'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-lg border border-border bg-white p-6 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-secondary">Please try again or return to the dashboard.</p>
      <Button onClick={reset} className="mx-auto">Try again</Button>
    </div>
  );
}

export default Error;
