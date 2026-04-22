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
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize and check/clear old messages at 12am IST
  useEffect(() => {
    const checkAndLoadMessages = () => {
      const stored = localStorage.getItem('crochet_chat_history');
      const lastCleared = localStorage.getItem('crochet_chat_last_cleared');

      const now = new Date();
      // IST is UTC+5:30
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const todayIST = istTime.toISOString().split('T')[0];

      if (lastCleared !== todayIST) {
        // It's a new day or never cleared
        localStorage.setItem('crochet_chat_history', JSON.stringify([]));
        localStorage.setItem('crochet_chat_last_cleared', todayIST);
        setMessages([]);
      } else if (stored) {
        setMessages(JSON.parse(stored));
      }
    };

    checkAndLoadMessages();
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('crochet_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Polling for new messages
  useEffect(() => {
    const fetchNewMessages = async () => {
      try {
        const res = await fetch('/api/getMessages');
        const data = await res.json();

        if (data.success && data.messages) {
          setMessages(prev => {
            // Merge unique messages from owner
            const existingIds = new Set(prev.map(m => String(m.id)));
            const newOnes = data.messages.filter((m: Message) => !existingIds.has(String(m.id)));

            if (newOnes.length === 0) return prev;

            const updated = [...prev, ...newOnes].sort((a, b) => a.timestamp - b.timestamp);
            return updated;
          });
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    pollInterval.current = setInterval(fetchNewMessages, 4000); // 4 seconds poll

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const tempId = Date.now();
    const newMsg: Message = {
      id: tempId,
      text: inputText,
      sender: 'me',
      timestamp: tempId,
    };

    setLoading(true);
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    try {
      const res = await fetch('/api/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) {
        throw new Error('Failed to send');
      }
    } catch {
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f2f5] overflow-hidden">
      {/* Header */}
      <div className="bg-brand-pink-accent px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3 text-white">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
            <span className="text-lg font-bold">C</span>
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight">Crochet Owner</h3>
            <p className="text-[11px] text-white/80 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              Online
            </p>
          </div>
        </div>
        <div className="flex space-x-4 text-white/90">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </div>
      </div>

      {/* Messages area - The 'min-h-0' is crucial here */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl text-brand-text/60 text-xs text-center shadow-sm max-w-[280px]">
              🔒 Messages are end-to-end encrypted. They are cleared daily at 12am IST.
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-[14.5px] relative shadow-sm ${msg.sender === 'me'
                    ? 'bg-[#dcf8c6] text-[#303030] rounded-tr-none'
                    : 'bg-white text-[#303030] rounded-tl-none'
                  } animate-in fade-in slide-in-from-bottom-1 duration-200`}
              >
                <div className="pr-12">{msg.text}</div>
                <div className="text-[10px] absolute bottom-1 right-2 text-gray-500 flex items-center space-x-1">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  {msg.sender === 'me' && (
                    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M0 0h24v24H0z" fill="none"/><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17l-4.24-4.24-1.41 1.41 5.66 5.66L22.24 7l-1.41-1.41zM.41 13.41L1.82 12l5.66 5.66-1.41 1.41L.41 13.41z"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="p-2 bg-[#f0f2f5] border-t border-gray-200">
        <div className="flex items-center space-x-2 max-w-5xl mx-auto">
          <button type="button" className="p-2 text-gray-500 hover:text-brand-pink-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2.5 rounded-full bg-white border-none focus:ring-1 focus:ring-brand-pink-accent/20 text-[#303030] text-sm shadow-sm"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className={`${
              !inputText.trim() ? 'bg-gray-400' : 'bg-brand-pink-accent hover:scale-105'
            } text-white p-2.5 rounded-full transition-all disabled:opacity-50 shadow-md active:scale-95`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
