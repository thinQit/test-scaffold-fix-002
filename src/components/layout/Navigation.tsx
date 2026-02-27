'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tasks/new', label: 'New Task' },
  { href: '/settings', label: 'Settings' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">TodoApp</Link>

        <button
          type="button"
          aria-label="Toggle menu"
          className="md:hidden rounded-md border border-border p-2"
          onClick={() => setOpen(!open)}
        >
          <span className="block h-0.5 w-5 bg-foreground" />
          <span className="mt-1 block h-0.5 w-5 bg-foreground" />
          <span className="mt-1 block h-0.5 w-5 bg-foreground" />
        </button>

        <div className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-primary">
              {link.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium hover:text-primary">Login</Link>
              <Link href="/register" className="text-sm font-medium hover:text-primary">Sign Up</Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary">{user?.name}</span>
              <Button size="sm" variant="outline" onClick={logout}>Logout</Button>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link href="/login" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>Login</Link>
                <Link href="/register" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>Sign Up</Link>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => { logout(); setOpen(false); }}>
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
