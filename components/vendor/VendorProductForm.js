"use client";

import { useEffect, useState } from "react";
import { createProduct, listCategories } from "@/lib/api";
import { buildProductFormData, validateVendorProduct } from "@/lib/vendor";
import ProductCreated from "@/components/vendor/ProductCreated";
import ProductFields from "@/components/vendor/ProductFields";
import ProductImagesField from "@/components/vendor/ProductImagesField";
import VendorBarcodeField from "@/components/vendor/VendorBarcodeField";

const INITIAL_VALUES = {
  name: "",
  category: "",
  brand: "",
  description: "",
  price: "",
  currency: "NPR",
  gtin: "",
};

export default function VendorProductForm() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdProduct, setCreatedProduct] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function loadCategories() {
      try {
        const data = await listCategories();
        if (!ignore) {
          setCategories(data?.items ?? []);
        }
      } catch {
        if (!ignore) {
          setCategories([]);
        }
      }
    }
    loadCategories();
    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (event) => {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };
  const handleAddImages = (files) => {
    if (images.length + files.length > 5) {
      setError("A product can have at most 5 images.");
      return;
    }
    setImages((current) => [...current, ...files]);
    setError(null);
  };
  const resetForm = () => {
    setValues(INITIAL_VALUES);
    setImages([]);
    setCreatedProduct(null);
    setError(null);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateVendorProduct(values, images);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const product = await createProduct(buildProductFormData(values, images));
      setCreatedProduct(product);
    } catch (err) {
      setError(err.message || "Unable to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (createdProduct) {
    return <ProductCreated product={createdProduct} onReset={resetForm} />;
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <ProductFields
        values={values}
        categories={categories}
        onChange={handleChange}
      />
      <VendorBarcodeField
        value={values.gtin}
        onChange={handleChange}
        onBarcode={(code) =>
          setValues((current) => ({
            ...current,
            gtin: code.replace(/\s/g, ""),
          }))
        }
      />
      <ProductImagesField
        images={images}
        onAdd={handleAddImages}
        onRemove={(index) =>
          setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))
        }
      />
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#e24b6a] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-rose-200 transition hover:bg-[#cf3d5c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Saving and indexing…" : "Add product"}
      </button>
    </form>
  );
}
