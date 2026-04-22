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

    // Handle /setid command to update the owner's device ID
    for (const update of data.result) {
      const text = update.message?.text;
      const msgChatId = update.message?.chat?.id;

      if (text && text.startsWith('/setid ') && msgChatId) {
        const newId = text.split(' ')[1];
        if (newId) {
          const { updateEnv } = require('@/utils/envEditor');
          updateEnv('USER_DEVICE_ID', newId);

          // Send confirmation back to Telegram
          try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: msgChatId,
                text: `✅ Success! USER_DEVICE_ID has been updated to: ${newId}\n\nNote: You must run 'docker restart crochet_web' on the VPS for this change to take effect in the app.`,
              }),
            });
          } catch (err) {
            console.error('Failed to send Telegram confirmation:', err);
          }
        }
      }
    }

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
