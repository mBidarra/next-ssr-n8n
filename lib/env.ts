export const env = {
  N8N_AGENT_URL: process.env.N8N_AGENT_URL!,
  N8N_INGEST_URL: process.env.N8N_INGEST_URL!,
  N8N_BASIC_AUTH_USER: process.env.N8N_BASIC_AUTH_USER!,
  N8N_BASIC_AUTH_PASSWORD: process.env.N8N_BASIC_AUTH_PASSWORD!,
  N8N_TIMEOUT_MS: Number(process.env.N8N_TIMEOUT_MS || 10000),
};

type RequiredKey =
  | 'N8N_AGENT_URL'
  | 'N8N_INGEST_URL'
  | 'N8N_BASIC_USER'
  | 'N8N_BASIC_PASS';

export function requireEnv(key: RequiredKey): string {
  const v = process.env[key];
  if (!v) throw new Error(`Env var required missing: ${key}`);
  return v;
}