import crypto from 'crypto';
import { env } from './env';

const credentials = `${process.env.N8N_BASIC_AUTH_USER}:${process.env.N8N_BASIC_AUTH_PASS}`;
const authHeader = Buffer.from(credentials).toString('base64');

export async function postToN8n(url: string, payload: unknown, signal?: AbortSignal) {
  const body = JSON.stringify(payload || {});

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/json',
    },
    body,
    signal,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `n8n HTTP ${res.status}`);
  }

  const raw = await res.text();
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}