import { getPayload, type Payload } from "payload";
import config from "@payload-config";

// Payload's testing convention: bootstrap a single cached Payload instance
// per test file/process against the test DB (vitest.config.ts's `int`
// project sets DATABASE_URI to an isolated file, wiped by global-setup.ts).
let cached: Payload | null = null;

export async function getTestPayload(): Promise<Payload> {
  if (!cached) {
    cached = await getPayload({ config });
  }
  return cached;
}
