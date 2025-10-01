'use client';

import { useEffect, useRef } from 'react';

export default function Threads({
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = true
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const threads = [];
    const numThreads = 20;

    for (let i = 0; i < numThreads; i++) {
      threads.push({
        points: [],
        offset: Math.random() * Math.PI * 2
      });

      for (let j = 0; j < 50; j++) {
        threads[i].points.push({
          x: (canvas.width / 50) * j,
          y: canvas.height / 2
        });
      }
    }

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    if (enableMouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      threads.forEach((thread, i) => {
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 + i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.beginPath();

        thread.points.forEach((point, j) => {
          const baseY = canvas.height / 2;
          const wave = Math.sin(j * 0.1 + thread.offset + Date.now() * 0.001) * 50 * amplitude;
          
          let targetY = baseY + wave;
          
          if (enableMouseInteraction) {
            const dx = point.x - mouseX;
            const dy = baseY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 200) {
              targetY += ((200 - dist) / 200) * 100;
            }
          }

          point.y += (targetY - point.y) * 0.1;

          if (j === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });

        ctx.stroke();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [amplitude, distance, enableMouseInteraction]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
