/*
  Warnings:

  - You are about to drop the column `batchAssignmentId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `trainerRemarks` on the `tasks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_studentId_fkey";

-- DropIndex
DROP INDEX "tasks_batchAssignmentId_idx";

-- DropIndex
DROP INDEX "tasks_studentId_idx";

-- AlterTable
ALTER TABLE "academy_settings" ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;

-- AlterTable
ALTER TABLE "task_submissions" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "batchAssignmentId",
DROP COLUMN "status",
DROP COLUMN "studentId",
DROP COLUMN "trainerRemarks";

-- DropEnum
DROP TYPE "TaskStatus";

-- CreateTable
CREATE TABLE "daily_check_ins" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "batchId" TEXT,
    "mood" TEXT,
    "classFeedback" TEXT,
    "understood" BOOLEAN,
    "needsHelp" BOOLEAN NOT NULL DEFAULT false,
    "helpDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_branding" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "appName" TEXT NOT NULL DEFAULT 'Academy Management',
    "tagline" TEXT NOT NULL DEFAULT 'For Managing Everything',
    "logoUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_branding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_check_ins_batchId_idx" ON "daily_check_ins"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_check_ins_studentId_date_key" ON "daily_check_ins"("studentId", "date");

-- CreateIndex
CREATE INDEX "tasks_batchId_idx" ON "tasks"("batchId");

-- AddForeignKey
ALTER TABLE "daily_check_ins" ADD CONSTRAINT "daily_check_ins_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_check_ins" ADD CONSTRAINT "daily_check_ins_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
