"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-8 max-w-md text-center">
        <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
        <p className="text-slate-600 text-sm mb-6">The page could not load. Try refreshing.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold"
        >
          Try again
        </button>
        <p className="mt-4">
          <a href="/dashboard" className="text-sm text-primary-600 hover:underline">
            Back to dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
