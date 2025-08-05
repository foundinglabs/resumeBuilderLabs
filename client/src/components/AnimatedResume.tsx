import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Constants for better maintainability
const ANIMATION_CONFIG = {
  NAME_CYCLE_DURATION: 4000,
  SUMMARY_CYCLE_DURATION: 5000,
  TYPEWRITER_DELAY: 200,
  NAME_TYPE_SPEED: 80,
  SUMMARY_TYPE_SPEED: 40,
  TILT_TRANSITION: { duration: 0.8, ease: "easeOut" },
  FADE_TRANSITION: { duration: 0.5, delay: 0.2 }
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
  // State management with proper typing
  const [currentName, setCurrentName] = useState(0);
  const [currentSummary, setCurrentSummary] = useState(0);
  const [typedName, setTypedName] = useState('');
  const [typedSummary, setTypedSummary] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<'left' | 'center' | 'right'>('center');

  // Refs for cleanup
  const nameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const summaryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Optimized typewriter function with better error handling
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

  // Optimized interval management
  const startNameCycle = useCallback(() => {
    if (nameIntervalRef.current) {
      clearInterval(nameIntervalRef.current);
    }
    nameIntervalRef.current = setInterval(() => {
      setCurrentName((prev) => (prev + 1) % nameData.length);
    }, ANIMATION_CONFIG.NAME_CYCLE_DURATION);
  }, []);

  const startSummaryCycle = useCallback(() => {
    if (summaryIntervalRef.current) {
      clearInterval(summaryIntervalRef.current);
    }
    summaryIntervalRef.current = setInterval(() => {
      setCurrentSummary((prev) => (prev + 1) % summaryData.length);
    }, ANIMATION_CONFIG.SUMMARY_CYCLE_DURATION);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (nameIntervalRef.current) {
      clearInterval(nameIntervalRef.current);
      nameIntervalRef.current = null;
    }
    if (summaryIntervalRef.current) {
      clearInterval(summaryIntervalRef.current);
      summaryIntervalRef.current = null;
    }
    if (typeTimeoutRef.current) {
      clearTimeout(typeTimeoutRef.current);
      typeTimeoutRef.current = null;
    }
  }, []);

  // Initialize animations
  useEffect(() => {
    startNameCycle();
    startSummaryCycle();
    return cleanup;
  }, [startNameCycle, startSummaryCycle, cleanup]);

  // Typewriter effects with optimized dependencies
  useEffect(() => {
    if (typeTimeoutRef.current) {
      clearTimeout(typeTimeoutRef.current);
    }
    typeWriter(nameData[currentName], setTypedName, ANIMATION_CONFIG.NAME_TYPE_SPEED);
  }, [currentName, typeWriter]);

  useEffect(() => {
    if (typeTimeoutRef.current) {
      clearTimeout(typeTimeoutRef.current);
    }
    typeWriter(summaryData[currentSummary], setTypedSummary, ANIMATION_CONFIG.SUMMARY_TYPE_SPEED);
  }, [currentSummary, typeWriter]);

  // Optimized mouse move handler with throttling
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    
    let newPosition: 'left' | 'center' | 'right';
    if (percentage < 0.33) {
      newPosition = 'left';
    } else if (percentage > 0.66) {
      newPosition = 'right';
    } else {
      newPosition = 'center';
    }
    
    setHoverPosition(newPosition);
  }, [isHovered]);

  // Optimized hover handlers
  const handleHoverStart = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setIsHovered(false);
    setHoverPosition('center');
  }, []);

  // Memoized animation variants for better performance
  const getTiltVariants = useMemo(() => {
    const baseVariants = {
      initial: { opacity: 0, y: 30, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
    };

    const hoverVariants = {
      left: {
        scale: 1.02,
        rotateY: -12,
        rotateX: 3,
        x: -15,
        boxShadow: "0 40px 80px -20px rgba(59, 130, 246, 0.3)"
      },
      center: {
        scale: 1.02,
        rotateY: 0,
        rotateX: 0,
        x: 0,
        boxShadow: "0 40px 80px -20px rgba(59, 130, 246, 0.3)"
      },
      right: {
        scale: 1.02,
        rotateY: 12,
        rotateX: 3,
        x: 15,
        boxShadow: "0 40px 80px -20px rgba(59, 130, 246, 0.3)"
      }
    };

    return { ...baseVariants, ...hoverVariants };
  }, []);

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

  // Memoized background animation variants
  const backgroundAnimationVariants = useMemo(() => ({
    rotate: {
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    reverseRotate: {
      scale: [1, 1.3, 1],
      rotate: [360, 180, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }), []);

  // Memoized floating element animations
  const floatingAnimationVariants = useMemo(() => ({
    float: {
      y: [0, -8, 0],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    slide: {
      x: [0, 4, 0],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }), []);

  // Memoized decorative element animations
  const decorativeAnimationVariants = useMemo(() => ({
    pulse: {
      scale: [1, 1.4, 1],
      opacity: [0.3, 0.7, 0.3],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    pulseSmall: {
      scale: [1, 1.3, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }), []);

  // Memoized button click handler
  const handleButtonClick = useCallback(() => {
    window.location.href = '/builder';
  }, []);

  return (
    <motion.div
      variants={getTiltVariants}
      initial="initial"
      animate={isHovered ? hoverPosition : "animate"}
      whileHover="hover"
      transition={ANIMATION_CONFIG.TILT_TRANSITION}
      className="relative w-full max-w-6xl mx-auto mt-8 px-4 sm:px-6 lg:px-8"
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onMouseMove={handleMouseMove}
    >
      {/* Resume Paper */}
      <motion.div
        className="bg-white rounded-2xl shadow-2xl relative overflow-hidden cursor-pointer w-full"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          minHeight: 'fit-content'
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Animated Background Elements */}
        <motion.div
          className="absolute top-4 right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30"
          variants={backgroundAnimationVariants}
          animate="rotate"
        />
        
        <motion.div
          className="absolute bottom-4 left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30"
          variants={backgroundAnimationVariants}
          animate="reverseRotate"
        />

        {/* Resume Content */}
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 xl:p-10">
          {/* Header with Animated Name */}
          <motion.div 
            className="text-center mb-6 sm:mb-8"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
          >
            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {typedName}
              <motion.span
                variants={cursorVariants}
                animate="blink"
                className="inline-block w-1 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-500 ml-1 rounded-full"
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
            className="text-center mb-6 sm:mb-8 text-xs sm:text-sm text-gray-600"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          >
            <p className="font-medium text-gray-700">Software Engineer • San Francisco, CA</p>
            <p className="text-blue-600">john.doe@email.com • (555) 123-4567</p>
            <p className="text-purple-600">linkedin.com/in/johndoe • github.com/johndoe</p>
          </motion.div>

          {/* Animated Summary Section */}
          <motion.div 
            className="mb-6 sm:mb-8"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PROFESSIONAL SUMMARY
            </h2>
            <motion.div
              className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gradient-to-r from-gray-50 to-blue-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500"
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

          {/* Static Experience Section */}
          <motion.div 
            className="mb-6 sm:mb-8"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              EXPERIENCE
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-4 rounded-lg border-l-4 border-green-500">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Senior Software Engineer</h3>
                  <span className="text-xs text-gray-600 bg-blue-100 px-2 py-1 rounded-full w-fit">2020 - 2023</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">Tech Corp, San Francisco, CA</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Led development of scalable web applications using React and Node.js</li>
                  <li>• Mentored 5 junior developers and improved team productivity by 30%</li>
                  <li>• Implemented CI/CD pipelines reducing deployment time by 60%</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg border-l-4 border-purple-500">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Software Engineer</h3>
                  <span className="text-xs text-gray-600 bg-purple-100 px-2 py-1 rounded-full w-fit">2018 - 2020</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">Startup Inc, San Francisco, CA</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Developed full-stack features for SaaS platform with 100K+ users</li>
                  <li>• Optimized database queries improving performance by 40%</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Static Skills Section */}
          <motion.div 
            className="mb-6 sm:mb-8"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              SKILLS
            </h2>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 sm:p-4 rounded-lg border-l-4 border-orange-500">
              <div className="text-xs text-gray-700 space-y-2">
                <p><strong className="text-orange-700">Programming:</strong> JavaScript, React, Node.js, Python, TypeScript</p>
                <p><strong className="text-orange-700">Tools:</strong> Git, Docker, AWS, Jenkins, MongoDB, PostgreSQL</p>
                <p><strong className="text-orange-700">Methodologies:</strong> Agile, Scrum, TDD, CI/CD, Microservices</p>
              </div>
            </div>
          </motion.div>

          {/* Static Education Section */}
          <motion.div 
            className="mb-4"
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              EDUCATION
            </h2>
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-3 sm:p-4 rounded-lg border-l-4 border-teal-500">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">B.S. Computer Science</h3>
                <span className="text-xs text-gray-600 bg-teal-100 px-2 py-1 rounded-full w-fit">2018</span>
              </div>
              <p className="text-xs text-gray-600">Stanford University, Stanford, CA</p>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-4 sm:top-6 right-4 sm:right-6 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
          variants={floatingAnimationVariants}
          animate="float"
        />
        
        <motion.div
          className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
          variants={floatingAnimationVariants}
          animate="slide"
        />
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute -top-2 -left-2 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        variants={decorativeAnimationVariants}
        animate="pulse"
      />
      
      <motion.div
        className="absolute -bottom-2 -right-2 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        variants={decorativeAnimationVariants}
        animate="pulseSmall"
      />

      {/* Try It Now Button */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.button
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleButtonClick}
            >
              Try It Now →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnimatedResume; 