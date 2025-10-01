'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Balatro({
  isRotate = false,
  mouseInteraction = true,
  pixelFilter = 700
}) {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!mouseInteraction) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setPosition({ x: x * 0.1, y: y * 0.1 });
    setRotation({
      x: (y / rect.height) * 20,
      y: -(x / rect.width) * 20,
      z: isRotate ? (x / rect.width) * 10 : 0
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setRotation({ x: 0, y: 0, z: 0 });
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y,
          rotateZ: rotation.z,
          x: position.x,
          y: position.y
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-96 h-96 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          filter: `url(#pixelate-${pixelFilter})`
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          {/* Card content */}
        </div>
      </motion.div>

      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id={`pixelate-${pixelFilter}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
