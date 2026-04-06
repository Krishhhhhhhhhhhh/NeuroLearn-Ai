-- AlterTable
ALTER TABLE "public"."roadmapNode" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stepNumber" INTEGER;
