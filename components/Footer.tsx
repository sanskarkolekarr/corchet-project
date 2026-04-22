'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Footer() {
  const _c1 = useRef(0);
  const _t1 = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();

  const _onTick = async () => {
    _c1.current += 1;
    if (_c1.current >= 5) {
      const dId = localStorage.getItem('d_id');
      try {
        const res = await fetch('/api/verify-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dId }),
        });
        const data = await res.json();
        
        if (data.allowed) {
          sessionStorage.setItem("allow_secret_entry", "true");
          router.push('/secret');
        }
      } catch (err) {
        console.error('Verfication error:', err);
      }
      _c1.current = 0;
      return;
    }
    if (_t1.current) clearTimeout(_t1.current);
    _t1.current = setTimeout(() => { _c1.current = 0; }, 2000);
  };

  return (
    <footer className="py-12 bg-brand-pink-light/30 border-t border-brand-pink-soft/20 text-center">
      <div className="max-w-7xl mx-auto px-4">
        <h3 
          onPointerDown={() => _onTick()}
          className="text-lg font-light text-brand-text/70 mb-2 cursor-default select-none tracking-tight"
        >
          Crochet Gallery
        </h3>
        <p className="text-sm text-brand-text/60 italic mb-6">Made with love</p>
        <div className="flex justify-center space-x-6 mb-8 text-brand-text/50 text-sm">
          <a href="#" className="hover:text-brand-pink-accent transition-colors">Instagram</a>
          <a href="#" className="hover:text-brand-pink-accent transition-colors">Pinterest</a>
          <a href="#" className="hover:text-brand-pink-accent transition-colors">Etsy</a>
        </div>
        <p className="text-xs text-brand-text/40 select-none">
          &copy; {new Date().getFullYear()} Crochet Gallery. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
