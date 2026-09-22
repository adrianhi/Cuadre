import crypto from 'crypto';

export function hasValidBearerToken(header: string | undefined, secret: string): boolean {
  if (!secret || !header?.startsWith('Bearer ')) return false;
  const received = Buffer.from(header.slice('Bearer '.length));
  const expected = Buffer.from(secret);
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}
