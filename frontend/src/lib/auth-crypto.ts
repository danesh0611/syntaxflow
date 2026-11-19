/**
 * Edge-compatible password hashing (PBKDF2) and lightweight HMAC auth tokens.
 *
 * - Passwords use PBKDF2-SHA256 with a random 16-byte per-user salt (600 000 iterations).
 * - Legacy SHA-256 hashes (from before the upgrade) are auto-detected during
 *   verification so existing users can still log in. The login route re-hashes
 *   them with PBKDF2 on next successful login.
 * - Auth tokens are HMAC-SHA256 signed, containing the user email and expiry.
 */

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;
const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ── Hex helpers ──────────────────────────────────────────────────────────────

function toHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// ── Password hashing ─────────────────────────────────────────────────────────

/**
 * Hash a password with PBKDF2 + random per-user salt.
 * Returns `"salt_hex:hash_hex"`.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    HASH_BITS,
  );
  return `${toHex(salt)}:${toHex(hashBuffer)}`;
}

/**
 * Verify a password against a stored hash.
 * Supports both the new PBKDF2 format (`salt:hash`) and the legacy SHA-256 format.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  if (storedHash.includes(':')) {
    // New PBKDF2 format
    const [saltHex, expectedHashHex] = storedHash.split(':');
    const salt = fromHex(saltHex);
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const hashBuffer = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
      keyMaterial,
      HASH_BITS,
    );
    return toHex(hashBuffer) === expectedHashHex;
  }

  // Legacy SHA-256 fallback (old format without colon)
  return verifyLegacyPassword(password, storedHash);
}

/** Check if a stored hash uses the old SHA-256 format (needs migration). */
export function isLegacyHash(storedHash: string): boolean {
  return !storedHash.includes(':');
}

/** Legacy SHA-256 verification — kept only for migration. */
async function verifyLegacyPassword(password: string, expectedHash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`syntaxflow_sql_salt_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return toHex(hashBuffer) === expectedHash;
}

// ── Auth tokens (HMAC-SHA256) ────────────────────────────────────────────────

function getTokenSecret(): string {
  return (
    process.env.AUTH_TOKEN_SECRET ||
    process.env.SANITY_WEBHOOK_SECRET ||
    'sf-auth-fallback-replace-me'
  );
}

/**
 * Generate a signed auth token for a given email.
 * Format: `base64(email).timestamp.hmac_hex`
 */
export async function generateAuthToken(email: string): Promise<string> {
  const secret = getTokenSecret();
  const timestamp = Date.now().toString();
  const emailB64 = btoa(email.toLowerCase().trim());
  const payload = `${emailB64}.${timestamp}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return `${payload}.${toHex(sig)}`;
}

/**
 * Verify an auth token and return the user email if valid, or `null`.
 * Tokens older than 30 days are rejected.
 */
export async function verifyAuthToken(token: string): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [emailB64, timestamp, sigHex] = parts;

    // Check expiry
    const age = Date.now() - parseInt(timestamp, 10);
    if (isNaN(age) || age > TOKEN_MAX_AGE_MS || age < 0) return null;

    const secret = getTokenSecret();
    const payload = `${emailB64}.${timestamp}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromHex(sigHex) as BufferSource,
      encoder.encode(payload),
    );

    if (!valid) return null;
    return atob(emailB64);
  } catch {
    return null;
  }
}
