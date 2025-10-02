'use client';

export default function Aurora({
  colorStops = ['#3A29FF', '#FF94BA', '#FF3232'],
  blend = 0.5,
  amplitude = 1.0,
  speed = 0.5
}) {
  const reversedStops = [...colorStops].reverse();
  
  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <div className="absolute inset-0">
        <svg className="w-full h-full" style={{ filter: 'blur(80px)' }}>
          <defs>
            <linearGradient id="aurora-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              {colorStops.map((color, i) => (
                <stop key={i} offset={`${(i / (colorStops.length - 1)) * 100}%`} stopColor={color} stopOpacity={blend} />
              ))}
            </linearGradient>
            <linearGradient id="aurora-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
              {reversedStops.map((color, i) => (
                <stop key={i} offset={`${(i / (colorStops.length - 1)) * 100}%`} stopColor={color} stopOpacity={blend} />
              ))}
            </linearGradient>
            <linearGradient id="aurora-gradient-3" x1="50%" y1="0%" x2="50%" y2="100%">
              {colorStops.map((color, i) => (
                <stop key={i} offset={`${(i / (colorStops.length - 1)) * 100}%`} stopColor={color} stopOpacity={blend * 0.7} />
              ))}
            </linearGradient>
          </defs>
          
          {/* First ellipse */}
          <ellipse
            cx="30%"
            cy="50%"
            rx="45%"
            ry="35%"
            fill="url(#aurora-gradient-1)"
            opacity={0.7}
          >
            <animate
              attributeName="cx"
              values="30%;70%;30%"
              dur={`${25 / speed}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
            <animate
              attributeName="cy"
              values="50%;30%;50%"
              dur={`${20 / speed}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </ellipse>

          {/* Second ellipse */}
          <ellipse
            cx="70%"
            cy="50%"
            rx="40%"
            ry="30%"
            fill="url(#aurora-gradient-2)"
            opacity={0.6}
          >
            <animate
              attributeName="cx"
              values="70%;30%;70%"
              dur={`${22 / speed}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
            <animate
              attributeName="cy"
              values="50%;70%;50%"
              dur={`${18 / speed}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </ellipse>

          {/* Third ellipse for more depth */}
          <ellipse
            cx="50%"
            cy="60%"
            rx="35%"
            ry="25%"
            fill="url(#aurora-gradient-3)"
            opacity={0.5}
          >
            <animate
              attributeName="cx"
              values="50%;40%;60%;50%"
              dur={`${28 / speed}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
            />
            <animate
              attributeName="cy"
              values="60%;40%;60%;60%"
              dur={`${24 / speed}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </ellipse>
        </svg>
      </div>
    </div>
  );
}
