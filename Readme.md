# Resume Builder Labs
A full-stack resume builder with live templates, ATS analysis, and server-side PDF generation.

### Run with Docker (recommended)

```bash
# From repo root
docker compose up --build
# App available at http://localhost:5001 (mapped to container port 5000)
```

Or without compose:
```bash
docker build -t resume-builder .
docker run --rm -p 5001:5000 resume-builder
```

### Run with npm

Prereqs: Node.js 18+.
```bash
npm install
npm run dev
# App available at http://localhost:5000
```

### GitHub Actions
- Prod: auto deploys on merge/push to `main` (release to production)
- Dev: manual run (`workflow_dispatch`) deploys to development
- Required secrets are already set

### Routes & Functionality (brief)
- Frontend
  - `/` Home and templates preview
  - `/builder` Interactive resume builder (live preview, templates, download)
  - `/ats-analysis` ATS analysis (upload/parse, scoring, recommendations)

- API
  - `GET /api/health` Basic health info
  - `GET /api/resumes` List resumes (mock user if DB offline)
  - `GET /api/resumes/:id` Get resume
  - `POST /api/resumes` Create resume
  - `PUT /api/resumes/:id` Update resume
  - `DELETE /api/resumes/:id` Delete resume
  - `POST /api/pdf/extract` Parse uploaded resume PDF (`pdf` field)
  - `POST /api/pdf/generate-puppeteer` Server-side PDF generation
  - `GET /api/pdf/health` PDF service health
  - `POST /api/refine-resume` | `POST /api/resume/refine` AI-based resume refinement 