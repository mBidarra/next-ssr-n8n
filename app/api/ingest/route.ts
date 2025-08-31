import { NextRequest, NextResponse } from 'next/server';
import { postToN8n } from '../../../lib/n8n';
import { env, requireEnv } from '../../../lib/env';

export async function POST(_req: NextRequest) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), env.N8N_TIMEOUT_MS);
  try {
    const url = requireEnv('N8N_INGEST_URL');
    // n8n workflow needs to respond at the end (When Last Node Finishes or Respond to Webhook in the last node).
    const data = await postToN8n(url, { source: 'next-ssr-n8n' });
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err: any) {
    const msg = err?.message || 'Falha ao iniciar ingestão no n8n';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
