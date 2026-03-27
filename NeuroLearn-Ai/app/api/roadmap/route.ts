import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

export async function GET(req: NextRequest) {
  try {
    // Fetch all available roadmaps
    const roadmaps = await prisma.roadmap.findMany({
      include: {
        _count: {
          select: {
            nodes: true,
            userProgress: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ roadmaps });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmaps' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Admin only - create new roadmap
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // You can add admin check here later
    const { title, description, slug, difficulty, nodes } = await req.json();

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Create roadmap
    const roadmap = await prisma.roadmap.create({
      data: {
        title,
        description,
        slug,
        difficulty: difficulty || 'intermediate',
        nodes: {
          create: nodes || [],
        },
      },
      include: {
        nodes: true,
      },
    });

    return NextResponse.json({ roadmap }, { status: 201 });
  } catch (error) {
    console.error('Error creating roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to create roadmap' },
      { status: 500 }
    );
  }
}
