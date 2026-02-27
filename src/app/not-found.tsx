import Link from 'next/link';

export function NotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-lg border border-border bg-white p-6 text-center">
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-secondary">The page you are looking for does not exist.</p>
      <Link href="/" className="inline-flex rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-hover">
        Go home
      </Link>
    </div>
  );
}

export default NotFound;
