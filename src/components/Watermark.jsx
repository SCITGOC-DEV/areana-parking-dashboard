import React from 'react';

export const Watermark = ({ header="DEV",text = "Development"}) => {
  return (
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-50 whitespace-nowrap"
      style={{
        transform: 'translate(-50%, -50%) rotate(-45deg)',
      }}
    >
      <div className="flex flex-col items-center gap-1">
        {/* Header - Biggest */}
        <span className="text-[120px] sm:text-[160px] md:text-[200px] lg:text-[240px] xl:text-[280px] font-black text-indigo-400 dark:text-indigo-600 opacity-40 tracking-wider">
          {header}
        </span>
        
        {/* Main Text - Medium */}
        <span className="text-[60px] sm:text-[80px] md:text-[100px] lg:text-[120px] xl:text-[140px] font-black text-indigo-400 dark:text-indigo-600 opacity-40 tracking-wider">
          {text}
        </span>
      </div>
    </div>
  );
};
