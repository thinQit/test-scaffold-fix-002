import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuthToken, verifyToken } from '@/lib/auth';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional()
});

const listParamsSchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  completed: z.string().optional(),
  search: z.string().optional(),
  dueBefore: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

function serializeTask(task: {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  priority: string | null;
  tags: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description,
    completed: task.completed,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    priority: task.priority,
    tags: Array.isArray(task.tags) ? (task.tags as string[]) : [],
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}

export async function GET(request: Request) {
  try {
    const token = getAuthToken(request as unknown as import('next/server').NextRequest);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const parsed = listParamsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const page = Math.max(1, Number(parsed.data.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(parsed.data.pageSize || 20)));
    const skip = (page - 1) * pageSize;

    const where: {
      userId: string;
      completed?: boolean;
      title?: { contains: string; mode: 'insensitive' };
      dueDate?: { lt?: Date };
      priority?: 'low' | 'medium' | 'high';
    } = { userId: payload.userId };

    if (parsed.data.completed === 'true') {
      where.completed = true;
    }
    if (parsed.data.completed === 'false') {
      where.completed = false;
    }
    if (parsed.data.search) {
      where.title = { contains: parsed.data.search, mode: 'insensitive' };
    }
    if (parsed.data.dueBefore) {
      const dueBeforeDate = new Date(parsed.data.dueBefore);
      if (!Number.isNaN(dueBeforeDate.getTime())) {
        where.dueDate = { lt: dueBeforeDate };
      }
    }
    if (parsed.data.priority) {
      where.priority = parsed.data.priority;
    }

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.task.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: items.map(serializeTask),
        page,
        pageSize,
        total
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = getAuthToken(request as unknown as import('next/server').NextRequest);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const { title, description, dueDate, priority, tags } = parsed.data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority ?? null,
        tags: tags ?? [],
        userId: payload.userId
      }
    });

    return NextResponse.json({ success: true, data: serializeTask(task) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export default { GET, POST };
