
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let aiInstance: any;

try {
  aiInstance = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.0-flash',
  });
} catch (error) {
  console.error("Failed to initialize Genkit. AI features may not work.", error);
  // In a real app, you might want to provide a fallback or throw a more specific error.
  // For now, aiInstance will be undefined, and attempts to use it will likely fail.
}

export const ai = aiInstance;
