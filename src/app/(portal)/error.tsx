"use client";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="panel mx-auto max-w-lg rounded-3xl p-8">
      <h1 className="serif text-3xl">Something broke</h1>
      <p className="mt-3 text-sm text-muted">{error.message || "The portal could not load this page."}</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
