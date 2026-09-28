// This is a Vercel Serverless Function, which runs on the server.
// It can safely access environment variables.
// It requires Vercel KV to be set up and connected to the project.
// Environment variables: KV_REST_API_URL, KV_REST_API_TOKEN

interface VercelResponse {
  status: (code: number) => VercelResponse;
  setHeader: (key: string, value: string) => void;
  json: (body: any) => void;
  send: (body: string) => void;
}

interface VercelRequest {
  method: string;
  body: {
    type: 'pageView' | 'analysis';
  };
}

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

/**
 * A simple fetch-based client for Vercel KV to execute commands.
 */
async function kv(command: string, ...args: (string | number)[]) {
  if (!KV_URL || !KV_TOKEN) {
    throw new Error('KV database is not configured.');
  }
  
  const response = await fetch(`${KV_URL}/${command}/${args.join('/')}`, {
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
    },
    // Ensure we always get the latest value from the database.
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`KV command failed: ${await response.text()}`);
  }

  return response.json();
}

/**
 * API handler for getting and incrementing global usage statistics.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS and cache headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }
  
  try {
    // If the request is a POST, increment the relevant counter.
    if (req.method === 'POST') {
      const { type } = req.body;
      if (type === 'pageView') {
        await kv('incr', 'globalPageViews');
      } else if (type === 'analysis') {
        await kv('incr', 'globalAnalysisCount');
      } else if (type) {
        // If an invalid type is passed, return a bad request error.
        return res.status(400).json({ error: 'Invalid increment type specified.' });
      }
    }

    // After any operation (or for a GET request), fetch the latest counts.
    const [pageViewsResult, analysisCountResult] = await Promise.all([
      kv('get', 'globalPageViews').catch(() => ({ result: '0' })),
      kv('get', 'globalAnalysisCount').catch(() => ({ result: '0' })),
    ]);
    
    const pageViews = parseInt(pageViewsResult.result || '0', 10);
    const analysisCount = parseInt(analysisCountResult.result || '0', 10);

    // Return the latest statistics.
    return res.status(200).json({ pageViews, analysisCount });

  } catch (error) {
    console.error('Error with stats handler:', error);
    // If the KV database isn't set up, return zeros gracefully so the UI doesn't break.
    if (error instanceof Error && error.message.includes('KV database is not configured')) {
      return res.status(200).json({ pageViews: 0, analysisCount: 0, error: 'Stats service is not available.' });
    }
    // For other errors, return a generic server error.
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
