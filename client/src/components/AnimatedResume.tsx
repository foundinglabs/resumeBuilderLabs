import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Hover handlers
  const handleHoverStart = useCallback(() => setIsHovered(true), []);
  const handleHoverEnd = useCallback(() => setIsHovered(false), []);

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
        className="bg-white rounded-2xl shadow-2xl relative overflow-hidden w-full cursor-pointer transform-gpu"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
        variants={resumeHoverVariants}
        initial="initial"
        whileHover="hover"
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
      >
        {/* Beautiful Hover Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-2xl"
          variants={glowVariants}
          initial="initial"
          animate={isHovered ? "hover" : "initial"}
        />

        {/* Enhanced Background Elements */}
        <motion.div
          className="absolute top-2 right-2 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30"
          variants={backgroundAnimationVariants}
          animate="rotate"
        />
        <motion.div
          className="absolute bottom-2 left-2 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30"
          variants={backgroundAnimationVariants}
          animate="reverseRotate"
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
              className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {typedName}
              <motion.span
                variants={cursorVariants}
                animate="blink"
                className="inline-block w-1 h-5 sm:h-6 bg-gradient-to-b from-blue-500 to-purple-500 ml-1 rounded-full"
              />
            </motion.h1>
            <motion.div
              className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            className="text-center mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          >
            <p className="font-medium text-gray-700">Software Engineer • San Francisco, CA</p>
            <p className="text-blue-600">john.doe@email.com • (555) 123-4567</p>
            <p className="text-purple-600">linkedin.com/in/johndoe • github.com/johndoe</p>
          </motion.div>

          {/* Summary */}
          <motion.div 
            className="mb-3 sm:mb-4"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PROFESSIONAL SUMMARY
            </h2>
            <motion.div
              className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gradient-to-r from-gray-50 to-blue-50 p-2 sm:p-3 rounded-lg border-l-4 border-blue-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {typedSummary}
              <motion.span
                variants={cursorVariants}
                animate="blink"
                className="inline-block w-1 h-3 sm:h-4 bg-gradient-to-b from-blue-500 to-purple-500 ml-1 rounded-full"
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
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              EXPERIENCE
            </h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-2 sm:p-3 rounded-lg border-l-4 border-green-500">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Senior Software Engineer</h3>
                  <span className="text-xs text-gray-600 bg-blue-100 px-2 py-1 rounded-full w-fit">2020 - 2023</span>
                </div>
                <p className="text-xs text-gray-600 mb-1 sm:mb-2">Tech Corp, San Francisco, CA</p>
                <ul className="text-xs text-gray-700 space-y-1">
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
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              SKILLS
            </h2>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-2 sm:p-3 rounded-lg border-l-4 border-orange-500">
              <div className="text-xs text-gray-700 space-y-1 sm:space-y-2">
                <p><strong className="text-orange-700">Programming:</strong> JavaScript, React, Node.js, Python, TypeScript</p>
                <p><strong className="text-orange-700">Tools:</strong> Git, Docker, AWS, Jenkins, MongoDB, PostgreSQL</p>
                <p><strong className="text-orange-700">Methodologies:</strong> Agile, Scrum, TDD, CI/CD, Microservices</p>
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
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              EDUCATION
            </h2>
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-2 sm:p-3 rounded-lg border-l-4 border-teal-500">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">B.S. Computer Science</h3>
                <span className="text-xs text-gray-600 bg-teal-100 px-2 py-1 rounded-full w-fit">2018</span>
              </div>
              <p className="text-xs text-gray-600">Stanford University, Stanford, CA</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Floating Elements */}
        <motion.div
          className="absolute top-2 sm:top-4 right-2 sm:right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
          variants={floatingAnimationVariants}
          animate="float"
        />
        <motion.div
          className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
          variants={floatingAnimationVariants}
          animate="slide"
        />

        {/* New Hover-Enhanced Floating Elements */}
        <motion.div
          className="absolute top-4 sm:top-6 left-4 sm:left-6 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"
          variants={floatingHoverVariants}
          animate={isHovered ? "hover" : "initial"}
        />
        <motion.div
          className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
          variants={floatingHoverVariants}
          animate={isHovered ? "hover" : "initial"}
        />

        {/* Additional Dynamic Elements */}
        <motion.div
          className="absolute top-1/2 left-2 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"
          variants={floatingHoverVariants}
          animate={isHovered ? "hover" : "initial"}
          style={{ animationDelay: '0.5s' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
          variants={floatingHoverVariants}
          animate={isHovered ? "hover" : "initial"}
          style={{ animationDelay: '1s' }}
        />
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute -top-1 -left-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        variants={decorativeAnimationVariants}
        animate="pulse"
      />
      <motion.div
        className="absolute -bottom-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        variants={decorativeAnimationVariants}
        animate="pulseSmall"
      />
    </div>
  );
};

export default AnimatedResume;