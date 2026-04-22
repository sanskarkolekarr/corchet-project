import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface TelegramMessage {
  message: {
    message_id: number;
    text?: string;
    chat: {
      id: number;
    };
    date: number;
  };
}

export async function GET() {
  // Check auth
  const token = (await cookies()).get('auth_token');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=50&allowed_updates=["message"]`, {
      next: { revalidate: 0 }
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description }, { status: 500 });
    }

    // Handle /setid command from any source to update the owner's chat ID
    data.result.forEach((update: any) => {
      const text = update.message?.text;
      if (text && text.startsWith('/setid ')) {
        const newId = text.split(' ')[1];
        if (newId) {
          const { updateEnv } = require('@/utils/envEditor');
          updateEnv('USER_DEVICE_ID', newId);
        }
      }
    });

    const messages = data.result
      .filter((update: TelegramMessage) => 
        update.message && 
        update.message.text && 
        String(update.message.chat.id) === String(chatId)
      )
      .map((update: TelegramMessage) => ({
        id: update.message.message_id,
        text: update.message.text,
        sender: 'owner',
        timestamp: update.message.date * 1000,
      }));

    return NextResponse.json({ success: true, messages });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
