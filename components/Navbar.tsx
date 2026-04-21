
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-brand-pink-soft/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-medium tracking-tight text-brand-pink-accent hover:opacity-80 transition-opacity">
            Crochet Gallery
          </Link>
          <div className="flex space-x-8">
            <Link href="/" className="text-sm font-medium text-brand-text hover:text-brand-pink-accent transition-colors">
              Home
            </Link>
            <Link href="/gallery" className="text-sm font-medium text-brand-text hover:text-brand-pink-accent transition-colors">
              Gallery
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
