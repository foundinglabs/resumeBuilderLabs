import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileText, Palette, Sparkles, Edit, Check, Target, Star, Moon, Sun, Menu, X } from "lucide-react";
import { allTemplates, getCustomTemplates, getReactiveResumeTemplates, getTemplatePreviewUrl } from "@/utils/template-integration";
import { LoginSignupButton } from "@/components/LoginSignupButton";
import AnimatedResume from "@/components/AnimatedResume";
import AnimatedTileBackground from "@/components/AnimatedTileBackground";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, MotionValue, useMotionValue, useMotionValueEvent, animate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";

// Template Slider Component with Horizontal Scroll
const TemplateSlider = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const templates = allTemplates;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: ref });
  const maskImage = useScrollOverflowMask(scrollXProgress);
  
  // Auto-scroll functionality
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    let animationId: number;
    let scrollDirection = 1; // 1 for right, -1 for left
    let scrollSpeed = 1; // pixels per frame

    const autoScroll = () => {
      if (!container) return;

      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const maxScroll = scrollWidth - clientWidth;

      // Change direction when reaching the end
      if (scrollLeft >= maxScroll) {
        scrollDirection = -1;
      } else if (scrollLeft <= 0) {
        scrollDirection = 1;
      }

      container.scrollLeft += scrollSpeed * scrollDirection;
      animationId = requestAnimationFrame(autoScroll);
    };

    // Start auto-scroll after a delay
    const startDelay = setTimeout(() => {
      animationId = requestAnimationFrame(autoScroll);
    }, 2000);

    // Pause auto-scroll on hover
    const handleMouseEnter = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(autoScroll);
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(startDelay);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

    return (
         <div className="w-full h-full flex flex-col">
       {/* Templates Container */}
       <div className="relative w-full flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          style={{ 
            maskImage,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
                     className="flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto pb-4 px-8 md:px-12 lg:px-16 w-full max-w-full [&::-webkit-scrollbar]:hidden"
        >
          {templates.map((template, index) => (
                         <motion.div
               key={template.id}
                                                             className={`flex-shrink-0 w-64 md:w-72 lg:w-80 backdrop-blur-sm border rounded-[10px] shadow-lg transition-all duration-200 cursor-pointer group hover:scale-[1.02] min-h-[500px] ${
                                 isDarkMode 
                                   ? 'bg-slate-800/80 border-white/10 hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]' 
                                   : 'bg-white border-[#E5E7EB] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]'
                               }`}
               initial={{ opacity: 0, x: 30, y: 20 }}
               animate={{ 
                 opacity: 1, 
                 x: 0,
                 y: 0,
                 transition: {
                   delay: index * 0.08,
                   type: "spring",
                   stiffness: 100,
                   damping: 20,
                   duration: 0.8
                 }
               }}

               whileTap={{ 
                 scale: 0.98,
                 transition: { duration: 0.1 }
               }}
              onClick={() => {
                window.location.href = `/builder?template=${template.id}&source=${template.isReactiveResume ? 'reactive-resume' : 'custom'}`;
              }}
            >
                                                                                                                       {/* Template Preview */}
                                 <div className="relative h-[380px] overflow-hidden rounded-t-lg template-preview bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                {template.previewImage ? (
                  <img 
                    src={template.previewImage} 
                    alt={`${template.name} template preview`}
                    className="w-full h-full object-cover object-top transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextSibling) {
                        nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                                 <div 
                   className={`w-full h-full p-4 items-center justify-center absolute inset-0 flex ${
                     isDarkMode 
                       ? 'bg-gradient-to-br from-slate-700 to-slate-800' 
                       : 'bg-gradient-to-br from-gray-100 to-gray-200'
                   }`}
                   style={{
                     display: template.previewImage ? 'none' : 'flex'
                   }}
                 >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center backdrop-blur-sm ${
                      isDarkMode ? 'bg-white/20' : 'bg-gray-800/20'
                    }`}>
                      <svg className={`w-8 h-8 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className={`text-sm font-semibold text-center block ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}>{template.name}</span>
                  </div>
                </div>
                

              </div>
              
                             {/* Template Info */}
               <div className="p-4">
                                  <h4 className={`text-lg font-bold mb-2 line-clamp-1 ${
                                    isDarkMode ? 'text-gray-200' : 'text-[#0F172A]'
                                  }`}>{template.name}</h4>
                  <p className={`text-sm mb-4 line-clamp-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-[#64748B]'
                  }`}>{template.description}</p>
                                    <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:scale-[1.03] text-white text-sm transition-all duration-200 py-2.5 px-5 border-0 rounded-lg shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                   Use Template
                 </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// Scroll Overflow Mask Hook - Removed fade for better visibility
function useScrollOverflowMask(scrollXProgress: MotionValue<number>) {
  // Return a transparent mask to disable the fade effect
  return useMotionValue('none');
}



export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Add styles for template preview normalization
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .template-preview img {
        filter: contrast(105%) brightness(105%);
        object-fit: cover;
        object-position: top;
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
      }
      
      .template-preview {
        position: relative;
        overflow: hidden;
        border-radius: 8px 8px 0 0;
      }
      
      .template-preview::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%);
        pointer-events: none;
        z-index: 1;
      }
      
      .template-preview img:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
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

      // Determine active section based on scroll position with smoother detection
      const sections = ['home', 'templates'];
      const sectionElements = sections.map(id => document.getElementById(id));
      
      let currentSection = 'home';
      sectionElements.forEach((element, index) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const threshold = window.innerHeight * 0.3; // 30% of viewport height
          if (rect.top <= threshold && rect.bottom >= threshold) {
            currentSection = sections[index];
          }
        }
      });
      
      setActiveSection(currentSection);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, []);

  const isActiveLink = (section: string) => activeSection === section;
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <div className={`min-h-screen overflow-x-hidden relative transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-[#F8F9FA]'
    } text-foreground`}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      {/* Navigation */}
      <motion.nav 
        className={`fixed top-0 w-full z-50 border-b transition-all duration-300 backdrop-blur-md ${
          isDarkMode 
            ? 'bg-gradient-to-r from-[#0D1B2A] to-[#1B263B]/95 border-white/10' 
            : 'bg-white/95 border-[#E5E7EB]'
        } ${isScrolled ? 'shadow-lg' : ''}`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: "easeOut",
          type: "spring",
          stiffness: 120,
          damping: 25
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <motion.div 
              className="flex items-center"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.1,
                ease: "easeOut"
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 150
                }}
              >
                <FileText className={`h-8 w-8 mr-3 ${isDarkMode ? 'text-[#3B82F6]' : 'text-[#3B82F6]'}`} />
              </motion.div>
              <motion.span 
                className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.3
                }}
              >
                ResumeBuilder
              </motion.span>
            </motion.div>
            
            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Templates Link */}
              <motion.a 
                href="#templates" 
                className={`relative transition-colors duration-200 ${
                  isActiveLink('templates') 
                    ? isDarkMode ? 'text-white font-semibold' : 'text-[#1A1A1A] font-semibold'
                    : isDarkMode ? 'text-[#CBD5E1] hover:text-[#60A5FA]' : 'text-[#4B5563] hover:text-[#3B82F6]'
                }`}
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.4,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Templates
                {isActiveLink('templates') && (
                  <motion.div
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${isDarkMode ? 'bg-white' : 'bg-[#3B82F6]'}`}
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
                  className={`transition-colors ${isDarkMode ? 'text-[#CBD5E1] hover:text-[#60A5FA]' : 'text-[#4B5563] hover:text-[#3B82F6]'}`}
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.5,
                    ease: "easeOut"
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ATS Analysis
                </motion.a>
              </Link>
              
              {/* Theme Toggle */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.6,
                  type: "spring",
                  stiffness: 150
                }}
              >
                <ThemeToggle />
              </motion.div>
              
              {/* Login/Signup Button */}
              <motion.div
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.7,
                  ease: "easeOut"
                }}
              >
                <LoginSignupButton />
              </motion.div>
              
              {/* Start Building Button */}
              <Link href="/builder">
                <motion.div
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.8,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -1
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className={`bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-lg hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 border-0 rounded-[10px]`}
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
            
            {/* Mobile Menu Button */}
            <motion.div
              className="md:hidden"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: 0.6,
                type: "spring",
                stiffness: 150
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-[#1A1A1A] hover:bg-gray-100'}`}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-[#E5E7EB] dark:border-white/10 bg-white/95 dark:bg-[#0D1B2A]/95 backdrop-blur-md"
            >
              <div className="py-4 px-4 space-y-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-3">
                  {/* Templates Link */}
                  <motion.a 
                    href="#templates" 
                    className={`block py-3 px-4 rounded-lg transition-colors duration-200 ${
                      isActiveLink('templates') 
                        ? isDarkMode ? 'bg-white/10 text-white font-semibold' : 'bg-[#3B82F6]/10 text-[#3B82F6] font-semibold'
                        : isDarkMode ? 'text-[#CBD5E1] hover:bg-white/10 hover:text-white' : 'text-[#4B5563] hover:bg-[#3B82F6]/10 hover:text-[#3B82F6]'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Templates
                  </motion.a>
                  
                  {/* ATS Analysis Link */}
                  <Link href="/ats-analysis">
                    <motion.a 
                      className={`block py-3 px-4 rounded-lg transition-colors duration-200 ${
                        isDarkMode ? 'text-[#CBD5E1] hover:bg-white/10 hover:text-white' : 'text-[#4B5563] hover:bg-[#3B82F6]/10 hover:text-[#3B82F6]'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ATS Analysis
                    </motion.a>
                  </Link>
                </div>
                
                {/* Mobile Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-[#E5E7EB] dark:border-white/10">
                  {/* Theme Toggle */}
                  <div className="flex justify-center">
                    <ThemeToggle />
                  </div>
                  
                  {/* Login/Signup Button */}
                  <div className="flex justify-center">
                    <LoginSignupButton />
                  </div>
                  
                  {/* Start Building Button */}
                  <Link href="/builder" className="block">
                    <Button 
                      className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-lg hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 border-0 rounded-[10px]"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        // Clear any URL hash before navigation
                        if (window.location.hash) {
                          window.history.replaceState(null, '', window.location.pathname);
                        }
                      }}
                    >
                      Start Building Resume
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

            {/* Hero Section */}
      <section id="home" className={`relative min-h-screen flex items-center justify-center overflow-hidden pt-16 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-[#F1F5F9]'
      }`}>
        {/* Subtle background pattern */}
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent_50%)]' 
            : 'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_50%)]'
        }`}></div>
         
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="animate-fadeInUp text-center lg:text-left">
                              <motion.h1 
                                  className={`text-4xl md:text-6xl font-bold mb-6 ${
                                    isDarkMode 
                                      ? 'bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent' 
                                      : 'text-[#1A1A1A]'
                                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <span>
                    {typedText}
              </span>
                </motion.h1>
              <motion.p 
                className={`text-xl md:text-2xl mb-8 max-w-2xl leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-[#4B5563]'
                }`}
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
                   className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors ${
                     isDarkMode 
                       ? 'bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15' 
                       : 'bg-white/80 border border-[#E5E7EB] text-[#4B5563] hover:bg-white hover:border-[#3B82F6]'
                   }`}
                   whileHover={{ scale: 1.02 }}
                   transition={{ type: "spring", stiffness: 400 }}
                 >
                   <Check className="w-4 h-4 mr-2 text-[#22C55E]" />
                   ATS-Friendly
                 </motion.div>
                 <motion.div
                   className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors ${
                     isDarkMode 
                       ? 'bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15' 
                       : 'bg-white/80 border border-[#E5E7EB] text-[#4B5563] hover:bg-white hover:border-[#3B82F6]'
                   }`}
                   whileHover={{ scale: 1.02 }}
                   transition={{ type: "spring", stiffness: 400 }}
                 >
                   <Eye className="w-4 h-4 mr-2 text-[#3B82F6]" />
                   Live Preview
                 </motion.div>
                 <motion.div
                   className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors ${
                     isDarkMode 
                       ? 'bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15' 
                       : 'bg-white/80 border border-[#E5E7EB] text-[#4B5563] hover:bg-white hover:border-[#3B82F6]'
                   }`}
                   whileHover={{ scale: 1.02 }}
                   transition={{ type: "spring", stiffness: 400 }}
                 >
                   <Sparkles className="w-4 h-4 mr-2 text-[#10B981]" />
                   AI-Powered
                 </motion.div>
                 <motion.div
                   className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors ${
                     isDarkMode 
                       ? 'bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15' 
                       : 'bg-white/80 border border-[#E5E7EB] text-[#4B5563] hover:bg-white hover:border-[#3B82F6]'
                   }`}
                   whileHover={{ scale: 1.02 }}
                   transition={{ type: "spring", stiffness: 400 }}
                 >
                   <FileText className="w-4 h-4 mr-2 text-[#0EA5E9]" />
                   PDF Export
                 </motion.div>
               </motion.div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-center">
              <Link href="/builder" className="w-full sm:w-auto">
                  <motion.div
                    className="w-full sm:w-auto"
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
                       className="w-full sm:w-auto bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-4 text-lg font-semibold rounded-[10px] shadow-lg hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 border-0"
                  onClick={() => {
                    // Clear any URL hash before navigation
                    if (window.location.hash) {
                      window.history.replaceState(null, '', window.location.pathname);
                    }
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Start Building Resume</span>
                  <span className="sm:hidden">Start Building</span>
                </Button>
                  </motion.div>
              </Link>
              <Link href="/ats-analysis" className="w-full sm:w-auto">
                  <motion.div
                    className="w-full sm:w-auto"
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
                        className={`w-full sm:w-auto backdrop-blur-sm px-6 py-4 text-lg font-semibold rounded-[10px] shadow-lg hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 ${
                          isDarkMode 
                            ? 'border border-white/20 hover:border-white/40 text-gray-200 hover:text-white bg-white/10 hover:bg-white/20' 
                            : 'border border-[#E5E7EB] hover:border-[#3B82F6] text-[#4B5563] hover:text-[#3B82F6] bg-white/80 hover:bg-white'
                        }`}
                     >
                  <Target className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">ATS Checker</span>
                  <span className="sm:hidden">ATS Check</span>
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

             {/* Templates Preview Section */}
                  <section id="templates" className={`w-full min-h-screen ${
            isDarkMode 
              ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
              : 'bg-[#F1F5F9]'
          }`}>
                       <div className="w-full min-h-screen flex flex-col">
              {/* Fixed Header */}
              <div className={`sticky top-16 z-10 backdrop-blur-md py-6 ${
                isDarkMode 
                  ? 'bg-slate-900/95 border-b border-white/10' 
                  : 'bg-white/95 border-b border-[#E5E7EB]'
              }`}>
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <motion.h2 
                   className={`text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 ${
                     isDarkMode 
                       ? 'bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent' 
                       : 'text-[#1A1A1A]'
                   }`}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, ease: "easeOut" }}
                   viewport={{ once: true }}
                 >
                   Professional Templates
                 </motion.h2>
                 <motion.p 
                   className={`text-lg md:text-xl text-center max-w-3xl mx-auto leading-relaxed ${
                     isDarkMode ? 'text-gray-300' : 'text-[#4B5563]'
                   }`}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                   viewport={{ once: true }}
                 >
                   Explore our collection of professional templates designed to help you create standout resumes.
                 </motion.p>
               </div>
             </div>
             
                           {/* Animated Template Slider */}
                             <div className="flex-1 w-full pt-4 pb-8">
                 <TemplateSlider isDarkMode={isDarkMode} />
             </div>
         </div>
       </section>



             {/* Tools Section */}
       <section className={`py-20 mb-0 ${
         isDarkMode 
           ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
           : 'bg-[#F1F5F9]'
       }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
                                                   <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-[#3B82F6] rounded-[10px] mb-6 shadow-lg">
               <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
             </div>
             <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${
               isDarkMode 
                 ? 'bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent' 
                 : 'text-[#1A1A1A]'
             }`}>
               Complete Resume Toolkit
             </h2>
             <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
               isDarkMode ? 'text-gray-300' : 'text-[#4B5563]'
             }`}>
               Everything you need to create, extract, and optimize your resume content with professional-grade tools.
             </p>
             <div className="flex justify-center mt-6 space-x-2">
               <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse"></div>
               <div className="w-2 h-2 bg-[#60A5FA] rounded-full animate-pulse animation-delay-2000"></div>
               <div className="w-2 h-2 bg-[#93C5FD] rounded-full animate-pulse animation-delay-4000"></div>
             </div>
          </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
                         {/* Resume Builder */}
             <Card className={`group relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] h-full rounded-[10px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)] ${
               isDarkMode 
                 ? 'border border-white/10 bg-slate-800/80' 
                 : 'border border-[#E5E7EB] bg-white'
             }`}>
               <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                 isDarkMode 
                   ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10' 
                   : 'bg-gradient-to-r from-[#3B82F6]/5 to-[#10B981]/5'
               }`}></div>
                             <CardContent className="relative p-4 md:p-6 lg:p-8 flex flex-col h-full">
                                                      <div className="flex items-center mb-6">
                      <div className="relative">
                        <div className="bg-[#3B82F6] w-12 h-12 md:w-16 md:h-16 rounded-[10px] flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Edit className="text-white h-6 w-6 md:h-8 md:w-8" />
                        </div>
                      </div>
                     <div>
                       <h3 className={`text-xl md:text-2xl font-bold mb-1 transition-colors ${
                         isDarkMode ? 'text-gray-200' : 'text-[#1A1A1A]'
                       }`}>
                         Resume Builder
                       </h3>
                       <p className="text-[#3B82F6] font-medium text-sm md:text-base">Interactive Editor</p>
                     </div>
                   </div>
                
                                 <p className={`mb-6 text-base md:text-lg flex-grow leading-relaxed ${
                   isDarkMode ? 'text-gray-300' : 'text-[#4B5563]'
                 }`}>
                   Create professional resumes with live preview, 18+ templates, and instant PDF export. Perfect for crafting your perfect resume from scratch with real-time collaboration.
                 </p>
                
                                 <div className="space-y-3 mb-8">
                   <div className={`flex items-center group/item ${
                     isDarkMode ? 'text-gray-200' : 'text-[#4B5563]'
                   }`}>
                     <div className="bg-[#22C55E]/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-[#22C55E]" />
                     </div>
                     <span className={`transition-colors ${
                       isDarkMode ? 'group-hover/item:text-gray-100' : 'group-hover/item:text-[#1A1A1A]'
                     }`}>18+ Professional Templates</span>
                   </div>
                   <div className={`flex items-center group/item ${
                     isDarkMode ? 'text-gray-200' : 'text-[#4B5563]'
                   }`}>
                     <div className="bg-[#3B82F6]/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-[#3B82F6]" />
                     </div>
                     <span className={`transition-colors ${
                       isDarkMode ? 'group-hover/item:text-gray-100' : 'group-hover/item:text-[#1A1A1A]'
                     }`}>Live Preview & Real-time Editing</span>
                   </div>
                   <div className={`flex items-center group/item ${
                     isDarkMode ? 'text-gray-200' : 'text-[#4B5563]'
                   }`}>
                     <div className="bg-[#10B981]/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-[#10B981]" />
                     </div>
                     <span className={`transition-colors ${
                       isDarkMode ? 'group-hover/item:text-gray-100' : 'group-hover/item:text-[#1A1A1A]'
                     }`}>High-Quality PDF Export</span>
                   </div>
                   <div className={`flex items-center group/item ${
                     isDarkMode ? 'text-gray-200' : 'text-[#4B5563]'
                   }`}>
                     <div className="bg-[#0EA5E9]/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-[#0EA5E9]" />
                     </div>
                     <span className={`transition-colors ${
                       isDarkMode ? 'group-hover/item:text-gray-100' : 'group-hover/item:text-[#1A1A1A]'
                     }`}>Resume Upload & Auto-fill</span>
                   </div>
                 </div>

                                                                                                                                       <Link href="/builder">
                     <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white text-lg py-6 shadow-lg hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 group/btn border-0 rounded-[10px]">
                     <Edit className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                     Start Building Resume
                   </Button>
                 </Link>
              </CardContent>
            </Card>

                                                   {/* ATS Analysis */}
             <Card className={`group relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] h-full rounded-[10px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)] ${
               isDarkMode 
                 ? 'border border-white/10 bg-slate-800/80' 
                 : 'border border-[#E5E7EB] bg-white'
             }`}>
               <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                 isDarkMode 
                   ? 'bg-gradient-to-r from-purple-600/10 to-pink-600/10' 
                   : 'bg-gradient-to-r from-[#10B981]/5 to-[#3B82F6]/5'
               }`}></div>
                             <CardContent className="relative p-4 md:p-6 lg:p-8 flex flex-col h-full">
                                  <div className="flex items-center mb-6">
                   <div className="relative">
                     <div className="bg-[#10B981] w-12 h-12 md:w-16 md:h-16 rounded-[10px] flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                       <Target className="text-white h-6 w-6 md:h-8 md:w-8" />
                     </div>
                   </div>
                   <div>
                     <h3 className={`text-xl md:text-2xl font-bold mb-1 transition-colors ${
                       isDarkMode ? 'text-gray-200' : 'text-[#1A1A1A]'
                     }`}>
                       ATS Analysis
                     </h3>
                     <p className="text-[#10B981] font-medium text-sm md:text-base">Compatibility Scoring</p>
                   </div>
                 </div>
                
                                 <p className={`mb-6 text-base md:text-lg flex-grow leading-relaxed ${
                   isDarkMode ? 'text-gray-300' : 'text-[#4B5563]'
                 }`}>
                   Get detailed ATS compatibility scoring and recommendations. Analyze your resume's performance with applicant tracking systems and optimize for maximum visibility.
                 </p>
                
                                 <div className="space-y-3 mb-8">
                   <div className={`flex items-center group/item ${
                     isDarkMode ? 'text-gray-200' : 'text-[#4B5563]'
                   }`}>
                     <div className="bg-[#22C55E]/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-[#22C55E]" />
                     </div>
                     <span className={`transition-colors ${
                       isDarkMode ? 'group-hover/item:text-gray-100' : 'group-hover/item:text-[#1A1A1A]'
                     }`}>ATS Compatibility Score</span>
                   </div>
                   <div className={`flex items-center group/item ${
                     isDarkMode ? 'text-gray-200' : 'text-[#4B5563]'
                   }`}>
                     <div className="bg-[#3B82F6]/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-[#3B82F6]" />
                     </div>
                     <span className={`transition-colors ${
                       isDarkMode ? 'group-hover/item:text-gray-100' : 'group-hover/item:text-[#1A1A1A]'
                     }`}>Keyword Analysis</span>
                   </div>
                   <div className={`flex items-center group/item ${
                     isDarkMode ? 'text-gray-200' : 'text-[#4B5563]'
                   }`}>
                     <div className="bg-[#10B981]/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-[#10B981]" />
                     </div>
                     <span className={`transition-colors ${
                       isDarkMode ? 'group-hover/item:text-gray-100' : 'group-hover/item:text-[#1A1A1A]'
                     }`}>Improvement Recommendations</span>
                   </div>
                   <div className={`flex items-center group/item ${
                     isDarkMode ? 'text-gray-200' : 'text-[#4B5563]'
                   }`}>
                     <div className="bg-[#0EA5E9]/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-[#0EA5E9]" />
                     </div>
                     <span className={`transition-colors ${
                       isDarkMode ? 'group-hover/item:text-gray-100' : 'group-hover/item:text-[#1A1A1A]'
                     }`}>Format & Structure Analysis</span>
                   </div>
                 </div>

                                                                   <Link href="/ats-analysis">
                    <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white text-lg py-6 shadow-lg hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 group/btn border-0 rounded-[10px]">
                     <Target className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                     Analyze Resume
                   </Button>
                 </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* Footer */}
      <Footer />
    </div>
  );
}