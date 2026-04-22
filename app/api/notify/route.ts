import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { dId } = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const groupId = process.env.TELEGRAM_GROUP_CHAT_ID;

    // Set the auth token cookie so they can actually send/receive messages
    (await cookies()).set('auth_token', 'secure_session_active', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    // Notify Telegram Group about the high-level Admin entry
    if (botToken && groupId) {
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: groupId,
            text: `🔓 Admin Direct Access!\n\nDevice ID: ${dId || 'Unknown'}\nMethod: 20-Click Gallery Trigger\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
          }),
        });
      } catch (err) {
        console.error('Failed to send admin notification:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
