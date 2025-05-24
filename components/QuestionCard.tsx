import React from 'react';
import { Question, MultipleChoiceOption } from '../types'; // QuestionType removed as it's always MC

interface QuestionCardProps {
  question: Question;
  onAnswerSubmit: (answerId: string) => void;
  disabled: boolean;
  // userInput and setUserInput removed
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswerSubmit, disabled }) => {
  
  // handleSubmit for text input removed

  return (
    // Background and text updated
    <div className="bg-slate-50 p-6 rounded-lg shadow-xl border border-slate-200">
      <p className="text-lg md:text-xl font-medium mb-6 text-slate-700 leading-relaxed">{question.questionText}</p>
      
      <div className="space-y-3">
        {question.options.map((option: MultipleChoiceOption) => (
          <button
            key={option.id}
            onClick={() => onAnswerSubmit(option.id)}
            disabled={disabled}
            // Button style updated for light theme
            className="w-full text-left bg-slate-200 hover:bg-purple-500 hover:text-white text-slate-700 font-medium py-3 px-5 rounded-md transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label={`Answer: ${option.text}`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};