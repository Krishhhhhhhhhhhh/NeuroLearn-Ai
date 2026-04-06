'use client';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import RoadmapNode from './RoadmapNode';
import RoadmapEdge from './RoadmapEdge';

interface RoadmapCanvasProps {
  roadmap: {
    id: string;
    title: string;
    nodes: Array<{
      id: string;
      title: string;
      description?: string;
      position: { x: number; y: number };
      dependsOn?: string[];
      resources?: any;
      stepNumber?: number;
    }>;
  };
  userProgress?: {
    nodeProgress: Array<{
      nodeId: string;
      state: 'locked' | 'unlocked' | 'in_progress' | 'completed';
    }>;
  } | null;
  onNodeClick?: (nodeId: string, nodeData: any) => void;
  onNodeStateChange?: (nodeId: string, newState: string) => void;
}

const nodeTypes: NodeTypes = {
  roadmapNode: RoadmapNode,
};

export default function RoadmapCanvas({
  roadmap,
  userProgress,
  onNodeClick,
  onNodeStateChange,
}: RoadmapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Memoize callback handlers to prevent unnecessary re-renders
  const handleNodeClick = useCallback(
    (nodeId: string, nodeData: any) => {
      onNodeClick?.(nodeId, nodeData);
    },
    [onNodeClick]
  );

  const handleStateChange = useCallback(
    (nodeId: string, newState: string) => {
      onNodeStateChange?.(nodeId, newState);
    },
    [onNodeStateChange]
  );

  // Memoize nodes calculation to prevent hydration mismatches
  const initialNodes = useMemo(() => {
    if (!roadmap?.nodes) return [];

    // If stepNumber is provided in node data, use it; otherwise calculate based on dependency levels
    const hasStepNumbers = roadmap.nodes.some((node) => node.stepNumber !== undefined);

    if (hasStepNumbers) {
      // Use pre-calculated step numbers from the API
      return roadmap.nodes.map((node) => {
        const nodeProgressData = userProgress?.nodeProgress?.find(
          (p) => p.nodeId === node.id
        );
        const state = nodeProgressData?.state || 'locked';

        return {
          id: node.id,
          data: {
            label: node.title,
            description: node.description,
            state,
            stepNumber: node.stepNumber,
            onClick: () => handleNodeClick(node.id, node),
            onStateChange: (newState: string) => {
              handleStateChange(node.id, newState);
            },
          },
          position: node.position || { x: 0, y: 0 },
          type: 'roadmapNode',
        };
      });
    } else {
      // Fallback: Calculate step numbers based on dependency levels
      const nodeLevels = new Map<string, number>();
      const calculateLevel = (nodeId: string): number => {
        if (nodeLevels.has(nodeId)) {
          return nodeLevels.get(nodeId)!;
        }

        const node = roadmap.nodes.find((n) => n.id === nodeId);
        if (!node || !node.dependsOn || node.dependsOn.length === 0) {
          nodeLevels.set(nodeId, 0);
          return 0;
        }

        let maxDepLevel = 0;
        for (const depId of node.dependsOn) {
          const depLevel = calculateLevel(depId);
          maxDepLevel = Math.max(maxDepLevel, depLevel);
        }

        const level = maxDepLevel + 1;
        nodeLevels.set(nodeId, level);
        return level;
      };

      roadmap.nodes.forEach((node) => {
        calculateLevel(node.id);
      });

      return roadmap.nodes.map((node) => {
        const nodeProgressData = userProgress?.nodeProgress?.find(
          (p) => p.nodeId === node.id
        );
        const state = nodeProgressData?.state || 'locked';
        const stepNumber = (nodeLevels.get(node.id) || 0) + 1;

        return {
          id: node.id,
          data: {
            label: node.title,
            description: node.description,
            state,
            stepNumber,
            onClick: () => handleNodeClick(node.id, node),
            onStateChange: (newState: string) => {
              handleStateChange(node.id, newState);
            },
          },
          position: node.position || { x: 0, y: 0 },
          type: 'roadmapNode',
        };
      });
    }
  }, [roadmap?.nodes, userProgress?.nodeProgress, handleNodeClick, handleStateChange]);

  // Memoize edges calculation
  const initialEdges = useMemo(() => {
    if (!roadmap?.nodes) return [];

    const newEdges: Edge[] = [];
    roadmap.nodes.forEach((node) => {
      if (node.dependsOn && node.dependsOn.length > 0) {
        node.dependsOn.forEach((depId) => {
          newEdges.push({
            id: `${depId}->${node.id}`,
            source: depId,
            target: node.id,
            type: 'roadmapEdge',
            animated: true,
          });
        });
      }
    });

    return newEdges;
  }, [roadmap?.nodes]);

  // Initialize nodes and edges from roadmap data
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  return (
    <div style={{ width: '100%', height: '100%' }} className="rounded-lg border overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
