'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string | number;
  text: string;
  sender: 'me' | 'owner';
  timestamp: number;
}

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Initial fetch and auto-focus
  useEffect(() => {
    fetchMessages();
    inputRef.current?.focus();

    pollInterval.current = setInterval(fetchMessages, 3000); // 3s polling

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/getMessages');
      const data = await res.json();

      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const text = inputText;
    setInputText('');
    setLoading(true);

    // Optimistic update for "me" sender
    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      text: text,
      sender: 'me',
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newMsg]);

    try {
      const res = await fetch('/api/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('Failed to send');
      
      // Refresh messages immediately after sending
      fetchMessages();
    } catch {
      alert('Failed to send message. Please try again.');
      // Remove failed message from UI
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInputText(text);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#fafafa] font-sans selection:bg-pink-100 overflow-hidden">
      {/* Header */}
      <header className="relative z-20 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-pink-50 flex items-center justify-between shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-200">
              C
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>
          </div>
          <div>
            <h1 className="text-gray-800 font-bold text-lg tracking-tight leading-none">Ayushi</h1>
            <p className="text-pink-500 text-[11px] font-semibold mt-1 uppercase tracking-wider opacity-80">Owner • Online</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2.5 rounded-xl hover:bg-pink-50 text-gray-400 hover:text-pink-500 transition-all active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scroll-smooth custom-scrollbar bg-slate-50/50"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <div className="w-16 h-16 bg-pink-100 rounded-3xl flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
            <p className="text-gray-500 font-medium text-sm">No messages yet today</p>
            <p className="text-[11px] text-gray-400 mt-1 italic">Daily reset at 12 AM IST</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender === 'me';
            const showDate = idx === 0 || new Date(messages[idx-1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

            return (
              <div key={msg.id} className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                {showDate && (
                  <div className="w-full flex justify-center my-4">
                    <span className="bg-white/60 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 shadow-sm">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className={`relative max-w-[80%] min-w-[60px] px-4 py-3 rounded-2xl shadow-sm ${
                  isMe 
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  <div className={`mt-1.5 flex items-center justify-end space-x-1 opacity-60 text-[10px] ${isMe ? 'text-white' : 'text-gray-400'}`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Input Area */}
      <footer className="relative z-20 px-6 py-6 bg-white border-t border-pink-50 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center space-x-3">
          <div className="flex-1 relative group">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a message..."
              className="w-full bg-gray-50/80 border-2 border-transparent focus:border-pink-200 focus:bg-white px-6 py-3.5 rounded-2xl text-sm transition-all outline-none text-gray-700 shadow-inner group-hover:bg-gray-100/50"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="h-[48px] w-[48px] flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl shadow-lg shadow-pink-200 hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-50 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6 rotate-45 -mt-0.5 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            )}
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 mt-4 tracking-tight">
          🔒 Messages are encrypted and cleared daily
        </p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fdf2f8;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #fce7f3;
        }
      `}</style>
    </div>
  );
}

