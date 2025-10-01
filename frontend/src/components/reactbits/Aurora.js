'use client';

export default function Aurora({
  colorStops = ['#3A29FF', '#FF94BA', '#FF3232'],
  blend = 0.5,
  amplitude = 1.0,
  speed = 0.5
}) {
  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <div className="absolute inset-0">
        <svg className="w-full h-full" style={{ filter: 'blur(60px)' }}>
          <defs>
            <linearGradient id="aurora-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              {colorStops.map((color, i) => (
                <stop key={i} offset={`${(i / (colorStops.length - 1)) * 100}%`} stopColor={color} stopOpacity={blend} />
              ))}
            </linearGradient>
            <linearGradient id="aurora-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
              {colorStops.reverse().map((color, i) => (
                <stop key={i} offset={`${(i / (colorStops.length - 1)) * 100}%`} stopColor={color} stopOpacity={blend} />
              ))}
            </linearGradient>
          </defs>
          
          <ellipse
            cx="30%"
            cy="50%"
            rx="40%"
            ry="30%"
            fill="url(#aurora-gradient-1)"
            opacity={0.8}
          >
            <animate
              attributeName="cx"
              values="30%;70%;30%"
              dur={`${20 / speed}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="50%;30%;50%"
              dur={`${15 / speed}s`}
              repeatCount="indefinite"
            />
          </ellipse>

          <ellipse
            cx="70%"
            cy="50%"
            rx="35%"
            ry="25%"
            fill="url(#aurora-gradient-2)"
            opacity={0.6}
          >
            <animate
              attributeName="cx"
              values="70%;30%;70%"
              dur={`${18 / speed}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="50%;70%;50%"
              dur={`${16 / speed}s`}
              repeatCount="indefinite"
            />
          </ellipse>
        </svg>
      </div>
    </div>
  );
}
