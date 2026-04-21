
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative h-[100vh] flex items-center justify-center bg-gradient-to-b from-brand-pink-light to-white overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-brand-pink-soft/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-pink-light/30 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-light text-brand-text mb-4 tracking-tight">
          Handmade Crochet Creations
        </h1>
        <p className="text-lg md:text-xl text-brand-text/70 mb-8 font-light">
          Every thread tells a story
        </p>
        <Link 
          href="/gallery"
          className="inline-block px-8 py-3 bg-brand-pink-accent hover:bg-brand-pink-accent/80 text-white rounded-full transition-all duration-300 transform hover:scale-105 soft-shadow"
        >
          View Gallery
        </Link>
      </div>
    </section>
  );
}
