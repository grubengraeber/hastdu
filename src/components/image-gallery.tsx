'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: { url: string }[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Keine Bilder verfügbar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
        <Image
          src={images[selectedIndex].url}
          alt={`${title} - Bild ${selectedIndex + 1}`}
          fill
          className="object-contain"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
                index === selectedIndex
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={image.url}
                alt={`${title} - Vorschau ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
