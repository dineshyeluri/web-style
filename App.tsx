
import React, { useState, useEffect, useCallback } from 'react';
import { HeroContent, AnimationState } from './types';
import KineticHero from './components/KineticHero';
import { generateHeroContent } from './services/geminiService';
import { RefreshCcw, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [content, setContent] = useState<HeroContent>({
    headline: "CRAFTING DIGITAL PERFECTION",
    subheadline: "Experience the next generation of web motion with high-end kinetic typography and fluid layouts.",
    ctaText: "Start Exploring"
  });
  const [status, setStatus] = useState<AnimationState>(AnimationState.READY);
  const [industry, setIndustry] = useState('Creative Agency');

  const fetchNewContent = useCallback(async () => {
    setStatus(AnimationState.LOADING);
    try {
      const newContent = await generateHeroContent(industry);
      if (newContent) {
        setContent(newContent);
      }
    } catch (error) {
      console.error("Failed to fetch content", error);
    } finally {
      setStatus(AnimationState.READY);
    }
  }, [industry]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-md bg-black/10 border-b border-white/5">
        <div className="text-xl font-black tracking-tighter">KINETIC<span className="text-blue-500">.</span>STUDIO</div>
        <div className="flex gap-4 items-center">
          <select 
            className="bg-zinc-900 border border-white/10 text-xs rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option>Creative Agency</option>
            <option>Tech Startup</option>
            <option>Luxury Fashion</option>
            <option>Architectural Firm</option>
            <option>Space Exploration</option>
          </select>
          <button 
            onClick={fetchNewContent}
            disabled={status === AnimationState.LOADING}
            className="group relative flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${status === AnimationState.LOADING ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            {status === AnimationState.LOADING ? 'Generating...' : 'Regenerate'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative h-screen flex items-center justify-center overflow-hidden">
        <KineticHero 
          content={content} 
          isLoading={status === AnimationState.LOADING} 
        />
        
        {/* Decorative Elements */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/50" />
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll to Discover</span>
        </div>
      </main>

      {/* Subtle floating overlay */}
      <div className="fixed top-1/2 right-6 -translate-y-1/2 flex flex-col gap-6 z-40">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-1 h-1 bg-white/20 rounded-full hover:bg-blue-500 transition-colors cursor-pointer" />
        ))}
      </div>
    </div>
  );
};

export default App;
