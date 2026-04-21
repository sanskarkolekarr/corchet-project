
import GalleryGrid from "@/components/GalleryGrid";

export default function GalleryPage() {
  return (
    <div className="pt-24 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-brand-text mb-4 tracking-tight">Gallery</h1>
          <div className="w-24 h-1 bg-brand-pink-accent/30 mx-auto rounded-full" />
        </header>
        <GalleryGrid />
      </div>
    </div>
  );
}
