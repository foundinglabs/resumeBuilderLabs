import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileText, Palette, Sparkles, Edit, Check, Target, Star, Moon, Sun } from "lucide-react";
import { allTemplates, getCustomTemplates, getReactiveResumeTemplates, getTemplatePreviewUrl } from "@/utils/template-integration";
import { LoginSignupButton } from "@/components/LoginSignupButton";
import AnimatedResume from "@/components/AnimatedResume";
import AnimatedTileBackground from "@/components/AnimatedTileBackground";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { resolvedTheme } = useTheme();

  const fullText = "Your story deserves a standout resume — powered by AI.";

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 50); // Speed of typing

      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [currentIndex, fullText]);

  // Handle scroll for sticky header shadow and active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);

      // Determine active section based on scroll position
      const sections = ['home', 'features', 'templates'];
      const sectionElements = sections.map(id => document.getElementById(id));
      
      let currentSection = 'home';
      sectionElements.forEach((element, index) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = sections[index];
          }
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActiveLink = (section: string) => activeSection === section;
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <div className="min-h-screen overflow-x-hidden relative transition-colors duration-300 bg-background text-foreground">
      {/* Navigation */}
      <motion.nav 
        className={`fixed top-0 w-full z-50 border-b transition-all duration-300 bg-background border-border ${isScrolled ? 'shadow-md' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <motion.div 
              className="flex items-center"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.2,
                ease: "easeOut"
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.3,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <FileText className="h-8 w-8 mr-3 text-primary" />
              </motion.div>
              <motion.span 
                className="text-xl font-bold text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.5
                }}
              >
                ResumeBuilder Pro
              </motion.span>
            </motion.div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Features Link */}
              <motion.a 
                href="#features" 
                className={`relative transition-colors duration-200 ${
                  isActiveLink('features') 
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-primary'
                }`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.6,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Features
                {isActiveLink('features') && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeTab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.a>
              
              {/* Templates Link */}
              <motion.a 
                href="#templates" 
                className={`relative transition-colors duration-200 ${
                  isActiveLink('templates') 
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-primary'
                }`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.7,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Templates
                {isActiveLink('templates') && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeTab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.a>
              
              {/* ATS Analysis Link */}
              <Link href="/ats-analysis">
                <motion.a 
                  className="transition-colors text-muted-foreground hover:text-primary"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.8,
                    ease: "easeOut"
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                ATS Analysis
                </motion.a>
              </Link>
              
              {/* Theme Toggle */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 1.0,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <ThemeToggle />
              </motion.div>
              
              {/* Login/Signup Button */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 1.1,
                  ease: "easeOut"
                }}
              >
              <LoginSignupButton />
              </motion.div>
              
              {/* Start Building Button */}
              <Link href="/builder">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 1.2,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -1,
                    boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                <Button 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0"
                  onClick={() => {
                    // Clear any URL hash before navigation
                    if (window.location.hash) {
                      window.history.replaceState(null, '', window.location.pathname);
                    }
                  }}
                >
                  Start Building
                </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Tile Background - Only in Hero Section */}
        <AnimatedTileBackground showInDarkMode={resolvedTheme !== 'dark'} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="animate-fadeInUp text-center lg:text-left">
                              <motion.h1 
                                  className="text-4xl md:text-6xl font-bold mb-6 text-foreground"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    {typedText}
              </span>
                </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl mb-8 max-w-2xl text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
              Build professional resumes in minutes with our AI-powered tools, live preview, and stunning templates.
              </motion.p>
              
              {/* Quick Value Props */}
              <motion.div 
                className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.div
                  className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  ATS-Friendly
                </motion.div>
                <motion.div
                  className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium border bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  Live Preview
                </motion.div>
                <motion.div
                  className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  AI-Powered
                </motion.div>
                <motion.div
                  className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium border bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  PDF Export
                </motion.div>
              </motion.div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Link href="/builder">
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      y: -2,
                      boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 25 
                    }}
                  >
                <Button 
                      className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
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
                  </motion.div>
              </Link>
              <Link href="/ats-analysis">
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      y: -2,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 25 
                    }}
                  >
                    <Button 
                      variant="outline" 
                      className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 bg-white hover:bg-slate-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                  <Target className="mr-2 h-5 w-5" />
                  ATS Checker
                </Button>
                  </motion.div>
              </Link>
              </div>
            </div>
            
            {/* Right Column - Animated Resume */}
            <div className="flex justify-end">
              <AnimatedResume />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>
              Why Choose ResumeBuilder Pro?
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Everything you need to create, customize, and download your perfect resume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Live Preview */}
            <Card className="border-0 hover:shadow-lg transition-shadow group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 dark:hover:shadow-blue-500/10">
              <CardContent className="p-8">
                <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Eye className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Live Preview</h3>
                <p className="text-muted-foreground">
                  See your resume update in real-time as you make changes. No more guessing how it looks!
                </p>
              </CardContent>
            </Card>

            {/* Feature 2: PDF Export */}
            <Card className="border-0 hover:shadow-lg transition-shadow group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 dark:hover:shadow-green-500/10">
              <CardContent className="p-8">
                <div className="bg-green-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">PDF Export</h3>
                <p className="text-muted-foreground">
                  Download your resume as a high-quality PDF ready for printing or sharing.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3: 18 Professional Templates */}
            <Card className="border-0 hover:shadow-lg transition-shadow group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 dark:hover:shadow-purple-500/10">
              <CardContent className="p-8">
                <div className="bg-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Palette className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">18 Professional Templates</h3>
                <p className="text-muted-foreground">
                  Choose from 6 custom templates plus 12 premium templates for every profession and style.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4: ATS Checker */}
            <Card className="border-0 hover:shadow-lg transition-shadow group bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/50 dark:to-amber-800/50 dark:hover:shadow-amber-500/10">
              <CardContent className="p-8">
                <div className="bg-amber-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">ATS Checker</h3>
                <p className="text-muted-foreground">
                  Get comprehensive ATS analysis with detailed scoring, keyword optimization, and professional recommendations to improve your resume's compatibility.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Templates Preview Section */}
      <section id="templates" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Professional Templates
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our collection of ATS-friendly, professionally designed templates.
            </p>
          </div>

          {/* Custom Templates Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
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