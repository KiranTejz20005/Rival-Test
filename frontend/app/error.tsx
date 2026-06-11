'use client';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Something went wrong</h1>
        <p className="text-neutral-500 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
