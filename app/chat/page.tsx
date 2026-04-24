'use client';

import { useEffect, useState } from 'react';
import ChatUI from '@/components/ChatUI';

export default function ChatPage() {
  const [canAccess] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(sessionStorage.getItem('allow_chat_entry'));
  });

  // Access control
  useEffect(() => {
    if (!canAccess) {
      window.location.href = '/';
    }
  }, [canAccess]);

  if (!canAccess) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden h-[100dvh]">
      <div className="flex-1 min-h-0 w-full flex flex-col">
        <ChatUI />
      </div>
    </div>
  );

}
