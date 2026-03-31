'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Zap, Loader2, Share2, Copy, Download } from 'lucide-react';
import { RoadmapViewer } from '@/components/roadmap/RoadmapViewer';
import { RoadmapNodeDetail } from '@/components/roadmap/RoadmapNodeDetail';
import { generateRoadmapWithGemini } from '@/lib/services/roadmapGenerator';

interface RoadmapData {
  id: string;
  title: string;
  description?: string;
  slug: string;
  nodes: Array<{
    id: string;
    title: string;
    description?: string;
    position: { x: number; y: number };
    dependsOn?: string[];
    resources?: any;
  }>;
}

export default function RoadmapViewPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { data: session, status } = useSession();

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingWithAI, setGeneratingWithAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before rendering React Flow (prevents hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch roadmap data with Gemini fallback
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check sessionStorage cache first
        const cached = sessionStorage.getItem(`roadmap_${slug}`);
        if (cached) {
          const data = JSON.parse(cached);
          setRoadmap(data.roadmap);
          setUserProgress(data.userProgress);
          setLoading(false);
          return;
        }

        // Fetch from database
        const response = await fetch(`/api/roadmap/${slug}`);

        if (response.ok) {
          // Roadmap found in database
          const data = await response.json();
          setRoadmap(data.roadmap);
          setUserProgress(data.userProgress);
          
          // Cache in sessionStorage
          sessionStorage.setItem(`roadmap_${slug}`, JSON.stringify(data));
        } else if (response.status === 404) {
          // Roadmap not found - generate with Gemini AI
          setGeneratingWithAI(true);
          
          try {
            const generatedRoadmap = await generateRoadmapWithGemini(slug);
            
            // Auto-save to database
            const saveResponse = await fetch('/api/roadmap', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(generatedRoadmap),
            });

            if (saveResponse.ok) {
              const savedData = await saveResponse.json();
              setRoadmap(savedData.roadmap);
              
              // Fetch user progress for newly saved roadmap
              const progressResponse = await fetch(`/api/roadmap/${slug}`);
              if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                setUserProgress(progressData.userProgress);
                
                // Cache both in sessionStorage
                sessionStorage.setItem(
                  `roadmap_${slug}`,
                  JSON.stringify({
                    roadmap: progressData.roadmap,
                    userProgress: progressData.userProgress,
                  })
                );
              }
            } else {
              throw new Error('Failed to save generated roadmap');
            }
          } catch (genErr: any) {
            console.error('Error generating roadmap with Gemini:', genErr);
            setError(
              `Could not find "${slug}" and AI generation failed: ${genErr.message}. Try a different topic.`
            );
          } finally {
            setGeneratingWithAI(false);
          }
        } else {
          throw new Error(`Failed to fetch roadmap (Status: ${response.status})`);
        }
      } catch (err) {
        console.error('Error fetching roadmap:', err);
        setError(err instanceof Error ? err.message : 'Failed to load roadmap. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [slug]);

  const handleNodeClick = useCallback(
    (nodeId: string, nodeData: any) => {
      if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return;
      }

      const nodeState = userProgress?.nodeProgress?.find(
        (p: any) => p.nodeId === nodeId
      )?.state || 'locked';

      setSelectedNode({
        ...nodeData,
        id: nodeId,
        currentState: nodeState,
      });
      setDetailOpen(true);
    },
    [status, userProgress, router]
  );

  const handleNodeStateChange = useCallback(
    async (nodeId: string, newState: string) => {
      if (!slug || !session?.user?.id) return;

      setIsSaving(true);
      try {
        const response = await fetch(`/api/roadmap/${slug}/progress`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodeId, newState }),
        });

        if (!response.ok) {
          throw new Error('Failed to update progress');
        }

        const data = await response.json();
        setUserProgress(data.userProgress);

        // Update selected node state
        setSelectedNode((prev) =>
          prev ? { ...prev, currentState: newState } : null
        );
      } catch (err) {
        console.error('Error updating node state:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [slug, session?.user?.id]
  );

  const handleShareRoadmap = useCallback(async () => {
    if (!roadmap) return;

    const shareUrl = `${window.location.origin}/roadmap/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: roadmap.title,
          text: `Check out this learning roadmap: ${roadmap.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  }, [roadmap, slug]);

  const handleDuplicateRoadmap = useCallback(() => {
    if (!roadmap?.title) return;

    const newSlug = `${roadmap.title}-copy`
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    router.push(`/roadmap/${newSlug}`);
  }, [roadmap?.title, router]);

  const handleExportRoadmap = useCallback(() => {
    if (!roadmap) return;

    const exportData = {
      title: roadmap.title,
      description: roadmap.description,
      nodes: roadmap.nodes,
      generatedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}-roadmap.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [roadmap, slug]);

  const progressPercent = userProgress?.progressPercent || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Navbar isAuthenticated={status === 'authenticated'} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            {generatingWithAI && (
              <>
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <p className="text-lg font-medium text-foreground">Creating your roadmap with AI...</p>
                <p className="text-sm text-muted-foreground">This may take a moment</p>
              </>
            )}
            {!generatingWithAI && <p className="text-muted-foreground">Loading roadmap...</p>}
          </div>
        </main>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Navbar isAuthenticated={status === 'authenticated'} />
        <main className="container mx-auto px-4 py-8">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-5 w-5" />
                <p className="font-semibold">Error</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push('/roadmap')}>Back to Roadmaps</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar isAuthenticated={status === 'authenticated'} showBackButton />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/roadmap')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
          >
            ← Back to Roadmaps
          </button>
          
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight mb-2">{roadmap.title}</h1>
              {roadmap.description && (
                <p className="text-muted-foreground max-w-2xl">{roadmap.description}</p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 items-start">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShareRoadmap}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
                {copyFeedback && <span className="text-xs">Copied!</span>}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDuplicateRoadmap}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Duplicate</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportRoadmap}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {status === 'authenticated' && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Your Progress</span>
                    <span className="text-muted-foreground">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Roadmap Canvas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Learning Path
            </CardTitle>
            <CardDescription>
              Click nodes to view details. {status === 'unauthenticated' ? 'Sign in to track progress.' : 'Your progress is automatically saved.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoadmapViewer
              roadmap={roadmap}
              userProgress={userProgress}
              onNodeClick={handleNodeClick}
              onNodeStateChange={handleNodeStateChange}
              isMounted={isMounted}
              isLoading={isSaving}
            />
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border border-gray-400" />
                <span>Locked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900 border border-amber-500" />
                <span>Unlocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900 border border-blue-500" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900 border border-green-500" />
                <span>Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Node Detail Modal */}
      <RoadmapNodeDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        node={selectedNode}
        nodeState={selectedNode?.currentState}
        onStateChange={handleNodeStateChange}
        roadmapNodes={roadmap.nodes}
        isLoading={isSaving}
      />
    </div>
  );
}
