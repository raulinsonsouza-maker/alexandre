-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "moduleId" TEXT;

-- Drop legacy unique (course-level cert)
DROP INDEX IF EXISTS "Certificate_userId_courseId_key";

-- Backfill: if any certs lack moduleId, remove them (fresh prod seed preferred)
DELETE FROM "Certificate" WHERE "moduleId" IS NULL;

-- Enforce NOT NULL after cleanup
ALTER TABLE "Certificate" ALTER COLUMN "moduleId" SET NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Certificate_userId_courseId_idx" ON "Certificate"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Certificate_userId_moduleId_key" ON "Certificate"("userId", "moduleId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Certificate_moduleId_fkey'
  ) THEN
    ALTER TABLE "Certificate"
      ADD CONSTRAINT "Certificate_moduleId_fkey"
      FOREIGN KEY ("moduleId") REFERENCES "Module"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
