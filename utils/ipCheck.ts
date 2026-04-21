import { headers } from 'next/headers';

export async function isIpAllowed() {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const remoteAddr = headersList.get('x-real-ip');
  
  const clientIp = forwarded ? forwarded.split(',')[0] : (remoteAddr || 'unknown');
  
  const allowedIpsString = process.env.ALLOWED_IPS || '';
  const allowedIps = allowedIpsString.split(',').map(ip => ip.trim());
  
  // Return true if IP is in allowed list, or if it's local (for development)
  return allowedIps.includes(clientIp) || allowedIps.includes('::1') || allowedIps.includes('127.0.0.1');
}

export async function getClientIp() {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0] : 'unknown';
}
