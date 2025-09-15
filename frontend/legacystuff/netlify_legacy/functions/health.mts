export default async (req, context) => {
  return new Response(JSON.stringify({
    status: 'healthy',
    message: 'Enterprise AI Hub backend is running on Netlify Functions',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};

export const config = {
  path: "/api/health"
};
