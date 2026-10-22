import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
// Shared dependency-free JavaScript is also exercised by Node's test runner.
import { plannerAPI } from '../../../lib/planner-api.mjs';
export const dynamic = 'force-dynamic';
async function handle(request: Request) {
  const user = await getChatGPTUser();
  return plannerAPI(request, env.DB, user?.userId);
}
export const GET = handle;
export const PUT = handle;
