import React from 'react';
import { GermanLevel } from '../types';

interface LevelSelectorProps {
  levels: GermanLevel[];
  onSelectLevel: (level: GermanLevel) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({ levels, onSelectLevel }) => {
  return (
    <div className="text-center">
      <img
        src="https://www.glorialingua.lt/wp-content/uploads/2018/07/cropped-gloria-lingua-logo.png"
        alt="Gloria Lingua Logo"
        className="h-16 md:h-20 mx-auto mb-6"
      />
      <img
        src="https://www.glorialingua.lt/wp-content/uploads/2024/09/Vokieciu-pamokos21-570x350.png"
        alt="German Language Teacher - Viel Spaß beim Lernen!"
        className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover mx-auto mb-8 shadow-xl border-4 border-purple-500/70"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null; // prevent infinite loop if placeholder also fails
          target.src = 'https://via.placeholder.com/192/9333ea/ffffff?text=Lehrerin'; // Fallback placeholder
          target.alt = 'Placeholder image for German Language Teacher';
        }}
      />
      {/* Text colors updated for light theme */}
      <h2 className="text-3xl font-semibold mb-8 text-slate-800">Wähle dein Niveau</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => onSelectLevel(level)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
            aria-label={`Select level ${level}`}
          >
            {level}
          </button>
        ))}
      </div>
      <p className="mt-10 text-slate-600 text-sm"> {/* Darker text */}
        Willkommen! Wählen Sie ein Niveau, um Ihr Deutsch-Quiz zu starten.
      </p>
    </div>
  );
};