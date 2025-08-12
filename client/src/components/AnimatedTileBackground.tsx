import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface TileProps {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  darkColor: string;
  delay: number;
  shape: 'square' | 'L' | 'rectangle';
}

interface AnimatedTileBackgroundProps {
  showInDarkMode?: boolean;
}

const AnimatedTileBackground: React.FC<AnimatedTileBackgroundProps> = ({ showInDarkMode = false }) => {
  // Generate tiles in an irregular grid pattern like the image
  const tiles = useMemo(() => {
    const tileArray: TileProps[] = [];
    const colors = [
      'from-blue-50/30 to-blue-100/25',
      'from-slate-50/35 to-blue-50/30',
      'from-cyan-50/30 to-blue-50/25',
      'from-sky-50/35 to-slate-50/30'
    ];
    
    const darkColors = [
      'from-blue-300/60 to-blue-400/50',
      'from-blue-200/70 to-blue-300/60',
      'from-cyan-300/60 to-blue-300/50',
      'from-sky-300/60 to-blue-200/70'
    ];

    // Create irregular grid pattern
    const positions: Array<{x: number, y: number, size: number, shape: 'square' | 'L' | 'rectangle'}> = [
      // Top row
      { x: 50, y: 50, size: 80, shape: 'square' },
      { x: 180, y: 80, size: 60, shape: 'L' },
      { x: 320, y: 60, size: 100, shape: 'rectangle' },
      { x: 480, y: 90, size: 70, shape: 'square' },
      { x: 620, y: 70, size: 85, shape: 'L' },
      { x: 780, y: 50, size: 75, shape: 'square' },
      
      // Second row
      { x: 120, y: 200, size: 90, shape: 'rectangle' },
      { x: 280, y: 220, size: 65, shape: 'L' },
      { x: 420, y: 180, size: 80, shape: 'square' },
      { x: 580, y: 210, size: 70, shape: 'L' },
      { x: 720, y: 190, size: 85, shape: 'rectangle' },
      
      // Third row
      { x: 80, y: 350, size: 75, shape: 'L' },
      { x: 240, y: 320, size: 90, shape: 'square' },
      { x: 400, y: 360, size: 65, shape: 'rectangle' },
      { x: 560, y: 330, size: 80, shape: 'L' },
      { x: 700, y: 350, size: 70, shape: 'square' },
      
      // Fourth row
      { x: 150, y: 500, size: 85, shape: 'rectangle' },
      { x: 320, y: 480, size: 70, shape: 'L' },
      { x: 480, y: 520, size: 75, shape: 'square' },
      { x: 640, y: 490, size: 90, shape: 'rectangle' },
      
      // Fifth row
      { x: 100, y: 650, size: 80, shape: 'L' },
      { x: 260, y: 620, size: 70, shape: 'square' },
      { x: 420, y: 650, size: 85, shape: 'rectangle' },
      { x: 580, y: 630, size: 75, shape: 'L' },
      { x: 740, y: 660, size: 80, shape: 'square' },
      
      // Additional scattered tiles
      { x: 900, y: 100, size: 60, shape: 'L' },
      { x: 1050, y: 150, size: 80, shape: 'square' },
      { x: 920, y: 300, size: 70, shape: 'rectangle' },
      { x: 1080, y: 280, size: 65, shape: 'L' },
      { x: 950, y: 450, size: 75, shape: 'square' },
      { x: 1100, y: 420, size: 85, shape: 'rectangle' },
      { x: 930, y: 600, size: 70, shape: 'L' },
      { x: 1090, y: 580, size: 80, shape: 'square' },
    ];

    positions.forEach((pos, index) => {
      const colorIndex = index % colors.length;
      tileArray.push({
        id: index,
        x: pos.x,
        y: pos.y,
        size: pos.size,
        color: colors[colorIndex],
        darkColor: darkColors[colorIndex],
        shape: pos.shape,
        delay: index * 0.1
      });
    });
    
    return tileArray;
  }, []);

  const tileVariants = useMemo(() => ({
    initial: { 
      opacity: 0, 
      scale: 0.8,
      rotate: -5,
      y: 20
    },
    animate: { 
      opacity: 0.25, 
      scale: 1,
      rotate: 0,
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        delay: 0.2
      }
    },
    hover: { 
      opacity: 0.4, 
      scale: 1.1,
      rotate: 3,
      y: -5,
      transition: { 
        duration: 0.3, 
        ease: "easeOut"
      }
    },
    float: {
      y: [0, -8, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }), []);

  const containerVariants = useMemo(() => ({
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 1,
        staggerChildren: 0.05
      }
    }
  }), []);

  const getShapeClasses = (shape: 'square' | 'L' | 'rectangle', size: number) => {
    const baseClasses = "absolute bg-gradient-to-br backdrop-blur-sm border cursor-pointer";
    
    switch (shape) {
      case 'square':
        return `${baseClasses} rounded-lg border-blue-100/50 dark:border-blue-300/50`;
      case 'L':
        return `${baseClasses} rounded-lg border-blue-100/50 dark:border-blue-300/50`;
      case 'rectangle':
        return `${baseClasses} rounded-lg border-blue-100/50 dark:border-blue-300/50`;
      default:
        return `${baseClasses} rounded-lg border-blue-100/50 dark:border-blue-300/50`;
    }
  };

  // Don't render if showInDarkMode is false and we're in dark mode
  if (!showInDarkMode) {
    return null;
  }

  return (
    <motion.div
      className="absolute inset-0 z-0 overflow-hidden"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {tiles.map((tile) => (
        <motion.div
          key={tile.id}
          className={`${getShapeClasses(tile.shape, tile.size)} ${tile.color} dark:${tile.darkColor}`}
          style={{
            left: tile.x,
            top: tile.y,
            width: tile.shape === 'rectangle' ? tile.size * 1.5 : tile.size,
            height: tile.shape === 'L' ? tile.size * 0.8 : tile.size,
          }}
          variants={tileVariants}
          whileHover="hover"
          initial="initial"
          animate={["animate", "float"]}
          transition={{
            delay: tile.delay,
            duration: 0.6,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  );
};

export default AnimatedTileBackground; 