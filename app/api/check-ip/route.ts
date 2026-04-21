import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = await headers();
  
  // Get IP from headers (standard practice for Next.js on Vercel/etc)
  const forwarded = headersList.get('x-forwarded-for');
  const remoteAddr = headersList.get('x-real-ip');
  
  const clientIp = forwarded ? forwarded.split(',')[0] : (remoteAddr || 'unknown');
  
  const allowedIpsString = process.env.ALLOWED_IPS || '';
  const allowedIps = allowedIpsString.split(',').map(ip => ip.trim());
  
  const isAllowed = allowedIps.includes(clientIp) || allowedIps.includes('::1') || allowedIps.includes('127.0.0.1');

  return NextResponse.json({ 
    allowed: isAllowed,
    ip: clientIp // Returning IP for debugging/setup purposes
  });
}
