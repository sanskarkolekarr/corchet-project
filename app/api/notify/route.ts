import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { type, dId } = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const groupId = process.env.TELEGRAM_GROUP_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !groupId) {
      return NextResponse.json({ success: false, error: 'Missing config' }, { status: 500 });
    }

    let message = '';
    if (type === 'access_tap') {
      message = `📱 Access Attempt!\n\nDevice ID: ${dId}\nAction: 5-Click Footer Tap\n\nIf you want to grant access, use:\n/setid ${dId}`;
    } else {
      message = `🔓 Admin Entry Logged\n\nDevice ID: ${dId || 'Unknown'}\nTime: ${new Date().toLocaleString()}`;
    }

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: groupId,
        text: message,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Notify error:', err);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
