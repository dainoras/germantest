import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    // Background updated for light theme
    <div className="w-full bg-slate-200 rounded-full h-3 mb-6 shadow-inner"> 
      <div
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};