// In-memory storage for demo (in production, use a database)
let batchStorage = {};
let candidateStorage = {};

// Initialize with sample data
if (Object.keys(candidateStorage).length === 0) {
  const sampleCandidates = [
    {
      id: "candidate-1",
      name: "Sarah Johnson",
      email: "sarah.j@email.com", 
      phone: "+1-555-0123",
      score: 87,
      analysis: {
        personal: {
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          phone: "+1-555-0123",
          location: "New York, NY",
          age: "29",
          gender: "Female",
          current_salary: "$95,000",
          expected_salary: "$110,000"
        },
        skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git", "AWS"],
        experience: [
          {
            company: "Tech Corp",
            position: "Senior Developer",
            duration: "2020-2023",
            description: "Led frontend development team, implemented microservices architecture"
          },
          {
            company: "StartupXYZ",
            position: "Full Stack Developer",
            duration: "2018-2020",
            description: "Built scalable web applications from scratch"
          }
        ],
        match_analysis: {
          overall_score: 87,
          skills_matched: ["JavaScript", "React", "Node.js", "Python"],
          skills_missing: ["Docker", "Kubernetes"],
          strengths: ["Strong technical background", "Leadership experience"],
          concerns: ["Limited DevOps experience"],
          recommendation: "Highly Recommended"
        }
      }
    },
    {
      id: "candidate-2",
      name: "Michael Chen",
      email: "m.chen@email.com",
      phone: "+1-555-0124",
      score: 78,
      analysis: {
        personal: {
          name: "Michael Chen",
          email: "m.chen@email.com",
          phone: "+1-555-0124",
          location: "San Francisco, CA",
          age: "26",
          gender: "Male",
          current_salary: "$85,000",
          expected_salary: "$100,000"
        },
        skills: ["Python", "Django", "PostgreSQL", "Docker", "Redis", "Linux"],
        experience: [
          {
            company: "Data Inc",
            position: "Backend Developer",
            duration: "2019-2023",
            description: "Developed and maintained RESTful APIs, optimized database queries"
          }
        ],
        match_analysis: {
          overall_score: 78,
          skills_matched: ["Python", "Django", "PostgreSQL"],
          skills_missing: ["JavaScript", "React"],
          strengths: ["Strong backend experience", "Database optimization"],
          concerns: ["Limited frontend experience"],
          recommendation: "Recommended"
        }
      }
    },
    {
      id: "candidate-3",
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      phone: "+1-555-0125",
      score: 65,
      analysis: {
        personal: {
          name: "Emily Rodriguez",
          email: "emily.r@email.com",
          phone: "+1-555-0125",
          location: "Austin, TX",
          age: "24",
          gender: "Female",
          current_salary: "$55,000",
          expected_salary: "$70,000"
        },
        skills: ["HTML", "CSS", "JavaScript", "WordPress", "Photoshop", "Figma"],
        experience: [
          {
            company: "Design Studio",
            position: "Frontend Developer",
            duration: "2021-2023",
            description: "Developed responsive websites and landing pages"
          }
        ],
        match_analysis: {
          overall_score: 65,
          skills_matched: ["HTML", "CSS", "JavaScript"],
          skills_missing: ["React", "Node.js", "Python", "SQL"],
          strengths: ["Good design sense", "Frontend fundamentals"],
          concerns: ["Limited advanced technical skills", "No backend experience"],
          recommendation: "Consider"
        }
      }
    }
  ];
  
  sampleCandidates.forEach(candidate => {
    candidateStorage[candidate.id] = candidate;
  });
}

export default async (req, context) => {
  const url = new URL(req.url);
  const method = req.method;
  
  // Handle CORS
  if (method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      }
    });
  }

  if (method === 'POST') {
    try {
      // For demo purposes, create a mock batch
      const batchId = crypto.randomUUID();
      const batchName = `Demo Batch - ${new Date().toLocaleDateString()}`;
      
      // Use sample candidates from storage
      const candidateList = Object.values(candidateStorage);
      const candidates = candidateList.map((candidate, index) => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        score: candidate.score,
        skills_matched: candidate.analysis.match_analysis.skills_matched.length,
        skills_missing: candidate.analysis.match_analysis.skills_missing.length,
        experience_years: candidate.analysis.experience.length,
        filename: `${candidate.name.replace(' ', '_')}_CV.pdf`
      }));

      // Store batch
      batchStorage[batchId] = {
        id: batchId,
        name: batchName,
        status: "completed",
        created_at: new Date().toISOString(),
        cv_count: 3,
        jd_count: 1,
        candidates: candidates
      };

      return new Response(JSON.stringify({
        batch_id: batchId,
        status: "completed",
        candidates_processed: candidates.length,
        message: "Batch processing completed successfully"
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }

  // Handle GET requests
  if (method === 'GET') {
    const queryParams = url.searchParams;
    
    // Get specific candidate details
    if (queryParams.has('candidate')) {
      const candidateId = queryParams.get('candidate');
      if (candidateStorage[candidateId]) {
        return new Response(JSON.stringify(candidateStorage[candidateId]), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      } else {
        return new Response(JSON.stringify({ error: "Candidate not found" }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }
    }
    
    // Generate candidate report
    if (queryParams.has('report')) {
      const candidateId = queryParams.get('report');
      if (candidateStorage[candidateId]) {
        const candidate = candidateStorage[candidateId];
        return new Response(JSON.stringify({
          report_data: "JVBERi0xLjQKJcOkw7zDtsO4DQoxIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAyIDAgUgo+PgplbmRvYmoK", // Mock PDF data
          filename: `${candidate.name.replace(' ', '_')}_Report.pdf`
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      } else {
        return new Response(JSON.stringify({ error: "Candidate not found" }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }
    }
    
    // Get batch results
    if (queryParams.has('batch')) {
      const batchId = queryParams.get('batch');
      if (batchStorage[batchId]) {
        return new Response(JSON.stringify({
          batch: {
            id: batchId,
            name: batchStorage[batchId].name,
            status: batchStorage[batchId].status,
            created_at: batchStorage[batchId].created_at
          },
          candidates: batchStorage[batchId].candidates
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      } else {
        return new Response(JSON.stringify({ error: "Batch not found" }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
};

export const config = {
  path: "/api/cv-intelligence"
};
