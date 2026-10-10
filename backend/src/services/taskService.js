const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { TaskPriorityMap, SubmissionStatusMap } = require('../utils/enumMaps');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');
const s3Service = require('./s3Service');
const { isScopedRole } = require('../constants/roles');

// --------------------------------------------------------------------------
// Serialization
// --------------------------------------------------------------------------

/** Overdue is derived, never stored — see the SubmissionStatusMap comment. */
function effectiveStatus(submission, dueDate) {
  const stored = SubmissionStatusMap.fromDb(submission.status);
  const isOpen = stored === 'Pending' || stored === 'Needs Revision';
  if (isOpen && new Date(dueDate) < new Date()) return 'Overdue';
  return stored;
}

function fileToPublic(file) {
  return {
    id: file.id,
    url: file.url,
    fileName: file.fileName,
    fileType: file.fileType,
    fileSize: file.fileSize,
    uploadedAt: file.uploadedAt,
  };
}

function submissionToPublic(submission, dueDate) {
  return {
    id: submission.id,
    taskId: submission.taskId,
    studentId: submission.studentId,
    student: submission.student
      ? { id: submission.student.id, name: submission.student.name, studentCode: submission.student.studentCode }
      : undefined,
    status: effectiveStatus(submission, dueDate),
    content: submission.content || '',
    submittedAt: submission.submittedAt,
    trainerFeedback: submission.trainerFeedback || '',
    reviewedAt: submission.reviewedAt,
    reviewedById: submission.reviewedById,
    files: (submission.files || []).map(fileToPublic),
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}

function taskToPublic(task) {
  const submissions = (task.submissions || []).map((s) => submissionToPublic(s, task.dueDate));
  const total = submissions.length;
  const counts = {
    total,
    submitted: submissions.filter((s) => ['Submitted', 'Resubmitted', 'Reviewed'].includes(s.status)).length,
    reviewed: submissions.filter((s) => s.status === 'Reviewed').length,
    pending: submissions.filter((s) => s.status === 'Pending').length,
    needsRevision: submissions.filter((s) => s.status === 'Needs Revision').length,
    overdue: submissions.filter((s) => s.status === 'Overdue').length,
  };

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    assignedDate: task.assignedDate,
    dueDate: task.dueDate,
    priority: TaskPriorityMap.fromDb(task.priority),
    batchId: task.batchId,
    batch: task.batch ? { id: task.batch.id, name: task.batch.name, batchCode: task.batch.batchCode } : undefined,
    createdById: task.createdById,
    assignmentType: task.batchId ? 'batch' : 'individual',
    attachments: (task.attachments || []).map(fileToPublic),
    submissionCounts: counts,
    submissions,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

const taskInclude = {
  batch: true,
  attachments: true,
  submissions: { include: { student: { select: { id: true, name: true, studentCode: true } }, files: true } },
};

// --------------------------------------------------------------------------
// Reads
// --------------------------------------------------------------------------

/**
 * Role-scoped task list.
 * - ADMIN: everything.
 * - STAFF: only tasks they created OR tasks on batches they trainer.
 * - STUDENT: only tasks that have a submission row for them (handled by
 *   getMine instead — students never hit this list endpoint).
 */
async function getAll(query, actor) {
  const { page, pageSize, skip, take } = parsePagination(query);

  const where = {
    ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    ...(query.batchId ? { batchId: query.batchId } : {}),
    ...(query.priority ? { priority: TaskPriorityMap.toDb(query.priority) } : {}),
  };

  if (isScopedRole(actor.role)) {
    const myBatches = await prisma.batch.findMany({ where: { trainerId: actor.employeeId }, select: { id: true } });
    const batchIds = myBatches.map((b) => b.id);
    where.OR = [{ createdById: actor.employeeId }, { batchId: { in: batchIds } }];
  }

  const [rows, total] = await Promise.all([
    prisma.task.findMany({ where, include: taskInclude, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.task.count({ where }),
  ]);

  let data = rows.map(taskToPublic);

  // Status filter applies after derivation (Overdue isn't a DB column), so
  // it's cheaper to filter in JS here than to fetch everything unfiltered
  // for large datasets — acceptable at academy scale (hundreds, not
  // millions, of tasks); switch to a DB-side computed column if this ever
  // needs to scale further.
  if (query.status) {
    data = data.filter((t) => t.submissions.some((s) => s.status === query.status));
  }
  if (query.studentId) {
    data = data.filter((t) => t.submissions.some((s) => s.studentId === query.studentId));
  }

  return buildPaginatedResult(data, total, page, pageSize);
}

async function getById(id) {
  const task = await prisma.task.findUnique({ where: { id }, include: taskInclude });
  if (!task) throw ApiError.notFound('Task not found.');
  return taskToPublic(task);
}

/** A student's own task list — every task they have a submission row for. */
async function getMine(studentId) {
  const submissions = await prisma.taskSubmission.findMany({
    where: { studentId },
    include: {
      task: { include: { batch: true, attachments: true } },
      files: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return submissions.map((s) => ({
    ...submissionToPublic(s, s.task.dueDate),
    task: {
      id: s.task.id,
      title: s.task.title,
      description: s.task.description,
      assignedDate: s.task.assignedDate,
      dueDate: s.task.dueDate,
      priority: TaskPriorityMap.fromDb(s.task.priority),
      batch: s.task.batch ? { id: s.task.batch.id, name: s.task.batch.name } : undefined,
      attachments: (s.task.attachments || []).map(fileToPublic),
    },
  }));
}

async function getMySubmission(taskId, studentId) {
  const submission = await prisma.taskSubmission.findUnique({
    where: { taskId_studentId: { taskId, studentId } },
    include: { task: { include: { batch: true, attachments: true } }, files: true },
  });
  if (!submission) throw ApiError.notFound("This task isn't assigned to you.");
  return {
    ...submissionToPublic(submission, submission.task.dueDate),
    task: {
      id: submission.task.id,
      title: submission.task.title,
      description: submission.task.description,
      assignedDate: submission.task.assignedDate,
      dueDate: submission.task.dueDate,
      priority: TaskPriorityMap.fromDb(submission.task.priority),
      batch: submission.task.batch ? { id: submission.task.batch.id, name: submission.task.batch.name } : undefined,
      attachments: (submission.task.attachments || []).map(fileToPublic),
    },
  };
}

// --------------------------------------------------------------------------
// Writes — create
// --------------------------------------------------------------------------

/**
 * Creates ONE Task row, then a TaskSubmission (status PENDING) for every
 * assigned student — a single student for an individual task, or every
 * currently-active student in the batch for a batch task. This is the
 * "don't create duplicate task records" rule from the spec: the Task
 * itself never repeats, only the lightweight per-student progress row does.
 */
async function create(input, actor) {
  const isBatch = Boolean(input.batchId);

  let studentIds = [];
  if (isBatch) {
    const students = await prisma.student.findMany({
      where: { batchId: input.batchId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (students.length === 0) {
      throw ApiError.badRequest('This batch has no active students to assign the task to.', 'BATCH_EMPTY');
    }
    studentIds = students.map((s) => s.id);
  } else {
    const student = await prisma.student.findUnique({ where: { id: input.studentId } });
    if (!student) throw ApiError.badRequest('Selected student does not exist.', 'INVALID_STUDENT');
    studentIds = [student.id];
  }

  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        title: input.title,
        description: input.description,
        assignedDate: input.assignedDate,
        dueDate: input.dueDate,
        priority: TaskPriorityMap.toDb(input.priority),
        batchId: isBatch ? input.batchId : null,
        createdById: actor.employeeId || null,
        attachments: input.attachments?.length
          ? {
              create: input.attachments.map((f) => ({
                url: f.url,
                fileName: f.fileName,
                fileType: f.fileType,
                fileSize: f.fileSize,
              })),
            }
          : undefined,
      },
    });

    await tx.taskSubmission.createMany({
      data: studentIds.map((studentId) => ({ taskId: created.id, studentId })),
    });

    return created;
  });

  return getById(task.id);
}

async function update(id, patch) {
  const data = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.description !== undefined) data.description = patch.description;
  if (patch.assignedDate !== undefined) data.assignedDate = patch.assignedDate;
  if (patch.dueDate !== undefined) data.dueDate = patch.dueDate;
  if (patch.priority !== undefined) data.priority = TaskPriorityMap.toDb(patch.priority);

  await prisma.task.update({ where: { id }, data });
  return getById(id);
}

async function remove(id) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { attachments: true, submissions: { include: { files: true } } },
  });
  if (!task) throw ApiError.notFound('Task not found.');

  // Best-effort S3 cleanup so deleted tasks don't leave orphaned objects
  // in the bucket — never blocks the actual delete if it fails.
  const keysToDelete = [
    ...task.attachments.map((a) => s3Service.keyFromUrl(a.url)),
    ...task.submissions.flatMap((s) => s.files.map((f) => s3Service.keyFromUrl(f.url))),
  ].filter(Boolean);

  await prisma.task.delete({ where: { id } }); // cascades to attachments/submissions/files
  await Promise.all(keysToDelete.map((key) => s3Service.deleteObject(key)));
}

// --------------------------------------------------------------------------
// Writes — student submission
// --------------------------------------------------------------------------

/**
 * A student submits (or resubmits, if NEEDS_REVISION) their work. Blocks a
 * second submission on an already-SUBMITTED/REVIEWED task — resubmission is
 * only possible after the trainer explicitly sends it back for revision.
 */
async function submit(taskId, studentId, input) {
  const submission = await prisma.taskSubmission.findUnique({
    where: { taskId_studentId: { taskId, studentId } },
    include: { task: true },
  });
  if (!submission) throw ApiError.notFound("This task isn't assigned to you.");

  const current = SubmissionStatusMap.fromDb(submission.status);
  if (current === 'Submitted' || current === 'Resubmitted' || current === 'Reviewed') {
    throw ApiError.conflict(
      'This task has already been submitted. Ask your trainer to send it back for revision before resubmitting.',
      'ALREADY_SUBMITTED',
    );
  }

  const nextStatus = current === 'Needs Revision' ? 'RESUBMITTED' : 'SUBMITTED';

  await prisma.$transaction(async (tx) => {
    await tx.submissionFile.deleteMany({ where: { submissionId: submission.id } });
    await tx.taskSubmission.update({
      where: { id: submission.id },
      data: {
        status: nextStatus,
        content: input.content || '',
        submittedAt: new Date(),
        files: input.files?.length
          ? {
              create: input.files.map((f) => ({
                url: f.url,
                fileName: f.fileName,
                fileType: f.fileType,
                fileSize: f.fileSize,
              })),
            }
          : undefined,
      },
    });
  });

  return getMySubmission(taskId, studentId);
}

// --------------------------------------------------------------------------
// Writes — trainer review
// --------------------------------------------------------------------------

async function review(submissionId, actor, input) {
  const submission = await prisma.taskSubmission.findUnique({ where: { id: submissionId }, include: { task: true } });
  if (!submission) throw ApiError.notFound('Submission not found.');

  const current = SubmissionStatusMap.fromDb(submission.status);
  if (current === 'Pending') {
    throw ApiError.badRequest("This student hasn't submitted anything yet.", 'NOT_SUBMITTED');
  }

  const nextStatus = input.decision === 'approve' ? 'REVIEWED' : 'NEEDS_REVISION';

  await prisma.taskSubmission.update({
    where: { id: submissionId },
    data: {
      status: nextStatus, // already a raw Prisma enum value, not a label
      trainerFeedback: input.feedback || '',
      reviewedAt: new Date(),
      reviewedById: actor.employeeId || null,
    },
  });

  return getById(submission.taskId);
}

/** Admin/Staff view of one specific student's tasks (their own submission per task) — same shape as getMine. */
async function getByStudent(studentId) {
  return getMine(studentId);
}

module.exports = {
  getAll,
  getById,
  getMine,
  getByStudent,
  getMySubmission,
  create,
  update,
  remove,
  submit,
  review,
};
