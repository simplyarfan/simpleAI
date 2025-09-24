import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AnimatedBackground({ children, variant = 'gradient' }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (variant === 'gradient') {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`,
          }}
          animate={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 25 }}
        />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  if (variant === 'mesh') {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-white dark:bg-gray-900" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-20 dark:opacity-10" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  if (variant === 'particles') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-900">
        <ParticleField />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {children}
    </div>
  );
}

function ParticleField() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-blue-400 rounded-full opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
