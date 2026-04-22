import { NextResponse } from 'next/server';
import { getAllowedDevice } from '@/utils/deviceStorage';

export async function POST(request: Request) {
  try {
    const { dId } = await request.json();
    const allowedUserDevice = getAllowedDevice();
    
    // Silent check for standard users
    if (dId && dId === allowedUserDevice) {
      return NextResponse.json({ allowed: true });
    }
    
    return NextResponse.json({ allowed: false });
  } catch {
    return NextResponse.json({ allowed: false }, { status: 400 });
  }
}
