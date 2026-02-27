'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    tags: '',
    completed: false,
  });

  const taskId = params?.id as string;

  const fetchTask = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const { data, error: apiError } = await api.get<Task>(`/api/tasks/${taskId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (apiError || !data) {
      setError(apiError || 'Unable to load task.');
      setLoading(false);
      return;
    }

    setTask(data);
    setFormState({
      title: data.title,
      description: data.description || '',
      dueDate: data.dueDate ? data.dueDate.slice(0, 10) : '',
      priority: data.priority || 'medium',
      tags: data.tags?.join(', ') || '',
      completed: data.completed,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const token = localStorage.getItem('token');
    const { data, error: apiError } = await api.put<Task>(
      `/api/tasks/${taskId}`,
      {
        title: formState.title,
        description: formState.description || undefined,
        completed: formState.completed,
        dueDate: formState.dueDate || undefined,
        priority: formState.priority || undefined,
        tags: formState.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      } as RequestInit
    );

    if (apiError || !data) {
      toast(apiError || 'Unable to update task.', 'error');
      setSaving(false);
      return;
    }

    setTask(data);
    toast('Task updated successfully.', 'success');
    setSaving(false);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    const { error: apiError } = await api.delete<{ success: boolean }>(`/api/tasks/${taskId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (apiError) {
      toast(apiError || 'Unable to delete task.', 'error');
      return;
    }

    toast('Task deleted.', 'success');
    router.push('/dashboard');
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Task detail</h1>
              <p className="text-secondary">Review and update your task information.</p>
            </div>
            {task && (
              <Badge variant={task.completed ? 'success' : 'warning'}>
                {task.completed ? 'Completed' : 'In progress'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <p className="text-error">{error}</p>
          ) : !task ? (
            <p className="text-secondary">Task not found.</p>
          ) : (
            <form className="space-y-4" onSubmit={handleSave}>
              <Input
                label="Title"
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Description</label>
                <textarea
                  className="w-full rounded-md border border-border px-3 py-2"
                  rows={4}
                  value={formState.description}
                  onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Due date"
                  type="date"
                  value={formState.dueDate}
                  onChange={(event) => setFormState((prev) => ({ ...prev, dueDate: event.target.value }))}
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">Priority</label>
                  <select
                    className="w-full rounded-md border border-border px-3 py-2"
                    value={formState.priority}
                    onChange={(event) => setFormState((prev) => ({ ...prev, priority: event.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <Input
                label="Tags"
                value={formState.tags}
                onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2"
                  value={formState.completed ? 'completed' : 'incomplete'}
                  onChange={(event) => setFormState((prev) => ({ ...prev, completed: event.target.value === 'completed' }))}
                >
                  <option value="incomplete">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                  Back to dashboard
                </Button>
                <Button type="button" variant="destructive" onClick={() => setShowDelete(true)}>
                  Delete task
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete task?">
        <p className="text-secondary">This action cannot be undone. Are you sure you want to delete this task?</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </section>
  );
}

export default TaskDetailPage;
