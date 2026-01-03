
import React, { useEffect, useRef, useState } from 'react';
import { HeroContent } from '../types';

const DEFAULT_TEXT = "NCHARUDH SOLUTIONS";
const LIGHT_COLOR = "#FFFFFF"; 
const STROKE_COLOR = "rgba(255, 255, 255, 0.12)"; 
const BG_COLOR = "#0a0a0a";
const GEAR_TINT = "rgba(255, 255, 255, 0.04)";
const BOLT_TINT = "rgba(255, 255, 255, 0.1)";

interface LetterState {
  char: string;
  x: number;
  y: number;
  width: number;
  bounceOffset: number;
  bounceVel: number;
  scaleX: number;
  scaleY: number;
  hasBeenLit: boolean;
}

interface KineticHeroProps {
  content?: HeroContent;
  isLoading?: boolean;
}

interface Gear {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  speed: number;
  teeth: number;
  bolts: number;
  type: 'large' | 'medium' | 'small';
}

export const KineticHero: React.FC<KineticHeroProps> = ({ content, isLoading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isComplete, setIsComplete] = useState(false);

  const displayText = (content?.headline && content.headline.trim() !== "") ? content.headline.toUpperCase() : DEFAULT_TEXT;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const fontSize = Math.min(width * 0.08, 140);
    const letterSpacing = fontSize * 0.18;
    ctx.font = `bold ${fontSize}px "Anton", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let totalTextWidth = 0;
    for (let i = 0; i < displayText.length; i++) {
      totalTextWidth += ctx.measureText(displayText[i]).width;
      if (i < displayText.length - 1) totalTextWidth += letterSpacing;
    }

    const startX = (width - totalTextWidth) / 2;
    const centerY = height / 2;

    const letters: LetterState[] = [];
    let currentX = startX;
    
    for (let i = 0; i < displayText.length; i++) {
      const char = displayText[i];
      const charWidth = ctx.measureText(char).width;
      letters.push({
        char,
        x: currentX + charWidth / 2,
        y: centerY,
        width: charWidth,
        bounceOffset: 0,
        bounceVel: 0,
        scaleX: 1,
        scaleY: 1,
        hasBeenLit: false,
      });
      currentX += charWidth + letterSpacing;
    }

    // Gear sizing definitions for the "Circular" cluster
    const rLarge = fontSize * 1.6;
    const rMedium = fontSize * 1.2;
    const rSmall = fontSize * 0.9;
    
    // Teeth density relative to radius for consistent meshing
    const toothPitch = 6.5; 
    
    // G1 (Large - Center Base)
    const g1: Gear = {
      x: width / 2,
      y: centerY + rLarge * 0.4,
      radius: rLarge,
      rotation: 0,
      speed: 0.0035,
      teeth: Math.round(rLarge / toothPitch) * 4,
      bolts: 6,
      type: 'large'
    };

    const speedBase = g1.speed;
    const meshTightness = 0.97; // Closer "rubbing" fit

    // G2 (Medium - Top Left Cluster)
    // Angle to position G2 relative to G1
    const angleG2 = -Math.PI * 0.7; 
    const distG2 = (rLarge + rMedium) * meshTightness;
    
    const g2: Gear = {
      x: g1.x + distG2 * Math.cos(angleG2),
      y: g1.y + distG2 * Math.sin(angleG2),
      radius: rMedium,
      rotation: angleG2 + Math.PI, // Aligned mesh
      speed: -speedBase * (g1.radius / rMedium),
      teeth: Math.round(rMedium / toothPitch) * 4,
      bolts: 4,
      type: 'medium'
    };

    // G3 (Small - Top Right Cluster)
    // Positioned to touch G1 but stay close to G2 in a circular formation
    const angleG3 = -Math.PI * 0.3;
    const distG3 = (rLarge + rSmall) * meshTightness;

    const g3: Gear = {
      x: g1.x + distG3 * Math.cos(angleG3),
      y: g1.y + distG3 * Math.sin(angleG3),
      radius: rSmall,
      rotation: angleG3 + Math.PI / 1.5,
      speed: -speedBase * (g1.radius / rSmall),
      teeth: Math.round(rSmall / toothPitch) * 4,
      bolts: 3,
      type: 'small'
    };

    const gears = [g1, g2, g3];

    let spotlight = {
      active: true,
      x: -800,
      vx: 15,
      width: fontSize * 4.8,
      angle: -Math.PI / 9, 
    };

    const drawWatchGear = (ctx: CanvasRenderingContext2D, gear: Gear) => {
      const { x, y, radius, rotation, teeth, bolts } = gear;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      const innerRadius = radius * 0.88;
      const outerRadius = radius * 1.05;
      const hubRadius = radius * 0.32;
      const centerHole = radius * 0.1;

      // 1. Draw Teeth
      ctx.beginPath();
      ctx.fillStyle = GEAR_TINT;
      for (let i = 0; i < teeth; i++) {
        const angle = (i * 2 * Math.PI) / teeth;
        const toothWidth = (2 * Math.PI) / teeth * 0.35;
        
        ctx.lineTo(Math.cos(angle - toothWidth) * innerRadius, Math.sin(angle - toothWidth) * innerRadius);
        ctx.lineTo(Math.cos(angle - toothWidth * 0.6) * outerRadius, Math.sin(angle - toothWidth * 0.6) * outerRadius);
        ctx.lineTo(Math.cos(angle + toothWidth * 0.6) * outerRadius, Math.sin(angle + toothWidth * 0.6) * outerRadius);
        ctx.lineTo(Math.cos(angle + toothWidth) * innerRadius, Math.sin(angle + toothWidth) * innerRadius);
      }
      ctx.closePath();
      ctx.fill();

      // 2. Main Plate
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Details
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius - 2, 0, Math.PI * 2);
      ctx.stroke();

      // Bolts
      if (bolts > 0) {
        for (let i = 0; i < bolts; i++) {
          const bAngle = (i * 2 * Math.PI) / bolts;
          const bx = Math.cos(bAngle) * (hubRadius * 0.8);
          const by = Math.sin(bAngle) * (hubRadius * 0.8);
          ctx.beginPath();
          ctx.arc(bx, by, radius * 0.05, 0, Math.PI * 2);
          ctx.fillStyle = BOLT_TINT;
          ctx.fill();
          ctx.stroke();
        }
      }

      // Hub Detail
      ctx.beginPath();
      ctx.arc(0, 0, hubRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, centerHole, 0, Math.PI * 2);
      ctx.stroke();
      
      // Cutouts
      ctx.globalCompositeOperation = 'destination-out';
      const spokes = gear.type === 'large' ? 6 : (gear.type === 'medium' ? 5 : 4);
      for (let i = 0; i < spokes; i++) {
        const sAngle = (i * 2 * Math.PI) / spokes;
        ctx.save();
        ctx.rotate(sAngle);
        ctx.beginPath();
        const startR = hubRadius + 10;
        const endR = innerRadius - 12;
        ctx.moveTo(startR, -5);
        ctx.lineTo(endR, -10);
        ctx.arc(0, 0, endR, -0.12, 0.12);
        ctx.lineTo(startR, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.globalCompositeOperation = 'source-over';

      ctx.restore();
    };

    const drawBeamPath = (ctx: CanvasRenderingContext2D, x: number, w: number, angle: number) => {
      const topOffset = Math.tan(angle) * height;
      ctx.beginPath();
      ctx.moveTo(x - w / 2 - topOffset, 0);
      ctx.lineTo(x + w / 2 - topOffset, 0);
      ctx.lineTo(x + w / 2, height);
      ctx.lineTo(x - w / 2, height);
      ctx.closePath();
    };

    const animate = () => {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, width, height);

      // --- Mechanism Layer ---
      gears.forEach(g => {
        g.rotation += g.speed;
        drawWatchGear(ctx, g);
      });

      // --- Spotlight Sweep Logic ---
      if (spotlight.active) {
        spotlight.x += spotlight.vx;
        if (spotlight.x > width + 1500) {
          spotlight.active = false;
          setIsComplete(true);
        }
      }

      letters.forEach(l => {
        const topOffset = Math.tan(spotlight.angle) * (l.y - 0);
        const dist = Math.abs(l.x - (spotlight.x - topOffset));
        if (dist < spotlight.width / 2) {
          l.hasBeenLit = true;
        }
      });

      // Layer 1: Typography Outlines
      ctx.lineWidth = 1;
      ctx.strokeStyle = STROKE_COLOR;
      ctx.font = `bold ${fontSize}px "Anton", sans-serif`;
      letters.forEach(l => {
        if (l.char === ' ') return;
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.strokeText(l.char, 0, 0);
        ctx.restore();
      });

      // Layer 2: Illuminated Sweep
      if (spotlight.active) {
        ctx.save();
        drawBeamPath(ctx, spotlight.x, spotlight.width, spotlight.angle);
        ctx.clip();

        const beamGrad = ctx.createLinearGradient(spotlight.x - spotlight.width/2, 0, spotlight.x + spotlight.width/2, 0);
        beamGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        beamGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.05)");
        beamGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, 0, width, height);

        letters.forEach(l => {
          if (l.char === ' ') return;
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.shadowBlur = 40; 
          ctx.shadowColor = "white";
          ctx.fillStyle = "white";
          ctx.fillText(l.char, 0, 0);
          ctx.shadowBlur = 5; 
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1.5;
          ctx.strokeText(l.char, 0, 0);
          ctx.restore();
        });
        ctx.restore();
      }

      // Layer 3: Final Persistent State
      letters.forEach(l => {
        if (l.hasBeenLit && l.char !== ' ') {
          const topOffset = Math.tan(spotlight.angle) * (l.y - 0);
          const isLeftOfBeam = !spotlight.active || (l.x < spotlight.x - topOffset - spotlight.width / 3);
          
          if (isLeftOfBeam) {
            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.shadowBlur = 10; 
            ctx.shadowColor = "rgba(255, 255, 255, 0.1)";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(l.char, 0, 0);
            ctx.restore();
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Re-position circular gear cluster
      g1.x = width / 2;
      g1.y = height / 2 + rLarge * 0.4;
      
      const dG2 = (rLarge + rMedium) * meshTightness;
      g2.x = g1.x + dG2 * Math.cos(angleG2);
      g2.y = g1.y + dG2 * Math.sin(angleG2);
      
      const dG3 = (rLarge + rSmall) * meshTightness;
      g3.x = g1.x + dG3 * Math.cos(angleG3);
      g3.y = g1.y + dG3 * Math.sin(angleG3);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [displayText]);

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {isComplete && content && (
          <div className="absolute top-[68%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 text-center z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <p className="text-white/40 font-mono text-[9px] tracking-[0.6em] uppercase mb-6">
              {content.subheadline || "Precision Synchronized Digital Engineering"}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 bg-white/10" />
              <button 
                className="px-10 py-2 border border-white/5 text-white/80 font-mono text-[8px] tracking-[0.7em] uppercase hover:bg-white/5 transition-all hover:text-white"
              >
                {content.ctaText || "Enter Studio"}
              </button>
              <div className="h-[1px] w-12 bg-white/10" />
            </div>
          </div>
        )}
      </div>
      
      {isComplete && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
           <button 
             onClick={() => window.location.reload()} 
             className="text-white/20 font-mono text-[7px] uppercase tracking-[0.5em] hover:text-white/50 transition-all py-2 px-4"
           >
             RE_SYNC_CORE
           </button>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
           <div className="flex flex-col items-center gap-4">
              <div className="w-6 h-6 border border-white/5 border-t-white/80 rounded-full animate-spin" />
              <div className="font-mono text-[7px] tracking-[0.8em] text-white/60 uppercase animate-pulse">Synchronizing_Chrono_Link</div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KineticHero;
