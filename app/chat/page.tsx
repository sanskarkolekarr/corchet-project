
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChatUI from '@/components/ChatUI';
import { isIpAllowed } from '@/utils/ipCheck';

export default async function ChatPage() {
  const allowed = await isIpAllowed();
  if (!allowed) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');

  // Server-side protection
  if (!authToken || authToken.value !== 'secure_session_active') {
    redirect('/secret');
  }

  return (
    <div className="pt-24 min-h-screen bg-brand-pink-light/10">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-light text-brand-text mb-2 tracking-tight">Private Chat</h1>
          <p className="text-sm text-brand-text/50">Direct connection with the creator</p>
          <div className="w-16 h-0.5 bg-brand-pink-accent/30 mx-auto mt-4 rounded-full" />
        </header>

        <div className="max-w-2xl mx-auto">
          <ChatUI />
        </div>
        
        <div className="mt-12 text-center">
           <p className="text-xs text-brand-text/30">
             Your session will expire when you close the browser tab.
           </p>
        </div>
      </div>
    </div>
  );
}
