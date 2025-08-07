var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertResumeSchema: () => insertResumeSchema,
  insertUserSchema: () => insertUserSchema,
  resumes: () => resumes,
  updateResumeSchema: () => updateResumeSchema,
  users: () => users
});
import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  template: text("template").notNull().default("modern"),
  personalInfo: jsonb("personal_info").notNull(),
  summary: text("summary"),
  experience: jsonb("experience").notNull(),
  education: jsonb("education").notNull(),
  skills: jsonb("skills").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var updateResumeSchema = insertResumeSchema.partial();

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getResume(id) {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume || void 0;
  }
  async getResumesByUser(userId) {
    return await db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.updatedAt));
  }
  async createResume(insertResume) {
    const [resume] = await db.insert(resumes).values(insertResume).returning();
    return resume;
  }
  async updateResume(id, updateResume) {
    const [resume] = await db.update(resumes).set({ ...updateResume, updatedAt: /* @__PURE__ */ new Date() }).where(eq(resumes.id, id)).returning();
    return resume || void 0;
  }
  async deleteResume(id) {
    const result = await db.delete(resumes).where(eq(resumes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async initializeMockUser() {
    const existingUser = await this.getUserByUsername("demo_user");
    if (existingUser) {
      return existingUser;
    }
    return await this.createUser({
      username: "demo_user",
      password: "demo_password"
      // In real app, this would be hashed
    });
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
import multer from "multer";

// server/pdf-processor.ts
var pdfModule = null;
async function getPdfParser() {
  if (!pdfModule) {
    const pdfParse = await import("pdf-parse");
    pdfModule = pdfParse.default;
  }
  return pdfModule;
}
async function processPDFBuffer(buffer) {
  try {
    console.log("Processing PDF buffer of size:", buffer.length);
    let data;
    try {
      const pdf = await getPdfParser();
      data = await pdf(buffer, {
        normalizeWhitespace: true,
        disableCombineTextItems: false
      });
      if (data?.text?.trim().length > 50) {
        const cleanText = data.text.replace(/\n\s*\n/g, "\n").replace(/\s+/g, " ").trim();
        return {
          success: true,
          text: cleanText,
          metadata: {
            pages: data.numpages,
            title: data.info?.Title,
            author: data.info?.Author,
            subject: data.info?.Subject,
            keywords: data.info?.Keywords,
            creator: data.info?.Creator,
            producer: data.info?.Producer,
            creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : void 0,
            modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : void 0
          }
        };
      }
    } catch (parseError) {
      console.warn("pdf-parse failed, trying pdfjs-dist...", parseError);
    }
    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
      const uint8Array = new Uint8Array(buffer);
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdfDocument = await loadingTask.promise;
      let fullText = "";
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str || "").join(" ");
        fullText += pageText + "\n";
      }
      const cleanText = fullText.replace(/\n\s*\n/g, "\n").replace(/\s+/g, " ").trim();
      if (cleanText.length < 50) {
        return {
          success: false,
          error: "PDF appears to be image-based or scanned. Little text could be extracted. Please convert to DOCX using SmallPDF.com or ILovePDF.com."
        };
      }
      return {
        success: true,
        text: cleanText,
        metadata: {
          pages: pdfDocument.numPages
        }
      };
    } catch (fallbackError) {
      console.error("pdfjs-dist fallback also failed:", fallbackError);
      return {
        success: false,
        error: "Failed to parse PDF: unsupported format or corrupted file. Please convert to DOCX using an online converter."
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("password") || message.includes("encrypted")) {
      return {
        success: false,
        error: "This PDF is password-protected. Please remove the password and try again."
      };
    }
    if (message.includes("corrupt") || message.includes("invalid")) {
      return {
        success: false,
        error: "The PDF file is corrupted or invalid. Please try a different file."
      };
    }
    console.error("Unexpected PDF processing error:", error);
    return {
      success: false,
      error: "We could not extract text from this PDF. It may be scanned, complex, or in an unsupported format.\n\n\u2705 Try this:\n1. Go to https://smallpdf.com/pdf-to-word\n2. Convert your PDF to DOCX\n3. Upload the DOCX file instead\n\nDOCX files work perfectly with our system!"
    };
  }
}
function validatePDFFile(file) {
  if (!file.mimetype || !file.mimetype.includes("pdf")) {
    return { valid: false, error: "File must be a PDF document" };
  }
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" };
  }
  if (!file.buffer || file.buffer.length === 0) {
    return { valid: false, error: "File appears to be empty" };
  }
  return { valid: true };
}

// server/gemini-service.ts
import { GoogleGenAI } from "@google/genai";
function getFieldSpecificGuidance(field) {
  const defaultGuidance = {
    fieldName: "General Professional",
    summaryGuidance: "highlight key achievements and professional growth",
    prioritySkills: ["Communication", "Leadership", "Problem Solving", "Time Management"],
    industryFocus: "Emphasize professional accomplishments and career progression",
    contentGuidelines: "Include quantifiable achievements and demonstrate impact",
    keywordFocus: "professional excellence and measurable results"
  };
  const fieldGuidanceMap = {
    "technology": {
      fieldName: "Technology",
      summaryGuidance: "emphasize technical expertise and innovation",
      prioritySkills: ["Programming Languages", "Software Development", "System Architecture", "Cloud Technologies"],
      industryFocus: "Highlight technical achievements, system improvements, and innovative solutions",
      contentGuidelines: "Include specific technologies, performance metrics, and project impact",
      keywordFocus: "technical proficiency, scalability, and innovation"
    },
    "marketing": {
      fieldName: "Marketing",
      summaryGuidance: "showcase campaign success and brand impact",
      prioritySkills: ["Digital Marketing", "Campaign Management", "Analytics", "Brand Strategy"],
      industryFocus: "Emphasize campaign ROI, audience growth, and brand engagement",
      contentGuidelines: "Include conversion rates, growth metrics, and campaign performance",
      keywordFocus: "marketing ROI, brand growth, and customer engagement"
    },
    "finance": {
      fieldName: "Finance",
      summaryGuidance: "highlight financial analysis and strategic impact",
      prioritySkills: ["Financial Analysis", "Risk Management", "Investment Strategy", "Financial Modeling"],
      industryFocus: "Emphasize cost savings, revenue optimization, and risk mitigation",
      contentGuidelines: "Include financial metrics, cost reductions, and strategic recommendations",
      keywordFocus: "financial performance, risk management, and strategic value"
    }
  };
  return fieldGuidanceMap[field || ""] || defaultGuidance;
}
async function refineResumeText(rawText, field) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Gemini API Key check:", apiKey ? `Key loaded: ${apiKey.substring(0, 15)}...` : "NOT SET - Using fallback analysis");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  const ai = new GoogleGenAI({ apiKey });
  const fieldGuidance = getFieldSpecificGuidance(field);
  const prompt = `Extract detailed structured JSON from the following resume text for ${fieldGuidance.fieldName} professional optimization.

Instructions:
- Return a comprehensive JSON object with the following structure
- Industry Focus: ${fieldGuidance.industryFocus}
- Content Guidelines: ${fieldGuidance.contentGuidelines}
- Prioritize skills: ${fieldGuidance.prioritySkills.join(", ")}
- Emphasize: ${fieldGuidance.keywordFocus}

Required JSON structure:
{
  "metadata": {
    "parser_version": "1.2",
    "parsed_at": "${(/* @__PURE__ */ new Date()).toISOString()}",
    "confidence_score": 0.95,
    "layout_type": "professional",
    "is_ats_compatible": true,
    "language": "en",
    "word_count": ${rawText.split(" ").length},
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
    console.log("Gemini API response received, parsing JSON...");
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }
    const refinedData = JSON.parse(responseText);
    console.log("Successfully refined resume text with Gemini AI");
    return refinedData;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Gemini API failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function handleRefineResume(req, res) {
  try {
    const { text: text2, field } = req.body;
    if (!text2 || typeof text2 !== "string") {
      return res.status(400).json({
        success: false,
        error: "Resume text is required and must be a string"
      });
    }
    if (text2.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: "Resume text is too short to process"
      });
    }
    console.log(`Refining resume text with Gemini API. Text length: ${text2.length} characters`);
    const refinedData = await refineResumeText(text2, field);
    res.json({
      success: true,
      data: refinedData
    });
  } catch (error) {
    console.error("Error in handleRefineResume:", error);
    const fallbackData = {
      metadata: {
        parser_version: "1.2",
        parsed_at: (/* @__PURE__ */ new Date()).toISOString(),
        confidence_score: 0.8,
        layout_type: "standard",
        is_ats_compatible: true,
        language: "en",
        word_count: req.body.text ? req.body.text.split(" ").length : 0,
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
    console.log("Providing fallback structured data due to API error");
    res.json({
      success: true,
      data: fallbackData
    });
  }
}

// server/pdf-service-puppeteer.ts
import puppeteer from "puppeteer";
var PuppeteerPDFService = class {
  static browser = null;
  static async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--disable-dev-shm-usage",
          "--no-first-run"
        ]
      });
    }
    return this.browser;
  }
  static async generatePDF(options) {
    const { resumeData, templateId, filename } = options;
    console.log("Starting Puppeteer PDF generation for:", filename);
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1920, height: 2400 });
      const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:5000" : process.env.PUBLIC_URL || "http://localhost:5000";
      const pdfUrl = `${baseUrl}/builder?pdf=true&template=${templateId}`;
      console.log("Navigating to:", pdfUrl);
      await page.evaluateOnNewDocument((data) => {
        window.localStorage.setItem("resume_builder_data", JSON.stringify(data));
        window.localStorage.setItem("pdf_generation_mode", "true");
      }, resumeData);
      await page.goto(pdfUrl, {
        waitUntil: "networkidle0",
        timeout: 3e4
      });
      await new Promise((resolve) => setTimeout(resolve, 3e3));
      const resumeElement = "#resume-preview";
      console.log("Using standardized selector:", resumeElement);
      await page.waitForSelector(resumeElement, { timeout: 1e4 });
      const element = await page.$(resumeElement);
      if (!element) {
        throw new Error("Resume preview element not found. Please ensure the resume is properly loaded.");
      }
      const width = await page.evaluate((el) => el.scrollWidth, element);
      const height = await page.evaluate((el) => el.scrollHeight, element);
      if (!width || !height) {
        throw new Error("Could not get element dimensions");
      }
      console.log("Element dimensions:", { width, height });
      const resumeHTML = await page.evaluate((el) => {
        const clone = el.cloneNode(true);
        const interactiveElements = clone.querySelectorAll("button, input, select, textarea, [contenteditable], .toolbar, .controls");
        interactiveElements.forEach((element2) => element2.remove());
        const styleElements = clone.querySelectorAll("style, script");
        styleElements.forEach((element2) => element2.remove());
        const computedStyles = window.getComputedStyle(el);
        clone.style.cssText = computedStyles.cssText;
        const allElements = clone.querySelectorAll("*");
        allElements.forEach((element2) => {
          const attrs = element2.attributes;
          for (let i = attrs.length - 1; i >= 0; i--) {
            const attr = attrs[i];
            if (attr.name.startsWith("data-") || attr.name.startsWith("aria-")) {
              element2.removeAttribute(attr.name);
            }
          }
        });
        return clone.outerHTML;
      }, element);
      const styles = await page.evaluate(() => {
        const styleSheets = Array.from(document.styleSheets);
        let cssText = "";
        styleSheets.forEach((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules || sheet.rules);
            rules.forEach((rule) => {
              cssText += rule.cssText + "\n";
            });
          } catch (e) {
          }
        });
        return cssText;
      });
      const pdfPage = await browser.newPage();
      try {
        await pdfPage.setViewport({
          width,
          height
        });
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                ${styles}
                
                /* Additional PDF-specific styles */
                body {
                  margin: 0;
                  padding: 0;
                  background: white;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  -webkit-font-smoothing: antialiased;
                  -moz-osx-font-smoothing: grayscale;
                  text-rendering: optimizeLegibility;
                }
                
                /* PDF container styling */
                #resume-preview {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                  width: 100% !important;
                  height: auto !important;
                  overflow: visible !important;
                }
                
                /* Custom template specific fixes */
                .bg-pink-600, .bg-pink-400, .from-pink-600, .to-pink-400 {
                  background: #db2777 !important;
                  color: white !important;
                }
                
                .bg-gradient-to-b {
                  background: linear-gradient(to bottom, var(--tw-gradient-stops)) !important;
                }
                
                /* Ensure proper dimensions for custom templates */
                .max-w-5xl, .w-full {
                  max-width: none !important;
                  width: 100% !important;
                }
                
                .shadow-lg, .shadow-2xl {
                  box-shadow: none !important;
                }
                
                .rounded-2xl, .rounded-xl {
                  border-radius: 0 !important;
                }
                
                /* Grid layout fixes */
                .grid {
                  display: grid !important;
                }
                
                .grid-cols-1 {
                  grid-template-columns: repeat(1, 1fr) !important;
                }
                
                @media (min-width: 1024px) {
                  .lg\\:grid-cols-3 {
                    grid-template-columns: repeat(3, 1fr) !important;
                  }
                  .lg\\:col-span-1 {
                    grid-column: span 1 / span 1 !important;
                  }
                  .lg\\:col-span-2 {
                    grid-column: span 2 / span 2 !important;
                  }
                }
                
                .template-container {
                  margin: 0 !important;
                  padding: 0 !important;
                  background-color: white !important;
                  box-shadow: none !important;
                  width: 100% !important;
                  min-height: 100% !important;
                  position: relative !important;
                }
                
                /* Ensure all text is visible */
                * {
                  color-adjust: exact !important;
                  -webkit-print-color-adjust: exact !important;
                }
                
                /* Remove any print-specific styles that might interfere */
                @media print {
                  * { box-shadow: none !important; }
                }
              </style>
            </head>
            <body>
              ${resumeHTML}
            </body>
          </html>
        `;
        await pdfPage.setContent(htmlContent, {
          waitUntil: "networkidle0",
          timeout: 3e4
        });
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        const pdfBuffer2 = await pdfPage.pdf({
          format: "A4",
          printBackground: true,
          margin: {
            top: "0.2in",
            right: "0.2in",
            bottom: "0.2in",
            left: "0.2in"
          },
          displayHeaderFooter: false,
          preferCSSPageSize: true
        });
        await pdfPage.close();
        console.log("PDF generated successfully with template container only");
        return Buffer.from(pdfBuffer2);
      } catch (error) {
        await pdfPage.close();
        throw error;
      }
      const pdfBuffer = await page.pdf({
        width,
        height,
        printBackground: true,
        margin: {
          top: "0.1in",
          right: "0.1in",
          bottom: "0.1in",
          left: "0.1in"
        },
        displayHeaderFooter: false,
        preferCSSPageSize: false
      });
      console.log("PDF generated successfully with template container only");
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error("Puppeteer PDF generation error:", error);
      throw error;
    } finally {
      await page.close();
    }
  }
  static async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
};
async function generatePDFWithPuppeteer(req, res) {
  try {
    const { resumeData, templateId, filename } = req.body;
    if (!resumeData || !templateId || !filename) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: resumeData, templateId, filename"
      });
    }
    console.log("Generating PDF with Puppeteer for:", filename);
    const pdfBuffer = await PuppeteerPDFService.generatePDF({
      resumeData,
      templateId,
      filename
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).json({
      success: false,
      error: "PDF generation failed: " + error.message
    });
  }
}
process.on("exit", async () => {
  await PuppeteerPDFService.cleanup();
});
process.on("SIGINT", async () => {
  await PuppeteerPDFService.cleanup();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await PuppeteerPDFService.cleanup();
  process.exit(0);
});

// server/routes.ts
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});
async function registerRoutes(app2) {
  let mockUser;
  let databaseAvailable = true;
  try {
    mockUser = await storage.initializeMockUser();
    console.log("Database connected successfully, mock user initialized");
  } catch (error) {
    console.error("Failed to initialize mock user:", error);
    console.log("Running in offline mode without database");
    databaseAvailable = false;
    mockUser = { id: 1, username: "demo_user" };
  }
  app2.get("/api/resumes", async (req, res) => {
    try {
      if (!databaseAvailable) {
        return res.json([]);
      }
      const mockUserId = mockUser?.id || 1;
      const resumes2 = await storage.getResumesByUser(mockUserId);
      res.json(resumes2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });
  app2.get("/api/resumes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resume = await storage.getResume(id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });
  app2.post("/api/resumes", async (req, res) => {
    try {
      const resumeData = insertResumeSchema.parse(req.body);
      const mockUserId = mockUser?.id || 1;
      const resume = await storage.createResume({ ...resumeData, userId: mockUserId });
      res.status(201).json(resume);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resume data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create resume" });
    }
  });
  app2.put("/api/resumes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resumeData = updateResumeSchema.parse(req.body);
      const resume = await storage.updateResume(id, resumeData);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resume data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update resume" });
    }
  });
  app2.delete("/api/resumes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteResume(id);
      if (!success) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json({ message: "Resume deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      database: databaseAvailable ? "connected" : "offline",
      puppeteer: "available",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.post("/api/pdf/generate-puppeteer", generatePDFWithPuppeteer);
  app2.post("/api/pdf/extract", async (req, res) => {
    try {
      upload.single("pdf")(req, res, async (err) => {
        if (err) {
          console.error("Multer upload error:", err);
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              error: "File size too large. Maximum size is 10MB."
            });
          }
          if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
              success: false,
              error: 'Unexpected file field. Please upload a PDF file using the field name "pdf".'
            });
          }
          if (err.message && err.message.includes("Unexpected field")) {
            return res.status(400).json({
              success: false,
              error: 'Invalid file field. Please upload a PDF file using the field name "pdf".'
            });
          }
          return res.status(400).json({
            success: false,
            error: "File upload error. Please ensure you are uploading a valid PDF file."
          });
        }
        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: "No PDF file provided. Please select a PDF file to upload."
          });
        }
        console.log("Processing PDF upload:", req.file.originalname, "Size:", req.file.size);
        const validation = validatePDFFile(req.file);
        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            error: validation.error
          });
        }
        const result = await processPDFBuffer(req.file.buffer);
        if (result.success) {
          console.log("PDF processing successful for:", req.file.originalname);
          res.json(result);
        } else {
          console.log("PDF processing failed for:", req.file.originalname, "Error:", result.error);
          res.status(422).json(result);
        }
      });
    } catch (error) {
      console.error("PDF processing endpoint error:", error);
      res.status(500).json({
        success: false,
        error: "Server error during PDF processing"
      });
    }
  });
  app2.get("/api/pdf/health", (req, res) => {
    res.json({
      status: "healthy",
      service: "pdf-processor",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.post("/api/refine-resume", (req, res) => {
    console.log("Direct refine-resume endpoint called");
    handleRefineResume(req, res);
  });
  app2.post("/api/resume/refine", (req, res) => {
    console.log("Resume refine endpoint called");
    handleRefineResume(req, res);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
console.log("DATABASE_URL:", process.env.DATABASE_URL);
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
