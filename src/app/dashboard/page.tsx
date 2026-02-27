'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
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
  createdAt?: string;
  updatedAt?: string;
}

interface TaskListResponse {
  items: Task[];
  page: number;
  pageSize: number;
  total: number;
}

const priorityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function DashboardPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dueBefore, setDueBefore] = useState('');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (search.trim()) params.append('search', search.trim());
    if (completedFilter) params.append('completed', completedFilter);
    if (priorityFilter) params.append('priority', priorityFilter);
    if (dueBefore) params.append('dueBefore', dueBefore);

    const token = localStorage.getItem('token');
    const { data, error: apiError } = await api.get<TaskListResponse>(`/api/tasks?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (apiError || !data) {
      setError(apiError || 'Unable to load tasks.');
      setLoading(false);
      return;
    }

    setTasks(data.items);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [page, pageSize, search, completedFilter, priorityFilter, dueBefore]);

  const toggleCompletion = async (task: Task) => {
    const token = localStorage.getItem('token');
    const updated = { ...task, completed: !task.completed };
    setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)));

    const { error: apiError } = await api.patch<Task>(`/api/tasks/${task.id}`, {
      completed: !task.completed,
    }, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    } as RequestInit);

    if (apiError) {
      setTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
      toast('Unable to update task.', 'error');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-secondary">Track your tasks, priorities, and due dates.</p>
        </div>
        <Link href="/tasks/new">
          <Button>Create task</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Filters</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              label="Search"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search by title"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Status</label>
              <select
                className="w-full rounded-md border border-border px-3 py-2"
                value={completedFilter}
                onChange={(event) => {
                  setPage(1);
                  setCompletedFilter(event.target.value);
                }}
              >
                <option value="">All</option>
                <option value="true">Completed</option>
                <option value="false">Incomplete</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Priority</label>
              <select
                className="w-full rounded-md border border-border px-3 py-2"
                value={priorityFilter}
                onChange={(event) => {
                  setPage(1);
                  setPriorityFilter(event.target.value);
                }}
              >
                <option value="">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <Input
              label="Due before"
              type="date"
              value={dueBefore}
              onChange={(event) => {
                setPage(1);
                setDueBefore(event.target.value);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Your tasks</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <p className="text-error">{error}</p>
          ) : tasks.length === 0 ? (
            <div className="space-y-2 text-center">
              <p className="text-secondary">No tasks found. Create your first task.</p>
              <Link href="/tasks/new">
                <Button size="sm">Create task</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex flex-col gap-3 rounded-md border border-border p-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/tasks/${task.id}`} className="text-lg font-semibold hover:text-primary">
                        {task.title}
                      </Link>
                      {task.completed ? (
                        <Badge variant="success">Completed</Badge>
                      ) : (
                        <Badge variant="warning">In progress</Badge>
                      )}
                    </div>
                    {task.description && <p className="text-sm text-secondary">{task.description}</p>}
                    <div className="flex flex-wrap gap-3 text-xs text-secondary">
                      <span>Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}</span>
                      <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                      {task.priority && <span>Priority: {priorityLabels[task.priority]}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleCompletion(task)}>
                      {task.completed ? 'Mark incomplete' : 'Mark complete'}
                    </Button>
                    <Link href={`/tasks/${task.id}`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-secondary">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default DashboardPage;
