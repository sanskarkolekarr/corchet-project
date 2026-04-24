import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { saveMessages, getMessages } from '@/utils/messageStorage';
import { setAllowedDevice, getAllowedDevice } from '@/utils/deviceStorage';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    chat: {
      id: number;
    };
    date: number;
  };
}

interface TelegramApiResponse {
  ok: boolean;
  description?: string;
  result?: TelegramUpdate[];
}

export async function GET() {
  // Check auth
  const token = (await cookies()).get('auth_token');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;

    // Load the last processed update ID to avoid spamming
    const offsetPath = path.join(process.cwd(), 'db', 'last_update_id.txt');
    const dataDir = path.dirname(offsetPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let offset = 0;
    if (fs.existsSync(offsetPath)) {
      offset = parseInt(fs.readFileSync(offsetPath, 'utf8')) || 0;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=50&offset=${offset}&allowed_updates=["message"]`, {
      next: { revalidate: 0 }
    });

    const data = (await response.json()) as TelegramApiResponse;
    
    if (!data.ok) {
      console.error('Telegram API Error:', data.description);
      return NextResponse.json({ success: true, messages: getMessages() });
    }

    if (data.result && data.result.length > 0) {
      let maxUpdateId = offset;
      const newIncomingMessages: Array<{
        id: string;
        text: string;
        sender: 'admin' | 'owner';
        timestamp: number;
      }> = [];

      for (const update of data.result) {
        if (update.update_id >= maxUpdateId) {
          maxUpdateId = update.update_id + 1;
        }

        const message = update.message;
        if (!message) {
          continue;
        }

        const text = message.text;
        const msgChatId = String(message.chat.id);

        // 1. Check for /setid command
        if (text && text.startsWith('/setid ')) {
          const newId = text.split(' ')[1];
          if (newId) {
            if (getAllowedDevice() !== newId) {
              setAllowedDevice(newId);
              try {
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: msgChatId,
                    text: `✅ Success! USER_DEVICE_ID updated to: ${newId}`,
                  }),
                });
              } catch {}
            }
          }
          continue;
        }

        // 2. Accept all messages and label sender based on chat type
        const isAdmin = msgChatId === String(groupChatId);
        const senderLabel = isAdmin ? 'admin' : 'owner';
        if (text) {
          newIncomingMessages.push({
            id: `tg-${message.message_id}`,
            text: text,
            sender: senderLabel,
            timestamp: message.date * 1000,
          });
        }
      }

      if (newIncomingMessages.length > 0) {
        saveMessages(newIncomingMessages);
      }

      fs.writeFileSync(offsetPath, String(maxUpdateId));
    }

    return NextResponse.json({ success: true, messages: getMessages() });
  } catch (error: unknown) {
    console.error('GET messages error:', error);
    return NextResponse.json({ success: true, messages: getMessages() });
  }
}


