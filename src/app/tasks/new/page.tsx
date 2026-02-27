'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
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

export function NewTaskPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    const { data, error: apiError } = await api.post<Task>(
      '/api/tasks',
      {
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
        priority: priority || undefined,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      } as RequestInit
    );

    if (apiError || !data) {
      setError(apiError || 'Unable to create task.');
      setLoading(false);
      return;
    }

    toast('Task created successfully!', 'success');
    router.push('/dashboard');
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Create task</h1>
          <p className="text-secondary">Add details to stay organized and on track.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Description</label>
              <textarea
                className="w-full rounded-md border border-border px-3 py-2"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Due date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Priority</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <Input
              label="Tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Comma separated"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={loading}>
                Create task
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export default NewTaskPage;
