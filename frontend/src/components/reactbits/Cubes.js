'use client';

import { useEffect, useRef } from 'react';

export default function Cubes({
  gridSize = 8,
  maxAngle = 60,
  radius = 4,
  borderStyle = '2px dashed #5227FF',
  faceColor = '#1a1a2e',
  rippleColor = '#ff6b6b',
  rippleSpeed = 1.5,
  autoAnimate = true,
  rippleOnClick = true
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cubes = [];
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cube = document.createElement('div');
        cube.className = 'cube';
        cube.style.position = 'absolute';
        cube.style.width = '40px';
        cube.style.height = '40px';
        cube.style.border = borderStyle;
        cube.style.left = `${i * 50}px`;
        cube.style.top = `${j * 50}px`;
        cube.style.transformStyle = 'preserve-3d';
        cube.style.transition = 'transform 0.3s';
        
        cubes.push({ element: cube, x: i, y: j });
        container.appendChild(cube);
      }
    }

    let time = 0;
    
    const animate = () => {
      time += 0.01;
      
      cubes.forEach(({ element, x, y }) => {
        const distance = Math.sqrt(
          Math.pow(x - gridSize / 2, 2) + Math.pow(y - gridSize / 2, 2)
        );
        const angle = Math.sin(time + distance * 0.5) * maxAngle;
        
        element.style.transform = `rotateX(${angle}deg) rotateY(${angle}deg)`;
      });
      
      if (autoAnimate) {
        requestAnimationFrame(animate);
      }
    };

    if (autoAnimate) {
      animate();
    }

    return () => {
      cubes.forEach(({ element }) => container.removeChild(element));
    };
  }, [gridSize, maxAngle, radius, borderStyle, faceColor, rippleColor, rippleSpeed, autoAnimate, rippleOnClick]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        width: `${gridSize * 50}px`,
        height: `${gridSize * 50}px`,
        perspective: '600px'
      }}
    />
  );
}
