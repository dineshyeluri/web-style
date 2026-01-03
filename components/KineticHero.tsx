
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroContent } from '../types';
import InteractiveBackground from './InteractiveBackground';

interface KineticHeroProps {
  content: HeroContent;
  isLoading: boolean;
}

const KineticHero: React.FC<KineticHeroProps> = ({ content, isLoading }) => {
  // Reveal animation variants for the "masking" technique
  const maskVariant = {
    initial: { y: "110%", skewY: 7 },
    animate: { 
      y: 0, 
      skewY: 0,
      transition: {
        duration: 1.1,
        ease: [0.76, 0, 0.24, 1], // Precise professional reel easing
      }
    },
    exit: { 
      y: "-110%", 
      skewY: -7,
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1]
      }
    }
  };

  const containerVariant = {
    animate: {
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6 overflow-hidden">
      <InteractiveBackground />

      {/* Main Content Area */}
      <div className="relative z-10 text-center w-full max-w-[90vw] pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div 
            key={content.headline}
            variants={containerVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center"
          >
            {/* Headline with Masking */}
            <div className="mb-6 md:mb-10">
              <h1 className="text-6xl md:text-8xl lg:text-[11vw] font-black tracking-[-0.05em] leading-[0.85] flex flex-wrap justify-center gap-x-[0.2em]">
                {content.headline.split(' ').map((word, i) => (
                  <span key={i} className="relative inline-block overflow-hidden py-[0.1em]">
                    <motion.span 
                      variants={maskVariant}
                      className="inline-block whitespace-nowrap"
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </h1>
            </div>

            {/* Subheadline Fade & Rise */}
            <div className="overflow-hidden">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-zinc-500 text-sm md:text-xl lg:text-2xl max-w-2xl mx-auto font-medium tracking-tight"
              >
                {content.subheadline}
              </motion.p>
            </div>

            {/* CTA Button with Liquid Hover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="mt-12 pointer-events-auto"
            >
              <button className="group relative px-10 py-4 bg-white text-black rounded-full overflow-hidden transition-all active:scale-95">
                <div className="absolute inset-0 bg-blue-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[0.76, 0, 0.24, 1]" />
                <span className="relative z-10 text-xs font-black tracking-[0.25em] uppercase group-hover:text-white transition-colors duration-300">
                  {content.ctaText}
                </span>
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Meta Labels (Reel Accent) */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingLabel position="top-1/3 left-10" label="Ver. 2.5" delay={1.5} />
        <FloatingLabel position="bottom-1/4 right-20" label="Adaptive Design" delay={1.8} />
        <FloatingLabel position="top-1/4 right-1/4" label="High-Res Motion" delay={2.1} />
      </div>

      {/* Bottom Interface Accents */}
      <div className="absolute bottom-10 left-10 hidden md:block">
        <div className="flex gap-10">
          <Stat label="Motion Physics" value="60FPS" />
          <Stat label="Response" value="<20ms" />
        </div>
      </div>
    </div>
  );
};

const FloatingLabel = ({ position, label, delay }: { position: string, label: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.4 }}
    transition={{ delay, duration: 1 }}
    className={`absolute ${position} flex items-center gap-3`}
  >
    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
  </motion.div>
);

const Stat = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">{label}</span>
    <span className="text-xs font-mono font-medium text-zinc-400">{value}</span>
  </div>
);

export default KineticHero;
