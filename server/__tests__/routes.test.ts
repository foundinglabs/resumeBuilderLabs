import express from 'express';
import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mocks for storage to avoid real DB
const initializeMockUser = vi.fn().mockResolvedValue({ id: 1, username: 'demo_user' });
const getResumesByUser = vi.fn().mockResolvedValue([]);
const getResume = vi.fn().mockResolvedValue(undefined);
const createResume = vi.fn().mockImplementation(async (data: any) => ({ id: 2, ...data }));
const updateResume = vi.fn().mockResolvedValue(undefined);
const deleteResume = vi.fn().mockResolvedValue(false);

vi.mock('../storage', () => ({
  storage: {
    initializeMockUser,
    getResumesByUser,
    getResume,
    createResume,
    updateResume,
    deleteResume,
  },
}));

// Mock PDF processor helpers
const validatePDFFile = vi.fn().mockReturnValue({ valid: true });
const processPDFBuffer = vi.fn().mockResolvedValue({ success: true, text: 'extracted text', metadata: { pages: 1 } });
vi.mock('../pdf-processor', () => ({
  validatePDFFile,
  processPDFBuffer,
}));

// Mock Puppeteer service
const generatePDF = vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 fake'));
vi.mock('../pdf-service-puppeteer', () => ({
  PuppeteerPDFService: { generatePDF },
  generatePDFWithPuppeteer: async (req: any, res: any) => {
    try {
      const { resumeData, templateId, filename } = req.body;
      if (!resumeData || !templateId || !filename) {
        return res.status(400).json({ success: false, error: 'Missing required fields: resumeData, templateId, filename' });
      }
      const buf = await generatePDF({ resumeData, templateId, filename });
      res.setHeader('Content-Type', 'application/pdf');
      return res.send(buf);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: 'PDF generation failed: ' + e.message });
    }
  }
}));

// Helper to create a test server instance with routes mounted
async function createTestServer() {
  const { registerRoutes } = await import('../routes');
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  const httpServer = await registerRoutes(app);
  return httpServer;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('API: Health', () => {
  it('returns healthy status (online DB)', async () => {
    const server = await createTestServer();
    const res = await request(server).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(['connected', 'offline']).toContain(res.body.database);
  });

  it('returns healthy with database offline when init fails', async () => {
    initializeMockUser.mockRejectedValueOnce(new Error('db down'));
    const server = await createTestServer();
    const res = await request(server).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.database).toBe('offline');
  });
});

describe('API: Resumes', () => {
  it('GET /api/resumes returns empty array when DB offline', async () => {
    initializeMockUser.mockRejectedValueOnce(new Error('db down'));
    const server = await createTestServer();
    const res = await request(server).get('/api/resumes');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/resumes validates body', async () => {
    const server = await createTestServer();
    const res = await request(server).post('/api/resumes').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/resumes creates resume', async () => {
    const server = await createTestServer();
    const resume = {
      title: 'My Resume',
      template: 'modern',
      personalInfo: { name: 'John' },
      summary: 'Summary',
      experience: [],
      education: [],
      skills: [],
    };
    const res = await request(server).post('/api/resumes').send(resume);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 2, title: 'My Resume' });
    expect(createResume).toHaveBeenCalled();
  });

  it('GET /api/resumes/:id returns 404 when missing', async () => {
    const server = await createTestServer();
    getResume.mockResolvedValueOnce(undefined);
    const res = await request(server).get('/api/resumes/123');
    expect(res.status).toBe(404);
  });

  it('GET /api/resumes/:id returns resume when found', async () => {
    const server = await createTestServer();
    const resume = { id: 5, title: 'Found', userId: 1, template: 'modern', personalInfo: {}, experience: [], education: [], skills: [] };
    getResume.mockResolvedValueOnce(resume);
    const res = await request(server).get('/api/resumes/5');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 5, title: 'Found' });
  });

  it('PUT /api/resumes/:id validates body', async () => {
    const server = await createTestServer();
    const res = await request(server).put('/api/resumes/1').send({ title: 123 });
    expect(res.status).toBe(400);
  });

  it('PUT /api/resumes/:id returns 404 when not found', async () => {
    const server = await createTestServer();
    updateResume.mockResolvedValueOnce(undefined);
    const body = { title: 'Updated', personalInfo: {}, experience: [], education: [], skills: [] };
    const res = await request(server).put('/api/resumes/1').send(body);
    expect(res.status).toBe(404);
  });

  it('PUT /api/resumes/:id updates resume', async () => {
    const server = await createTestServer();
    const updated = { id: 1, title: 'Updated', userId: 1, template: 'modern', personalInfo: {}, experience: [], education: [], skills: [] };
    updateResume.mockResolvedValueOnce(updated as any);
    const body = { title: 'Updated', personalInfo: {}, experience: [], education: [], skills: [] };
    const res = await request(server).put('/api/resumes/1').send(body);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, title: 'Updated' });
  });

  it('DELETE /api/resumes/:id returns 404 when not found', async () => {
    const server = await createTestServer();
    deleteResume.mockResolvedValueOnce(false);
    const res = await request(server).delete('/api/resumes/1');
    expect(res.status).toBe(404);
  });

  it('DELETE /api/resumes/:id succeeds', async () => {
    const server = await createTestServer();
    deleteResume.mockResolvedValueOnce(true);
    const res = await request(server).delete('/api/resumes/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Resume deleted successfully' });
  });
});

describe('API: PDF extraction', () => {
  it('returns 400 when no file is provided', async () => {
    const server = await createTestServer();
    const res = await request(server).post('/api/pdf/extract');
    expect(res.status).toBe(400);
  });

  it('returns 400 when validation fails', async () => {
    const server = await createTestServer();
    validatePDFFile.mockReturnValueOnce({ valid: false, error: 'Invalid file' });
    const res = await request(server)
      .post('/api/pdf/extract')
      .attach('pdf', Buffer.from('fake'), { filename: 'test.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns success when processing succeeds', async () => {
    const server = await createTestServer();
    processPDFBuffer.mockResolvedValueOnce({ success: true, text: 'hello', metadata: { pages: 1 } });
    const res = await request(server)
      .post('/api/pdf/extract')
      .attach('pdf', Buffer.from('fake'), { filename: 'test.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.text).toBe('hello');
  });

  it('returns 422 when processing yields failure', async () => {
    const server = await createTestServer();
    processPDFBuffer.mockResolvedValueOnce({ success: false, error: 'Could not parse' });
    const res = await request(server)
      .post('/api/pdf/extract')
      .attach('pdf', Buffer.from('fake'), { filename: 'test.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe('API: PDF generation (Puppeteer)', () => {
  it('returns 400 when fields are missing', async () => {
    const server = await createTestServer();
    const res = await request(server).post('/api/pdf/generate-puppeteer').send({});
    expect(res.status).toBe(400);
  });

  it('returns PDF when generation succeeds', async () => {
    const server = await createTestServer();
    generatePDF.mockResolvedValueOnce(Buffer.from('%PDF-1.7 mock'));
    const res = await request(server)
      .post('/api/pdf/generate-puppeteer')
      .send({ resumeData: { name: 'X' }, templateId: 'tpl', filename: 'file' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(Buffer.isBuffer(res.body) || typeof res.body === 'string').toBeTruthy();
  });

  it('returns 500 when generation fails', async () => {
    const server = await createTestServer();
    generatePDF.mockRejectedValueOnce(new Error('boom'));
    const res = await request(server)
      .post('/api/pdf/generate-puppeteer')
      .send({ resumeData: { name: 'X' }, templateId: 'tpl', filename: 'file' });
    expect(res.status).toBe(500);
  });
});

describe('API: Resume refine', () => {
  it('returns 400 for short text', async () => {
    const server = await createTestServer();
    const res = await request(server)
      .post('/api/resume/refine')
      .send({ text: 'too short', field: 'technology' });
    expect(res.status).toBe(400);
  });

  it('returns success with fallback data when API key missing', async () => {
    const server = await createTestServer();
    const longText = 'A'.repeat(200);
    const res = await request(server)
      .post('/api/resume/refine')
      .send({ text: longText, field: 'technology' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeTruthy();
  });
});