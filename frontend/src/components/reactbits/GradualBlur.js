'use client';

import { motion } from 'framer-motion';

export default function GradualBlur({
  children,
  target = 'parent',
  position = 'bottom',
  height = '6rem',
  strength = 2,
  divCount = 5,
  curve = 'bezier',
  exponential = true,
  opacity = 1
}) {
  return (
    <div className="relative overflow-hidden">
      {children}
      
      <div
        className="absolute pointer-events-none"
        style={{
          [position]: 0,
          left: 0,
          right: 0,
          height: height
        }}
      >
        {Array.from({ length: divCount }).map((_, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              inset: 0,
              backdropFilter: `blur(${(strength * (index + 1)) / divCount}px)`,
              WebkitBackdropFilter: `blur(${(strength * (index + 1)) / divCount}px)`,
              opacity: opacity * ((index + 1) / divCount)
            }}
          />
        ))}
      </div>
    </div>
  );
}
