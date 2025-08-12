import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertResumeSchema, updateResumeSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { processPDFBuffer, validatePDFFile, PDFProcessingResult } from "./pdf-processor";
import { handleRefineResume } from "./gemini-service";
import { generatePDFWithPuppeteer } from "./pdf-service-puppeteer";

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
  let databaseAvailable = true;
  
  try {
    mockUser = await storage.initializeMockUser();
    console.log("Database connected successfully, mock user initialized");
  } catch (error) {
    console.error("Failed to initialize mock user:", error);
    console.log("Running in offline mode without database");
    databaseAvailable = false;
    // Create a fallback mock user for offline mode
    mockUser = { id: 1, username: "demo_user" };
  }

  // Resume routes
  app.get("/api/resumes", async (req, res) => {
    try {
      if (!databaseAvailable) {
        // Return empty array when database is not available
        return res.json([]);
      }
      
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

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      database: databaseAvailable ? "connected" : "offline",
      puppeteer: "available",
      timestamp: new Date().toISOString()
    });
  });

  // Puppeteer PDF Generation endpoint
  app.post("/api/pdf/generate-puppeteer", generatePDFWithPuppeteer);

  // PDF Processing API endpoint
  app.post("/api/pdf/extract", async (req, res) => {
    try {
      // Handle file upload with proper error handling
      upload.single('pdf')(req, res, async (err) => {
        if (err) {
          console.error('Multer upload error:', err);
          
          // Handle specific Multer errors
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: 'File size too large. Maximum size is 10MB.'
            });
          }
          
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              error: 'Unexpected file field. Please upload a PDF file using the field name "pdf".'
            });
          }
          
          if (err.message && err.message.includes('Unexpected field')) {
            return res.status(400).json({
              success: false,
              error: 'Invalid file field. Please upload a PDF file using the field name "pdf".'
            });
          }
          
          return res.status(400).json({
            success: false,
            error: 'File upload error. Please ensure you are uploading a valid PDF file.'
          });
        }
        
        // Check if file was uploaded
        if (!req.file) {
          return res.status(400).json({ 
            success: false, 
            error: "No PDF file provided. Please select a PDF file to upload." 
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
      });
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
