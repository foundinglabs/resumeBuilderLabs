# Resume Builder Pro

## Overview

Resume Builder Pro is a comprehensive full-stack web application that allows users to create professional resumes using multiple templates with advanced ATS (Applicant Tracking System) optimization features. Built with React, Node.js/Express, and PostgreSQL, it features a modern UI with shadcn/ui components, real-time preview functionality, and production-ready PDF/DOCX export capabilities.

## 🚀 Key Features

### Core Functionality
- **Professional Resume Builder**: Form-based editor with comprehensive sections
- **Real-time Preview**: Live preview with instant template switching
- **Multiple Export Formats**: PDF and DOCX generation with embedded links
- **ATS Optimization**: Advanced resume analysis and scoring system
- **Template System**: 12+ professional templates with distinct designs
- **File Upload & Parsing**: Extract data from existing PDF/DOCX resumes

### Advanced Features
- **ATS Resume Analysis**: Comprehensive scoring with job description matching
- **Template Categories**: Executive, Universal ATS, Tech-Focused, Academic, Entry-Level, Creative
- **Enhanced Data Mapping**: Support for all resume sections including projects, certifications, languages
- **Production-Ready PDF Generation**: Server-side processing with A4 formatting
- **Comprehensive DOCX Export**: All embedded links and sections included
- **Responsive Design**: Mobile-friendly interface with modern UI

## 🏗️ System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, Zustand for local state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API**: RESTful endpoints for resume CRUD operations
- **Session Storage**: PostgreSQL-based session store

### Key Components

1. **Resume Builder Interface**
   - Form-based resume editor with multiple sections
   - Real-time preview with template selection
   - PDF/DOCX export functionality using html2pdf.js and docx library

2. **Template System**
   - 12+ professional resume templates with distinct designs
   - Template-specific styling and layout
   - Easy template switching with live preview
   - ATS-optimized layouts

3. **Database Schema**
   - Users table for authentication
   - Resumes table with JSONB fields for flexible data storage
   - Foreign key relationships between users and resumes

## 📊 Data Flow

1. **Resume Creation**
   - User fills out form sections (personal info, experience, education, skills)
   - Data is stored in local state and synchronized with backend
   - Real-time preview updates as user types

2. **Template Selection**
   - User selects from available templates
   - Preview instantly updates with new template styling
   - Template preference is saved with resume data

3. **Data Persistence**
   - Resume data is stored in PostgreSQL with JSONB for flexibility
   - Automatic save functionality
   - Version control through updatedAt timestamps

4. **Export Process**
   - PDF: Client-side generation with html2pdf.js, A4 formatting
   - DOCX: Server-side generation with comprehensive data mapping
   - Both formats include all embedded links and sections

## 🔧 Technical Implementation

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **UI Components**: Radix UI primitives, shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **PDF Generation**: html2pdf.js for resume export
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Server**: Express.js with TypeScript support
- **Database**: Drizzle ORM with Neon serverless PostgreSQL
- **Validation**: Zod for runtime type validation
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Development**: tsx for TypeScript execution, esbuild for production builds

## 🎨 Template System

### Professional Templates
1. **Onyx (Executive)**: Formal black/gray minimalist design for senior executive positions
2. **Ditto (Universal ATS)**: Clean, simple layout with excellent ATS compatibility
3. **Kakuna (Tech-Focused)**: Two-column layout with modular sections for technical expertise
4. **Chikorita (Academic)**: Serif fonts and academic formatting for research positions
5. **Azurill (Entry-Level)**: Education-first layout perfect for new graduates
6. **Pikachu (Creative)**: Modern gradient design with visual appeal for designers

### Classic Templates
- **Classic**: Green executive template with professional styling
- **Modern**: Blue-accented professional template
- **Stylish**: Purple-themed creative template
- **Compact**: Simple, space-efficient design
- **Overleaf**: LaTeX-inspired academic template
- **Elegant**: Sophisticated typography and layout

## 📁 Project Structure

```
Resume_Builder/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── templates/     # Resume template components
│   │   ├── lib/           # Utility functions
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand state management
│   │   ├── utils/         # Helper utilities
│   │   └── types/         # TypeScript type definitions
├── server/                # Backend Express application
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   ├── db.ts            # Database configuration
│   └── gemini-service.ts # AI integration
├── shared/               # Shared schema and types
├── public/              # Static assets
└── package.json         # Project dependencies
```

## 🚀 Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- tsx for backend TypeScript execution
- Concurrent development setup with frontend and backend

### Production Build
- Frontend: Vite build output to `dist/public`
- Backend: esbuild bundle to `dist/index.js`
- Database: Drizzle migrations in `migrations/` directory
- Environment: Requires `DATABASE_URL` environment variable

### Database Management
- Schema defined in `shared/schema.ts`
- Migrations managed through Drizzle Kit
- Push-based schema updates with `npm run db:push`

## 🔄 Recent Updates (Latest)

### ✅ Production-Level ATS Checker
- **Job Description Input/Comparison**: Prominent input field for job descriptions with detailed job match scoring
- **Targeted Keyword Report**: Real-time analysis of required vs missing skills, bonus skills, and quantifiable requirements
- **Advanced Formatting Analysis**: Font analysis, layout issue detection, bullet point style assessment
- **Action Verb Analysis**: Strong vs weak verb identification with specific replacement suggestions
- **Quantifiable Results Audit**: Metrics detection and opportunities for adding numbers/percentages
- **Enhanced Readability Metrics**: Flesch-Kincaid grade level, sentence length analysis, passive voice percentage
- **Experience-Level Contextual Advice**: Tailored recommendations for different career levels
- **Tabbed Production Interface**: 6-tab comprehensive analysis (Overview, Job Match, Formatting, Action Verbs, Metrics, Readability)

### ✅ PDF/DOCX Export Enhancements
- **Fixed PDF Template Selection**: PDF now correctly reflects selected template with proper A4 formatting
- **Enhanced DOCX Generation**: All embedded links and comprehensive data sections included
- **Robust Error Handling**: Improved error handling for file generation and data mapping
- **Template Rendering Fixes**: Resolved React runtime errors and infinite loops
- **Data Mapping Improvements**: Added null checks and optional chaining for robust data processing

### ✅ Template System Improvements
- **Professional Template Categories**: Organized templates by use case and career level
- **Enhanced Template Rendering**: Fixed ResumeURL object rendering in templates
- **Responsive Design**: All templates optimized for mobile and desktop viewing
- **Print-Safe Design**: Templates optimized for both web display and PDF export

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Resume_Builder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and other configurations

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=development
PORT=3000
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema changes
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the changelog for recent updates

---

**Resume Builder Pro** - Professional resume creation with ATS optimization and modern web technologies. 