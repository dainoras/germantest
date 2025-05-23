
export enum GermanLevel {
  A1 = "A1 (Beginner)",
  A2 = "A2 (Elementary)",
  B1 = "B1 (Intermediate)",
  B2 = "B2 (Upper Intermediate)",
  C1 = "C1 (Advanced)",
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
  TRANSLATION_EN_DE = 'TRANSLATION_EN_DE',
  TRANSLATION_DE_EN = 'TRANSLATION_DE_EN',
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  level: GermanLevel; // For practice mode, this is the chosen level. For placement, this is the question's specific intended level.
  type: QuestionType;
  questionText: string;
  options: MultipleChoiceOption[];
  correctAnswer: string; // Option id
  explanation?: string;
}

export enum GameMode {
  CHOOSING_MODE = 'CHOOSING_MODE',
  PLACEMENT_TEST = 'PLACEMENT_TEST',
  PRACTICE_MODE = 'PRACTICE_MODE',
}

export enum GameState {
  // Common states
  INITIAL = 'INITIAL', // App just loaded, choosing mode
  LOADING_QUESTIONS = 'LOADING_QUESTIONS', // Loading practice questions
  QUIZ_ACTIVE = 'QUIZ_ACTIVE', // Practice quiz active
  SHOWING_FEEDBACK = 'SHOWING_FEEDBACK', // Showing feedback for a practice question
  QUIZ_COMPLETE = 'QUIZ_COMPLETE', // Practice quiz finished, showing score

  // Placement Test specific states
  LOADING_PLACEMENT_QUESTIONS = 'LOADING_PLACEMENT_QUESTIONS',
  PLACEMENT_TEST_ACTIVE = 'PLACEMENT_TEST_ACTIVE',
  CALCULATING_PLACEMENT_RESULT = 'CALCULATING_PLACEMENT_RESULT',
  SHOWING_PLACEMENT_RESULT = 'SHOWING_PLACEMENT_RESULT',
}

export interface UserPlacementAnswer {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  questionLevel: GermanLevel; // The original intended level of the question
}
