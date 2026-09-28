import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  tip: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, tip }) => {
  return (
    <span className="group relative inline-block">
      <span className="underline decoration-dotted decoration-gray-400 cursor-help">
        {children}
      </span>
      <div className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 transform rounded-lg bg-gray-800 p-3 text-sm text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 pointer-events-none">
        <p className="text-left">{tip}</p>
        <div className="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform bg-gray-800"></div>
      </div>
    </span>
  );
};

export default Tooltip;