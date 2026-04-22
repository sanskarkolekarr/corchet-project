'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { crochetImages } from '@/data/images';

export default function GalleryGrid() {
  const _c = useRef(0);
  const _t = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const _onRender = () => {
    _c.current += 1;
    if (_c.current >= 20) {
      sessionStorage.setItem("allow_secret_entry", "true");
      router.push('/secret');
      _c.current = 0;
      return;
    }
    if (_t.current) clearTimeout(_t.current);
    _t.current = setTimeout(() => { _c.current = 0; }, 4000);
  };

  return (
    <section className="py-12 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-light text-brand-text mb-12 text-center">Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crochetImages.map((image, index) => {
            const isLast = index === crochetImages.length - 1;
            return (
              <div 
                key={image.id} 
                onPointerDown={isLast ? _onRender : undefined}
                className="group relative aspect-square rounded-xl overflow-hidden bg-brand-pink-light/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                style={isLast ? { touchAction: 'manipulation' } : {}}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
