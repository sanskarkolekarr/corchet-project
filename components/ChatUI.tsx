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
    <div className="flex flex-col h-[70vh] bg-white rounded-3xl soft-shadow border border-brand-pink-soft/30 overflow-hidden">
      {/* Header */}
      <div className="bg-brand-pink-light/30 px-6 py-4 border-b border-brand-pink-soft/20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-pink-accent flex items-center justify-center text-white">
            <span className="text-lg">C</span>
          </div>
          <div>
            <h3 className="font-medium text-brand-text">Owner Chat</h3>
            <p className="text-xs text-green-500 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] bg-fixed"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-brand-text/40 italic text-sm text-center px-8">
            Start a conversation with the owner. Messages are cleared daily at 12am.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === 'me'
                    ? 'bg-brand-pink-accent text-white rounded-tr-none'
                    : 'bg-brand-pink-light text-brand-text rounded-tl-none'
                  } soft-shadow animate-in slide-in-from-bottom-2 duration-300`}
              >
                {msg.text}
                <div className={`text-[10px] mt-1 opacity-60 text-right`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="p-4 border-t border-brand-pink-soft/20 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-5 py-3 rounded-full border border-brand-pink-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-pink-accent/30 text-brand-text text-sm transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="bg-brand-pink-accent text-white p-3 rounded-full hover:bg-brand-pink-accent/80 transition-all disabled:opacity-50 transform active:scale-90"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
