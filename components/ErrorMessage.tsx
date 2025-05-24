import React from 'react';
import { ExclamationTriangleIcon } from './Icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, onGoHome }) => {
  return (
    // Red background with white/light text is generally okay.
    <div className="text-center p-6 bg-red-600 border border-red-700 rounded-lg shadow-xl text-white">
      <div className="flex justify-center mb-4">
        <ExclamationTriangleIcon className="w-12 h-12 text-yellow-300" />
      </div>
      <h3 className="text-2xl font-semibold mb-3">Ein Fehler ist aufgetreten</h3>
      <p className="mb-6 text-red-100">{message}</p> {/* Lighter red text for main message */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150"
          >
            Erneut versuchen
          </button>
        )}
        {onGoHome && (
           <button
            onClick={onGoHome}
            className="bg-red-400 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150" // Adjusted for better visibility
          >
            Zurück zur Startseite
          </button>
        )}
      </div>
    </div>
  );
};