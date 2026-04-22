import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

interface TelegramMessage {
  update_id: number;
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

    // Load the last processed update ID to avoid spamming
    const offsetPath = path.join(process.cwd(), 'last_update_id.txt');
    let offset = 0;
    if (fs.existsSync(offsetPath)) {
      offset = parseInt(fs.readFileSync(offsetPath, 'utf8')) || 0;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=50&offset=${offset}&allowed_updates=["message"]`, {
      next: { revalidate: 0 }
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error('Telegram API Error:', data.description);
      return NextResponse.json({ error: data.description }, { status: 500 });
    }

    if (data.result && data.result.length > 0) {
      console.log(`Received ${data.result.length} new updates from Telegram`);
      
      let maxUpdateId = offset;

      // Handle /setid command to update the owner's device ID
      for (const update of data.result) {
        // Track the highest update_id
        if (update.update_id >= maxUpdateId) {
          maxUpdateId = update.update_id + 1;
        }

        const text = update.message?.text;
        const msgChatId = update.message?.chat?.id;

        if (text && text.startsWith('/setid ')) {
          console.log(`Found /setid command from chat ${msgChatId}: ${text}`);
          const newId = text.split(' ')[1];
          if (newId && msgChatId) {
            const { setAllowedDevice } = require('@/utils/deviceStorage');
            setAllowedDevice(newId);

            // Send confirmation back to Telegram
            try {
              console.log(`Sending confirmation to ${msgChatId}...`);
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: msgChatId,
                  text: `✅ Success! USER_DEVICE_ID has been updated to: ${newId}\n\nIt is now instantly active! No restart required.`,
                }),
              });
            } catch (err) {
              console.error('Failed to send Telegram confirmation:', err);
            }
          }
        }
      }

      // Save the new offset to mark messages as read
      fs.writeFileSync(offsetPath, String(maxUpdateId));
    }

    const messages = (data.result || [])
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
  } catch (error: any) {
    console.error('GET messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
