import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { addMessage } from '@/utils/messageStorage';

export async function POST(request: Request) {
  // Check auth
  const token = (await cookies()).get('auth_token');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const personalChatId = process.env.TELEGRAM_CHAT_ID;
    const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
    
    // We send to the group if available, otherwise personal
    const targetChatId = groupChatId || personalChatId;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: text,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description }, { status: 500 });
    }

    // Save to server-side storage
    addMessage({
      id: `me-${Date.now()}`,
      text: text,
      sender: 'me',
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true, message: data.result });
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

