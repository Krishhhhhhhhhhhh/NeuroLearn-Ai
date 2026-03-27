import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  resources: Array<{
    type: 'docs' | 'video' | 'course' | 'article';
    title: string;
    url?: string;
  }>;
  dependsOn: string[];
}

interface GeneratedRoadmap {
  title: string;
  description: string;
  slug: string;
  nodes: RoadmapNode[];
}

function calculateNodePositions(
  nodeCount: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const nodesPerLevel = Math.ceil(Math.sqrt(nodeCount));
  const levelHeight = 150;
  const nodeWidth = 200;

  let index = 0;
  for (let level = 0; level < nodesPerLevel && index < nodeCount; level++) {
    const levelNodes = Math.min(nodesPerLevel, nodeCount - index);
    const totalWidth = levelNodes * nodeWidth + (levelNodes - 1) * 50;
    const startX = (1000 - totalWidth) / 2;

    for (let i = 0; i < levelNodes; i++) {
      positions.push({
        x: startX + i * (nodeWidth + 50),
        y: level * levelHeight,
      });
      index++;
    }
  }

  return positions;
}

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing slug parameter' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini client with API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert curriculum designer. Generate a comprehensive learning roadmap for: "${slug}"

Return a JSON object with this exact structure:
{
  "title": "Clear full title",
  "description": "2-3 sentence description",
  "nodes": [
    {
      "id": "node-1",
      "title": "Topic name",
      "description": "What you'll learn",
      "resources": [
        {"type": "docs|video|course|article", "title": "Resource name"}
      ],
      "dependsOn": ["node-id"] or []
    }
  ]
}

Create 8-12 nodes starting from fundamentals and progressing to advanced. Each node should have 2-3 resources. Resources should NOT include URLs.

Return ONLY the JSON, no markdown code blocks, no explanations.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse JSON from response');
      }
      parsedResponse = JSON.parse(jsonMatch[0]);
    }

    const positions = calculateNodePositions(parsedResponse.nodes.length);

    const generatedRoadmap: GeneratedRoadmap = {
      title: parsedResponse.title || slug,
      description:
        parsedResponse.description ||
        `Learn ${slug} with a structured learning path`,
      slug,
      nodes: (parsedResponse.nodes || []).map(
        (node: any, index: number) => ({
          id: node.id || `node-${index + 1}`,
          title: node.title || 'Untitled',
          description: node.description || '',
          resources: (node.resources || []).map((res: any) => ({
            type: res.type || 'docs',
            title: res.title || 'Resource',
          })),
          dependsOn: node.dependsOn || [],
          position: positions[index],
        })
      ),
    };

    return NextResponse.json(generatedRoadmap);
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate roadmap',
      },
      { status: 500 }
    );
  }
}
