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

export function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await api.post<AuthResponse>('/api/auth/register', {
      email,
      password,
      displayName: displayName || undefined,
    });

    if (apiError || !data) {
      setError(apiError || 'Registration failed. Please try again.');
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
    toast('Account created successfully!', 'success');
    router.push('/dashboard');
  };

  return (
    <section className="mx-auto max-w-md space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Register</h1>
          <p className="text-secondary">Create an account to start tracking tasks.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Display name"
              name="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Optional"
            />
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={loading} fullWidth>
              Create account
            </Button>
          </form>
          <p className="mt-4 text-sm text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

export default RegisterPage;
