// server/src/services/syllabusProcessor/geminiAnalyzer.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { addRateMyProfLinks } from './rateMyProfUtils';

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// The detailed prompt text from your original code
const SYLLABUS_ANALYSIS_PROMPT = `
You are a helpful assistant that extracts **structured data** from a university or college syllabus.

When given the raw text of the syllabus, identify and extract the following:
1. Course Info (course_name, course_code, department, course website from the school)
2. Instructors/TA(s) (name, email, office_hours, office_location)
...
`;  // The full prompt would be included here

/**
 * Analyzes syllabus text using Gemini AI
 */
export async function analyzeSyllabusWithGemini(syllabusText: string): Promise<any> {
  if (!syllabusText || syllabusText.trim().length === 0) {
    throw new Error("Empty syllabus text provided for analysis");
  }

  try {
    // Merge prompt with syllabus text
    const fullPrompt = `${SYLLABUS_ANALYSIS_PROMPT}\n\nRaw Syllabus Text:\n\n${syllabusText}`;
    
    // 60s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const result = await model.generateContent(fullPrompt);
    clearTimeout(timeoutId);

    if (!result || !result.response) {
      throw new Error("No response from Gemini API");
    }

    // Extract text and parse JSON
    const responseText = result.response.text();
    let jsonString = responseText;
    if (responseText.includes("```json")) {
      jsonString = responseText.split("```json")[1].split("```")[0].trim();
    } else if (responseText.includes("```")) {
      jsonString = responseText.split("```")[1].split("```")[0].trim();
    }
    
    if (!jsonString?.trim()) {
      throw new Error("Gemini API returned empty text");
    }

    // Parse JSON
    let jsonObject = JSON.parse(jsonString);
    
    // Enhance the data with Rate My Professor links
    jsonObject = addRateMyProfLinks(jsonObject);
    
    return jsonObject;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Gemini API request timed out after 60 seconds");
    }
    throw new Error(`Gemini analysis error: ${error.message}`);
  }
}



