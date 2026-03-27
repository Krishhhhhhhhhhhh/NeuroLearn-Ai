'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Lock, CheckCircle, Play, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapNodeDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: {
    id: string;
    title: string;
    description?: string;
    resources?: Array<{
      title: string;
      url: string;
      type: string;
    }>;
    dependsOn?: string[];
  } | null;
  nodeState?: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  onStateChange?: (nodeId: string, newState: string) => void;
  roadmapNodes?: Array<{ id: string; title: string }>;
  isLoading?: boolean;
}

export function RoadmapNodeDetail({
  open,
  onOpenChange,
  node,
  nodeState = 'locked',
  onStateChange,
  roadmapNodes = [],
  isLoading = false,
}: RoadmapNodeDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!node) return null;

  const handleStateChange = async (newState: string) => {
    if (isUpdating || !onStateChange) return;
    setIsUpdating(true);
    try {
      await onStateChange(node.id, newState);
    } finally {
      setIsUpdating(false);
    }
  };

  const prerequisites = node.dependsOn
    ?.map((id) => roadmapNodes.find((n) => n.id === id))
    .filter(Boolean) || [];

  const getStateColor = (state: string) => {
    switch (state) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'unlocked':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'locked':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'in_progress':
        return <Play className="h-5 w-5" />;
      case 'locked':
        return <Lock className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{node.title}</DialogTitle>
              <Badge className={cn('w-fit', getStateColor(nodeState))}>
                <div className="flex items-center gap-1">
                  {getStateIcon(nodeState)}
                  <span className="capitalize">{nodeState.replace('_', ' ')}</span>
                </div>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          {node.description && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground">{node.description}</p>
            </div>
          )}

          {/* Prerequisites */}
          {prerequisites.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Prerequisites
              </h3>
              <ul className="text-sm space-y-1">
                {prerequisites.map((prereq) => (
                  <li key={prereq?.id} className="text-muted-foreground">
                    • {prereq?.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources */}
          {node.resources && node.resources.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Learning Resources</h3>
              <div className="space-y-2">
                {node.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{resource.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {resource.type}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* State Change Buttons */}
          {nodeState !== 'locked' && (
            <div className="flex gap-2 pt-4">
              {nodeState !== 'in_progress' && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleStateChange('in_progress')}
                  disabled={isUpdating || isLoading}
                >
                  Start Learning
                </Button>
              )}
              {nodeState !== 'completed' && nodeState !== 'locked' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStateChange('completed')}
                  disabled={isUpdating || isLoading}
                >
                  Mark Complete
                </Button>
              )}
            </div>
          )}

          {nodeState === 'locked' && prerequisites.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Complete all prerequisites to unlock this node.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
