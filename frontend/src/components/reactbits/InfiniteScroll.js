'use client';

import { useState, useEffect } from 'react';

export default function InfiniteScroll({
  items: initialItems = [],
  isFilted = true,
  tiltDirection = 'left',
  autoplay = true,
  autoplaySpeed = 0.1,
  pauseOnHover = true
}) {
  const [items, setItems] = useState(initialItems);
  
  return (
    <div className="relative w-full overflow-hidden py-8">
      <div 
        className="flex space-x-4 animate-scroll"
        style={{
          animation: autoplay ? `scroll ${30 / autoplaySpeed}s linear infinite` : 'none',
          animationPlayState: pauseOnHover ? 'running' : 'paused'
        }}
      >
        {[...items, ...items, ...items].map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-64 h-96 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            {typeof item === 'string' ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-white text-center">{item}</p>
              </div>
            ) : (
              item
            )}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
