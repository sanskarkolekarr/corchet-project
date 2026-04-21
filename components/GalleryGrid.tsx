
'use strict';

import Image from 'next/image';
import { crochetImages } from '@/data/images';

export default function GalleryGrid() {
  return (
    <section className="py-12 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-light text-brand-text mb-12 text-center">Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crochetImages.map((image) => (
            <div 
              key={image.id} 
              className="group relative aspect-square rounded-xl overflow-hidden bg-brand-pink-light/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={image.id <= 4}
              />
              <div className="absolute inset-0 bg-brand-pink-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
