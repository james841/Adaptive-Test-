/**
 * Browser-safe password hashing using Web Crypto API (SHA-256 + salt)
 * No Node.js dependencies needed.
 */

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Simple deterministic salt based on username (consistent across logins)
function makeSalt(username: string): string {
  return `cat_system_salt_${username}_2026`
}

export async function hashPassword(password: string, username: string): Promise<string> {
  const salt = makeSalt(username)
  // Double-hash: hash(salt + hash(password))
  const inner = await sha256(password)
  return sha256(salt + inner)
}

export async function verifyPassword(
  password: string,
  username: string,
  storedHash: string,
): Promise<boolean> {
  const computed = await hashPassword(password, username)
  return computed === storedHash
}
