const INPUT_CLASS =
  "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-[#2b2422] outline-none transition focus:border-[#e24b6a] focus:ring-2 focus:ring-rose-100";

/**
 * @param {{
 *   values: Record<string, string>,
 *   categories: Array<{ name: string }>,
 *   onChange: (event: import("react").ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
 * }} props
 */
export default function ProductFields({ values, categories, onChange }) {
  return (
    <div className="space-y-5">
      <label className="block text-sm font-bold text-gray-800">
        Product name
        <input
          name="name"
          value={values.name}
          onChange={onChange}
          placeholder="e.g. Black running shoes"
          className={INPUT_CLASS}
          required
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-bold text-gray-800">
          Category
          <input
            name="category"
            value={values.category}
            onChange={onChange}
            list="vendor-categories"
            placeholder="e.g. Footwear"
            className={INPUT_CLASS}
            required
          />
          <datalist id="vendor-categories">
            {categories.map((category) => (
              <option key={category.name} value={category.name} />
            ))}
          </datalist>
        </label>
        <label className="block text-sm font-bold text-gray-800">
          Brand
          <input
            name="brand"
            value={values.brand}
            onChange={onChange}
            placeholder="Optional"
            className={INPUT_CLASS}
          />
        </label>
      </div>
      <label className="block text-sm font-bold text-gray-800">
        Description
        <textarea
          name="description"
          value={values.description}
          onChange={onChange}
          rows={4}
          placeholder="Describe materials, fit, color, or other useful details."
          className={`${INPUT_CLASS} resize-y`}
        />
      </label>
      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <label className="block text-sm font-bold text-gray-800">
          Price
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={values.price}
            onChange={onChange}
            placeholder="0.00"
            className={INPUT_CLASS}
            required
          />
        </label>
        <label className="block text-sm font-bold text-gray-800">
          Currency
          <select
            name="currency"
            value={values.currency}
            onChange={onChange}
            className={INPUT_CLASS}
          >
            <option value="NPR">NPR</option>
            <option value="USD">USD</option>
            <option value="INR">INR</option>
          </select>
        </label>
      </div>
    </div>
  );
}
