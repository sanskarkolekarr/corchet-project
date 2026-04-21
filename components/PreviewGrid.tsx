
import Image from 'next/image';
import Link from 'next/link';
import { crochetImages } from '@/data/images';

export default function PreviewGrid() {
  // Take first 4 images for preview
  const previewImages = crochetImages.slice(0, 4);

  return (
    <section className="py-24 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {previewImages.map((image) => (
            <div key={image.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-brand-pink-light/30 transition-all duration-300 hover-zoom soft-shadow">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link 
            href="/gallery"
            className="inline-block px-8 py-3 border border-brand-pink-accent text-brand-pink-accent hover:bg-brand-pink-light transition-all rounded-full font-medium"
          >
            View Full Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}
