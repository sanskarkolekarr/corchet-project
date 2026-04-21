'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [isIpAllowed, setIsIpAllowed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkIp = async () => {
      try {
        const res = await fetch('/api/check-ip');
        const data = await res.json();
        setIsIpAllowed(data.allowed);
      } catch (error) {
        console.error('Failed to check IP:', error);
      }
    };
    checkIp();
  }, []);

  const handleSecretClick = () => {
    if (!isIpAllowed) return; // Only allow clicks if IP is authorized

    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        router.push('/secret');
        if (timerRef.current) clearTimeout(timerRef.current);
        return 0;
      }
      return next;
    });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);
  };

  return (
    <footer className="py-12 bg-brand-pink-light/30 border-t border-brand-pink-soft/20 text-center">
      <div className="max-w-7xl mx-auto px-4">
        <h3 
          onClick={handleSecretClick}
          className="text-xl font-medium text-brand-text mb-2 cursor-default select-none active:scale-95 transition-transform"
        >
          Crochet Gallery
        </h3>
        <p className="text-sm text-brand-text/60 italic mb-6">Made with love</p>
        <div className="flex justify-center space-x-6 mb-8 text-brand-text/50">
          <a href="#" className="hover:text-brand-pink-accent transition-colors text-sm">Instagram</a>
          <a href="#" className="hover:text-brand-pink-accent transition-colors text-sm">Pinterest</a>
          <a href="#" className="hover:text-brand-pink-accent transition-colors text-sm">Etsy</a>
        </div>
        <p className="text-xs text-brand-text/40">
          &copy; {new Date().getFullYear()} Crochet Gallery. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
