
import React, { useState, useCallback, useEffect } from 'react';
import { GermanLevel, Question, GameState, GameMode, UserPlacementAnswer } from './types';
import { AVAILABLE_LEVELS, NUM_QUESTIONS_PER_QUIZ, PLACEMENT_TEST_LEVELS, NUM_QUESTIONS_PER_LEVEL_IN_PLACEMENT_TEST, PLACEMENT_TEST_PROFICIENCY_THRESHOLD } from './constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LevelSelector } from './components/LevelSelector';
import { QuizArea } from './components/QuizArea';
import { ScoreDisplay } from './components/ScoreDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { ModeSelector } from './components/ModeSelector';
import { PlacementResultDisplay } from './components/PlacementResultDisplay'; // New
import { fetchGermanQuestions, fetchPlacementTestQuestions } from './services/geminiService';

// Helper function to shuffle an array (currently unused but kept for potential future use)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}


const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.CHOOSING_MODE);
  const [currentLevel, setCurrentLevel] = useState<GermanLevel | null>(null); // For practice mode
  const [questions, setQuestions] = useState<Question[]>([]); // For practice mode quiz
  const [placementTestQuestions, setPlacementTestQuestions] = useState<Question[]>([]); // For placement test
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0); // For practice mode score
  const [userPlacementAnswers, setUserPlacementAnswers] = useState<UserPlacementAnswer[]>([]);
  const [determinedPlacementLevel, setDeterminedPlacementLevel] = useState<GermanLevel>(GermanLevel.A1); // Default to A1

  const [gameState, setGameState] = useState<GameState>(GameState.INITIAL);
  const [isLoading, setIsLoading] = useState<boolean>(false); // General loading state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
      const keyMissingError = "API Key is missing from the application's environment. Please ensure it's configured correctly. The application may not function as expected.";
      console.warn(keyMissingError);
      if (!error) {
         setError(keyMissingError + " Please contact the site administrator if this issue persists in a deployed environment.");
      }
    }
  }, [error]);

  const handleSelectMode = (mode: GameMode) => {
    setError(null); 
    setGameMode(mode);
    if (mode === GameMode.PRACTICE_MODE) {
      setGameState(GameState.INITIAL); 
    } else if (mode === GameMode.PLACEMENT_TEST) {
      startPlacementTest();
    }
  };

  const startPlacementTest = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGameState(GameState.LOADING_PLACEMENT_QUESTIONS);
    try {
      const fetchedQuestions = await fetchPlacementTestQuestions();
      if (fetchedQuestions.length === 0) {
        setError("No questions could be generated for the placement test. Please try again later.");
        setGameState(GameState.INITIAL); 
        setGameMode(GameMode.CHOOSING_MODE);
      } else {
        const sortedQuestions = [...fetchedQuestions].sort((a, b) => {
          const indexA = PLACEMENT_TEST_LEVELS.indexOf(a.level);
          const indexB = PLACEMENT_TEST_LEVELS.indexOf(b.level);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1; 
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setPlacementTestQuestions(sortedQuestions);
        setCurrentQuestionIndex(0);
        setUserPlacementAnswers([]);
        setGameState(GameState.PLACEMENT_TEST_ACTIVE);
      }
    } catch (err) {
      console.error("Failed to fetch placement test questions:", err);
      let errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching placement test questions.';
      if (errorMessage.includes("Failed to parse JSON response")) {
        errorMessage += " This often indicates an API key issue (invalid, expired, or quota exceeded) or a problem with the AI service. Please check the browser console for the raw response from Gemini, which may contain more details.";
      }
      setError(errorMessage);
      setGameState(GameState.INITIAL);
      setGameMode(GameMode.CHOOSING_MODE);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const loadPracticeQuestions = useCallback(async (level: GermanLevel) => {
    setIsLoading(true);
    setError(null);
    setCurrentLevel(level); // Set currentLevel when loading questions
    setGameState(GameState.LOADING_QUESTIONS);
    try {
      const fetchedQuestions = await fetchGermanQuestions(level, NUM_QUESTIONS_PER_QUIZ);
      if (fetchedQuestions.length === 0) {
        setError(`No questions could be generated for ${level}. Please try a different level or try again later.`);
        setGameState(GameState.INITIAL); 
        // setCurrentLevel(null); // Don't nullify, keep it for retry or context
      } else {
        setQuestions(fetchedQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setGameState(GameState.QUIZ_ACTIVE);
      }
    } catch (err) {
      console.error("Failed to fetch practice questions:", err);
      let errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching practice questions.';
       if (errorMessage.includes("Failed to parse JSON response")) {
        errorMessage += " This often indicates an API key issue (invalid, expired, or quota exceeded) or a problem with the AI service. Please check the browser console for the raw response from Gemini, which may contain more details.";
      }
      setError(errorMessage);
      setGameState(GameState.INITIAL); 
      // setCurrentLevel(null); // Don't nullify
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLevelSelect = (level: GermanLevel) => { 
    loadPracticeQuestions(level);
  };

  const handlePracticeQuizComplete = (finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.QUIZ_COMPLETE);
  };

  const handlePlayAgainPractice = () => { 
    if (currentLevel) {
      loadPracticeQuestions(currentLevel);
    }
  };

  const goHome = () => {
    setGameMode(GameMode.CHOOSING_MODE);
    setGameState(GameState.INITIAL);
    setCurrentLevel(null);
    setQuestions([]);
    setPlacementTestQuestions([]);
    setUserPlacementAnswers([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setError(null);
    setIsLoading(false);
    setDeterminedPlacementLevel(GermanLevel.A1); // Reset to default
  };

  const calculatePlacementLevel = (answers: UserPlacementAnswer[]): GermanLevel => {
    const correctAnswersByLevel: Record<GermanLevel, number> = {
      [GermanLevel.A1]: 0, [GermanLevel.A2]: 0, [GermanLevel.B1]: 0, [GermanLevel.B2]: 0, [GermanLevel.C1]: 0,
    };
    const questionsPerLevelCount: Record<GermanLevel, number> = {
       [GermanLevel.A1]: 0, [GermanLevel.A2]: 0, [GermanLevel.B1]: 0, [GermanLevel.B2]: 0, [GermanLevel.C1]: 0,
    };

    answers.forEach(answer => {
      questionsPerLevelCount[answer.questionLevel]++;
      if (answer.selectedOptionId === answer.correctOptionId) {
        correctAnswersByLevel[answer.questionLevel]++;
      }
    });

    console.log("Correct answers by level:", correctAnswersByLevel);
    console.log("Questions per level count:", questionsPerLevelCount);
    
    let finalDeterminedLevel = GermanLevel.A1; // Default to A1

    // Iterate from highest to lowest to find the highest achieved level
    for (let i = PLACEMENT_TEST_LEVELS.length - 1; i >= 0; i--) {
      const level = PLACEMENT_TEST_LEVELS[i];
      if (correctAnswersByLevel[level] >= PLACEMENT_TEST_PROFICIENCY_THRESHOLD) {
        finalDeterminedLevel = level;
        break; 
      }
    }
    // If no level met the threshold (e.g. loop finished without break), it defaults to A1.
    // If A1 also didn't meet the threshold, it still becomes A1.
    // We could refine this: if A1 has < threshold, maybe a "beginner advised" instead of "A1"
    // For now, A1 is the lowest possible result from this calculation.

    console.log("Determined placement level:", finalDeterminedLevel);
    return finalDeterminedLevel;
  };
  
  const handlePlacementTestAnswer = (answer: UserPlacementAnswer) => {
    const updatedAnswers = [...userPlacementAnswers, answer];
    setUserPlacementAnswers(updatedAnswers);
    
    if (updatedAnswers.length >= placementTestQuestions.length) {
      setGameState(GameState.CALCULATING_PLACEMENT_RESULT);
      console.log("All placement questions answered. Calculating result. Answers:", updatedAnswers);
      
      // Simulate calculation delay for UX, then set result and new state
      setTimeout(() => {
        const calculatedLevel = calculatePlacementLevel(updatedAnswers);
        setDeterminedPlacementLevel(calculatedLevel);
        setGameState(GameState.SHOWING_PLACEMENT_RESULT);
      }, 1500); // 1.5 second delay
    }
  };

  const handleStartPracticeAtDeterminedLevel = (level: GermanLevel) => {
    setGameMode(GameMode.PRACTICE_MODE);
    // currentLevel will be set by loadPracticeQuestions
    loadPracticeQuestions(level);
  };

  const handleChooseDifferentLevelForPractice = () => {
    setGameMode(GameMode.PRACTICE_MODE);
    setGameState(GameState.INITIAL); // Show level selector
    setCurrentLevel(null);
    setQuestions([]);
  };

  const handleRetakePlacementTest = () => {
    startPlacementTest(); // This will reset necessary states for placement test
  };


  const renderContent = () => {
    if (isLoading || gameState === GameState.LOADING_QUESTIONS || gameState === GameState.LOADING_PLACEMENT_QUESTIONS) {
      const message = gameState === GameState.LOADING_PLACEMENT_QUESTIONS 
        ? "Please wait, AI is generating your placement test questions..." 
        : `Please wait, AI is generating ${currentLevel || 'Deutsch'} questions...`;
      return <LoadingSpinner message={message} />;
    }
    
    if (error) {
      let retryAction = undefined;
      // Fix: Removed `|| gameState === GameState.LOADING_QUESTIONS` from the condition.
      // This part of the condition was redundant due to the preceding `if` block (lines 236-240)
      // which already handles cases where `gameState` is `LOADING_QUESTIONS`.
      // If execution reaches here, `gameState` cannot be `LOADING_QUESTIONS`, causing a type error.
      // The retry action should be available if an error occurred and the state was reset to INITIAL.
      if (gameMode === GameMode.PRACTICE_MODE && currentLevel && gameState === GameState.INITIAL) {
        retryAction = () => loadPracticeQuestions(currentLevel);
      // Fix: Removed `|| gameState === GameState.LOADING_PLACEMENT_QUESTIONS` from the condition.
      // Similar to the above, this condition was redundant and caused a type error.
      // The retry action for placement test should be available if an error occurred and state is INITIAL.
      } else if (gameMode === GameMode.PLACEMENT_TEST && gameState === GameState.INITIAL) {
        retryAction = startPlacementTest;
      }
      return <ErrorMessage message={error} onRetry={retryAction} onGoHome={goHome}/>;
    }

    switch (gameMode) {
      case GameMode.CHOOSING_MODE:
        return <ModeSelector onSelectMode={handleSelectMode} />;
      
      case GameMode.PRACTICE_MODE:
        switch (gameState) {
          case GameState.INITIAL: 
            return <LevelSelector levels={AVAILABLE_LEVELS} onSelectLevel={handleLevelSelect} />;
          case GameState.QUIZ_ACTIVE:
            if (questions.length > 0 && currentLevel) { // Ensure currentLevel is also set
              return (
                <QuizArea
                  questions={questions}
                  onQuizComplete={handlePracticeQuizComplete}
                  currentLevel={currentLevel} 
                  isPlacementTest={false}
                />
              );
            }
             // Fallback if questions are not ready or level is null
            return <ErrorMessage message="No questions available for practice or level not set. Try selecting a level again." onGoHome={goHome}/>;
          case GameState.QUIZ_COMPLETE:
            if (currentLevel) { // Ensure currentLevel is set
              return (
                <ScoreDisplay
                  score={score}
                  totalQuestions={questions.length}
                  onPlayAgain={handlePlayAgainPractice}
                  onChangeLevel={handleChooseDifferentLevelForPractice} 
                  level={currentLevel}
                />
              );
            }
            return <ErrorMessage message="Quiz score cannot be displayed as the level context is missing." onGoHome={goHome}/>;
          default: 
            return <LevelSelector levels={AVAILABLE_LEVELS} onSelectLevel={handleLevelSelect} />;
        }

      case GameMode.PLACEMENT_TEST:
        switch (gameState) {
          case GameState.PLACEMENT_TEST_ACTIVE:
            if (placementTestQuestions.length > 0) {
              return (
                <QuizArea
                  questions={placementTestQuestions} 
                  currentLevel={null} 
                  isPlacementTest={true}
                  onPlacementTestAnswer={handlePlacementTestAnswer} 
                />
              );
            }
            return <ErrorMessage message="No questions available for placement test." onGoHome={goHome}/>;
          case GameState.CALCULATING_PLACEMENT_RESULT:
            return <LoadingSpinner message="Calculating your placement result..." />;
          case GameState.SHOWING_PLACEMENT_RESULT:
            return (
              <PlacementResultDisplay 
                determinedLevel={determinedPlacementLevel}
                onPracticeDeterminedLevel={handleStartPracticeAtDeterminedLevel}
                onPracticeChooseLevel={handleChooseDifferentLevelForPractice}
                onRetakeTest={handleRetakePlacementTest}
              />
            );
          default:
             console.warn("Unexpected gameState in PLACEMENT_TEST mode:", gameState);
             return <ErrorMessage message="An unexpected state occurred in the placement test. Please try again." onGoHome={goHome}/>; 
        }
      
      default:
        return <ModeSelector onSelectMode={handleSelectMode} />;
    }
  };

  const showHomeButton = (gameMode !== GameMode.CHOOSING_MODE && gameState !== GameState.INITIAL) ||
                         (gameMode === GameMode.PRACTICE_MODE && gameState === GameState.INITIAL && currentLevel !== null) || // Show if a level is selected even if not loading yet
                         (gameMode === GameMode.PLACEMENT_TEST && gameState === GameState.SHOWING_PLACEMENT_RESULT); // Show on result screen too

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Header onGoHome={goHome} showHomeButton={showHomeButton} />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-white shadow-2xl rounded-xl p-6 md:p-10"> 
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;