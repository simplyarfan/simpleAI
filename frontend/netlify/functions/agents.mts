export default async (req, context) => {
  const url = new URL(req.url);
  const department = url.searchParams.get('department');

  const agents = {
    "hr": [
      {
        "id": "cv_intelligence",
        "name": "CV Intelligence",
        "description": "Parse, analyze and rank resumes with AI",
        "icon": "📄",
        "status": "active",
        "metrics": {
          "processed": 1247,
          "time_saved": "312 hours",
          "accuracy": 94.5
        }
      },
      {
        "id": "interview_coordinator",
        "name": "Interview Coordinator", 
        "description": "Automated interview scheduling and coordination",
        "icon": "📅",
        "status": "active",
        "metrics": {
          "scheduled": 89,
          "conflicts_avoided": 23,
          "time_saved": "67 hours"
        }
      },
      {
        "id": "onboarding_assistant",
        "name": "Onboarding Assistant",
        "description": "Streamline new employee onboarding",
        "icon": "🎯",
        "status": "active",
        "metrics": {
          "employees_onboarded": 34,
          "completion_rate": 98.2,
          "satisfaction": 4.8
        }
      },
      {
        "id": "hr_analytics",
        "name": "HR Analytics",
        "description": "Advanced people analytics and insights",
        "icon": "📊",
        "status": "beta",
        "metrics": {
          "reports_generated": 156,
          "insights_discovered": 42,
          "accuracy": 91.3
        }
      }
    ],
    "finance": [
      {
        "id": "invoice_processor",
        "name": "Invoice Processor",
        "description": "Automated invoice processing and validation",
        "icon": "💰",
        "status": "coming_soon"
      }
    ],
    "it": [
      {
        "id": "helpdesk_resolver",
        "name": "Helpdesk Resolver",
        "description": "AI-powered ticket resolution",
        "icon": "🛠️",
        "status": "coming_soon"
      }
    ]
  };

  const responseData = department ? agents[department] || [] : agents;
  
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};

export const config = {
  path: "/api/agents"
};
