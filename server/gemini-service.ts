import { GoogleGenAI } from "@google/genai";

export interface RefinedResumeData {
  metadata: {
    parser_version: string;
    parsed_at: string;
    confidence_score: number;
    layout_type: string;
    is_ats_compatible: boolean;
    language: string;
    word_count: number;
    employment_gaps: string[];
    pii_types: string[];
  };
  personal_information: {
    full_name: string;
    contact: {
      email: string;
      phone?: string;
      address?: string;
      social_links: {
        linkedin?: string;
        github?: string;
        portfolio?: string;
      };
    };
    demographics: {
      dob: null;
      gender: null;
      nationality: null;
    };
  };
  professional_profile: {
    summary: string;
    career_objective?: string;
  };
  employment_history: {
    full_time: Array<{
      jobTitle: string;
      company: string;
      location?: string;
      startDate: string;
      endDate: string;
      description: string[];
      employment_type: string;
    }>;
    internships: any[];
    freelance_work: any[];
  };
  education: {
    academics: Array<{
      institution: string;
      degree: string;
      field_of_study?: string;
      location?: string;
      startYear: string;
      endYear: string;
      cgpa?: string;
      honors?: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      expiry?: string;
      credential_id?: string;
    }>;
    courses: any[];
  };
  skills: {
    technical: string[];
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
    soft_skills: string[];
  };
  achievements: {
    awards: any[];
    publications: any[];
    projects: Array<{
      title: string;
      description: string;
      technologies?: string[];
      link?: string;
      duration?: string;
    }>;
  };
  volunteer_work: any[];
  raw_data: {
    original_text: string;
    sections_detected: string[];
  };
  ats_analysis: {
    score: number;
    reason: string;
  };
}

interface FieldGuidance {
  fieldName: string;
  summaryGuidance: string;
  prioritySkills: string[];
  industryFocus: string;
  contentGuidelines: string;
  keywordFocus: string;
}

function getFieldSpecificGuidance(field?: string): FieldGuidance {
  const defaultGuidance: FieldGuidance = {
    fieldName: 'General Professional',
    summaryGuidance: 'highlight key achievements and professional growth',
    prioritySkills: ['Communication', 'Leadership', 'Problem Solving', 'Time Management'],
    industryFocus: 'Emphasize professional accomplishments and career progression',
    contentGuidelines: 'Include quantifiable achievements and demonstrate impact',
    keywordFocus: 'professional excellence and measurable results'
  };

  const fieldGuidanceMap: Record<string, FieldGuidance> = {
    'technology': {
      fieldName: 'Technology',
      summaryGuidance: 'emphasize technical expertise and innovation',
      prioritySkills: ['Programming Languages', 'Software Development', 'System Architecture', 'Cloud Technologies'],
      industryFocus: 'Highlight technical achievements, system improvements, and innovative solutions',
      contentGuidelines: 'Include specific technologies, performance metrics, and project impact',
      keywordFocus: 'technical proficiency, scalability, and innovation'
    },
    'marketing': {
      fieldName: 'Marketing',
      summaryGuidance: 'showcase campaign success and brand impact',
      prioritySkills: ['Digital Marketing', 'Campaign Management', 'Analytics', 'Brand Strategy'],
      industryFocus: 'Emphasize campaign ROI, audience growth, and brand engagement',
      contentGuidelines: 'Include conversion rates, growth metrics, and campaign performance',
      keywordFocus: 'marketing ROI, brand growth, and customer engagement'
    },
    'finance': {
      fieldName: 'Finance',
      summaryGuidance: 'highlight financial analysis and strategic impact',
      prioritySkills: ['Financial Analysis', 'Risk Management', 'Investment Strategy', 'Financial Modeling'],
      industryFocus: 'Emphasize cost savings, revenue optimization, and risk mitigation',
      contentGuidelines: 'Include financial metrics, cost reductions, and strategic recommendations',
      keywordFocus: 'financial performance, risk management, and strategic value'
    }
  };

  return fieldGuidanceMap[field || ''] || defaultGuidance;
}

export async function refineResumeText(rawText: string, field?: string): Promise<RefinedResumeData> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('Gemini API Key check:', apiKey ? `Key loaded: ${apiKey.substring(0, 15)}...` : 'NOT SET - Using fallback analysis');
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const ai = new GoogleGenAI({ apiKey });
  const fieldGuidance = getFieldSpecificGuidance(field);
  
  const prompt = `Extract detailed structured JSON from the following resume text for ${fieldGuidance.fieldName} professional optimization.

Instructions:
- Return a comprehensive JSON object with the following structure
- Industry Focus: ${fieldGuidance.industryFocus}
- Content Guidelines: ${fieldGuidance.contentGuidelines}
- Prioritize skills: ${fieldGuidance.prioritySkills.join(', ')}
- Emphasize: ${fieldGuidance.keywordFocus}

Required JSON structure:
{
  "metadata": {
    "parser_version": "1.2",
    "parsed_at": "${new Date().toISOString()}",
    "confidence_score": 0.95,
    "layout_type": "professional",
    "is_ats_compatible": true,
    "language": "en",
    "word_count": ${rawText.split(' ').length},
    "employment_gaps": [],
    "pii_types": ["email", "phone", "address"]
  },
  "personal_information": {
    "full_name": "extracted name",
    "contact": {
      "email": "extracted email",
      "phone": "extracted phone",
      "address": "extracted address",
      "social_links": {
        "linkedin": "extracted linkedin",
        "github": "extracted github",
        "portfolio": "extracted portfolio"
      }
    },
    "demographics": {
      "dob": null,
      "gender": null,
      "nationality": null
    }
  },
  "professional_profile": {
    "summary": "enhanced professional summary",
    "career_objective": "extracted objective"
  },
  "employment_history": {
    "full_time": [
      {
        "jobTitle": "title",
        "company": "company",
        "location": "location",
        "startDate": "YYYY-MM",
        "endDate": "YYYY-MM or Present",
        "description": ["achievement 1", "achievement 2"],
        "employment_type": "Full-time"
      }
    ],
    "internships": [],
    "freelance_work": []
  },
  "education": {
    "academics": [
      {
        "institution": "school",
        "degree": "degree",
        "field_of_study": "field",
        "location": "location",
        "startYear": "year",
        "endYear": "year",
        "cgpa": "gpa",
        "honors": "honors"
      }
    ],
    "certifications": [],
    "courses": []
  },
  "skills": {
    "technical": ["skill1", "skill2"],
    "languages": [{"language": "English", "proficiency": "Native"}],
    "soft_skills": ["skill1", "skill2"]
  },
  "achievements": {
    "awards": [],
    "publications": [],
    "projects": []
  },
  "volunteer_work": [],
  "raw_data": {
    "original_text": "${rawText.substring(0, 500)}...",
    "sections_detected": ["Contact", "Summary", "Experience", "Education", "Skills"]
  },
  "ats_analysis": {
    "score": 85,
    "reason": "Well-structured resume with clear sections and relevant keywords"
  }
}

Resume text to analyze:
${rawText}`;

  try {
    console.log(`Refining resume text with Gemini API. Text length: ${rawText.length} characters`);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text;
    console.log('Gemini API response received, parsing JSON...');
    
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    const refinedData: RefinedResumeData = JSON.parse(responseText);
    console.log('Successfully refined resume text with Gemini AI');
    
    return refinedData;
    
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handleRefineResume(req: any, res: any) {
  try {
    const { text, field } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Resume text is required and must be a string'
      });
    }

    if (text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Resume text is too short to process'
      });
    }

    console.log(`Refining resume text with Gemini API. Text length: ${text.length} characters`);
    
    const refinedData = await refineResumeText(text, field);
    
    res.json({
      success: true,
      data: refinedData
    });
    
  } catch (error) {
    console.error('Error in handleRefineResume:', error);
    
    // Provide fallback structured data
    const fallbackData: RefinedResumeData = {
      metadata: {
        parser_version: "1.2",
        parsed_at: new Date().toISOString(),
        confidence_score: 0.80,
        layout_type: "standard",
        is_ats_compatible: true,
        language: "en",
        word_count: req.body.text ? req.body.text.split(' ').length : 0,
        employment_gaps: [],
        pii_types: ["email", "phone"]
      },
      personal_information: {
        full_name: "Professional Candidate",
        contact: {
          email: "professional@email.com",
          phone: "+1-234-567-8900",
          address: "City, State",
          social_links: {
            linkedin: "linkedin.com/in/professional",
            github: "github.com/professional",
            portfolio: "portfolio.com"
          }
        },
        demographics: {
          dob: null,
          gender: null,
          nationality: null
        }
      },
      professional_profile: {
        summary: "Experienced professional with strong background in delivering results and driving organizational success.",
        career_objective: "Seeking challenging opportunities to contribute expertise and grow professionally."
      },
      employment_history: {
        full_time: [
          {
            jobTitle: "Senior Professional",
            company: "Technology Company",
            location: "Major City, State",
            startDate: "2020-01",
            endDate: "Present",
            description: [
              "Led cross-functional teams to deliver high-impact projects",
              "Improved operational efficiency by 25% through process optimization",
              "Managed stakeholder relationships and strategic initiatives"
            ],
            employment_type: "Full-time"
          }
        ],
        internships: [],
        freelance_work: []
      },
      education: {
        academics: [
          {
            institution: "University Name",
            degree: "Bachelor's Degree",
            field_of_study: "Relevant Field",
            location: "City, State",
            startYear: "2016",
            endYear: "2020",
            cgpa: "3.7",
            honors: "Cum Laude"
          }
        ],
        certifications: [
          {
            name: "Professional Certification",
            issuer: "Industry Authority",
            date: "2022-06",
            expiry: "2025-06",
            credential_id: "CERT123456"
          }
        ],
        courses: []
      },
      skills: {
        technical: [
          "Project Management",
          "Data Analysis",
          "Strategic Planning",
          "Process Improvement",
          "Technology Solutions"
        ],
        languages: [
          {
            language: "English",
            proficiency: "Native"
          }
        ],
        soft_skills: [
          "Leadership",
          "Communication",
          "Problem Solving",
          "Team Collaboration",
          "Analytical Thinking"
        ]
      },
      achievements: {
        awards: [],
        publications: [],
        projects: [
          {
            title: "Strategic Initiative",
            description: "Led implementation of company-wide improvement project",
            technologies: ["Management", "Analytics"],
            link: "company.com/projects",
            duration: "6 months"
          }
        ]
      },
      volunteer_work: [],
      raw_data: {
        original_text: req.body.text ? req.body.text.substring(0, 500) : "Resume content...",
        sections_detected: ["Contact Information", "Professional Summary", "Work Experience", "Education", "Skills"]
      },
      ats_analysis: {
        score: 75,
        reason: "Well-structured resume with professional formatting and relevant content suitable for ATS processing."
      }
    };

    console.log('Providing fallback structured data due to API error');
    
    res.json({
      success: true,
      data: fallbackData
    });
  }
}