'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ScrollStack({ children }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const items = Array.isArray(children) ? children : [children];

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrolled / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen py-20">
      {items.map((item, index) => {
        const itemProgress = Math.max(0, Math.min(1, (scrollProgress - index * 0.2) * 5));
        const scale = 0.8 + itemProgress * 0.2;
        const translateY = (1 - itemProgress) * 100;

        return (
          <motion.div
            key={index}
            className="sticky top-20 mb-8"
            style={{
              scale,
              translateY: `${translateY}px`,
              zIndex: items.length - index
            }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              {item}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function ScrollStackItem({ children }) {
  return <div>{children}</div>;
}
