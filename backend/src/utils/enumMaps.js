/**
 * The frontend (built first, as a standalone mock app) uses human-readable
 * strings as enum values — "Video Editor", "In Progress", "Not Interested".
 * Postgres/Prisma enums are conventionally SCREAMING_SNAKE_CASE.
 *
 * Rather than rewriting every dropdown/badge in the frontend to speak
 * database casing, this module translates at the API boundary: the wire
 * format (what the frontend sends/receives over HTTP) stays exactly the
 * human-readable strings it already uses, and only the service layer here
 * converts to/from the actual Prisma enum before touching the database.
 */

function createEnumMap(pairs) {
  const toDb = new Map(pairs);
  const fromDb = new Map(pairs.map(([label, dbValue]) => [dbValue, label]));
  return {
    toDb: (label) => {
      if (label === undefined || label === null) return label;
      const value = toDb.get(label);
      if (value === undefined) throw new Error(`Unknown enum label: "${label}"`);
      return value;
    },
    fromDb: (dbValue) => {
      if (dbValue === undefined || dbValue === null) return dbValue;
      return fromDb.get(dbValue) ?? dbValue;
    },
    labels: () => Array.from(toDb.keys()),
  };
}

const GenderMap = createEnumMap([
  ['Male', 'MALE'],
  ['Female', 'FEMALE'],
  ['Other', 'OTHER'],
]);

const ActiveInactiveMap = createEnumMap([
  ['Active', 'ACTIVE'],
  ['Inactive', 'INACTIVE'],
]);

const EmployeeTypeMap = createEnumMap([
  ['Trainer', 'TRAINER'],
  ['Developer', 'DEVELOPER'],
  ['Designer', 'DESIGNER'],
  ['Video Editor', 'VIDEO_EDITOR'],
  ['Digital Marketing', 'DIGITAL_MARKETING'],
  ['Counsellor', 'COUNSELLOR'],
]);

const StudentStatusMap = createEnumMap([
  ['Active', 'ACTIVE'],
  ['On Hold', 'ON_HOLD'],
  ['Completed', 'COMPLETED'],
  ['Dropped', 'DROPPED'],
]);

const StudentModeMap = createEnumMap([
  ['Online', 'ONLINE'],
  ['Offline', 'OFFLINE'],
  ['Hybrid', 'HYBRID'],
]);

const BatchStatusMap = createEnumMap([
  ['Upcoming', 'UPCOMING'],
  ['Ongoing', 'ONGOING'],
  ['Completed', 'COMPLETED'],
]);

const CourseStatusMap = ActiveInactiveMap;

const LeadSourceMap = createEnumMap([
  ['Walk-in', 'WALK_IN'],
  ['Website', 'WEBSITE'],
  ['Google', 'GOOGLE'],
  ['Instagram', 'INSTAGRAM'],
  ['Referral', 'REFERRAL'],
]);

const LeadStatusMap = createEnumMap([
  ['New', 'NEW'],
  ['Contacted', 'CONTACTED'],
  ['Counselling', 'COUNSELLING'],
  ['Interested', 'INTERESTED'],
  ['Admission', 'ADMISSION'],
  ['Not Interested', 'NOT_INTERESTED'],
]);

const PaymentModeMap = createEnumMap([
  ['Cash', 'CASH'],
  ['UPI', 'UPI'],
  ['Card', 'CARD'],
  ['Bank Transfer', 'BANK_TRANSFER'],
  ['Cheque', 'CHEQUE'],
]);

const AttendanceStatusMap = createEnumMap([
  ['Present', 'PRESENT'],
  ['Absent', 'ABSENT'],
  ['Leave', 'LEAVE'],
]);

const ClassReportTaskStatusMap = createEnumMap([
  ['Not Given', 'NOT_GIVEN'],
  ['Given', 'GIVEN'],
  ['Reviewed', 'REVIEWED'],
]);

const TaskPriorityMap = createEnumMap([
  ['Low', 'LOW'],
  ['Medium', 'MEDIUM'],
  ['High', 'HIGH'],
]);

// Persisted submission states. "Overdue" is deliberately NOT one of these —
// it's derived at read time in taskService (Pending/Needs Revision + past
// due date) since it depends on "now", not stored data. It's still a valid
// value on the *wire* (API responses can report status: "Overdue"), so
// filters compare against it directly rather than through this map.
const SubmissionStatusMap = createEnumMap([
  ['Pending', 'PENDING'],
  ['Submitted', 'SUBMITTED'],
  ['Needs Revision', 'NEEDS_REVISION'],
  ['Resubmitted', 'RESUBMITTED'],
  ['Reviewed', 'REVIEWED'],
]);

module.exports = {
  createEnumMap,
  GenderMap,
  ActiveInactiveMap,
  EmployeeTypeMap,
  StudentStatusMap,
  StudentModeMap,
  BatchStatusMap,
  CourseStatusMap,
  LeadSourceMap,
  LeadStatusMap,
  PaymentModeMap,
  AttendanceStatusMap,
  ClassReportTaskStatusMap,
  TaskPriorityMap,
  SubmissionStatusMap,
};
