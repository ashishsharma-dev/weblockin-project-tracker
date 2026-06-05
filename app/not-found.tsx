import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-[2rem] border bg-card/90 p-10 text-center shadow-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">404 Error</p>
        <h1 className="mt-4 text-4xl font-bold">Page not found</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you requested does not exist or you may not have access to it.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
