import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/layout/Navigation';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import Toaster from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'Todo Dashboard',
  description: 'A simple todo application with authentication and task management.'
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <ToastProvider>
            <Navigation />
            <main className="mx-auto w-full max-w-6xl px-4 py-6">
              {children}
            </main>
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;
