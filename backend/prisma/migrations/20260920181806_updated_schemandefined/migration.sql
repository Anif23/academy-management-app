-- AlterTable
ALTER TABLE "walk_ins" ADD COLUMN     "batchId" TEXT;

-- AddForeignKey
ALTER TABLE "walk_ins" ADD CONSTRAINT "walk_ins_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
