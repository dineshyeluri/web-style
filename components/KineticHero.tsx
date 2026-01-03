
import React, { useEffect, useRef, useState } from 'react';
import { HeroContent } from '../types';

const DEFAULT_TEXT = "NCHARUDH SOLUTIONS";
const STROKE_COLOR = "rgba(255, 255, 255, 0.08)"; 
const BG_COLOR = "#030303";

interface LetterState {
  char: string;
  x: number;
  y: number;
  width: number;
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

    // Calculate text positions
    let totalTextWidth = 0;
    const charWidths: number[] = [];
    for (let i = 0; i < displayText.length; i++) {
      const w = ctx.measureText(displayText[i]).width;
      charWidths.push(w);
      totalTextWidth += w;
      if (i < displayText.length - 1) totalTextWidth += letterSpacing;
    }

    const startX = (width - totalTextWidth) / 2;
    const centerY = height / 2;
    const letters: LetterState[] = [];
    let currentX = startX;
    for (let i = 0; i < displayText.length; i++) {
      letters.push({
        char: displayText[i],
        x: currentX + charWidths[i] / 2,
        y: centerY,
        width: charWidths[i],
        hasBeenLit: false,
      });
      currentX += charWidths[i] + letterSpacing;
    }

    // --- MECHANICAL SYNCED GEAR ENGINE ---
    
    // 1. Base Parameters
    const rLargeBase = fontSize * 1.6;
    const tLarge = 18; // 18 chunky teeth for the main gear
    
    // 2. Derive other gears to ensure identical pitch (p = 2*PI*R / T)
    const tMedium = 12; // Must be integer
    const tSmall = 8;   // Must be integer
    
    // Adjust radii to match pitch exactly: R2 = R1 * (T2/T1)
    const rLarge = rLargeBase;
    const rMedium = rLarge * (tMedium / tLarge);
    const rSmall = rLarge * (tSmall / tLarge);

    const speedBase = 0.003;
    const gearCenterY = centerY + rLarge * 0.45;
    
    // Mesh tightness: distance = R1 + R2. We use 0.98 for visual "rubbing" depth.
    const meshFactor = 0.97;

    // Gear 1: Center Driver
    const g1: Gear = {
      x: width / 2,
      y: gearCenterY,
      radius: rLarge,
      rotation: 0,
      speed: speedBase,
      teeth: tLarge,
      bolts: 6,
      type: 'large'
    };

    // Gear 2: Meshed Left
    const angleG2 = -Math.PI * 0.75; // 135 degrees
    const distG2 = (rLarge + rMedium) * meshFactor;
    
    /**
     * Meshing Math:
     * To align Gear 2 with Gear 1:
     * 1. Find rotation of G1 at the contact point (angleG2).
     * 2. Orientation of G2 at contact point is angleG2 + PI.
     * 3. Add a half-tooth offset (PI / teeth) so tooth meets gap.
     */
    const g2: Gear = {
      x: g1.x + distG2 * Math.cos(angleG2),
      y: g1.y + distG2 * Math.sin(angleG2),
      radius: rMedium,
      rotation: (angleG2 + Math.PI) - (g1.rotation - angleG2) * (tLarge / tMedium) + (Math.PI / tMedium),
      speed: -speedBase * (tLarge / tMedium),
      teeth: tMedium,
      bolts: 4,
      type: 'medium'
    };

    // Gear 3: Meshed Right
    const angleG3 = -Math.PI * 0.25; // 45 degrees
    const distG3 = (rLarge + rSmall) * meshFactor;
    const g3: Gear = {
      x: g1.x + distG3 * Math.cos(angleG3),
      y: g1.y + distG3 * Math.sin(angleG3),
      radius: rSmall,
      rotation: (angleG3 + Math.PI) - (g1.rotation - angleG3) * (tLarge / tSmall) + (Math.PI / tSmall),
      speed: -speedBase * (tLarge / tSmall),
      teeth: tSmall,
      bolts: 3,
      type: 'small'
    };

    const gears = [g1, g2, g3];

    let spotlight = {
      active: true,
      x: -1200,
      vx: 18,
      width: fontSize * 5,
      angle: -Math.PI / 8, 
    };

    const drawGearPath = (ctx: CanvasRenderingContext2D, gear: Gear, rIn: number, rOut: number) => {
      ctx.beginPath();
      const toothWidthFactor = 0.22; // Half-width of tooth in radians cycle
      for (let i = 0; i < gear.teeth; i++) {
        const angle = (i * 2 * Math.PI) / gear.teeth;
        const toothW = (2 * Math.PI) / gear.teeth * toothWidthFactor;
        
        // Trapezoidal "Industrial" Tooth Shape
        ctx.lineTo(Math.cos(angle - toothW * 1.3) * rIn, Math.sin(angle - toothW * 1.3) * rIn);
        ctx.lineTo(Math.cos(angle - toothW * 0.7) * rOut, Math.sin(angle - toothW * 0.7) * rOut);
        ctx.lineTo(Math.cos(angle + toothW * 0.7) * rOut, Math.sin(angle + toothW * 0.7) * rOut);
        ctx.lineTo(Math.cos(angle + toothW * 1.3) * rIn, Math.sin(angle + toothW * 1.3) * rIn);
      }
      ctx.closePath();
    };

    const draw3DGear = (ctx: CanvasRenderingContext2D, gear: Gear) => {
      const { x, y, radius, rotation } = gear;
      const innerR = radius * 0.85; 
      const outerR = radius * 1.1;

      ctx.save();
      ctx.translate(x, y);

      // --- 1. THE SIDE (EXTRUSION) ---
      // Render multiple dark layers to simulate the vertical face of the gear
      ctx.save();
      ctx.rotate(rotation);
      const depth = radius * 0.15;
      for (let i = depth; i > 0; i -= 4) {
        ctx.save();
        ctx.translate(i * 0.4, i * 0.8); // 3D Tilt direction
        ctx.fillStyle = i === depth ? "#000000" : "#1a1a1a";
        drawGearPath(ctx, gear, innerR, outerR);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // --- 2. THE TOP FACE ---
      ctx.save();
      ctx.rotate(rotation);
      
      // Industrial Metallic Gradient
      const grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
      grad.addColorStop(0, "#555555");
      grad.addColorStop(0.3, "#999999");
      grad.addColorStop(0.5, "#222222");
      grad.addColorStop(0.7, "#aaaaaa");
      grad.addColorStop(1, "#333333");

      ctx.fillStyle = grad;
      drawGearPath(ctx, gear, innerR, outerR);
      ctx.fill();

      // Sharp highlight on the edge
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center Detail
      const hubR = radius * 0.4;
      const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, hubR);
      hubGrad.addColorStop(0, "#050505");
      hubGrad.addColorStop(0.9, "#666666");
      hubGrad.addColorStop(1, "#333333");
      
      ctx.beginPath();
      ctx.arc(0, 0, hubR, 0, Math.PI * 2);
      ctx.fillStyle = hubGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.stroke();

      // Bolts
      for (let i = 0; i < gear.bolts; i++) {
        const bAngle = (i * 2 * Math.PI) / gear.bolts;
        const bx = Math.cos(bAngle) * (hubR * 0.7);
        const by = Math.sin(bAngle) * (hubR * 0.7);
        ctx.beginPath();
        ctx.arc(bx, by, radius * 0.07, 0, Math.PI * 2);
        ctx.fillStyle = "#111111";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx - 2, by - 2, radius * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = "#888888";
        ctx.fill();
      }

      // Cutouts
      ctx.globalCompositeOperation = 'destination-out';
      const spokes = gear.type === 'large' ? 6 : (gear.type === 'medium' ? 5 : 4);
      for (let i = 0; i < spokes; i++) {
        const sAngle = (i * 2 * Math.PI) / spokes;
        ctx.save();
        ctx.rotate(sAngle);
        ctx.beginPath();
        const sR = hubR + 12;
        const eR = innerR - 12;
        ctx.moveTo(sR, -8);
        ctx.lineTo(eR, -16);
        ctx.arc(0, 0, eR, -0.2, 0.2);
        ctx.lineTo(sR, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.globalCompositeOperation = 'source-over';

      ctx.restore();
      ctx.restore();
    };

    const animate = () => {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, width, height);

      // --- Physics Update ---
      g1.rotation += g1.speed;
      // Secondary gears are strictly bound to G1's rotation for visual perfection
      g2.rotation = (angleG2 + Math.PI) - (g1.rotation - angleG2) * (tLarge / tMedium) + (Math.PI / tMedium);
      g3.rotation = (angleG3 + Math.PI) - (g1.rotation - angleG3) * (tLarge / tSmall) + (Math.PI / tSmall);

      // --- Draw Mechanism ---
      gears.forEach(g => draw3DGear(ctx, g));

      // --- Spotlight Typography ---
      if (spotlight.active) {
        spotlight.x += spotlight.vx;
        if (spotlight.x > width + 2500) {
          spotlight.active = false;
          setIsComplete(true);
        }
      }

      letters.forEach(l => {
        const topOffset = Math.tan(spotlight.angle) * (l.y - 0);
        const dist = Math.abs(l.x - (spotlight.x - topOffset));
        if (dist < spotlight.width / 2.5) {
          l.hasBeenLit = true;
        }
      });

      // Typography Outlines
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

      // Typography Reveal
      if (spotlight.active) {
        ctx.save();
        const topOffset = Math.tan(spotlight.angle) * height;
        ctx.beginPath();
        ctx.moveTo(spotlight.x - spotlight.width / 2 - topOffset, 0);
        ctx.lineTo(spotlight.x + spotlight.width / 2 - topOffset, 0);
        ctx.lineTo(spotlight.x + spotlight.width / 2, height);
        ctx.lineTo(spotlight.x - spotlight.width / 2, height);
        ctx.closePath();
        ctx.clip();

        const beamGrad = ctx.createLinearGradient(spotlight.x - spotlight.width/2, 0, spotlight.x + spotlight.width/2, 0);
        beamGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        beamGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
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
          ctx.restore();
        });
        ctx.restore();
      }

      // Final Persistent Text
      letters.forEach(l => {
        if (l.hasBeenLit && l.char !== ' ') {
          const topOffset = Math.tan(spotlight.angle) * (l.y - 0);
          const isLeftOfBeam = !spotlight.active || (l.x < spotlight.x - topOffset - spotlight.width / 4);
          if (isLeftOfBeam) {
            ctx.save();
            ctx.translate(l.x, l.y);
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
      
      g1.x = width / 2;
      g1.y = gearCenterY;
      const dG2 = (rLarge + rMedium) * meshFactor;
      g2.x = g1.x + dG2 * Math.cos(angleG2);
      g2.y = g1.y + dG2 * Math.sin(angleG2);
      const dG3 = (rLarge + rSmall) * meshFactor;
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
    <div className="relative w-full h-full bg-[#030303] flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {isComplete && content && (
          <div className="absolute top-[75%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 text-center z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <p className="text-white/20 font-mono text-[9px] tracking-[0.9em] uppercase mb-12">
              {content.subheadline || "The Pinnacle of High-Performance Digital Craft"}
            </p>
            <div className="flex items-center justify-center gap-12">
              <div className="h-[1px] w-24 bg-white/5" />
              <button 
                className="px-16 py-4 border border-white/5 text-white/70 font-mono text-[11px] tracking-[1.1em] uppercase hover:bg-white/5 hover:text-white transition-all hover:tracking-[1.3em] group"
              >
                {content.ctaText || "Launch"}
              </button>
              <div className="h-[1px] w-24 bg-white/5" />
            </div>
          </div>
        )}
      </div>
      
      {isComplete && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
           <button 
             onClick={() => window.location.reload()} 
             className="text-white/10 font-mono text-[6px] uppercase tracking-[0.6em] px-4 py-2 hover:text-white/40 transition-colors"
           >
             SYSTEM_RESET_CALIBRATION
           </button>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
           <div className="flex flex-col items-center gap-8">
              <div className="w-16 h-[1px] bg-white/10 relative overflow-hidden">
                 <div className="absolute inset-0 bg-white animate-[loading_2s_infinite]" />
              </div>
              <div className="font-mono text-[7px] tracking-[1.8em] text-white/60 uppercase">Locking_Gears</div>
           </div>
        </div>
      )}
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default KineticHero;
