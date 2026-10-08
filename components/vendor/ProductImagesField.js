import ImagePreviews from "@/components/vendor/ImagePreviews";

/**
 * @param {{
 *   images: File[],
 *   onAdd: (files: File[]) => void,
 *   onRemove: (index: number) => void,
 * }} props
 */
export default function ProductImagesField({ images, onAdd, onRemove }) {
  const remaining = 5 - images.length;
  const handleChange = (event) => {
    onAdd(Array.from(event.target.files ?? []));
    event.target.value = "";
  };
  return (
    <fieldset>
      <legend className="text-sm font-bold text-gray-800">Product images</legend>
      <p className="mt-1 text-xs leading-5 text-stone-500">
        Add 1–5 JPG, PNG, or WebP images. The first image becomes the primary photo.
      </p>
      {images.length > 0 && (
        <div className="mt-3">
          <ImagePreviews images={images} onRemove={onRemove} />
        </div>
      )}
      {remaining > 0 && (
        <label className="mt-3 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 px-5 py-6 text-center transition hover:border-[#e24b6a] hover:bg-rose-50">
          <span className="text-sm font-extrabold text-[#e24b6a]">
            Choose product images
          </span>
          <span className="mt-1 text-xs text-stone-500">
            You can add {remaining} more {remaining === 1 ? "image" : "images"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      )}
    </fieldset>
  );
}
