"use client";

import VisualSearchPanel from "@/components/search/VisualSearchPanel";

export default function ImageSearch() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Visual search
          </h1>
          <p className="mt-2 text-gray-600">
            Upload or capture a photo. Matching products appear immediately.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50">
          <VisualSearchPanel />
        </div>
      </div>
    </section>
  );
}
