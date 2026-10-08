import SearchResults from "@/components/search/SearchResults";

/**
 * @param {{
 *   previewUrl: string | null,
 *   status: string,
 *   results: Array<Record<string, unknown>>,
 *   errorMessage: string | null,
 *   onClear: () => void,
 * }} props
 */
export default function HomepageVisualResults({
  previewUrl,
  status,
  results,
  errorMessage,
  onClear,
}) {
  return (
    <main id="catalog" className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-rose-100 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Search photo"
                className="h-20 w-16 rounded-xl object-cover ring-1 ring-rose-100"
              />
            )}
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#e24b6a]">
                Visual search
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#2b2422]">
                {status === "searching" ? "Finding similar styles…" : "Similar products"}
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                Matches from your photo, ranked by visual similarity.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-rose-100 px-4 py-2 text-sm font-bold text-[#2b2422] hover:bg-rose-50"
          >
            Back to shop
          </button>
        </div>
        {status === "error" && errorMessage && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errorMessage}
          </p>
        )}
        {status === "empty" && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-8 text-center text-sm text-amber-900">
            No strong matches. Try a clearer product photo.
          </p>
        )}
        {status === "success" && (
          <SearchResults
            results={results}
            countLabel={`${results.length} items ranked by visual match`}
          />
        )}
      </div>
    </main>
  );
}
