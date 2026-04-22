'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ChatUI from '@/components/ChatUI';

export default function ChatPage() {
  const router = useRouter();
  const [canAccess, setCanAccess] = useState(false);

  const initialized = useRef(false);

  // Access control
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const allowed = sessionStorage.getItem("allow_chat_entry");
    
    if (allowed) {
      setCanAccess(true);
    } else {
      window.location.href = "/";
    }
  }, []);

  if (!canAccess) return null;

  return (
    <div className="pt-24 pb-8 min-h-[calc(100vh-250px)] flex flex-col bg-brand-pink-light/10">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
        <header className="text-center mb-6 flex-shrink-0">
          <h1 className="text-3xl font-light text-brand-text mb-1 tracking-tight">Private Chat</h1>
          <p className="text-sm text-brand-text/50">Direct connection with the creator</p>
          <div className="w-16 h-0.5 bg-brand-pink-accent/30 mx-auto mt-2 rounded-full" />
        </header>

        <div className="flex-1 min-h-[500px] mx-auto w-full max-w-2xl">
          <ChatUI />
        </div>
      </div>
    </div>
  );
}
