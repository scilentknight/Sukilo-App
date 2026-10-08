/**
 * @param {{
 *   categories: Array<{ name: string, count: number }>,
 *   activeCategory: string | null,
 *   onSelect: (category: string | null) => void,
 * }} props
 */
export default function CategorySidebar({ categories, activeCategory, onSelect }) {
  return (
    <aside className="hidden w-52 shrink-0 lg:block">
      <div className="sticky top-32 rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-rose-100">
        <p className="px-2 text-xs font-extrabold uppercase tracking-[0.16em] text-stone-400">
          Wander
        </p>
        <ul className="mt-3 space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className={`w-full rounded-2xl px-3 py-2.5 text-left text-sm font-bold ${
                activeCategory === null
                  ? "bg-[#2b2422] text-white"
                  : "text-stone-700 hover:bg-rose-50"
              }`}
            >
              All pieces
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.name}>
              <button
                type="button"
                onClick={() => onSelect(cat.name)}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-semibold ${
                  activeCategory === cat.name
                    ? "bg-rose-50 text-[#e24b6a]"
                    : "text-stone-700 hover:bg-rose-50"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className="text-xs font-bold text-stone-400">{cat.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
