/**
 * @param {{
 *   currentPage: number,
 *   totalPages: number,
 *   onPageChange: (page: number) => void,
 * }} props
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }
  const first = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const last = Math.min(totalPages, first + 4);
  const pages = Array.from(
    { length: last - first + 1 },
    (_, index) => first + index
  );
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`h-10 w-10 rounded-full text-sm font-extrabold ${
            page === currentPage
              ? "bg-[#e24b6a] text-white shadow-md shadow-rose-200"
              : "border border-gray-200 bg-white text-gray-700 hover:border-rose-300"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
