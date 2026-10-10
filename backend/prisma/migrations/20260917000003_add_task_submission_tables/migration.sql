CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'NEEDS_REVISION', 'RESUBMITTED', 'REVIEWED');

CREATE TABLE "task_attachments" (
  "id" TEXT PRIMARY KEY,
  "taskId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "task_attachments_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "task_attachments_taskId_idx" ON "task_attachments"("taskId");

CREATE TABLE "task_submissions" (
  "id" TEXT PRIMARY KEY,
  "taskId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
  "content" TEXT,
  "submittedAt" TIMESTAMP(3),
  "trainerFeedback" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "task_submissions_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "task_submissions_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "task_submissions_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "task_submissions_taskId_studentId_key" ON "task_submissions"("taskId", "studentId");
CREATE INDEX "task_submissions_studentId_idx" ON "task_submissions"("studentId");
CREATE INDEX "task_submissions_status_idx" ON "task_submissions"("status");

CREATE TABLE "submission_files" (
  "id" TEXT PRIMARY KEY,
  "submissionId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "submission_files_submissionId_fkey"
    FOREIGN KEY ("submissionId") REFERENCES "task_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "submission_files_submissionId_idx" ON "submission_files"("submissionId");