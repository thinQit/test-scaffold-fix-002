import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuthToken, verifyToken } from '@/lib/auth';

const updateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  completed: z.boolean(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional()
});

const patchTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional()
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

async function getAuthUser(request: Request) {
  const token = getAuthToken(request as unknown as import('next/server').NextRequest);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findFirst({ where: { id: params.id, userId: payload.userId } });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: serializeTask(task) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const existing = await prisma.task.findFirst({ where: { id: params.id, userId: payload.userId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const { title, description, completed, dueDate, priority, tags } = parsed.data;

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title,
        description,
        completed,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority ?? null,
        tags: tags ?? []
      }
    });

    return NextResponse.json({ success: true, data: serializeTask(task) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = patchTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const existing = await prisma.task.findFirst({ where: { id: params.id, userId: payload.userId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: parsed.data.title ?? undefined,
        description: parsed.data.description ?? undefined,
        completed: parsed.data.completed ?? undefined,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        priority: parsed.data.priority ?? undefined,
        tags: parsed.data.tags ?? undefined
      }
    });

    return NextResponse.json({ success: true, data: serializeTask(task) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.task.findFirst({ where: { id: params.id, userId: payload.userId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export default { GET, PUT, PATCH, DELETE };
