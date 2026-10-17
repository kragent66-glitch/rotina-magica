/**
 * Criptografia no próprio aparelho (Web Crypto): PIN guardado só como hash (PBKDF2) e backup
 * cifrado com senha (AES-GCM). Nada sai do celular; sem a senha, o arquivo de backup não abre.
 */
const ITERATIONS = 150_000;
const enc = new TextEncoder();
const dec = new TextDecoder();

export function toBase64(bytes: Uint8Array): string {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
}

export function fromBase64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

export function randomBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

async function baseKey(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
}

export async function hashPin(pin: string, salt: Uint8Array): Promise<string> {
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    await baseKey(pin),
    256,
  );
  return toBase64(new Uint8Array(bits));
}

export async function verifyPin(pin: string, saltB64: string, hashB64: string): Promise<boolean> {
  return (await hashPin(pin, fromBase64(saltB64))) === hashB64;
}

async function aesKey(password: string, salt: Uint8Array) {
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    await baseKey(password),
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export interface EncryptedFile {
  app: 'rumo';
  enc: 'aes-gcm';
  salt: string;
  iv: string;
  data: string;
}

export async function encryptText(text: string, password: string): Promise<EncryptedFile> {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, await aesKey(password, salt), enc.encode(text));
  return { app: 'rumo', enc: 'aes-gcm', salt: toBase64(salt), iv: toBase64(iv), data: toBase64(new Uint8Array(data)) };
}

export async function decryptText(file: EncryptedFile, password: string): Promise<string> {
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(file.iv) as BufferSource },
      await aesKey(password, fromBase64(file.salt)),
      fromBase64(file.data) as BufferSource,
    );
    return dec.decode(plain);
  } catch {
    throw new Error('Senha errada ou arquivo danificado');
  }
}

export function isEncryptedFile(value: unknown): value is EncryptedFile {
  const v = value as Partial<EncryptedFile> | null;
  return !!v && v.app === 'rumo' && v.enc === 'aes-gcm' && typeof v.data === 'string';
}

/** PIN de 4 a 8 dígitos. */
export function isValidPin(pin: string): boolean {
  return /^\d{4,8}$/.test(pin);
}
