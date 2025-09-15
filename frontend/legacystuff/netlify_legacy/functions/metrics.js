exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify({
      "total_time_saved": 1247,
      "total_cost_saved": 84500,
      "automation_rate": 76.3,
      "user_satisfaction": 4.7,
      "active_agents": 4,
      "total_requests_today": 143,
      "department_usage": {
        "HR": 45,
        "Finance": 28,
        "IT": 15,
        "Sales": 12
      },
      "trending_agents": [
        {"name": "CV Intelligence", "usage_increase": 23.5},
        {"name": "Interview Coordinator", "usage_increase": 18.2}
      ]
    })
  };
};
