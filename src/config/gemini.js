import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const API_KEY = "YOUR_GEMINI_API_KEY_HERE";
export const genAI = new GoogleGenerativeAI(API_KEY);
