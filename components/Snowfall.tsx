
import React from 'react';

const Snowfall: React.FC = () => {
  // Generate random snowflakes
  const snowflakes = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 3 + 5}s`,
    animationDelay: `${Math.random() * 5}s`,
    opacity: Math.random() * 0.5 + 0.3,
    size: Math.random() * 4 + 3,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
        `}
      </style>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute bg-slate-200/60 rounded-full shadow-sm"
          style={{
            left: flake.left,
            top: -10,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animation: `fall ${flake.animationDuration} linear ${flake.animationDelay} infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default Snowfall;
