import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileText, Palette, Sparkles, Edit, Check, Target, Star } from "lucide-react";
import { allTemplates, getCustomTemplates, getReactiveResumeTemplates, getTemplatePreviewUrl } from "@/utils/template-integration";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-slate-800">ResumeBuilder Pro</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#templates" className="text-slate-600 hover:text-blue-600 transition-colors">Templates</a>
              <Link href="/ats-analysis" className="text-slate-600 hover:text-blue-600 transition-colors">
                ATS Analysis
              </Link>
              <Link href="/text-extractor" className="text-slate-600 hover:text-blue-600 transition-colors">
                Text Extractor
              </Link>
              <Link href="/builder">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // Clear any URL hash before navigation
                    if (window.location.hash) {
                      window.history.replaceState(null, '', window.location.pathname);
                    }
                  }}
                >
                  Start Building
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fadeInUp">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              Create Your Perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Resume
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Build professional resumes in minutes with our AI-powered tools, live preview, and stunning templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/builder">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => {
                    // Clear any URL hash before navigation
                    if (window.location.hash) {
                      window.history.replaceState(null, '', window.location.pathname);
                    }
                  }}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Building Resume
                </Button>
              </Link>
              <Link href="/ats-analysis">
                <Button variant="outline" className="border-2 border-slate-300 text-slate-700 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-slate-50">
                  <Target className="mr-2 h-5 w-5" />
                  ATS Checker
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Why Choose ResumeBuilder Pro?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to create, customize, and download your perfect resume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Live Preview */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 hover:shadow-lg transition-shadow group">
              <CardContent className="p-8">
                <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Eye className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Live Preview</h3>
                <p className="text-slate-600">See your resume update in real-time as you make changes. No more guessing how it looks!</p>
              </CardContent>
            </Card>

            {/* Feature 2: PDF Export */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 hover:shadow-lg transition-shadow group">
              <CardContent className="p-8">
                <div className="bg-green-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">PDF Export</h3>
                <p className="text-slate-600">Download your resume as a high-quality PDF ready for printing or sharing.</p>
              </CardContent>
            </Card>

            {/* Feature 3: 18 Professional Templates */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 hover:shadow-lg transition-shadow group">
              <CardContent className="p-8">
                <div className="bg-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Palette className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">18 Professional Templates</h3>
                <p className="text-slate-600">Choose from 6 custom templates plus 12 premium templates for every profession and style.</p>
              </CardContent>
            </Card>

            {/* Feature 4: ATS Checker */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-0 hover:shadow-lg transition-shadow group">
              <CardContent className="p-8">
                <div className="bg-amber-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">ATS Checker</h3>
                <p className="text-slate-600">Get comprehensive ATS analysis with detailed scoring, keyword optimization, and professional recommendations to improve your resume's compatibility.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Templates Preview Section */}
      <section id="templates" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Professional Templates
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose from our collection of ATS-friendly, professionally designed templates.
            </p>
          </div>

          {/* Custom Templates Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">
              ResumeGenius Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getCustomTemplates().map((template) => (
                <Card 
                  key={template.id} 
                  className="bg-white hover:shadow-xl transition-shadow overflow-hidden cursor-pointer group"
                  onClick={() => {
                    window.location.href = `/builder?template=${template.id}&source=custom`;
                  }}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br p-8 flex items-center justify-center" style={{
                    background: `linear-gradient(to bottom right, ${template.color.includes('slate') ? '#e2e8f0' : template.color.includes('blue') ? '#dbeafe' : template.color.includes('pink') ? '#fce7f3' : template.color.includes('emerald') ? '#d1fae5' : template.color.includes('yellow') ? '#fef3c7' : '#e9d5ff'}, ${template.color.includes('slate') ? '#94a3b8' : template.color.includes('blue') ? '#60a5fa' : template.color.includes('pink') ? '#f472b6' : template.color.includes('emerald') ? '#34d399' : template.color.includes('yellow') ? '#fbbf24' : '#a78bfa'})`
                  }}>
                    <span className="text-2xl font-bold text-slate-700">{template.name}</span>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-semibold text-slate-800 mb-2">{template.name}</h4>
                    <p className="text-slate-600 mb-4">{template.description}</p>
                    <Button className={`w-full ${template.color} ${template.hoverColor} group-hover:scale-105 transition-transform`}>
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Premium  Resume Templates Section */}
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Premium Resume Templates
                <Star className="h-6 w-6 text-yellow-500" />
              </h3>
              <p className="text-lg text-slate-600">
                Premium templates from the  Resume Builder Pro
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getReactiveResumeTemplates().map((template) => (
                <Card 
                  key={template.id} 
                  className="bg-white hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => {
                    window.location.href = `/builder?template=${template.id}&source=reactive-resume`;
                  }}
                >
                  <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
                    {template.previewImage ? (
                      <img 
                        src={template.previewImage} 
                        alt={`${template.name} template preview`}
                        className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to gradient if image fails to load
                          e.currentTarget.style.display = 'none';
                          const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextSibling) {
                            nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full bg-gradient-to-br p-6 items-center justify-center absolute inset-0" 
                      style={{
                        display: template.previewImage ? 'none' : 'flex',
                        background: `linear-gradient(to bottom right, ${template.color.includes('blue') ? '#dbeafe' : template.color.includes('gray') ? '#f3f4f6' : template.color.includes('green') ? '#d1fae5' : template.color.includes('purple') ? '#e9d5ff' : template.color.includes('indigo') ? '#e0e7ff' : template.color.includes('cyan') ? '#cffafe' : template.color.includes('yellow') ? '#fef3c7' : template.color.includes('emerald') ? '#d1fae5' : template.color.includes('stone') ? '#f5f5f4' : template.color.includes('slate') ? '#f1f5f9' : template.color.includes('amber') ? '#fef3c7' : '#fed7aa'}, ${template.color.includes('blue') ? '#60a5fa' : template.color.includes('gray') ? '#9ca3af' : template.color.includes('green') ? '#34d399' : template.color.includes('purple') ? '#a78bfa' : template.color.includes('indigo') ? '#818cf8' : template.color.includes('cyan') ? '#22d3ee' : template.color.includes('yellow') ? '#fbbf24' : template.color.includes('emerald') ? '#34d399' : template.color.includes('stone') ? '#a8a29e' : template.color.includes('slate') ? '#64748b' : template.color.includes('amber') ? '#f59e0b' : '#fb923c'})`
                      }}
                    >
                      <span className="text-xl font-bold text-slate-700 text-center">{template.name}</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Premium
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">{template.name}</h4>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{template.description}</p>
                    <Button className={`w-full ${template.color} ${template.hoverColor} text-sm group-hover:scale-105 transition-transform`}>
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Complete Resume Toolkit
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to create, extract, and optimize your resume content.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Resume Builder */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 hover:shadow-xl transition-all group overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Edit className="text-white h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">Resume Builder</h3>
                    <p className="text-blue-600 font-medium">Interactive Editor</p>
                  </div>
                </div>
                
                <p className="text-slate-600 mb-6 text-lg">
                  Create professional resumes with live preview, 18+ templates, and instant PDF export. Perfect for crafting your perfect resume from scratch.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>18+ Professional Templates</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Live Preview & Real-time Editing</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>High-Quality PDF Export</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Resume Upload & Auto-fill</span>
                  </div>
                </div>

                <Link href="/builder">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                    <Edit className="mr-2 h-5 w-5" />
                    Start Building Resume
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Text Extractor */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 hover:shadow-xl transition-all group overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-green-600 w-16 h-16 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <FileText className="text-white h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">Text Extractor</h3>
                    <p className="text-green-600 font-medium">Document Parser</p>
                  </div>
                </div>
                
                <p className="text-slate-600 mb-6 text-lg">
                  Extract clean, structured text from PDF and DOCX resumes. Perfect for analyzing existing resumes or converting documents to plain text.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>PDF & DOCX Support</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Multi-page Document Processing</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Smart Section Detection</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Copy & Download Options</span>
                  </div>
                </div>

                <Link href="/text-extractor">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                    <FileText className="mr-2 h-5 w-5" />
                    Extract Resume Text
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* ATS Analysis */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 hover:shadow-xl transition-all group overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Target className="text-white h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">ATS Analysis</h3>
                    <p className="text-purple-600 font-medium">Compatibility Scoring</p>
                  </div>
                </div>
                
                <p className="text-slate-600 mb-6 text-lg">
                  Get detailed ATS compatibility scoring and recommendations. Analyze your resume's performance with applicant tracking systems.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>ATS Compatibility Score</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Keyword Analysis</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Improvement Recommendations</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Format & Structure Analysis</span>
                  </div>
                </div>

                <Link href="/ats-analysis">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
                    <Target className="mr-2 h-5 w-5" />
                    Analyze Resume
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build Your Dream Resume?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who've landed their dream jobs with our resume builder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/builder">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Building Now
              </Button>
            </Link>
            <Link href="/text-extractor">
              <Button className="bg-blue-700 text-white hover:bg-blue-800 px-8 py-4 text-lg font-semibold rounded-xl border border-blue-400">
                <FileText className="mr-2 h-5 w-5" />
                Extract Text First
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}