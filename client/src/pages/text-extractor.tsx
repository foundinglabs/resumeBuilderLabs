import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { ResumeTextExtractor } from "@/components/resume-text-extractor";
import { LoginSignupButton } from "@/components/LoginSignupButton";
import Footer from "@/components/Footer";

export default function TextExtractor() {
  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/builder">
                <span className="text-slate-600 hover:text-slate-800 font-medium">Resume Builder</span>
              </Link>
              <LoginSignupButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Resume Text Extractor
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Upload your PDF or DOCX resume files and extract clean, plain text for analysis, 
            processing, or integration with other tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">PDF</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">PDF Support</h3>
            <p className="text-sm text-slate-600">Extract text from PDF resumes with multi-page support</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold">DOC</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">DOCX Support</h3>
            <p className="text-sm text-slate-600">Process Microsoft Word documents with full formatting preservation</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold">AI</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Smart Detection</h3>
            <p className="text-sm text-slate-600">Automatically identify resume sections and structure</p>
          </div>
        </div>

        {/* Main Component */}
        <ResumeTextExtractor />

        {/* Technical Details */}
        <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Technical Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Supported Features</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  PDF text extraction (server-side recommended)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  DOCX document processing
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Multi-page document support
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Section detection and highlighting
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Copy to clipboard functionality
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Download as plain text
                </li>
              </ul>
            </div>
            

          </div>


        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}