
import { GermanLevel } from './types';

export const AVAILABLE_LEVELS: GermanLevel[] = [
  GermanLevel.A1,
  GermanLevel.A2,
  GermanLevel.B1,
  GermanLevel.B2,
  GermanLevel.C1,
];

export const NUM_QUESTIONS_PER_QUIZ = 20; // For practice mode

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

// Placement Test Configuration
export const NUM_QUESTIONS_PER_LEVEL_IN_PLACEMENT_TEST = 4;
export const PLACEMENT_TEST_LEVELS: GermanLevel[] = [
  GermanLevel.A1,
  GermanLevel.A2,
  GermanLevel.B1,
  GermanLevel.B2,
  GermanLevel.C1,
];
// Total questions in placement test will be NUM_QUESTIONS_PER_LEVEL_IN_PLACEMENT_TEST * PLACEMENT_TEST_LEVELS.length

export const PLACEMENT_TEST_PROFICIENCY_THRESHOLD = 3; // Minimum correct answers per level to be deemed proficient at that level
