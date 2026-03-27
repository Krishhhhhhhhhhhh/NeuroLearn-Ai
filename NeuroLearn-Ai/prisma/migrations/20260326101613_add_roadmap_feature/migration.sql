-- CreateTable
CREATE TABLE "public"."Roadmap" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "thumbnail" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'intermediate',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoadmapNode" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resources" JSONB,
    "position" JSONB NOT NULL,
    "dependsOn" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoadmapNodeDependency" (
    "id" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "dependentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoadmapNodeDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRoadmapProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoadmapProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserNodeProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "roadmapProgressId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'locked',
    "unlockedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserNodeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_slug_key" ON "public"."Roadmap"("slug");

-- CreateIndex
CREATE INDEX "Roadmap_slug_idx" ON "public"."Roadmap"("slug");

-- CreateIndex
CREATE INDEX "RoadmapNode_roadmapId_idx" ON "public"."RoadmapNode"("roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapNode_roadmapId_title_key" ON "public"."RoadmapNode"("roadmapId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapNodeDependency_prerequisiteId_dependentId_key" ON "public"."RoadmapNodeDependency"("prerequisiteId", "dependentId");

-- CreateIndex
CREATE INDEX "UserRoadmapProgress_userId_idx" ON "public"."UserRoadmapProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoadmapProgress_userId_roadmapId_key" ON "public"."UserRoadmapProgress"("userId", "roadmapId");

-- CreateIndex
CREATE INDEX "UserNodeProgress_userId_roadmapProgressId_idx" ON "public"."UserNodeProgress"("userId", "roadmapProgressId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNodeProgress_userId_nodeId_key" ON "public"."UserNodeProgress"("userId", "nodeId");

-- AddForeignKey
ALTER TABLE "public"."RoadmapNode" ADD CONSTRAINT "RoadmapNode_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "public"."Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoadmapNodeDependency" ADD CONSTRAINT "RoadmapNodeDependency_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "public"."RoadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoadmapNodeDependency" ADD CONSTRAINT "RoadmapNodeDependency_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "public"."RoadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRoadmapProgress" ADD CONSTRAINT "UserRoadmapProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRoadmapProgress" ADD CONSTRAINT "UserRoadmapProgress_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "public"."Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserNodeProgress" ADD CONSTRAINT "UserNodeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserNodeProgress" ADD CONSTRAINT "UserNodeProgress_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "public"."RoadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserNodeProgress" ADD CONSTRAINT "UserNodeProgress_roadmapProgressId_fkey" FOREIGN KEY ("roadmapProgressId") REFERENCES "public"."UserRoadmapProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
