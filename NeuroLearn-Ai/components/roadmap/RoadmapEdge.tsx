'use client';

import React from 'react';
import { EdgeProps, getSmoothStepPath } from 'reactflow';

export default function RoadmapEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-primary/60 hover:text-primary"
      />
      <circle
        cx={sourceX}
        cy={sourceY}
        r={4}
        fill="currentColor"
        className="text-primary"
      />
    </g>
  );
}
