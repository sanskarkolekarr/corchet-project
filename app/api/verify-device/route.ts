import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { dId } = await request.json();
    const allowedUserDevice = process.env.USER_DEVICE_ID;
    
    // Silent check for standard users
    if (dId && dId === allowedUserDevice) {
      return NextResponse.json({ allowed: true });
    }
    
    return NextResponse.json({ allowed: false });
  } catch {
    return NextResponse.json({ allowed: false }, { status: 400 });
  }
}
