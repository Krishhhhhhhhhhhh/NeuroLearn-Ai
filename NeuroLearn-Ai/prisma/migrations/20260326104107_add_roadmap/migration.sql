/*
  Warnings:

  - You are about to drop the `Roadmap` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoadmapNode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoadmapNodeDependency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserNodeProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRoadmapProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."RoadmapNode" DROP CONSTRAINT "RoadmapNode_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RoadmapNodeDependency" DROP CONSTRAINT "RoadmapNodeDependency_dependentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RoadmapNodeDependency" DROP CONSTRAINT "RoadmapNodeDependency_prerequisiteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserNodeProgress" DROP CONSTRAINT "UserNodeProgress_nodeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserNodeProgress" DROP CONSTRAINT "UserNodeProgress_roadmapProgressId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserNodeProgress" DROP CONSTRAINT "UserNodeProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserRoadmapProgress" DROP CONSTRAINT "UserRoadmapProgress_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserRoadmapProgress" DROP CONSTRAINT "UserRoadmapProgress_userId_fkey";

-- DropTable
DROP TABLE "public"."Roadmap";

-- DropTable
DROP TABLE "public"."RoadmapNode";

-- DropTable
DROP TABLE "public"."RoadmapNodeDependency";

-- DropTable
DROP TABLE "public"."UserNodeProgress";

-- DropTable
DROP TABLE "public"."UserRoadmapProgress";

-- CreateTable
CREATE TABLE "public"."roadmap" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "thumbnail" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'intermediate',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roadmapNode" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resources" JSONB,
    "position" JSONB NOT NULL,
    "dependsOn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmapNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."userRoadmapProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userRoadmapProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."userNodeProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "roadmapProgressId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'locked',
    "unlockedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "userNodeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_slug_key" ON "public"."roadmap"("slug");

-- CreateIndex
CREATE INDEX "roadmap_slug_idx" ON "public"."roadmap"("slug");

-- CreateIndex
CREATE INDEX "roadmapNode_roadmapId_idx" ON "public"."roadmapNode"("roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "roadmapNode_roadmapId_title_key" ON "public"."roadmapNode"("roadmapId", "title");

-- CreateIndex
CREATE INDEX "userRoadmapProgress_userId_roadmapId_idx" ON "public"."userRoadmapProgress"("userId", "roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "userRoadmapProgress_userId_roadmapId_key" ON "public"."userRoadmapProgress"("userId", "roadmapId");

-- CreateIndex
CREATE INDEX "userNodeProgress_userId_roadmapProgressId_idx" ON "public"."userNodeProgress"("userId", "roadmapProgressId");

-- CreateIndex
CREATE UNIQUE INDEX "userNodeProgress_userId_nodeId_key" ON "public"."userNodeProgress"("userId", "nodeId");

-- AddForeignKey
ALTER TABLE "public"."roadmapNode" ADD CONSTRAINT "roadmapNode_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "public"."roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."userRoadmapProgress" ADD CONSTRAINT "userRoadmapProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."userRoadmapProgress" ADD CONSTRAINT "userRoadmapProgress_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "public"."roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."userNodeProgress" ADD CONSTRAINT "userNodeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."userNodeProgress" ADD CONSTRAINT "userNodeProgress_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "public"."roadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."userNodeProgress" ADD CONSTRAINT "userNodeProgress_roadmapProgressId_fkey" FOREIGN KEY ("roadmapProgressId") REFERENCES "public"."userRoadmapProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
