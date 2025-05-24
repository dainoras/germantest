import React, { useState, useEffect } from 'react';
// Corrected: Added UserPlacementAnswer import
import { Question, GermanLevel, MultipleChoiceOption, UserPlacementAnswer } from '../types';
import { QuestionCard } from './QuestionCard';
import { AnswerFeedback } from './AnswerFeedback';
import { ProgressBar } from './ProgressBar';

interface QuizAreaProps {
  questions: Question[];
  // Corrected: currentLevel can be null for placement tests
  currentLevel: GermanLevel | null;
  // Corrected: Added isPlacementTest prop
  isPlacementTest: boolean;
  // Corrected: Made onQuizComplete optional as it's for practice mode only
  onQuizComplete?: (finalScore: number) => void;
  // Corrected: Added onPlacementTestAnswer prop for placement tests
  onPlacementTestAnswer?: (answer: UserPlacementAnswer) => void;
}

export const QuizArea: React.FC<QuizAreaProps> = ({ 
  questions, 
  onQuizComplete, 
  currentLevel,
  isPlacementTest,
  onPlacementTestAnswer 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Reset state when questions change (e.g. new quiz started)
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswerId(null);
    setIsCorrect(null);
    setShowFeedback(false);
  }, [questions]);

  const handleAnswerSubmit = (answerId: string) => {
    setSelectedAnswerId(answerId);
    const correct = answerId === currentQuestion.correctAnswer;
    
    setIsCorrect(correct);
    if (correct) {
      // Corrected: Only update score if not a placement test
      if (!isPlacementTest) {
        setScore(prevScore => prevScore + 1);
      }
    }
    
    // Corrected: If it's a placement test, call the specific handler
    if (isPlacementTest && onPlacementTestAnswer) {
      const userAnswer: UserPlacementAnswer = {
        questionId: currentQuestion.id,
        selectedOptionId: answerId,
        correctOptionId: currentQuestion.correctAnswer,
        questionLevel: currentQuestion.level, // Question.level is GermanLevel
      };
      onPlacementTestAnswer(userAnswer);
    }

    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswerId(null);
    setIsCorrect(null);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Quiz is complete
      // Corrected: Only call onQuizComplete if it's practice mode and the callback exists
      if (!isPlacementTest && onQuizComplete) {
        onQuizComplete(score);
      }
      // For placement test, App.tsx handles completion after the last onPlacementTestAnswer.
      // QuizArea simply runs out of questions. App.tsx will detect this.
    }
  };
  

  if (!currentQuestion) {
    // This can happen briefly if questions array is empty or index is out of bounds
    // Or if App.tsx is transitioning states after the last question.
    // Return null or a minimal loading/transition state if preferred.
    return <p className="text-center text-slate-600">Loading question or quiz finished...</p>; {/* Darker text */}
  }

  return (
    <div className="w-full">
      <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
      {/* Text color updated */}
      <h2 className="text-xl font-medium mb-4 text-slate-600 text-center">
        {isPlacementTest 
          ? `Placement Test - Frage ${currentQuestionIndex + 1} von ${questions.length}`
          : `Level: ${currentLevel} - Frage ${currentQuestionIndex + 1} von ${questions.length}`}
      </h2>
      
      {!showFeedback ? (
        <QuestionCard
          question={currentQuestion}
          onAnswerSubmit={handleAnswerSubmit}
          disabled={showFeedback}
        />
      ) : (
        <AnswerFeedback
          isCorrect={isCorrect!}
          correctAnswer={currentQuestion.correctAnswer} 
          explanation={currentQuestion.explanation}
          questionType={currentQuestion.type} 
          options={currentQuestion.options} 
          selectedAnswer={selectedAnswerId} 
          onNext={handleNextQuestion}
        />
      )}
       {!isPlacementTest && (
         // Text color updated
         <p className="text-center mt-6 text-2xl font-bold text-slate-700">Aktueller Punktestand: {score}</p>
       )}
    </div>
  );
};