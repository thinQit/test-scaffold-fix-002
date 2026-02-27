'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName?: string;
    createdAt?: string;
  };
  token: string;
}

export function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });

    if (apiError || !data) {
      setError(apiError || 'Login failed. Please try again.');
      setLoading(false);
      return;
    }

    localStorage.setItem('token', data.token);
    login({
      id: data.user.id,
      email: data.user.email,
      name: data.user.displayName || data.user.email,
      role: 'customer',
      createdAt: data.user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    toast('Welcome back!', 'success');
    router.push('/dashboard');
  };

  return (
    <section className="mx-auto max-w-md space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="text-secondary">Use your email and password to sign in.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={loading} fullWidth>
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-sm text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

export default LoginPage;
