'use client';

import { motion } from 'framer-motion';

export default function BlurText({ 
  text, 
  className = '',
  delay = 150,
  animateBy = 'words'
}) {
  const items = animateBy === 'words' ? text.split(' ') : text.split('');

  return (
    <span className={className}>
      {items.map((item, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{
            duration: 0.6,
            delay: (index * delay) / 1000,
            ease: [0.4, 0, 0.2, 1]
          }}
          viewport={{ once: true }}
          style={{ display: 'inline-block', marginRight: animateBy === 'words' ? '0.3em' : '0' }}
        >
          {item}
        </motion.span>
      ))}
    </span>
  );
}
