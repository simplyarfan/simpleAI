'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StaggeredMenu({ isOpen, onClose, menuItems = [] }) {
  const containerVariants = {
    closed: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    closed: { y: 50, opacity: 0 },
    open: { y: 0, opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            variants={containerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="space-y-8"
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <a
                  href={item.href}
                  className="text-4xl md:text-6xl font-bold text-white hover:text-orange-500 transition-colors duration-300 block"
                >
                  {item.label}
                  <span className="text-blue-500 ml-2">0{index + 1}</span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
