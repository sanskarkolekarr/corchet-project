import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password, dId } = await request.json();
    const secretPassword = process.env.SECRET_PASSWORD;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const allowedUserDevice = process.env.USER_DEVICE_ID;
    const allowedAdminDevice = process.env.ADMIN_DEVICE_ID;

    const isMatch = password === secretPassword && dId === allowedUserDevice;
    const isAdminMatch = password === adminPassword;

    if (isMatch || isAdminMatch) {
      // Set session cookie
      (await cookies()).set('auth_token', 'secure_session_active', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      // Notify Telegram Group ONLY about Admin logins
      if (isAdminMatch) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const groupId = process.env.TELEGRAM_GROUP_CHAT_ID;
        
        if (botToken && groupId) {
          try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: groupId,
                text: `🔒 Admin Login Verified!\n\nDevice ID: ${dId || 'Unknown'}\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
              }),
            });
          } catch (err) {
            console.error('Failed to send admin notification:', err);
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        v: isAdminMatch ? 1 : 0 
      });
    }

    return NextResponse.json(
      { success: false, message: 'Incorrect password' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    );
  }
}
