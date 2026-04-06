'use client';

import dynamic from 'next/dynamic';
import { ReactNode, useCallback, useMemo } from 'react';

const RoadmapCanvas = dynamic(
  () => import('./RoadmapCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Loading roadmap...</span>
      </div>
    ),
  }
);

export interface RoadmapNode {
  id: string;
  title: string;
  description?: string;
  position: { x: number; y: number };
  dependsOn?: string[];
  resources?: any;
}

export interface RoadmapViewerProps {
  roadmap: {
    id: string;
    title: string;
    description?: string;
    slug: string;
    nodes: RoadmapNode[];
  };
  userProgress?: {
    nodeProgress: Array<{
      nodeId: string;
      state: 'locked' | 'unlocked' | 'in_progress' | 'completed';
    }>;
  } | null;
  onNodeClick: (nodeId: string, nodeData: RoadmapNode) => void;
  onNodeStateChange: (nodeId: string, newState: string) => void;
  isMounted: boolean;
  isLoading?: boolean;
}

/**
 * Optimized RoadmapViewer component
 * Handles dynamic loading of RoadmapCanvas with proper hydration handling
 */
export function RoadmapViewer({
  roadmap,
  userProgress,
  onNodeClick,
  onNodeStateChange,
  isMounted,
  isLoading = false,
}: RoadmapViewerProps) {
  // Memoize callbacks to prevent unnecessary re-renders
  const memoizedOnNodeClick = useCallback(
    (nodeId: string, nodeData: RoadmapNode) => {
      onNodeClick(nodeId, nodeData);
    },
    [onNodeClick]
  );

  const memoizedOnNodeStateChange = useCallback(
    (nodeId: string, newState: string) => {
      onNodeStateChange(nodeId, newState);
    },
    [onNodeStateChange]
  );

  // Memoize roadmap data to prevent re-renders
  const memoizedRoadmap = useMemo(
    () => roadmap,
    [roadmap.id, roadmap.title, roadmap.slug, roadmap.nodes]
  );

  // Memoize user progress to prevent re-renders
  const memoizedUserProgress = useMemo(
    () => userProgress,
    [userProgress?.nodeProgress]
  );

  if (!isMounted) {
    return (
      <div className="w-full h-[700px] bg-muted rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border border-muted-foreground border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[700px] w-full rounded-lg border overflow-hidden bg-background">
      <RoadmapCanvas
        roadmap={memoizedRoadmap}
        userProgress={memoizedUserProgress}
        onNodeClick={memoizedOnNodeClick}
        onNodeStateChange={memoizedOnNodeStateChange}
      />
    </div>
  );
}
