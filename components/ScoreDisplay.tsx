import React from 'react';
import { GermanLevel } from '../types';

interface ScoreDisplayProps {
  score: number;
  totalQuestions: number;
  level: GermanLevel;
  onPlayAgain: () => void;
  onChangeLevel: () => void;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, totalQuestions, level, onPlayAgain, onChangeLevel }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  
  let feedbackMessage = "";
  if (percentage === 100) feedbackMessage = "Perfekt! Du bist ein Deutsch-Profi!";
  else if (percentage >= 80) feedbackMessage = "Sehr gut! Fast alles richtig!";
  else if (percentage >= 60) feedbackMessage = "Gut gemacht! Weiter so!";
  else if (percentage >= 40) feedbackMessage = "Übung macht den Meister. Nicht aufgeben!";
  else feedbackMessage = "Das war schwierig, oder? Versuche es nochmal!";

  return (
    // Background updated, text colors adjusted
    <div className="text-center p-6 bg-slate-50 rounded-lg shadow-xl border border-slate-200">
      <h2 className="text-3xl font-bold mb-2 text-purple-600">Quiz Beendet!</h2>
      <p className="text-lg mb-4 text-slate-600">Level: {level}</p>
      <p className="text-5xl font-extrabold my-6 text-slate-800">
        {score} / {totalQuestions}
      </p>
      <p className="text-2xl font-semibold mb-6 text-yellow-500">{percentage}% Richtig</p>
      <p className="text-md mb-8 text-slate-700">{feedbackMessage}</p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onPlayAgain}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Nochmal Spielen ({level})
        </button>
        <button
          onClick={onChangeLevel}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Anderes Level Wählen
        </button>
      </div>
    </div>
  );
};