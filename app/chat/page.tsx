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
    <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden h-[100dvh]">
      <div className="flex-1 min-h-0 w-full flex flex-col">
        <ChatUI />
      </div>
    </div>
  );

}
