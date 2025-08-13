import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileText, Palette, Sparkles, Edit, Check, Target, Star, Moon, Sun } from "lucide-react";
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
const TemplateSlider = () => {
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
      <div className="relative w-full flex-1 flex items-center justify-center">
        <motion.div 
          ref={ref}
          style={{ 
            maskImage,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          className="flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto pb-4 px-4 w-full max-w-full [&::-webkit-scrollbar]:hidden"
        >
          {templates.map((template, index) => (
                         <motion.div
               key={template.id}
                              className="flex-shrink-0 w-64 md:w-72 lg:w-80 bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
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
                               <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden rounded-t-lg">
                {template.previewImage ? (
                  <img 
                    src={template.previewImage} 
                    alt={`${template.name} template preview`}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
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
                  className="w-full h-full bg-gradient-to-br p-4 items-center justify-center absolute inset-0" 
                  style={{
                    display: template.previewImage ? 'none' : 'flex',
                    background: `linear-gradient(to bottom right, ${template.color.includes('blue') ? '#dbeafe' : template.color.includes('gray') ? '#f3f4f6' : template.color.includes('green') ? '#d1fae5' : template.color.includes('purple') ? '#e9d5ff' : template.color.includes('indigo') ? '#e0e7ff' : template.color.includes('cyan') ? '#cffafe' : template.color.includes('yellow') ? '#fef3c7' : template.color.includes('emerald') ? '#d1fae5' : template.color.includes('stone') ? '#f5f5f4' : template.color.includes('slate') ? '#f1f5f9' : template.color.includes('amber') ? '#fef3c7' : '#fed7aa'}, ${template.color.includes('blue') ? '#60a5fa' : template.color.includes('gray') ? '#9ca3af' : template.color.includes('green') ? '#34d399' : template.color.includes('purple') ? '#a78bfa' : template.color.includes('indigo') ? '#818cf8' : template.color.includes('cyan') ? '#22d3ee' : template.color.includes('yellow') ? '#fbbf24' : template.color.includes('emerald') ? '#34d399' : template.color.includes('stone') ? '#a8a29e' : template.color.includes('slate') ? '#64748b' : template.color.includes('amber') ? '#f59e0b' : '#fb923c'})`
                  }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-white text-center block">{template.name}</span>
                  </div>
                </div>
                

              </div>
              
              {/* Template Info */}
              <div className="p-4">
                                 <h4 className="text-sm font-semibold text-gray-200 mb-1 line-clamp-1">{template.name}</h4>
                 <p className="text-xs text-gray-400 mb-3 line-clamp-2">{template.description}</p>
                 <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs group-hover:scale-105 transition-transform py-2 border-0 rounded-lg">
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

// Scroll Overflow Mask Hook
const left = `0%`;
const right = `100%`;
const leftInset = `20%`;
const rightInset = `80%`;
const transparent = `#0000`;
const opaque = `#000`;

function useScrollOverflowMask(scrollXProgress: MotionValue<number>) {
  const maskImage = useMotionValue(
    `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`
  );

  useMotionValueEvent(scrollXProgress, "change", (value) => {
    if (value === 0) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`
      );
    } else if (value === 1) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${right}, ${opaque})`
      );
    } else if (
      scrollXProgress.getPrevious() === 0 ||
      scrollXProgress.getPrevious() === 1
    ) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${rightInset}, ${transparent})`
      );
    }
  });

  return maskImage;
}

// Animated Templates Section Component
const AnimatedTemplatesSection = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  // Create smoother spring animations with better easing
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.9, 1, 1, 0.9]), {
    stiffness: 80,
    damping: 30
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <div ref={targetRef} className="relative h-16 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Image with Parallax */}
      <motion.div
        style={{
          backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSIxMjAwIiB2aWV3Qm94PSIwIDAgMTYwMCAxMjAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYwMCIgaGVpZ2h0PSIxMjAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjE3ZGI3O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0YzFkOTU7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "120%",
          width: "100%",
          y: backgroundY,
          scale: backgroundScale,
          position: "absolute",
          top: 0,
          left: 0,
          filter: "brightness(0.3) blur(1px)",
        }}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900"></div>
    </div>
  );
};

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
    <div className="min-h-screen overflow-x-hidden relative transition-colors duration-300 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground">
      {/* Navigation */}
                    <motion.nav 
          className={`fixed top-0 w-full z-50 border-b transition-all duration-300 backdrop-blur-md ${
            isDarkMode 
              ? 'bg-gradient-to-r from-[#0D1B2A] to-[#1B263B]/95 border-white/10' 
              : 'bg-white/95 border-gray-200/50'
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
                                  <FileText className={`h-8 w-8 mr-3 ${isDarkMode ? 'text-[#3B82F6]' : 'text-[#14B8A6]'}`} />
               </motion.div>
                                              <motion.span 
                  className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}
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
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Templates Link */}
                             <motion.a 
                 href="#templates" 
                 className={`relative transition-colors duration-200 ${
                   isActiveLink('templates') 
                     ? isDarkMode ? 'text-white font-semibold' : 'text-[#0F172A] font-semibold'
                     : isDarkMode ? 'text-[#CBD5E1] hover:text-[#60A5FA]' : 'text-[#334155] hover:text-[#2DD4BF]'
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
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${isDarkMode ? 'bg-white' : 'bg-[#0F172A]'}`}
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
                   className={`transition-colors ${isDarkMode ? 'text-[#CBD5E1] hover:text-[#60A5FA]' : 'text-[#334155] hover:text-[#2DD4BF]'}`}
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
                     className={`bg-gradient-to-r ${isDarkMode ? 'from-[#3B82F6] to-[#2563EB] hover:from-[#60A5FA] hover:to-[#3B82F6]' : 'from-[#14B8A6] to-[#0D9488] hover:from-[#2DD4BF] hover:to-[#14B8A6]'} text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0`}
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
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent_50%)]"></div>
         
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="animate-fadeInUp text-center lg:text-left">
                              <motion.h1 
                                  className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <span>
                    {typedText}
              </span>
                </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl mb-8 max-w-2xl text-gray-300 leading-relaxed"
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
                   className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-gray-200 hover:bg-white/15 transition-colors"
                   whileHover={{ scale: 1.02 }}
                   transition={{ type: "spring", stiffness: 400 }}
                 >
                   <Check className="w-4 h-4 mr-2 text-emerald-400" />
                   ATS-Friendly
                 </motion.div>
                 <motion.div
                   className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-gray-200 hover:bg-white/15 transition-colors"
                   whileHover={{ scale: 1.02 }}
                   transition={{ type: "spring", stiffness: 400 }}
                 >
                   <Eye className="w-4 h-4 mr-2 text-blue-400" />
                   Live Preview
                 </motion.div>
                 <motion.div
                   className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-gray-200 hover:bg-white/15 transition-colors"
                   whileHover={{ scale: 1.02 }}
                   transition={{ type: "spring", stiffness: 400 }}
                 >
                   <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                   AI-Powered
                 </motion.div>
                 <motion.div
                   className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-gray-200 hover:bg-white/15 transition-colors"
                   whileHover={{ scale: 1.02 }}
                   transition={{ type: "spring", stiffness: 400 }}
                 >
                   <FileText className="w-4 h-4 mr-2 text-cyan-400" />
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
                       className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
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
                       className="w-full sm:w-auto border border-white/20 hover:border-white/40 text-gray-200 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-6 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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

      {/* Animated Templates Section */}
      <AnimatedTemplatesSection />

        {/* Templates Preview Section */}
        <section id="templates" className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
           <div className="w-full h-full flex flex-col">
             {/* Fixed Header */}
             <div className="sticky top-16 z-10 bg-slate-900/95 backdrop-blur-md border-b border-white/10 py-6">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <motion.h2 
                   className="text-3xl md:text-4xl lg:text-5xl font-bold text-center bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-3"
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, ease: "easeOut" }}
                   viewport={{ once: true }}
                 >
                   Professional Templates
                 </motion.h2>
                 <motion.p 
                   className="text-lg md:text-xl text-gray-300 text-center max-w-3xl mx-auto leading-relaxed"
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
             <div className="flex-1 w-full pt-4">
               <TemplateSlider />
           </div>
         </div>
       </section>



             {/* Tools Section */}
       <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
                         <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg">
               <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
             </div>
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">
               Complete Resume Toolkit
             </h2>
             <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
               Everything you need to create, extract, and optimize your resume content with professional-grade tools.
             </p>
             <div className="flex justify-center mt-6 space-x-2">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-2000"></div>
               <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse animation-delay-4000"></div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                         {/* Resume Builder */}
             <Card className="group relative overflow-hidden border border-white/10 bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-full">
               <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-6 md:p-8 flex flex-col h-full">
                                                     <div className="flex items-center mb-6">
                     <div className="relative">
                       <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                         <Edit className="text-white h-6 w-6 md:h-8 md:w-8" />
                       </div>
                     </div>
                     <div>
                       <h3 className="text-xl md:text-2xl font-bold text-gray-200 mb-1 transition-colors">
                         Resume Builder
                       </h3>
                       <p className="text-blue-400 font-medium text-sm md:text-base">Interactive Editor</p>
                     </div>
                   </div>
                
                                 <p className="text-gray-300 mb-6 text-base md:text-lg flex-grow leading-relaxed">
                   Create professional resumes with live preview, 18+ templates, and instant PDF export. Perfect for crafting your perfect resume from scratch with real-time collaboration.
                 </p>
                
                                 <div className="space-y-3 mb-8">
                   <div className="flex items-center text-gray-200 group/item">
                     <div className="bg-emerald-500/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-emerald-400" />
                     </div>
                     <span className="group-hover/item:text-gray-100 transition-colors">18+ Professional Templates</span>
                   </div>
                   <div className="flex items-center text-gray-200 group/item">
                     <div className="bg-blue-500/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-blue-400" />
                     </div>
                     <span className="group-hover/item:text-gray-100 transition-colors">Live Preview & Real-time Editing</span>
                   </div>
                   <div className="flex items-center text-gray-200 group/item">
                     <div className="bg-purple-500/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-purple-400" />
                     </div>
                     <span className="group-hover/item:text-gray-100 transition-colors">High-Quality PDF Export</span>
                   </div>
                   <div className="flex items-center text-gray-200 group/item">
                     <div className="bg-cyan-500/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-cyan-400" />
                     </div>
                     <span className="group-hover/item:text-gray-100 transition-colors">Resume Upload & Auto-fill</span>
                   </div>
                 </div>

                                 <Link href="/builder">
                   <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300 group/btn border-0 rounded-xl">
                     <Edit className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                     Start Building Resume
                   </Button>
                 </Link>
              </CardContent>
            </Card>

                         {/* ATS Analysis */}
             <Card className="group relative overflow-hidden border border-white/10 bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-full">
               <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-6 md:p-8 flex flex-col h-full">
                                 <div className="flex items-center mb-6">
                   <div className="relative">
                     <div className="bg-gradient-to-br from-purple-600 to-purple-700 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                       <Target className="text-white h-6 w-6 md:h-8 md:w-8" />
                     </div>
                   </div>
                   <div>
                     <h3 className="text-xl md:text-2xl font-bold text-gray-200 mb-1 transition-colors">
                       ATS Analysis
                     </h3>
                     <p className="text-purple-400 font-medium text-sm md:text-base">Compatibility Scoring</p>
                   </div>
                 </div>
                
                                 <p className="text-gray-300 mb-6 text-base md:text-lg flex-grow leading-relaxed">
                   Get detailed ATS compatibility scoring and recommendations. Analyze your resume's performance with applicant tracking systems and optimize for maximum visibility.
                 </p>
                
                                 <div className="space-y-3 mb-8">
                   <div className="flex items-center text-gray-200 group/item">
                     <div className="bg-emerald-500/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-emerald-400" />
                     </div>
                     <span className="group-hover/item:text-gray-100 transition-colors">ATS Compatibility Score</span>
                   </div>
                   <div className="flex items-center text-gray-200 group/item">
                     <div className="bg-blue-500/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-blue-400" />
                     </div>
                     <span className="group-hover/item:text-gray-100 transition-colors">Keyword Analysis</span>
                   </div>
                   <div className="flex items-center text-gray-200 group/item">
                     <div className="bg-purple-500/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-purple-400" />
                     </div>
                     <span className="group-hover/item:text-gray-100 transition-colors">Improvement Recommendations</span>
                   </div>
                   <div className="flex items-center text-gray-200 group/item">
                     <div className="bg-cyan-500/20 p-1 rounded-full mr-3 group-hover/item:scale-105 transition-transform">
                       <Check className="w-4 h-4 text-cyan-400" />
                     </div>
                     <span className="group-hover/item:text-gray-100 transition-colors">Format & Structure Analysis</span>
                   </div>
                 </div>

                                 <Link href="/ats-analysis">
                   <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300 group/btn border-0 rounded-xl">
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