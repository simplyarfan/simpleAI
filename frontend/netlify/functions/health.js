exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify({
      status: 'healthy',
      message: 'Enterprise AI Hub backend is running on Netlify Functions',
      timestamp: new Date().toISOString()
    })
  };
};
