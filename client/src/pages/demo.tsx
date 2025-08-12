import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Download,
  Eye,
  ArrowRight,
  X,
  Home
} from "lucide-react";
import Footer from "@/components/Footer";

interface DemoStep {
  id: string;
  title: string;
  description: string;
  duration: number;
}

const demoSteps: DemoStep[] = [
  {
    id: "upload",
    title: "Upload Your Resume",
    description: "Drag & drop PDF or DOCX files",
    duration: 3000
  },
  {
    id: "extract",
    title: "AI Text Extraction",
    description: "Processing document with advanced AI",
    duration: 4000
  },
  {
    id: "parse",
    title: "Smart Data Parsing",
    description: "Extracting structured information",
    duration: 3000
  },
  {
    id: "autofill",
    title: "Auto-Fill Form",
    description: "Populating resume fields automatically",
    duration: 4000
  },
  {
    id: "preview",
    title: "Live Preview",
    description: "Choose from professional templates",
    duration: 4000
  },
  {
    id: "download",
    title: "Multi-Format Export",
    description: "Download as PDF, DOCX, or JSON",
    duration: 3000
  }
];

const mockResumeData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  summary: "Experienced Full Stack Developer with 5+ years building scalable web applications...",
  experience: [
    { title: "Senior Developer", company: "TechCorp", period: "2021 - Present" },
    { title: "Software Engineer", company: "StartupXYZ", period: "2019 - 2021" }
  ],
  skills: ["React", "Node.js", "Python", "AWS", "Docker"]
};

const templates = [
  { name: "Modern", color: "bg-blue-500", accent: "border-blue-500" },
  { name: "Creative", color: "bg-purple-500", accent: "border-purple-500" },
  { name: "Classic", color: "bg-green-500", accent: "border-green-500" },
  { name: "Minimal", color: "bg-gray-500", accent: "border-gray-500" }
];

export default function Demo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [, setLocation] = useLocation();

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setProgress(0);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    setSelectedTemplate(0);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const currentStepData = demoSteps[currentStep];
    if (!currentStepData) {
      // Demo completed - redirect to home page features section
      setTimeout(() => {
        setLocation("/#features");
      }, 2000);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (currentStepData.duration / 50));
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (currentStep < demoSteps.length - 1) {
              setCurrentStep(currentStep + 1);
              setProgress(0);
            } else {
              setIsPlaying(false);
            }
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentStep, isPlaying]);

  // Auto-cycle templates during preview step
  useEffect(() => {
    if (currentStep === 4 && isPlaying) {
      const templateInterval = setInterval(() => {
        setSelectedTemplate(prev => (prev + 1) % templates.length);
      }, 1000);
      return () => clearInterval(templateInterval);
    }
  }, [currentStep, isPlaying]);

  const renderUploadStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center space-y-6"
    >
      <div className="relative">
        <motion.div
          animate={{ 
            y: isPlaying ? [0, -20, 0] : 0,
            rotate: isPlaying ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-32 h-40 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center"
        >
          <FileText className="w-16 h-16 text-red-600" />
          <span className="absolute -bottom-6 text-sm font-medium">resume.pdf</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isPlaying ? 1 : 0 }}
          className="absolute -right-4 -top-4"
        >
          <Upload className="w-8 h-8 text-blue-600" />
        </motion.div>
      </div>
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: isPlaying ? 1 : 0 }}
        className="w-80 h-32 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 flex items-center justify-center"
      >
        <span className="text-blue-600 font-medium">Drop files here to upload</span>
      </motion.div>
    </motion.div>
  );

  const renderExtractStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center space-y-6"
    >
      <div className="relative">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 0 0px rgba(59, 130, 246, 0.7)",
              "0 0 0 20px rgba(59, 130, 246, 0)",
              "0 0 0 0px rgba(59, 130, 246, 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-8 border-4 border-transparent border-t-blue-400 rounded-full"
        />
      </div>
      
      <div className="text-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-lg font-medium text-gray-700"
        >
          Analyzing document with AI...
        </motion.div>
        <div className="text-sm text-gray-500 mt-2">
          {Math.floor(progress)}% complete
        </div>
      </div>
    </motion.div>
  );

  const renderParseStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center space-x-8"
    >
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-gray-100 p-4 rounded-lg w-64"
      >
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
        <div className="text-xs text-gray-500 mt-2">Raw Text</div>
      </motion.div>
      
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <ArrowRight className="w-8 h-8 text-blue-600" />
      </motion.div>
      
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 border border-blue-200 p-4 rounded-lg w-64"
      >
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Name extracted</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Experience parsed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Skills identified</span>
          </div>
        </div>
        <div className="text-xs text-blue-600 mt-2">Structured Data</div>
      </motion.div>
    </motion.div>
  );

  const renderAutofillStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md space-y-4"
    >
      {[
        { label: "Full Name", value: mockResumeData.name, delay: 0 },
        { label: "Email", value: mockResumeData.email, delay: 0.3 },
        { label: "Phone", value: mockResumeData.phone, delay: 0.6 },
        { label: "Summary", value: mockResumeData.summary.substring(0, 50) + "...", delay: 0.9 }
      ].map((field, index) => (
        <motion.div
          key={field.label}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: field.delay }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <div className="relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: field.delay + 0.2, duration: 1 }}
              className="absolute inset-0 bg-green-100 rounded-md"
            />
            <motion.input
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: field.delay + 0.5 }}
              type="text"
              value={field.value}
              readOnly
              className="relative w-full px-3 py-2 border border-gray-300 rounded-md bg-transparent"
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderPreviewStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex space-x-8"
    >
      {/* Template Selector */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">Choose Template</h3>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template, index) => (
            <motion.div
              key={template.name}
              animate={{ 
                scale: selectedTemplate === index ? 1.05 : 1,
                boxShadow: selectedTemplate === index ? "0 8px 25px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.1)"
              }}
              className={`w-20 h-24 ${template.color} rounded-lg cursor-pointer relative ${
                selectedTemplate === index ? template.accent + " border-2" : "border border-gray-200"
              }`}
            >
              <div className="absolute bottom-1 left-1 right-1 bg-white bg-opacity-90 rounded text-xs text-center py-1">
                {template.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Live Preview */}
      <motion.div
        key={selectedTemplate}
        initial={{ opacity: 0.7, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 h-80 bg-white border-2 border-gray-200 rounded-lg p-4 shadow-lg"
      >
        <div className={`h-full ${templates[selectedTemplate].color} bg-opacity-10 rounded p-3 space-y-3`}>
          <div className="text-center">
            <div className="font-bold text-lg">{mockResumeData.name}</div>
            <div className="text-sm text-gray-600">{mockResumeData.email}</div>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium text-sm">Experience</div>
            {mockResumeData.experience.map((exp, i) => (
              <div key={i} className="text-xs">
                <div className="font-medium">{exp.title}</div>
                <div className="text-gray-600">{exp.company} • {exp.period}</div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="font-medium text-sm">Skills</div>
            <div className="flex flex-wrap gap-1">
              {mockResumeData.skills.map((skill, i) => (
                <span key={i} className={`px-2 py-1 ${templates[selectedTemplate].color} bg-opacity-20 rounded text-xs`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderDownloadStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center space-y-6"
    >
      <div className="grid grid-cols-3 gap-6">
        {[
          { format: "PDF", icon: "📄", color: "bg-red-100 border-red-300 text-red-700" },
          { format: "DOCX", icon: "📝", color: "bg-blue-100 border-blue-300 text-blue-700" },
          { format: "JSON", icon: "🔧", color: "bg-green-100 border-green-300 text-green-700" }
        ].map((option, index) => (
          <motion.div
            key={option.format}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.05 }}
            className={`w-24 h-32 ${option.color} border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer`}
          >
            <div className="text-3xl mb-2">{option.icon}</div>
            <div className="font-medium text-sm">{option.format}</div>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center space-x-2 text-green-600"
      >
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-medium">Resume Ready for Download!</span>
      </motion.div>
    </motion.div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderUploadStep();
      case 1: return renderExtractStep();
      case 2: return renderParseStep();
      case 3: return renderAutofillStep();
      case 4: return renderPreviewStep();
      case 5: return renderDownloadStep();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          {!isPlaying ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">
                  AI-Powered Resume Builder
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  See how our intelligent system transforms your existing resume into a professional, 
                  ATS-optimized document in minutes.
                </p>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={startDemo}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Watch Demo (90 seconds)
                </Button>
              </motion.div>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span>No signup required • See the full workflow</span>
                <Button
                  onClick={() => setLocation("/")}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Back to Home
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {demoSteps[currentStep]?.title || "Demo Complete!"}
                  </h2>
                  <p className="text-gray-600">
                    {demoSteps[currentStep]?.description || "Ready to build your resume?"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setLocation("/")}
                    variant="outline"
                    size="sm"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Home
                  </Button>
                  <Button
                    onClick={resetDemo}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close Demo
                  </Button>
                </div>
              </div>
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Step {currentStep + 1} of {demoSteps.length}</span>
                  <span>{Math.floor(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {/* Demo Content */}
              <div className="min-h-[400px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {renderCurrentStep()}
                </AnimatePresence>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Completion Animation */}
      <AnimatePresence>
        {!isPlaying && currentStep >= demoSteps.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center z-50"
          >
            <div className="text-center text-white">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0]
                }}
                transition={{ duration: 1.5 }}
                className="text-6xl mb-4"
              >
                ✨
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold mb-2"
              >
                Demo Complete!
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl opacity-90"
              >
                Redirecting to explore all features...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}