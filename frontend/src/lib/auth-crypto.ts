/**
 * Edge-compatible password hashing using Web Crypto API SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  // Salt with site-specific salt
  const data = encoder.encode(`syntaxflow_sql_salt_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, expectedHash: string): Promise<boolean> {
  const calculatedHash = await hashPassword(password);
  return calculatedHash === expectedHash;
}
