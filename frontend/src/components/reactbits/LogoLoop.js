'use client';

import { motion } from 'framer-motion';

export default function LogoLoop({ 
  logos = [],
  speed = 120,
  direction = 'left',
  logoHeight = 48,
  gap = 40,
  pauseOnHover = true,
  fadeOut = true,
  ariaLabel = 'Technology partners'
}) {
  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ height: `${logoHeight}px` }}
      aria-label={ariaLabel}
    >
      <motion.div
        className="flex items-center absolute"
        animate={{
          x: direction === 'left' ? [0, -1000] : [-1000, 0]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
        style={{ gap: `${gap}px` }}
      >
        {[...logos, ...logos, ...logos].map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{ height: `${logoHeight}px` }}
          >
            {typeof logo === 'string' ? (
              <img 
                src={logo} 
                alt="" 
                className="h-full w-auto object-contain"
              />
            ) : (
              logo
            )}
          </div>
        ))}
      </motion.div>
      
      {fadeOut && (
        <>
          <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-black to-transparent z-10" />
        </>
      )}
    </div>
  );
}
