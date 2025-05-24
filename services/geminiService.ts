
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GermanLevel, Question, QuestionType, MultipleChoiceOption } from '../types';
import { GEMINI_MODEL_TEXT, PLACEMENT_TEST_LEVELS, NUM_QUESTIONS_PER_LEVEL_IN_PLACEMENT_TEST } from '../constants';

// Attempt to read the API key injected by Netlify (or other means) into the window object
// @ts-ignore
const INJECTED_API_KEY = typeof window !== 'undefined' ? window.APP_GEMINI_API_KEY : undefined;

console.log("Attempting to use API Key. Injected key found:", INJECTED_API_KEY ? "Yes (value logged below if not undefined)" : "No, INJECTED_API_KEY is undefined.");
if (typeof INJECTED_API_KEY !== 'undefined') {
    // Only log the key if it's not undefined, to avoid logging "undefined" string literally if that's the value.
    // For security, be cautious about logging the actual key value in production console.
    // This is more for confirming the injection mechanism.
    console.log("Value of window.APP_GEMINI_API_KEY:", INJECTED_API_KEY);
}


// Fallback to process.env.API_KEY if not in a browser environment or if window.APP_GEMINI_API_KEY is not set.
// This helps if you ever run parts of this code in Node.js or a build environment.
const FALLBACK_PROCESS_ENV_KEY = process.env.API_KEY;

let effectiveApiKey = INJECTED_API_KEY;

if (!effectiveApiKey && FALLBACK_PROCESS_ENV_KEY) {
    console.log("Injected API key not found or empty, falling back to process.env.API_KEY (if available).");
    effectiveApiKey = FALLBACK_PROCESS_ENV_KEY;
}

console.log("Effective API Key that will be used (or placeholder):", effectiveApiKey ? (effectiveApiKey.length > 5 ? effectiveApiKey.substring(0,5) + "..." : "Short Key / Placeholder" ) : "None found, using placeholder.");


const apiKeyForConstructor = (effectiveApiKey && effectiveApiKey.trim() !== "")
  ? effectiveApiKey
  : "INVALID_API_KEY_NOT_CONFIGURED";

if (apiKeyForConstructor === "INVALID_API_KEY_NOT_CONFIGURED") {
    console.error(
      "CRITICAL: Gemini API Key is NOT configured. " +
      "Ensure `window.APP_GEMINI_API_KEY` is set by Netlify snippet injection from the `NETLIFY_GEMINI_API_KEY` environment variable. " +
      "Or, if running locally, ensure `process.env.API_KEY` is set. " +
      "The application WILL FAIL to fetch data from the Gemini API."
    );
}

const ai = new GoogleGenAI({ apiKey: apiKeyForConstructor });

const checkApiKeyValidity = () => {
  if (apiKeyForConstructor === "INVALID_API_KEY_NOT_CONFIGURED") {
    console.error("Gemini API Key is not configured. API calls will fail. Please ensure your API key is correctly set up in your deployment environment (Netlify environment variable + snippet injection) and accessible to the client-side application.");
    throw new Error("Gemini API Key is not configured. Cannot fetch questions. Please check your Netlify environment variable `NETLIFY_GEMINI_API_KEY` and the snippet injection setup.");
  }
};


const parseAndValidateQuestions = (jsonStr: string, expectedCount?: number, specificLevel?: GermanLevel): Question[] => {
  let cleanedJsonStr = jsonStr.trim();
  
  if (cleanedJsonStr.charCodeAt(0) === 0xFEFF) {
    cleanedJsonStr = cleanedJsonStr.substring(1);
  }
  
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleanedJsonStr.match(fenceRegex);
  if (match && match[1]) {
    cleanedJsonStr = match[1].trim();
  }

  cleanedJsonStr = cleanedJsonStr.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  
  try {
    const parsedData = JSON.parse(cleanedJsonStr);

    if (!Array.isArray(parsedData)) {
      console.error("Parsed data is not an array:", parsedData);
      throw new Error("Gemini API did not return a valid JSON array of questions.");
    }
    
    const validatedQuestions: Question[] = parsedData.filter(q => 
        q.id && 
        q.level && 
        Object.values(GermanLevel).includes(q.level as GermanLevel) &&
        q.type === QuestionType.MULTIPLE_CHOICE &&
        q.questionText && 
        q.correctAnswer &&
        Array.isArray(q.options) && 
        q.options.length === 4 && 
        q.options.every((opt: any) => opt.id && opt.text)
    ).map((q: any) => ({
      id: String(q.id),
      level: q.level as GermanLevel, 
      type: QuestionType.MULTIPLE_CHOICE,
      questionText: String(q.questionText),
      options: q.options as MultipleChoiceOption[],
      correctAnswer: String(q.correctAnswer),
      explanation: q.explanation ? String(q.explanation) : undefined,
    }));

    if (validatedQuestions.length === 0 && parsedData.length > 0) {
        console.warn("Questions received from API, but none passed validation. Check question structure and content.", "Received data:", parsedData);
    }
    
    if (expectedCount && validatedQuestions.length !== expectedCount && parsedData.length > 0) {
        console.warn(`Requested ${expectedCount} questions${specificLevel ? ` for ${specificLevel}` : ''}, but received ${validatedQuestions.length} valid questions after filtering. Original count from API: ${parsedData.length}`);
    }
    
    if (validatedQuestions.length === 0 && expectedCount && expectedCount > 0) {
        throw new Error(`No valid questions were generated or passed validation${specificLevel ? ` for ${specificLevel}` : ''}.`);
    }
    return validatedQuestions;

  } catch (parseError) {
    console.error("Failed to parse JSON. Cleaned string that was attempted to parse:", cleanedJsonStr);
    console.error("Original raw response text from Gemini (before any cleaning):", jsonStr);
    throw parseError;
  }
};

const generatePracticePrompt = (level: GermanLevel, count: number): string => {
  return `
Generate ${count} German multiple-choice quiz questions, CEFR level ${level}.
Output: JSON array. Schema per object:
{
  "id": "string",
  "level": "${level}", 
  "type": "${QuestionType.MULTIPLE_CHOICE}",
  "questionText": "string",
  "options": [
    {"id": "string", "text": "string"},
    {"id": "string", "text": "string"},
    {"id": "string", "text": "string"},
    {"id": "string", "text": "string"}
  ],
  "correctAnswer": "string",
  "explanation": "string"
}
Details:
- "id" fields must be unique strings.
- "level" field must be exactly "${level}".
- "options" array must contain exactly 4 distinct option objects.
- "correctAnswer" must be the "id" of one of the options.
- "explanation" is optional, 1-2 sentences.
- "type" must always be "${QuestionType.MULTIPLE_CHOICE}".
Respond ONLY with the JSON array. Provide exactly ${count} questions. No markdown.
`;
};

export const fetchGermanQuestions = async (level: GermanLevel, count: number): Promise<Question[]> => {
  checkApiKeyValidity();
  
  const prompt = generatePracticePrompt(level, count);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });
    return parseAndValidateQuestions(response.text, count, level);
  } catch (error) {
    console.error(`Error fetching practice questions for level ${level}:`, error);
    if (error instanceof Error) {
      if (error.message.includes("quota")) {
           throw new Error("API quota exceeded. Please try again later or check your Gemini API billing.");
      }
      if (error.message.toLowerCase().includes("api key is not configured")) {
          throw error; 
      }
      if (error.name === 'SyntaxError' || error.message.toLowerCase().includes("json") || error.message.toLowerCase().includes("unexpected token")) { 
          throw new Error("Failed to parse JSON response from Gemini for practice questions. The AI might have returned an invalid format. Check console for raw response from Gemini.");
      }
    }
    throw new Error(`Failed to fetch practice questions: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const generatePlacementTestPrompt = (levels: GermanLevel[], questionsPerLevel: number): string => {
  const totalQuestions = levels.length * questionsPerLevel;
  const levelDistribution = levels.map(level => `${questionsPerLevel} questions for CEFR level ${level}`).join(', ');

  return `
Generate a total of ${totalQuestions} German multiple-choice quiz questions for a placement test.
The questions should cover the following CEFR levels: ${levelDistribution}.
Output: A single JSON array containing all ${totalQuestions} questions.
For each question object in the JSON array, YOU MUST include a "level" field indicating the specific CEFR level that question was designed for (e.g., "A1 (Beginner)", "A2 (Elementary)", etc., exactly matching one of these values: ${levels.join(', ')}).

Schema per object:
{
  "id": "string (unique)",
  "level": "string (e.g., A1 (Beginner), A2 (Elementary), etc. - THIS IS CRITICAL and must reflect the question's intended difficulty)",
  "type": "${QuestionType.MULTIPLE_CHOICE}",
  "questionText": "string",
  "options": [
    {"id": "string", "text": "string"},
    {"id": "string", "text": "string"},
    {"id": "string", "text": "string"},
    {"id": "string", "text": "string"}
  ],
  "correctAnswer": "string (option id)",
  "explanation": "string (optional, 1-2 sentences)"
}
Details:
- "id" fields must be unique across all generated questions.
- "options" array must contain exactly 4 distinct option objects.
- "correctAnswer" must be the "id" of one of the options.
- "type" must always be "${QuestionType.MULTIPLE_CHOICE}".
- Ensure the "level" field for EACH question correctly reflects its intended CEFR difficulty from the requested levels.
Respond ONLY with the JSON array. No markdown.
`;
};

export const fetchPlacementTestQuestions = async (): Promise<Question[]> => {
  checkApiKeyValidity();

  const prompt = generatePlacementTestPrompt(PLACEMENT_TEST_LEVELS, NUM_QUESTIONS_PER_LEVEL_IN_PLACEMENT_TEST);
  const expectedTotalQuestions = PLACEMENT_TEST_LEVELS.length * NUM_QUESTIONS_PER_LEVEL_IN_PLACEMENT_TEST;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5, 
        thinkingConfig: { thinkingBudget: 0 }
      },
    });
    const questions = parseAndValidateQuestions(response.text, expectedTotalQuestions);
    
    const levelCounts: Record<string, number> = {};
    questions.forEach(q => {
      levelCounts[q.level] = (levelCounts[q.level] || 0) + 1;
    });
    console.log("Placement test question distribution by level (after validation):", levelCounts);

    return questions;
  } catch (error) {
    console.error("Error fetching placement test questions:", error);
     if (error instanceof Error) {
      if (error.message.includes("quota")) {
           throw new Error("API quota exceeded. Please try again later or check your Gemini API billing.");
      }
      if (error.message.toLowerCase().includes("api key is not configured")) {
          throw error; 
      }
      if (error.name === 'SyntaxError' || error.message.toLowerCase().includes("json") || error.message.toLowerCase().includes("unexpected token")) { 
          throw new Error("Failed to parse JSON response from Gemini for placement test. The AI might have returned an invalid format. Check console for raw response from Gemini.");
      }
    }
    throw new Error(`Failed to fetch placement test questions: ${error instanceof Error ? error.message : String(error)}`);
  }
};
