ALTER TABLE "tasks"
ADD COLUMN "createdById" TEXT;

CREATE INDEX "tasks_createdById_idx" ON "tasks"("createdById");

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "employees"("id")
ON DELETE SET NULL ON UPDATE CASCADE;