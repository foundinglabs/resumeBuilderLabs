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
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--primary) transparent'
          }}
          className="flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto pb-4 px-4 w-full max-w-full"
        >
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
                             className="flex-shrink-0 w-72 md:w-80 lg:w-96 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              initial={{ opacity: 0, x: 50 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: {
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 120,
                  damping: 15,
                  duration: 0.6
                }
              }}
              whileHover={{ 
                scale: 1.05,
                y: -8,
                transition: { 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  duration: 0.3 
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
                
                {template.isReactiveResume && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Premium
                  </div>
                )}
              </div>
              
              {/* Template Info */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-1 line-clamp-1">{template.name}</h4>
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{template.description}</p>
                <Button className={`w-full ${template.color} ${template.hoverColor} text-xs group-hover:scale-105 transition-transform py-2`}>
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

  // Create smooth spring animations
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]), {
    stiffness: 100,
    damping: 20
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1, 1.2]);
  
  const titleY = useTransform(scrollYProgress, [0, 0.5, 1], ["50%", "0%", "50%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div ref={targetRef} className="relative h-screen overflow-hidden bg-background">
      {/* Background Image with Parallax */}
      <motion.div
        style={{
          backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSIxMjAwIiB2aWV3Qm94PSIwIDAgMTYwMCAxMjAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYwMCIgaGVpZ2h0PSIxMjAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjE3ZGI3O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0YzFkOTU7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "150%",
          width: "100%",
          y: backgroundY,
          scale: backgroundScale,
          position: "absolute",
          top: 0,
          left: 0,
          filter: "brightness(0.7)",
        }}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"></div>

      {/* Content Container */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <motion.div
          style={{
            scale: scale,
            opacity: opacity,
            y: titleY
          }}
          className="text-center max-w-4xl px-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Professional Templates
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            Explore the templates available in Resume Builder Pro and view the resumes crafted with them. 
            They could also serve as examples to help guide the creation of your next resume.
          </p>
        </motion.div>
      </div>


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

      // Determine active section based on scroll position
      const sections = ['home', 'templates'];
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
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-0"
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
                      className="w-full sm:w-auto border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 bg-white hover:bg-slate-50 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-base sm:text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
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
        <section id="templates" className="w-full h-screen bg-muted/30">
          <div className="w-full h-full flex flex-col">
            {/* Animated Template Slider */}
            <div className="flex-1 w-full">
              <TemplateSlider />
          </div>
        </div>
      </section>



      {/* Tools Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Resume Toolkit
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, extract, and optimize your resume content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Resume Builder */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 hover:shadow-xl transition-all group overflow-hidden h-full">
              <CardContent className="p-6 md:p-8 flex flex-col h-full">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-600 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Edit className="text-white h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">Resume Builder</h3>
                    <p className="text-blue-600 font-medium text-sm md:text-base">Interactive Editor</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6 text-base md:text-lg flex-grow">
                  Create professional resumes with live preview, 18+ templates, and instant PDF export. Perfect for crafting your perfect resume from scratch.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-foreground">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>18+ Professional Templates</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Live Preview & Real-time Editing</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>High-Quality PDF Export</span>
                  </div>
                  <div className="flex items-center text-foreground">
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
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 hover:shadow-xl transition-all group overflow-hidden h-full">
              <CardContent className="p-6 md:p-8 flex flex-col h-full">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-600 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Target className="text-white h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">ATS Analysis</h3>
                    <p className="text-purple-600 font-medium text-sm md:text-base">Compatibility Scoring</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6 text-base md:text-lg flex-grow">
                  Get detailed ATS compatibility scoring and recommendations. Analyze your resume's performance with applicant tracking systems.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-foreground">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>ATS Compatibility Score</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Keyword Analysis</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Improvement Recommendations</span>
                  </div>
                  <div className="flex items-center text-foreground">
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

      {/* Footer */}
      <Footer />
    </div>
  );
}