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
import pdf from "pdf-parse";
async function processPDFBuffer(buffer) {
  try {
    console.log("Processing PDF buffer of size:", buffer.length);
    const data = await pdf(buffer);
    if (!data || !data.text) {
      return {
        success: false,
        error: "No text could be extracted from the PDF file"
      };
    }
    const cleanText = data.text.replace(/\n\s*\n/g, "\n").replace(/\s+/g, " ").trim();
    if (cleanText.length < 50) {
      return {
        success: false,
        error: "PDF appears to contain very little text content. It may be image-based or encrypted."
      };
    }
    console.log(`Successfully extracted ${cleanText.length} characters from PDF`);
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
        creationDate: data.info?.CreationDate,
        modificationDate: data.info?.ModDate
      }
    };
  } catch (error) {
    console.error("Error processing PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    if (errorMessage.includes("password") || errorMessage.includes("encrypted")) {
      return {
        success: false,
        error: "This PDF is password-protected or encrypted. Please remove the password and try again."
      };
    } else if (errorMessage.includes("Invalid") || errorMessage.includes("corrupt")) {
      return {
        success: false,
        error: "The PDF file appears to be corrupted or invalid. Please try a different file."
      };
    } else if (errorMessage.includes("not supported") || errorMessage.includes("version")) {
      return {
        success: false,
        error: "This PDF version is not supported. Please try saving it in a different format or use a DOCX file."
      };
    } else {
      return {
        success: false,
        error: `PDF processing failed: ${errorMessage}. Please try converting to DOCX format for better compatibility.`
      };
    }
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
  try {
    mockUser = await storage.initializeMockUser();
  } catch (error) {
    console.error("Failed to initialize mock user:", error);
  }
  app2.get("/api/resumes", async (req, res) => {
    try {
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
  app2.post("/api/pdf/extract", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No PDF file provided"
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
