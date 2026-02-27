import Link from 'next/link';

export function HomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Welcome to your Todo Dashboard</h1>
        <p className="mt-2 text-secondary">
          Manage tasks, track progress, and stay organized with filters and priorities.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-hover">
            Go to Dashboard
          </Link>
          <Link href="/login" className="rounded-md border border-border px-4 py-2 hover:bg-muted">
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
