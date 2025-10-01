/**
 * DOT GRID BACKGROUND
 * Animated dot grid background inspired by React Bits
 * Creates an interactive grid of dots that responds to mouse movement
 */

import React, { useEffect, useRef, useState } from 'react';

const DotGrid = ({
  dotSize = 1,
  dotColor = 'rgba(255, 255, 255, 0.3)',
  backgroundColor = 'transparent',
  spacing = 30,
  mouseLightRadius = 150,
  mouseLightColor = 'rgba(249, 115, 22, 0.4)', // Orange theme
  className = ''
}) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const mousePos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        setDimensions({
          width: parent.offsetWidth,
          height: parent.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;

    canvas.width = width;
    canvas.height = height;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      // Draw dots
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          // Calculate distance from mouse
          const dx = x - mousePos.current.x;
          const dy = y - mousePos.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Apply mouse light effect
          if (distance < mouseLightRadius) {
            const intensity = 1 - (distance / mouseLightRadius);
            const glowSize = dotSize + (intensity * 3);
            
            // Glow effect
            ctx.fillStyle = mouseLightColor;
            ctx.beginPath();
            ctx.arc(x, y, glowSize * 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw regular dot
          ctx.fillStyle = dotColor;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mousePos.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [dimensions, dotSize, dotColor, backgroundColor, spacing, mouseLightRadius, mouseLightColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default DotGrid;
