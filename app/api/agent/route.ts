import { NextRequest, NextResponse } from 'next/server';
import { postToN8n } from '../../../lib/n8n';
import { env } from '../../../lib/env';

export async function POST(req: NextRequest) {
  const { question } = await req.json().catch(() => ({ question: '' }));
  if (!question || typeof question !== 'string') {
    return NextResponse.json({ error: 'Field "question" is required.' }, { status: 400 });
  }

  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), env.N8N_TIMEOUT_MS);
  try {
    const data = await postToN8n(env.N8N_AGENT_URL, { question }, ac.signal);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    const msg = err?.message || 'Failed to query agent in n8n';
    return NextResponse.json({ error: msg }, { status: 502 });
  } finally {
    clearTimeout(id);
  }
}