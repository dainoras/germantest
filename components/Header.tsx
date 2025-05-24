import React from 'react';

interface HeaderProps {
  onGoHome?: () => void;
  showHomeButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, showHomeButton }) => {
  const homeButtonContent = (
    <button 
      onClick={onGoHome} 
      className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-150 ease-in-out text-lg px-4 py-3 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75"
      aria-label="Go to homepage"
    >
      <span role="img" aria-label="Home icon" className="mr-2">🏠</span> Home
    </button>
  );

  const spacer = (
    <div className="text-lg px-4 py-3 invisible" aria-hidden="true">
      <span role="img" aria-label="Home icon" className="mr-2">🏠</span> Home
    </div>
  );

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg py-4 sticky top-0 z-50"> {/* Light background */}
      <div className="container mx-auto px-4 flex items-center justify-between min-h-[72px]">
        
        <div className="flex-none flex justify-start">
          {showHomeButton && onGoHome ? homeButtonContent : spacer}
        </div>

        <div className="flex-grow flex justify-center">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-600 to-red-600">
              Deutsch lernen mit Jurgita
            </h1>
            {/* Subtitle color changed for light theme */}
            <p className="text-slate-600 text-sm">Master German with Interactive Quizzes</p> 
          </div>
        </div>

        <div className="flex-none flex justify-end">
          {spacer} 
        </div>

      </div>
    </header>
  );
};