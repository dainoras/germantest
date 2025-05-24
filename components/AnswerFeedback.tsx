import React from 'react';
import { QuestionType, MultipleChoiceOption } from '../types';
import { CheckCircleIcon, XCircleIcon } from './Icons';


interface AnswerFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string; // ID of the correct option
  explanation?: string;
  questionType: QuestionType; // Will be MULTIPLE_CHOICE
  options: MultipleChoiceOption[]; 
  selectedAnswer: string | null; // ID of the selected option
  onNext: () => void;
}

export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({ 
  isCorrect, 
  correctAnswer, 
  explanation, 
  options, 
  selectedAnswer, 
  onNext 
}) => {
  
  let displayCorrectAnswerText = "Correct answer not found.";
  const correctOption = options.find(opt => opt.id === correctAnswer);
  if (correctOption) {
    displayCorrectAnswerText = correctOption.text;
  }

  let selectedOptionText = "";
  if (selectedAnswer) {
    const chosenOption = options.find(opt => opt.id === selectedAnswer);
    if (chosenOption) {
      selectedOptionText = chosenOption.text;
    }
  }

  return (
    // Background based on correctness, text white is fine
    <div className={`p-6 rounded-lg shadow-xl text-center ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
      <div className="flex justify-center items-center mb-4">
        {isCorrect ? (
          <CheckCircleIcon className="w-16 h-16 text-white" />
        ) : (
          <XCircleIcon className="w-16 h-16 text-white" />
        )}
      </div>
      <h3 className="text-3xl font-bold mb-3 text-white">
        {isCorrect ? 'Richtig!' : 'Leider Falsch!'}
      </h3>
      
      {!isCorrect && (
        <>
          {selectedOptionText && (
            // Lighter text for contrast on red background
            <p className="text-lg mb-2 text-red-100"> 
              Du hast gewählt: <strong className="font-semibold">"{selectedOptionText}"</strong>
            </p>
          )}
          <p className="text-lg mb-3 text-red-100"> {/* Lighter text */}
            Die richtige Antwort ist: <strong className="font-semibold">{displayCorrectAnswerText}</strong>
          </p>
        </>
      )}
      
      {explanation && (
        // Lighter text for contrast on green/red background
        <div className="mt-4 pt-4 border-t border-white/30">
          <h4 className="text-lg font-semibold mb-1 text-white">{isCorrect ? "Gut zu wissen:" : "Erklärung:"}</h4>
          <p className="text-sm italic text-slate-100">{explanation}</p> 
        </div>
      )}

      {!explanation && !isCorrect && (
         <p className="text-sm italic mt-2 mb-4 text-red-100"> {/* Lighter text */}
            Versuche, dir die richtige Antwort für das nächste Mal zu merken!
         </p>
      )}

      <button
        onClick={onNext}
        // Button style updated for light theme context (was bg-white text-slate-800)
        className="mt-6 bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75"
      >
        Nächste Frage
      </button>
    </div>
  );
};