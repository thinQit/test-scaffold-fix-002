'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface Profile {
  id: string;
  email: string;
  displayName?: string;
  createdAt?: string;
}

export function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const { data, error: apiError } = await api.get<Profile>('/api/users/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (apiError || !data) {
      setError(apiError || 'Unable to load profile.');
      setLoading(false);
      return;
    }

    setProfile(data);
    setDisplayName(data.displayName || '');
    setEmail(data.email || '');
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    const { data, error: apiError } = await api.put<Profile>(
      '/api/users/me',
      { displayName, email },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      } as RequestInit
    );

    if (apiError || !data) {
      toast(apiError || 'Unable to update profile.', 'error');
      setSaving(false);
      return;
    }

    setProfile(data);
    toast('Profile updated.', 'success');
    setSaving(false);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    await api.post<{ success: boolean }>(
      '/api/auth/logout',
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      } as RequestInit
    );
    logout();
    router.push('/login');
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-secondary">Manage your profile and account preferences.</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <p className="text-error">{error}</p>
          ) : !profile ? (
            <p className="text-secondary">Profile not available.</p>
          ) : (
            <form className="space-y-4" onSubmit={handleSave}>
              <Input
                label="Display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <p className="text-sm text-secondary">
                Member since: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
                <Button type="button" variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default SettingsPage;
