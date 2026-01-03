
import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const InteractiveBackground: React.FC = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const springX = useSpring(mouse.x, { damping: 30, stiffness: 100 });
  const springY = useSpring(mouse.y, { damping: 30, stiffness: 100 });

  const rotateX = useTransform(springY, [-1, 1], [10, -10]);
  const rotateY = useTransform(springX, [-1, 1], [-10, 10]);
  const translateX = useTransform(springX, [-1, 1], [-20, 20]);
  const translateY = useTransform(springY, [-1, 1], [-20, 20]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none perspective-container">
      {/* Dynamic Glow */}
      <motion.div 
        style={{ x: translateX, y: translateY }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[160px] opacity-40" />
      </motion.div>

      {/* Interactive Grid */}
      <motion.div 
        style={{ rotateX, rotateY, scale: 1.1 }}
        className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] opacity-[0.03]"
      >
        {Array.from({ length: 400 }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-white" />
        ))}
      </motion.div>

      {/* Drifting Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%", 
              opacity: Math.random() * 0.3 
            }}
            animate={{ 
              y: ["-5%", "5%"],
              x: ["-2%", "2%"]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity, 
              repeatType: "mirror",
              ease: "easeInOut" 
            }}
            className="absolute w-[1px] h-[60px] bg-gradient-to-b from-transparent via-white to-transparent"
          />
        ))}
      </div>
    </div>
  );
};

export default InteractiveBackground;
