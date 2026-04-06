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
    borderRadius: 20,
  });

  // Calculate midpoint for arrow label
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <g>
      <defs>
        {/* Gradient for edges */}
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
        </linearGradient>
        
        {/* Arrow marker */}
        <marker
          id={`arrowhead-${id}`}
          markerWidth="20"
          markerHeight="20"
          refX="19"
          refY="9"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,18 L20,9 z" fill="#06b6d4" />
        </marker>

        {/* Glow filter for animation */}
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background edge for depth */}
      <path
        d={edgePath}
        fill="none"
        stroke="#06b6d4"
        strokeWidth={5}
        opacity={0.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main edge with gradient */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={`url(#grad-${id})`}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={`url(#arrowhead-${id})`}
        filter={`url(#glow-${id})`}
        style={{
          transition: 'stroke-width 0.2s',
        }}
        className="hover:stroke-cyan-400"
      />

      {/* Animated dashed overlay */}
      <path
        d={edgePath}
        fill="none"
        stroke="url(#grad-{id})"
        strokeWidth={2}
        strokeDasharray="5,5"
        opacity={0.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: 'dashoffset 20s linear infinite',
        }}
      />

      <style>{`
        @keyframes dashoffset {
          to {
            stroke-dashoffset: 10;
          }
        }
      `}</style>

      {/* Directional indicator - small arrow in middle */}
      <g transform={`translate(${midX}, ${midY})`}>
        <circle
          cx="0"
          cy="0"
          r="6"
          fill="#06b6d4"
          opacity={0.6}
          className="transition-all hover:opacity-100"
        />
        <text
          x="0"
          y="3"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="white"
          pointerEvents="none"
        >
          →
        </text>
      </g>
    </g>
  );
}
