'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ProductImage } from '@prisma/client';

export function ProductGallery({
  images,
  alt,
}: {
  images: ProductImage[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-sm border border-bone/10 bg-ash/40" />
    );
  }

  const main = images[active] ?? images[0]!;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-bone/10 bg-ash/40">
        <Image
          src={main.url}
          alt={main.alt ?? alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-sm border transition ${
                i === active ? 'border-gold/80' : 'border-bone/10 hover:border-bone/40'
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? alt}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
