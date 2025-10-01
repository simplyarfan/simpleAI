/**
 * REACT BITS - DOT GRID BACKGROUND (ENHANCED)
 * Super reactive dot grid that glows and scales near cursor
 * Like the one on reactbits.dev
 */

'use client';

import { useEffect, useRef } from 'react';

export default function DotGrid({
  dotSize = 1.5,
  dotColor = '#ff6b35',
  backgroundColor = 'transparent',
  spacing = 40,
  glowRadius = 200,
  maxGlowSize = 8,
  className = ''
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    
    const resizeCanvas = () => {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let mouseX = -1000;
    let mouseY = -1000;
    let rafId;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          // Calculate distance from mouse
          const dx = x - mouseX;
          const dy = y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Super reactive glow effect
          if (distance < glowRadius) {
            const intensity = 1 - (distance / glowRadius);
            const glowSize = dotSize + (intensity * maxGlowSize);
            
            // Outer glow
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize * 3);
            gradient.addColorStop(0, `${dotColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(0.5, `${dotColor}${Math.floor(intensity * 100).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, glowSize * 3, 0, Math.PI * 2);
            ctx.fill();

            // Inner bright dot
            ctx.fillStyle = dotColor;
            ctx.beginPath();
            ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Normal dot (dimmed)
            ctx.fillStyle = `${dotColor}40`; // 25% opacity
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [dotSize, dotColor, backgroundColor, spacing, glowRadius, maxGlowSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
