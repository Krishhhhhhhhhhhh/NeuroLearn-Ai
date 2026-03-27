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
          onClick: () => handleNodeClick(node.id, node),
          onStateChange: (newState: string) => {
            handleStateChange(node.id, newState);
          },
        },
        position: node.position || { x: 0, y: 0 },
        type: 'roadmapNode',
      };
    });
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
    <div style={{ width: '100%', height: '600px' }} className="rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
