'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';
import { Lock, CheckCircle, Play } from 'lucide-react';

interface RoadmapNodeProps {
  data: {
    label: string;
    description?: string;
    state: 'locked' | 'unlocked' | 'in_progress' | 'completed';
    onClick?: () => void;
    onStateChange?: (newState: string) => void;
  };
}

export default function RoadmapNode({ data }: RoadmapNodeProps) {
  const getNodeColors = (state: string) => {
    switch (state) {
      case 'completed':
        return 'bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-400';
      case 'in_progress':
        return 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400';
      case 'unlocked':
        return 'bg-amber-100 border-amber-500 dark:bg-amber-900 dark:border-amber-400';
      case 'locked':
      default:
        return 'bg-gray-100 border-gray-400 dark:bg-gray-800 dark:border-gray-600';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'in_progress':
        return <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={data.onClick}
      className={cn(
        'px-4 py-2 rounded-lg border-2 min-w-[180px] cursor-pointer transition-all hover:shadow-lg',
        getNodeColors(data.state),
        data.state === 'locked' && 'opacity-60 hover:opacity-75'
      )}
    >
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-semibold text-sm truncate">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
              {data.description}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          {getStateIcon(data.state)}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
