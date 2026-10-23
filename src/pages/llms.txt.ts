import { siteLlmsTxt } from '../lib/llms-endpoint';

export async function GET() {
  return siteLlmsTxt('en');
}
