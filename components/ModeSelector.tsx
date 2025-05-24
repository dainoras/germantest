import React from 'react';
import { GameMode } from '../types'; 

interface ModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="text-center">
      <img
        src="https://www.glorialingua.lt/wp-content/uploads/2018/07/cropped-gloria-lingua-logo.png"
        alt="Gloria Lingua Logo"
        className="h-16 md:h-20 mx-auto mb-6" // Gloria Lingua logo text should be visible on white background
      />
      <a 
        href="https://www.glorialingua.lt/vokieciu-kalbos-kursai-kaune/" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Visit Gloria Lingua German Courses page"
        className="inline-block"
      >
        <img
          src="https://www.glorialingua.lt/wp-content/uploads/2024/09/Vokieciu-pamokos21-570x350.png"
          alt="German Language Teacher - Viel Spaß beim Lernen!"
          className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover mx-auto mb-8 shadow-xl border-4 border-purple-500/70 hover:opacity-90 transition-opacity duration-150"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; 
            target.src = 'https://via.placeholder.com/192/9333ea/ffffff?text=Lehrerin'; 
            target.alt = 'Placeholder image for German Language Teacher';
          }}
        />
      </a>
      {/* Text colors updated for light theme */}
      <h2 className="text-3xl font-semibold mb-6 text-slate-800">Willkommen bei Deutsch lernen mit Jurgita!</h2>
      <p className="text-slate-600 mb-10 text-lg">
        Wie möchtest du starten?
      </p>
      <div className="space-y-6">
        <button
          onClick={() => onSelectMode(GameMode.PLACEMENT_TEST)}
          className="w-full max-w-md mx-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
          aria-label="Start Placement Test (Einstufungstest machen)"
        >
          <span className="block text-xl font-semibold">📝 Einstufungstest machen</span>
          <span className="block text-sm font-normal text-purple-100 mt-1"> {/* Lightened for better contrast on purple */}
            Finde dein aktuelles Deutschlevel heraus!
          </span>
          <span className="block text-xs font-normal text-purple-200 mt-2 italic"> {/* Lightened */}
            (Take a placement test to determine your German language level.)
          </span>
        </button>
        <button
          onClick={() => onSelectMode(GameMode.PRACTICE_MODE)}
          className="w-full max-w-md mx-auto bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 px-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-opacity-75"
          aria-label="Choose level and practice (Üben - Level wählen)"
        >
          <span className="block text-xl font-semibold">🏋️ Üben (Level wählen)</span>
          <span className="block text-sm font-normal text-teal-50 mt-1"> {/* Lightened for better contrast on teal */}
            Wähle ein Level und verbessere deine Fähigkeiten.
          </span>
          <span className="block text-xs font-normal text-teal-100 mt-2 italic"> {/* Lightened */}
            (Choose a specific level to practice and learn.)
          </span>
        </button>
      </div>
       <p className="mt-12 text-slate-500 text-sm"> {/* Darker text */}
        Entwickelt, um Deutschlernen interaktiv und effektiv zu gestalten. Viel Spaß!
      </p>
    </div>
  );
};