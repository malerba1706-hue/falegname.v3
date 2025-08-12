export async function hashPassword(plain) {
  const enc = new TextEncoder().encode(plain);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
