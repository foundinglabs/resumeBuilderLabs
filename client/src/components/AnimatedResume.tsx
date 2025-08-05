import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

// Constants for better maintainability
const ANIMATION_CONFIG = {
  NAME_CYCLE_DURATION: 4000,
  SUMMARY_CYCLE_DURATION: 5000,
  TYPEWRITER_DELAY: 200,
  NAME_TYPE_SPEED: 80,
  SUMMARY_TYPE_SPEED: 40,
  FADE_TRANSITION: { duration: 0.5, delay: 0.2 },
  HOVER_TRANSITION: { duration: 0.3, ease: "easeOut" }
} as const;

const nameData = [
  "JOHN DOE",
  "SARAH WILSON", 
  "MICHAEL CHEN",
  "EMMA RODRIGUEZ"
] as const;

const summaryData = [
  "Experienced software engineer with 5+ years developing scalable web applications. Passionate about clean code, user experience, and emerging technologies.",
  "Creative marketing professional with expertise in digital campaigns and brand strategy. Proven track record of increasing engagement and driving conversions.",
  "Data scientist specializing in machine learning and statistical analysis. Skilled in Python, R, and big data technologies with a focus on actionable insights.",
  "Product manager with strong technical background and user-centered design approach. Successfully launched 3 products with 1M+ active users."
] as const;

const AnimatedResume: React.FC = () => {
  const [currentName, setCurrentName] = useState(0);
  const [currentSummary, setCurrentSummary] = useState(0);
  const [typedName, setTypedName] = useState('');
  const [typedSummary, setTypedSummary] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 3D tilt motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  const nameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const summaryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Optimized typewriter function
  const typeWriter = useCallback((text: string, setText: (value: string) => void, delay: number = 50) => {
    if (!text) return;
    setIsTyping(true);
    let index = 0;
    setText('');
    const type = () => {
      if (index < text.length) {
        setText(text.substring(0, index + 1));
        index++;
        typeTimeoutRef.current = setTimeout(type, delay);
      } else {
        setIsTyping(false);
      }
    };
    typeTimeoutRef.current = setTimeout(type, ANIMATION_CONFIG.TYPEWRITER_DELAY);
  }, []);

  // Auto-cycle name and summary
  const startNameCycle = useCallback(() => {
    if (nameIntervalRef.current) clearInterval(nameIntervalRef.current);
    nameIntervalRef.current = setInterval(() => {
      setCurrentName((prev) => (prev + 1) % nameData.length);
    }, ANIMATION_CONFIG.NAME_CYCLE_DURATION);
  }, []);

  const startSummaryCycle = useCallback(() => {
    if (summaryIntervalRef.current) clearInterval(summaryIntervalRef.current);
    summaryIntervalRef.current = setInterval(() => {
      setCurrentSummary((prev) => (prev + 1) % summaryData.length);
    }, ANIMATION_CONFIG.SUMMARY_CYCLE_DURATION);
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (nameIntervalRef.current) clearInterval(nameIntervalRef.current);
    if (summaryIntervalRef.current) clearInterval(summaryIntervalRef.current);
    if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
  }, []);

  useEffect(() => {
    startNameCycle();
    startSummaryCycle();
    return cleanup;
  }, [startNameCycle, startSummaryCycle, cleanup]);

  // Typing effects
  useEffect(() => {
    if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
    typeWriter(nameData[currentName], setTypedName, ANIMATION_CONFIG.NAME_TYPE_SPEED);
  }, [currentName, typeWriter]);

  useEffect(() => {
    if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
    typeWriter(summaryData[currentSummary], setTypedSummary, ANIMATION_CONFIG.SUMMARY_TYPE_SPEED);
  }, [currentSummary, typeWriter]);

  // Mouse tracking handlers
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
    setIsHovered(true);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [mouseX, mouseY]);

  // Beautiful hover variants
  const resumeHoverVariants = useMemo(() => ({
    initial: { 
      scale: 1, 
      y: 0, 
      rotateX: 0, 
      rotateY: 0,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    hover: { 
      scale: 1.03, 
      y: -8,
      rotateX: 2,
      rotateY: 2,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { 
        duration: 0.4, 
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }), []);

  const glowVariants = useMemo(() => ({
    initial: { 
      opacity: 0, 
      scale: 0.8,
      filter: "blur(0px)"
    },
    hover: { 
      opacity: 1, 
      scale: 1,
      filter: "blur(1px)",
      transition: { 
        duration: 0.4, 
        ease: "easeOut"
      }
    }
  }), []);

  const floatingHoverVariants = useMemo(() => ({
    initial: { 
      y: 0, 
      scale: 1,
      opacity: 0.6
    },
    hover: { 
      y: [-3, 3, -3], 
      scale: [1, 1.2, 1],
      opacity: [0.6, 1, 0.6],
      transition: { 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    }
  }), []);

  const contentHoverVariants = useMemo(() => ({
    initial: { 
      scale: 1,
      filter: "brightness(1)"
    },
    hover: { 
      scale: 1.02,
      filter: "brightness(1.05)",
      transition: { 
        duration: 0.3, 
        ease: "easeOut"
      }
    }
  }), []);

  const cursorVariants = useMemo(() => ({
    blink: {
      opacity: [1, 0, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }), []);

  const fadeInVariants = useMemo(() => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: ANIMATION_CONFIG.FADE_TRANSITION
  }), []);

  const backgroundAnimationVariants = useMemo(() => ({
    rotate: {
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
    },
    reverseRotate: {
      scale: [1, 1.3, 1],
      rotate: [360, 180, 0],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }
  }), []);

  const floatingAnimationVariants = useMemo(() => ({
    float: {
      y: [0, -8, 0],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    },
    slide: {
      x: [0, 4, 0],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  }), []);

  const decorativeAnimationVariants = useMemo(() => ({
    pulse: {
      scale: [1, 1.4, 1],
      opacity: [0.3, 0.7, 0.3],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    },
    pulseSmall: {
      scale: [1, 1.3, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  }), []);

  return (
    <div className="relative w-full max-w-7xl mx-auto mt-2 px-4 sm:px-6 lg:px-8">
      {/* Resume Paper */}
                    <motion.div
         className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-lg dark:ring-1 dark:ring-white/10 relative overflow-hidden w-full cursor-pointer transform-gpu group ${
           isHovered ? 'dark:bg-slate-700' : ''
         }`}
         style={{
           background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
           border: '1px solid #e2e8f0',
           transformStyle: 'preserve-3d',
           perspective: '1000px',
           rotateX: rotateX,
           rotateY: rotateY
         }}
         onMouseMove={handleMouseMove}
         onMouseLeave={handleMouseLeave}
         whileHover={{ y: -10 }}
         transition={{ type: "spring", stiffness: 400, damping: 10 }}
       >
                 {/* Beautiful Hover Glow */}
         <motion.div
           className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           style={{
             transform: "translateZ(-10px)",
           }}
         />

        

        {/* Content with Enhanced Hover Effects */}
        <motion.div 
          className="relative z-10 p-3 sm:p-4 lg:p-6 xl:p-8"
          variants={contentHoverVariants}
          initial="initial"
          whileHover="hover"
        >
          {/* Name */}
          <motion.div 
            className="text-center mb-3 sm:mb-4"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
          >
                         <motion.h1
               className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
               animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             >
               {typedName}
               <motion.span
                 variants={cursorVariants}
                 animate="blink"
                 className="inline-block w-1 h-5 sm:h-6 bg-gradient-to-b from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 ml-1 rounded-full"
               />
             </motion.h1>
                         <motion.div
               className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 rounded-full"
               initial={{ width: 0 }}
               animate={{ width: "100%" }}
               transition={{ duration: 1, delay: 0.5 }}
             />
          </motion.div>

                     {/* Contact Info */}
           <motion.div 
             className="text-center mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300"
             variants={fadeInVariants}
             initial="initial"
             animate="animate"
             transition={{ delay: 0.3 }}
           >
             <p className="font-medium text-gray-700 dark:text-gray-300">Software Engineer • San Francisco, CA</p>
             <p className="text-blue-600 dark:text-blue-400">john.doe@email.com • (555) 123-4567</p>
             <p className="text-purple-600 dark:text-purple-400">linkedin.com/in/johndoe • github.com/johndoe</p>
           </motion.div>

          {/* Summary */}
          <motion.div 
            className="mb-3 sm:mb-4"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
                         <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
               PROFESSIONAL SUMMARY
             </h2>
             <motion.div
               className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 p-2 sm:p-3 rounded-lg border-l-4 border-blue-500"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.6 }}
             >
              {typedSummary}
                             <motion.span
                 variants={cursorVariants}
                 animate="blink"
                 className="inline-block w-1 h-3 sm:h-4 bg-gradient-to-b from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 ml-1 rounded-full"
               />
            </motion.div>
          </motion.div>

          {/* Experience */}
          <motion.div 
            className="mb-3 sm:mb-4"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
          >
                         <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
               EXPERIENCE
             </h2>
             <div className="space-y-2 sm:space-y-3">
               <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 p-2 sm:p-3 rounded-lg border-l-4 border-green-500">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                   <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">Senior Software Engineer</h3>
                   <span className="text-xs text-gray-600 dark:text-gray-300 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full w-fit shadow-sm hover:brightness-110 transition-all duration-200">2020 - 2023</span>
                 </div>
                 <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">Tech Corp, San Francisco, CA</p>
                 <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Led development of scalable web applications using React and Node.js</li>
                  <li>• Mentored 5 junior developers and improved team productivity by 30%</li>
                  <li>• Implemented CI/CD pipelines reducing deployment time by 60%</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div 
            className="mb-3 sm:mb-4"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
                         <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
               SKILLS
             </h2>
             <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-600 p-2 sm:p-3 rounded-lg border-l-4 border-orange-500">
               <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1 sm:space-y-2">
                 <p><strong className="text-orange-700 dark:text-orange-400">Programming:</strong> JavaScript, React, Node.js, Python, TypeScript</p>
                 <p><strong className="text-orange-700 dark:text-orange-400">Tools:</strong> Git, Docker, AWS, Jenkins, MongoDB, PostgreSQL</p>
                 <p><strong className="text-orange-700 dark:text-orange-400">Methodologies:</strong> Agile, Scrum, TDD, CI/CD, Microservices</p>
               </div>
             </div>
          </motion.div>

          {/* Education */}
          <motion.div 
            className="mb-2"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.7 }}
          >
                         <h2 className="text-base sm:text-gray-200 mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
               EDUCATION
             </h2>
             <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-700 dark:to-slate-600 p-2 sm:p-3 rounded-lg border-l-4 border-teal-500">
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                 <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">B.S. Computer Science</h3>
                 <span className="text-xs text-gray-600 dark:text-gray-300 bg-teal-100 dark:bg-teal-900 px-2 py-1 rounded-full w-fit shadow-sm hover:brightness-110 transition-all duration-200">2018</span>
               </div>
               <p className="text-xs text-gray-600 dark:text-gray-300">Stanford University, Stanford, CA</p>
             </div>
          </motion.div>
        </motion.div>
        
        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-white/5 dark:bg-slate-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            transform: "translateZ(20px)",
          }}
        />
      </motion.div>

      
    </div>
  );
};

export default AnimatedResume;