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
    stepNumber?: number;
    onClick?: () => void;
    onStateChange?: (newState: string) => void;
  };
}

export default function RoadmapNode({ data }: RoadmapNodeProps) {
  const getNodeColors = (state: string) => {
    switch (state) {
      case 'completed':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 dark:from-green-900 dark:to-emerald-900 dark:border-green-400';
      case 'in_progress':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-500 dark:from-blue-900 dark:to-cyan-900 dark:border-blue-400';
      case 'unlocked':
        return 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-500 dark:from-amber-900 dark:to-orange-900 dark:border-amber-400';
      case 'locked':
      default:
        return 'bg-gradient-to-br from-slate-50 to-gray-100 border-gray-400 dark:from-slate-800 dark:to-gray-700 dark:border-gray-600';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />;
      case 'in_progress':
        return <Play className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={data.onClick}
      className={cn(
        'px-5 py-4 rounded-lg border-2 min-w-[220px] max-w-[220px] cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 shadow-md relative',
        getNodeColors(data.state),
        data.state === 'locked' && 'opacity-70 hover:opacity-85'
      )}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#0ea5e9' }} />
      
      {/* Step Number Badge */}
      {data.stepNumber !== undefined && (
        <div className="absolute -top-4 -left-3 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white dark:border-slate-900">
          {data.stepNumber}
        </div>
      )}
      
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate text-gray-900 dark:text-gray-100">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
              {data.description}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 pt-1">
          {getStateIcon(data.state)}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#0ea5e9' }} />
    </div>
  );
}
