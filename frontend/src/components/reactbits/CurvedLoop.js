'use client';

import { motion } from 'framer-motion';

export default function CurvedLoop({
  marqueeText = 'Welcome to React Bits',
  speed = 3
}) {
  return (
    <div className="relative w-full overflow-hidden h-24">
      <svg viewBox="0 0 1000 100" className="w-full h-full">
        <defs>
          <path
            id="curve"
            d="M 0,50 Q 250,20 500,50 T 1000,50"
            fill="transparent"
          />
        </defs>
        
        <text fontSize="24" fill="white">
          <textPath href="#curve" startOffset="0%">
            <animate
              attributeName="startOffset"
              from="0%"
              to="100%"
              dur={`${speed}s`}
              repeatCount="indefinite"
            />
            {marqueeText} • {marqueeText} • {marqueeText}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
