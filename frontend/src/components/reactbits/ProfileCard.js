'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ProfileCard({
  name = 'John Doe',
  title = 'Software Engineer',
  avatarUrl = '',
  status = 'Online',
  contactText = 'Contact Me',
  handle = '@username',
  showUserInfo = true,
  enableTilt = true,
  enableMobileTilt = false,
  showTooltip = true,
  displayOverlayContent = true,
  overlayContent = null
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={enableTilt ? { rotateY: 5, rotateX: 5 } : {}}
      transition={{ duration: 0.3 }}
      style={{ perspective: 1000 }}
    >
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-1">
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 relative z-10">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={name}
                  className="w-32 h-32 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-4xl font-bold text-white">
                  {name.charAt(0)}
                </div>
              )}
            </motion.div>
          </div>

          {/* Info */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
            <p className="text-gray-400 mb-2">{title}</p>
            {showUserInfo && (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-blue-400 text-sm">{handle}</span>
                <span className="flex items-center text-green-400 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  {status}
                </span>
              </div>
            )}
          </div>

          {/* Contact Button */}
          <motion.button
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {contactText}
          </motion.button>

          {/* Overlay Content */}
          {displayOverlayContent && overlayContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-3xl flex items-center justify-center p-6"
            >
              {overlayContent}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
