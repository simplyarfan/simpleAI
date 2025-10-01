'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplitText({ 
  text, 
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out'
}) {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    setCharacters(text.split(''));
  }, [text]);

  return (
    <span className={className}>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: duration,
            delay: (index * delay) / 1000,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
