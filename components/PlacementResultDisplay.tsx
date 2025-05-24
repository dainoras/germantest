
import React from 'react';
import { GermanLevel } from '../types';

interface PlacementResultDisplayProps {
  determinedLevel: GermanLevel; // Assuming A1 is default if nothing higher
  onPracticeDeterminedLevel: (level: GermanLevel) => void;
  onPracticeChooseLevel: () => void;
  onRetakeTest: () => void;
}

export const PlacementResultDisplay: React.FC<PlacementResultDisplayProps> = ({
  determinedLevel,
  onPracticeDeterminedLevel,
  onPracticeChooseLevel,
  onRetakeTest,
}) => {
  return (
    <div className="text-center p-6 bg-slate-50 rounded-lg shadow-xl border border-slate-200">
      <h2 className="text-3xl font-bold mb-4 text-purple-600">Einstufungstest Ergebnis</h2>
      <p className="text-xl mb-2 text-slate-700">
        Dein geschätztes Deutsch-Niveau ist:
      </p>
      <p className="text-4xl font-extrabold my-4 text-slate-800">
        {determinedLevel}
      </p>
      
      <a 
        href="https://www.glorialingua.lt/vokieciu-kalbos-kursai-kaune/" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Contact Jurgita for German lessons at Gloria Lingua"
        className="inline-block my-8 p-4 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-150 group"
      >
        <p className="text-md font-semibold text-blue-700 mb-1 group-hover:text-blue-800 group-hover:underline">
          Contact me to learn German.
        </p>
        <p className="text-md font-semibold text-blue-700 group-hover:text-blue-800 group-hover:underline">
          Susisiek su manimi, jei nori išmokti vokiečių kalbą.
        </p>
      </a>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        {determinedLevel && (
          <button
            onClick={() => onPracticeDeterminedLevel(determinedLevel)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Üben ({determinedLevel})
          </button>
        )}
        <button
          onClick={onPracticeChooseLevel}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Anderes Level Üben
        </button>
        <button
          onClick={onRetakeTest}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Test Wiederholen
        </button>
      </div>
    </div>
  );
};
