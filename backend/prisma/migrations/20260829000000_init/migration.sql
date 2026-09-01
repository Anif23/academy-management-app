-- Validation-only DDL mirroring prisma/schema.prisma.
-- This file is NOT part of the shipped app (Prisma generates its own
-- migrations from schema.prisma). It exists purely to prove the relational
-- design — FKs, cascades, enums, unique constraints — is valid Postgres.

CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'STUDENT');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "EmployeeType" AS ENUM ('TRAINER', 'DEVELOPER', 'DESIGNER', 'VIDEO_EDITOR', 'DIGITAL_MARKETING', 'COUNSELLOR');
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "BatchStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'DROPPED');
CREATE TYPE "StudentMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');
CREATE TYPE "LeadSource" AS ENUM ('WALK_IN', 'WEBSITE', 'GOOGLE', 'INSTAGRAM', 'REFERRAL');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'COUNSELLING', 'INTERESTED', 'ADMISSION', 'NOT_INTERESTED');
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LEAVE');
CREATE TYPE "ClassReportTaskStatus" AS ENUM ('NOT_GIVEN', 'GIVEN', 'REVIEWED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'ADMIN',
  "department" TEXT,
  "phone" TEXT,
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "avatar" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "refresh_tokens" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP NOT NULL,
  "revokedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

CREATE TABLE "courses" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "duration" TEXT NOT NULL,
  "fee" DECIMAL(10,2) NOT NULL,
  "description" TEXT,
  "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "employees" (
  "id" TEXT PRIMARY KEY,
  "employeeCode" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "type" "EmployeeType" NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT NOT NULL,
  "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
  "joiningDate" TIMESTAMP NOT NULL,
  "userId" TEXT UNIQUE REFERENCES "users"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "batches" (
  "id" TEXT PRIMARY KEY,
  "batchCode" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "classTiming" TEXT NOT NULL,
  "days" TEXT[] NOT NULL,
  "status" "BatchStatus" NOT NULL DEFAULT 'UPCOMING',
  "courseId" TEXT NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
  "trainerId" TEXT REFERENCES "employees"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "walk_ins" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "mobile" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "qualification" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "source" "LeadSource" NOT NULL,
  "enquiryDate" TIMESTAMP NOT NULL,
  "remarks" TEXT,
  "followUpDate" TIMESTAMP,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "courseInterestedId" TEXT NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
  "counsellorId" TEXT REFERENCES "employees"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "students" (
  "id" TEXT PRIMARY KEY,
  "studentCode" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "photo" TEXT,
  "mobile" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "dob" TIMESTAMP,
  "gender" "Gender" NOT NULL,
  "address" TEXT NOT NULL,
  "qualification" TEXT NOT NULL,
  "courseDuration" TEXT NOT NULL,
  "joiningDate" TIMESTAMP NOT NULL,
  "mode" "StudentMode" NOT NULL DEFAULT 'OFFLINE',
  "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
  "userId" TEXT UNIQUE REFERENCES "users"("id") ON DELETE SET NULL,
  "courseId" TEXT NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
  "batchId" TEXT REFERENCES "batches"("id") ON DELETE SET NULL,
  "counsellorId" TEXT REFERENCES "employees"("id") ON DELETE SET NULL,
  "walkInId" TEXT UNIQUE REFERENCES "walk_ins"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "fees" (
  "id" TEXT PRIMARY KEY,
  "courseFee" DECIMAL(10,2) NOT NULL,
  "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "nextPaymentDate" TIMESTAMP,
  "remarks" TEXT,
  "studentId" TEXT NOT NULL UNIQUE REFERENCES "students"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "payments" (
  "id" TEXT PRIMARY KEY,
  "amount" DECIMAL(10,2) NOT NULL,
  "date" TIMESTAMP NOT NULL,
  "mode" "PaymentMode" NOT NULL,
  "remarks" TEXT,
  "feeId" TEXT NOT NULL REFERENCES "fees"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "payments_feeId_idx" ON "payments"("feeId");

CREATE TABLE "attendance" (
  "id" TEXT PRIMARY KEY,
  "date" TIMESTAMP NOT NULL,
  "status" "AttendanceStatus" NOT NULL,
  "studentId" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "batchId" TEXT NOT NULL REFERENCES "batches"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE ("studentId", "batchId", "date")
);
CREATE INDEX "attendance_batchId_date_idx" ON "attendance"("batchId", "date");

CREATE TABLE "class_reports" (
  "id" TEXT PRIMARY KEY,
  "date" TIMESTAMP NOT NULL,
  "topic" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "tasksGiven" TEXT,
  "taskStatus" "ClassReportTaskStatus" NOT NULL DEFAULT 'GIVEN',
  "studentPerformance" TEXT,
  "remarks" TEXT,
  "nextClassPlan" TEXT,
  "batchId" TEXT NOT NULL REFERENCES "batches"("id") ON DELETE CASCADE,
  "trainerId" TEXT REFERENCES "employees"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "class_reports_batchId_date_idx" ON "class_reports"("batchId", "date");

CREATE TABLE "tasks" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "assignedDate" TIMESTAMP NOT NULL,
  "dueDate" TIMESTAMP NOT NULL,
  "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
  "trainerRemarks" TEXT,
  "batchAssignmentId" TEXT,
  "studentId" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "batchId" TEXT REFERENCES "batches"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "tasks_studentId_idx" ON "tasks"("studentId");
CREATE INDEX "tasks_batchAssignmentId_idx" ON "tasks"("batchAssignmentId");

CREATE TABLE "performance" (
  "id" TEXT PRIMARY KEY,
  "date" TIMESTAMP NOT NULL,
  "technicalKnowledge" INTEGER NOT NULL,
  "practicalSkills" INTEGER NOT NULL,
  "communication" INTEGER NOT NULL,
  "attendance" INTEGER NOT NULL,
  "taskCompletion" INTEGER NOT NULL,
  "behaviour" INTEGER NOT NULL,
  "remarks" TEXT,
  "studentId" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "performance_studentId_idx" ON "performance"("studentId");
