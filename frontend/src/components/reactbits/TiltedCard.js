'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function TiltedCard({
  children,
  imageSrc,
  altText = 'Card image',
  captionText,
  containerHeight = '300px',
  containerWidth = '300px',
  imageHeight = '300px',
  imageWidth = '300px',
  rotateAmplitude = 12,
  scaleOnHover = 1.2,
  showMobileWarning = false,
  showTooltip = true,
  displayOverlayContent = true,
  overlayContent
}) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * rotateAmplitude;
    const rotateY = ((centerX - x) / centerX) * rotateAmplitude;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        height: containerHeight,
        width: containerWidth,
        perspective: 1000
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y
      }}
      whileHover={{ scale: scaleOnHover }}
      transition={{ duration: 0.3 }}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={altText}
          className="w-full h-full object-cover"
          style={{ height: imageHeight, width: imageWidth }}
        />
      )}
      
      {children}
      
      {captionText && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-white text-sm">{captionText}</p>
        </div>
      )}
      
      {displayOverlayContent && overlayContent && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
        >
          {overlayContent}
        </motion.div>
      )}
    </motion.div>
  );
}
