import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertResumeSchema, updateResumeSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { processPDFBuffer, validatePDFFile, PDFProcessingResult } from "./pdf-processor";
import { handleRefineResume } from "./gemini-service";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize mock user on startup
  let mockUser: any;
  try {
    mockUser = await storage.initializeMockUser();
  } catch (error) {
    console.error("Failed to initialize mock user:", error);
  }

  // Resume routes
  app.get("/api/resumes", async (req, res) => {
    try {
      // Use mock user for demo purposes
      const mockUserId = mockUser?.id || 1;
      const resumes = await storage.getResumesByUser(mockUserId);
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.get("/api/resumes/:id", async (req, res) => {
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

  app.post("/api/resumes", async (req, res) => {
    try {
      const resumeData = insertResumeSchema.parse(req.body);
      // Use mock user for demo purposes
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

  app.put("/api/resumes/:id", async (req, res) => {
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

  app.delete("/api/resumes/:id", async (req, res) => {
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

  // PDF Processing API endpoint
  app.post("/api/pdf/extract", upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: "No PDF file provided" 
        });
      }

      console.log('Processing PDF upload:', req.file.originalname, 'Size:', req.file.size);

      // Validate the uploaded file
      const validation = validatePDFFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }

      // Process the PDF buffer
      const result = await processPDFBuffer(req.file.buffer);

      if (result.success) {
        console.log('PDF processing successful for:', req.file.originalname);
        res.json(result);
      } else {
        console.log('PDF processing failed for:', req.file.originalname, 'Error:', result.error);
        res.status(422).json(result);
      }
    } catch (error) {
      console.error('PDF processing endpoint error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error during PDF processing'
      });
    }
  });

  // Health check endpoint for PDF processing
  app.get("/api/pdf/health", (req, res) => {
    res.json({
      status: "healthy",
      service: "pdf-processor",
      timestamp: new Date().toISOString()
    });
  });

  // Gemini AI resume refinement endpoints
  app.post("/api/refine-resume", (req, res) => {
    console.log('Direct refine-resume endpoint called');
    handleRefineResume(req, res);
  });

  // Also register the endpoint the client is actually calling
  app.post("/api/resume/refine", (req, res) => {
    console.log('Resume refine endpoint called');
    handleRefineResume(req, res);
  });

  const httpServer = createServer(app);
  return httpServer;
}
