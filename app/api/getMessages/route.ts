
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isIpAllowed } from '@/utils/ipCheck';

export async function GET() {
  // Check IP
  const allowed = await isIpAllowed();
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check auth
  const token = (await cookies()).get('auth_token');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // We fetch recent updates. Note: In a production app, you might want to use a database
    // to store these, but for this requirement, we'll proxy getUpdates.
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=50&allowed_updates=["message"]`, {
      next: { revalidate: 0 } // Disable caching
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description }, { status: 500 });
    }

    // Filter messages only for this specific Chat ID
    // We handle both incoming (from user) and outgoing (from bot - though getUpdates only shows incoming)
    // Actually, getUpdates only shows messages RECEIVED by the bot.
    // If the bot sends a message, it won't show up in getUpdates.
    // However, the requirement says "the chat should transfer to my id only".
    // This usually means the web user sends a message, it goes to the owner's Telegram (done via sendMessage).
    // If the owner REPLIES in Telegram, the web user should see it.
    
    const messages = data.result
      .filter((update: any) => 
        update.message && 
        update.message.text && // Ensure it's a text message
        String(update.message.chat.id) === String(chatId)
      )
      .map((update: any) => ({
        id: update.message.message_id,
        text: update.message.text,
        sender: 'owner', // Messages from the owner to the bot
        timestamp: update.message.date * 1000,
      }));

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
