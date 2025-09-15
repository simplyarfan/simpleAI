const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');
const pdf = require('pdf-parse');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage
let batches = [];
let candidatesData = [];

// Generate unique ID
function generateId() {
  return uuidv4();
}

// Parse multipart form data
function parseMultipartData(body, boundary) {
  console.log('Parsing multipart data, boundary:', boundary);
  
  const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body, 'base64');
  const boundaryDelimiter = `--${boundary}`;
  const parts = [];
  
  // Split by boundary
  const bodyStr = bodyBuffer.toString('binary');
  const sections = bodyStr.split(boundaryDelimiter);
  
  console.log(`Found ${sections.length} sections`);
  
  for (let i = 1; i < sections.length - 1; i++) {
    const section = sections[i];
    if (!section.trim()) continue;
    
    const headerEndIndex = section.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) continue;
    
    const headers = section.substring(0, headerEndIndex);
    const content = section.substring(headerEndIndex + 4);
    
    // Parse Content-Disposition header
    const nameMatch = headers.match(/name="([^"]+)"/);
    if (!nameMatch) continue;
    
    const fieldName = nameMatch[1];
    console.log(`Processing field: ${fieldName}`);
    
    if (headers.includes('filename=')) {
      // File upload
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      if (filenameMatch) {
        const filename = filenameMatch[1];
        // Convert content back to binary buffer
        const binaryContent = Buffer.from(content, 'binary');
        
        console.log(`File: ${filename}, size: ${binaryContent.length} bytes`);
        
        parts.push({
          name: fieldName,
          filename,
          content: binaryContent
        });
      }
    } else {
      // Regular form field
      const value = content.replace(/\r\n$/, '').trim();
      console.log(`Field ${fieldName}: ${value}`);
      
      parts.push({
        name: fieldName,
        content: Buffer.from(value, 'utf8')
      });
    }
  }
  
  console.log(`Parsed ${parts.length} parts successfully`);
  return parts;
}

// Extract text from PDF buffer
async function extractTextFromPDF(pdfBuffer) {
  try {
    console.log('Extracting text from PDF, buffer size:', pdfBuffer.length);
    const data = await pdf(pdfBuffer);
    console.log('PDF text extracted, length:', data.text ? data.text.length : 0);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return null;
  }
}

// Basic CV info parser as fallback
function parseBasicCVInfo(cvText, filename) {
  console.log('Using basic CV parsing fallback');
  
  const lines = cvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = cvText.match(emailRegex);
  
  // Extract phone
  const phoneRegex = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
  const phoneMatch = cvText.match(phoneRegex);
  
  // Extract name (usually first non-empty line)
  const name = lines.length > 0 ? lines[0] : filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
  
  // Extract skills (look for common skill keywords)
  const skillKeywords = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS', 'SQL', 'Git', 'AWS', 'Docker'];
  const foundSkills = skillKeywords.filter(skill => 
    cvText.toLowerCase().includes(skill.toLowerCase())
  );
  
  return {
    personal: {
      name: name,
      email: emailMatch ? emailMatch[0] : "Not specified",
      phone: phoneMatch ? phoneMatch[0] : "Not specified",
      location: "Not specified",
      age: "Not specified",
      gender: "Not specified",
      current_salary: "Not specified",
      expected_salary: "Not specified"
    },
    skills: foundSkills.length > 0 ? foundSkills : ["Skills extraction failed"],
    experience: [{
      company: "Experience parsing failed",
      position: "Please check CV format",
      duration: "Unknown",
      description: "Basic parsing could not extract detailed experience"
    }],
    education: [{
      degree: "Education parsing failed",
      institution: "Please check CV format",
      year: "Unknown"
    }],
    summary: "Basic CV parsing completed - some information may be missing"
  };
}

// Analyze CV using OpenAI
async function analyzeCVWithOpenAI(cvText, filename) {
  console.log('Starting CV analysis with OpenAI...');
  console.log('CV text length:', cvText ? cvText.length : 0);
  
  if (!cvText || cvText.trim().length < 50) {
    console.log('CV text too short or empty, using fallback');
    throw new Error('CV text is too short or empty');
  }
  
  try {
    const prompt = `You are an expert CV parser. Extract information from this resume/CV text and return ONLY a valid JSON object. Do not include any explanatory text, just the JSON.

CV Text:
${cvText.substring(0, 3000)}

Return this exact JSON structure:
{
  "personal": {
    "name": "full name from CV",
    "email": "email from CV or Not specified",
    "phone": "phone from CV or Not specified",
    "location": "location from CV or Not specified",
    "age": "age if mentioned or Not specified",
    "gender": "gender if mentioned or Not specified",
    "current_salary": "current salary if mentioned or Not specified",
    "expected_salary": "expected salary if mentioned or Not specified"
  },
  "skills": ["list of all skills found"],
  "experience": [
    {
      "company": "company name",
      "position": "job title",
      "duration": "time period",
      "description": "brief description"
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "school name",
      "year": "graduation year"
    }
  ],
  "summary": "brief professional summary"
}`;

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.1,
    });

    console.log('OpenAI response received');
    const responseContent = completion.choices[0].message.content.trim();
    console.log('OpenAI response content:', responseContent.substring(0, 200));
    
    const result = JSON.parse(responseContent);
    
    // Ensure skills is an array
    if (!Array.isArray(result.skills)) {
      result.skills = [];
    }
    
    // Ensure experience and education are arrays
    if (!Array.isArray(result.experience)) {
      result.experience = [];
    }
    if (!Array.isArray(result.education)) {
      result.education = [];
    }
    
    return result;
  } catch (error) {
    console.error('CV analysis error:', error.message);
    console.error('Error details:', error);
    
    // Try basic text parsing as fallback
    if (cvText && cvText.length > 50) {
      console.log('Attempting basic text parsing fallback...');
      return parseBasicCVInfo(cvText, filename);
    }
    
    // Final fallback
    return {
      personal: {
        name: filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' '),
        email: "Not specified",
        phone: "Not specified",
        location: "Not specified",
        age: "Not specified",
        gender: "Not specified",
        current_salary: "Not specified",
        expected_salary: "Not specified"
      },
      skills: ["Unable to extract skills"],
      experience: [{
        company: "Unable to extract",
        position: "Unable to extract",
        duration: "Unable to extract",
        description: "CV parsing failed - please check file format"
      }],
      education: [{
        degree: "Unable to extract",
        institution: "Unable to extract",
        year: "Unable to extract"
      }],
      summary: "CV analysis failed - please try uploading again"
    };
  }
}

// Analyze Job Description using OpenAI
async function analyzeJobDescription(jdText, filename) {
  try {
    const prompt = `Analyze this Job Description and return as JSON:\n\n${jdText}\n\nReturn JSON with:\n{\n  "position_title": "Job Title",\n  "company": "Company Name",\n  "required_skills": ["skill1", "skill2", ...],\n  "experience_required": "X years" or "X-Y years",\n  "responsibilities": ["responsibility1", "responsibility2", ...],\n  "domain": "Industry/Domain"\n}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.1,
    });

    const result = JSON.parse(completion.choices[0].message.content.trim());
    
    // Ensure required_skills is an array
    if (!Array.isArray(result.required_skills)) {
      result.required_skills = [];
    }
    if (!Array.isArray(result.responsibilities)) {
      result.responsibilities = [];
    }
    
    return result;
  } catch (error) {
    console.error('JD analysis error:', error);
    return {
      position_title: "Software Engineer",
      company: "TechCorp",
      required_skills: ["JavaScript", "Python", "React"],
      experience_required: "3-5 years",
      responsibilities: ["Develop software", "Collaborate with team"],
      domain: "Technology"
    };
  }
}

// Perform intelligent CV-JD matching using OpenAI
async function performCVJDMatching(cvData, jdData) {
  try {
    const prompt = `Analyze how well this candidate matches the job requirements. Be specific and detailed.

CANDIDATE CV:
Name: ${cvData.personal.name}
Skills: ${cvData.skills.join(', ')}
Experience: ${cvData.experience.map(exp => `${exp.position} at ${exp.company} (${exp.duration})`).join('; ')}
Education: ${cvData.education.map(edu => `${edu.degree} from ${edu.institution} (${edu.year})`).join('; ')}

JOB REQUIREMENTS:
Position: ${jdData.position_title}
Required Skills: ${jdData.required_skills.join(', ')}
Experience Required: ${jdData.experience_required}
Responsibilities: ${jdData.responsibilities.join(', ')}

Provide detailed analysis as JSON:
{
  "overall_score": 75,
  "skills_matched": ["List specific skills that match"],
  "skills_missing": ["List specific skills candidate lacks"],
  "strengths": ["Specific strengths based on CV vs JD"],
  "concerns": ["Specific concerns or gaps"],
  "recommendations": ["Specific hiring recommendations"],
  "fit_level": "High|Medium|Low",
  "recommendation": "Highly Recommended|Recommended|Consider|Not Recommended"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.1,
    });

    const result = JSON.parse(completion.choices[0].message.content.trim());
    
    // Ensure all arrays exist
    result.skills_matched = result.skills_matched || [];
    result.skills_missing = result.skills_missing || [];
    result.strengths = result.strengths || [];
    result.concerns = result.concerns || [];
    result.recommendations = result.recommendations || [];
    
    // Ensure score is within range
    result.overall_score = Math.min(100, Math.max(0, result.overall_score || 75));
    
    return result;
  } catch (error) {
    console.error('CV-JD matching error:', error);
    
    // Fallback to basic matching logic
    const cvSkills = cvData.skills.map(s => s.toLowerCase());
    const jdSkills = jdData.required_skills.map(s => s.toLowerCase());
    
    const matchedSkills = cvSkills.filter(skill => 
      jdSkills.some(jdSkill => 
        skill.includes(jdSkill) || jdSkill.includes(skill) || skill === jdSkill
      )
    );
    
    const skillMatchRate = jdSkills.length > 0 ? (matchedSkills.length / jdSkills.length) : 0.5;
    const overall_score = Math.round(70 + (skillMatchRate * 30));
    
    return {
      overall_score,
      skills_matched: matchedSkills.slice(0, 5),
      skills_missing: jdSkills.filter(skill => 
        !cvSkills.some(cvSkill => cvSkill.includes(skill) || skill.includes(cvSkill))
      ).slice(0, 3),
      strengths: skillMatchRate > 0.6 ? ['Good skill alignment'] : ['Some relevant experience'],
      concerns: skillMatchRate < 0.4 ? ['Limited skill match'] : [],
      recommendations: [`Score: ${overall_score}%`],
      fit_level: overall_score >= 85 ? 'High' : overall_score >= 75 ? 'Medium' : 'Low',
      recommendation: overall_score >= 85 ? 'Highly Recommended' : overall_score >= 75 ? 'Recommended' : 'Consider'
    };
  }
}

// Generate PDF report
function generatePDFReport(batch, candidates) {
  const content = `CV INTELLIGENCE REPORT\n\nBatch: ${batch.name}\nDate: ${new Date(batch.created_at).toLocaleDateString()}\nCandidates: ${candidates.length}\n\nRANKED CANDIDATES:\n${candidates.map((c, i) => `${i+1}. ${c.name} - Score: ${c.score}% - ${c.fit_level} Fit`).join('\n')}\n\nGenerated: ${new Date().toLocaleString()}`;
  return Buffer.from(content).toString('base64');
}

// Main handler function
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const path = event.path.replace('/.netlify/functions/cv-intelligence', '');

    // POST: Create batch with CV and JD analysis
    if (event.httpMethod === 'POST' && (path === '' || path === '/')) {
      const contentType = event.headers['content-type'] || event.headers['Content-Type'];
      
      if (!contentType?.includes('multipart/form-data')) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Content-Type must be multipart/form-data" }) };
      }

      const boundary = contentType.split('boundary=')[1];
      if (!boundary) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing boundary" }) };
      }

      const body = Buffer.isBuffer(event.body) ? event.body : Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
      const parts = parseMultipartData(body, boundary);
      
      let batchName = '';
      const cvFiles = [];
      let jdFile = null;

      for (const part of parts) {
        if (part.name === 'batchName') {
          batchName = part.content.toString('utf8');
        } else if (part.name === 'cvFiles') {
          cvFiles.push({ filename: part.filename, content: part.content });
        } else if (part.name === 'jdFile') {
          jdFile = { filename: part.filename, content: part.content };
        }
      }

      if (!batchName || cvFiles.length === 0 || !jdFile) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing batchName, cvFiles, or jdFile" }) };
      }

      // Process JD file
      let jdAnalysis;
      try {
        let jdText = '';
        if (jdFile.filename.toLowerCase().endsWith('.pdf')) {
          jdText = await extractTextFromPDF(jdFile.content);
        } else {
          jdText = jdFile.content.toString('utf8');
        }
        
        if (jdText) {
          jdAnalysis = await analyzeJobDescription(jdText, jdFile.filename);
        } else {
          throw new Error('Could not extract text from JD file');
        }
      } catch (error) {
        console.error('JD processing error:', error);
        // Fallback JD analysis
        jdAnalysis = {
          position_title: "Software Engineer",
          company: "TechCorp", 
          required_skills: ["JavaScript", "Python", "React", "Node.js", "SQL"],
          experience_required: "3-5 years",
          responsibilities: ["Develop software", "Collaborate with team"],
          domain: "Technology"
        };
      }

      // Create batch
      const batchId = generateId();
      const batch = {
        id: batchId,
        name: batchName,
        created_at: new Date().toISOString(),
        candidate_count: cvFiles.length,
        jd_analysis: jdAnalysis,
        status: 'completed'
      };
      batches.push(batch);

      // Process CVs
      const candidates = [];
      for (const cvFile of cvFiles) {
        try {
          console.log(`Processing CV: ${cvFile.filename}`);
          
          // Extract text from CV
          let cvText = '';
          if (cvFile.filename.toLowerCase().endsWith('.pdf')) {
            cvText = await extractTextFromPDF(cvFile.content);
          } else {
            cvText = cvFile.content.toString('utf8');
          }
          
          let cvData;
          if (cvText) {
            cvData = await analyzeCVWithOpenAI(cvText, cvFile.filename);
          } else {
            throw new Error('Could not extract text from CV file');
          }
          
          const matchingResult = await performCVJDMatching(cvData, jdAnalysis);

          const candidate = {
            id: generateId(),
            batch_id: batchId,
            name: cvData.personal.name || 'Name not found',
            email: cvData.personal.email || 'Email not found',
            phone: cvData.personal.phone || 'Phone not found',
            location: cvData.personal.location || 'Location not found',
            age: cvData.personal.age || 'N/A',
            gender: cvData.personal.gender || 'N/A',
            current_salary: cvData.personal.current_salary || 'N/A',
            expected_salary: cvData.personal.expected_salary || 'N/A',
            score: matchingResult.overall_score,
            skills_matched: matchingResult.skills_matched.length,
            skills_missing: matchingResult.skills_missing.length,
            experience_years: cvData.experience.length,
            fit_level: matchingResult.fit_level,
            filename: cvFile.filename,
            analysis: {
              personal: cvData.personal,
              skills: cvData.skills,
              experience: cvData.experience,
              education: cvData.education,
              match_analysis: matchingResult
            },
            created_at: new Date().toISOString()
          };

          candidates.push(candidate);
          candidatesData.push(candidate);
        } catch (error) {
          console.error(`Error processing CV ${cvFile.filename}:`, error);
        }
      }

      candidates.sort((a, b) => b.score - a.score);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          batch,
          candidates: candidates.map(c => ({
            id: c.id,
            name: c.name,
            score: c.score,
            fit_level: c.fit_level
          }))
        })
      };
    }

    // GET: Get candidates for batch
    if (event.httpMethod === 'GET' && path.startsWith('/candidates/')) {
      const batchId = path.replace('/candidates/', '');
      const batchCandidates = candidatesData.filter(c => c.batch_id === batchId);
      return { statusCode: 200, headers, body: JSON.stringify(batchCandidates) };
    }

    // GET: Generate report
    if (event.httpMethod === 'GET' && path.startsWith('/report/')) {
      const batchId = path.replace('/report/', '');
      const batch = batches.find(b => b.id === batchId);
      const batchCandidates = candidatesData.filter(c => c.batch_id === batchId);
      
      if (!batch) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Batch not found' }) };
      }

      const reportContent = generatePDFReport(batch, batchCandidates);
      
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="CV_Report_${batch.name.replace(/\s+/g, '_')}.txt"`
        },
        body: reportContent,
        isBase64Encoded: true
      };
    }

    // GET: List all batches
    if (event.httpMethod === 'GET' && (path === '' || path === '/')) {
      return { statusCode: 200, headers, body: JSON.stringify(batches) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Endpoint not found' }) };

  } catch (error) {
    console.error('CV Intelligence error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
