"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
/** Product image gallery: large view with selectable thumbnails (primary image first). */
export function ProductGallery({ images, name }) {
  const usable = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const [activeIndex, setActiveIndex] = useState(0);
  const active = usable[activeIndex];

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl border border-ink-200 bg-white">
        {active ? (
          <Image
            src={active.image_url}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
            priority
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm text-ink-400">
            No image available
          </span>
        )}
      </div>

      {usable.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-y-auto">
          {usable.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "focus-ring relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border bg-white",
                index === activeIndex ? "border-brand-500 ring-1 ring-brand-400" : "border-ink-200",
              )}
            >
              <Image src={image.image_url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
