// server/src/services/syllabusProcessor/geminiAnalyzer.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { addRateMyProfLinks } from './rateMyProfUtils';

// Initialize Gemini API client
console.log(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// The detailed prompt text from your original code
const SYLLABUS_ANALYSIS_PROMPT = `
You are a helpful assistant that extracts **structured data** from a university or college syllabus.

When given the raw text of the syllabus, identify and extract the following:
1. Course Info (course_name, course_code, department, course website from the school)
2. Instructors/TA(s) (name, email, office_hours, office_location)
3. Class Schedule (meeting_days_times, location) - For location, please provide:
   - Building name and room number
   - If available, include the full address or campus location
   - If multiple locations are used, list all of them
   - If the class is online, specify the platform (e.g., "Zoom", "Teams")
4. Tutorial/Lab Info (times, locations, TAs)
5. Assessments (name, weight, due_date) – Note: If an assessment has multiple due dates (e.g., recurring submissions or tutorial attendances on different days), do not create multiple assessment objects. Instead, include all dates in a single assessment object as an array in the due_date field. Also if there's other information that should be noted such as having multiple options to have different weightings on the projects, then clearly state it within the weights array. 
6. Important Deadlines
7. Policies (attendance, late work, academic integrity, other)
8. Required Textbooks/Materials
9. Other Notable Details
10. The name of the Institution 
11. YouTube Videos – Extract 2 YouTube videos that explain the course. For each video, extract:
    - video_title
    - video_url
    - thumbnail_url
    - description (if available)
12. YouTube Channels – Extract 2 popular YouTube channels related to the course. For each channel, extract:
    - channel_name
    - channel_url
    - thumbnail_url
    - description (if available)

In addition to the above, also extract and format the following for calendar (ICS) events. Create an additional top-level key "ics_events" that is an array of event objects. Each event object should include:

event_title: A concise title for the event.
start_date: The start date (and time, if available) in YYYY-MM-DD format (include time if available, e.g., "2024-04-15 23:59").
end_date: The end date (and time if applicable) in YYYY-MM-DD format.
recurrence: For recurring events (such as weekly classes or tutorials), include all days and times mentioned in the syllabus as a comma-separated list in a consistent format. For example, if a class is held on "Monday 14:00-15:30" and "Wednesday 14:00-15:30", the recurrence field should read "Every Monday 14:00-15:30, Wednesday 14:00-15:30". Do not omit any days.
location: The event location.
description: Additional details or context about the event.

**Date Format Requirements**:
- Format ALL dates as YYYY-MM-DD whenever possible
- For recurring events (like weekly classes), clearly indicate the day of week and time in a consistent format (e.g., "Monday 14:00-15:30")
- For assessments and due dates, always include the time when available (e.g., "2024-04-15 23:59")
- Convert any ambiguous dates to specific dates with the year included
- If a specific date range is mentioned (e.g., "reading week"), provide both start and end dates in YYYY-MM-DD format
- If only a month and day are provided in the syllabus (e.g., "April 15"), infer the year based on the current academic term

**Output Requirements**:
- Return a JSON object that matches the following structure exactly in order. Make sure that there is no object in full caps, if it has full caps change it to title case "TUTORIALS" -> "Tutorials":
  {
    "course_info": {
      "course_name": "",
      "course_code": "",
      "department": "",
      "course_website":"",
    },
    "instructors": [
      {
        "name": "",
        "email": "",
        "office_hours": "",
        "office_location": ""
      }
    ],
    "class_schedule": {
      "meeting_days_times": "",
      "location": ""
    },
    "tutorial_info": {
      "tutorial_times": "",
      "tutorial_locations": "",
      "tas": [
        {
          "name": "",
          "email": ""
        }
      ]
    },
    "assessments": [
      {
        "name": "",
        "weight": [],
        "due_date": [],
        "num_submissions": []
      }
    ],
    "important_deadlines": [],
    "policies": {
      "attendance": "",
      "late_work": "",
      "academic_integrity": "",
      "other": ""
    },
    "textbooks": "",
    "other_details": "",
    "ics_events": [ { "event_title": "", "start_date": "", "end_date": "", "recurrence": "", "location": "", "description": "" } ] }
    "youtube_videos": [
    {
      "video_title": "",
      "video_url": "",
      "thumbnail_url": "",
      "description": ""
    },
    {
      "video_title": "",
      "video_url": "",
      "thumbnail_url": "",
      "description": ""
    }
  ],
  "youtube_channels": [
    {
      "channel_name": "",
      "channel_url": "",
      "thumbnail_url": "",
      "description": ""
    },
    {
      "channel_name": "",
      "channel_url": "",
      "thumbnail_url": "",
      "description": ""
    }
  ],


For any field not specified in the syllabus, leave it blank ("") or an empty array.
No markdown formatting (e.g., no triple backticks). Just return a valid JSON object.
`;

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
    
    // Try to extract JSON from the response
    if (responseText.includes("```json")) {
      jsonString = responseText.split("```json")[1].split("```")[0].trim();
    } else if (responseText.includes("```")) {
      jsonString = responseText.split("```")[1].split("```")[0].trim();
    }
    
    if (!jsonString?.trim()) {
      throw new Error("Gemini API returned empty text");
    }

    // Try to parse JSON
    let jsonObject: any; // Use 'any' for flexibility or define a strict type
    try {
      jsonObject = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", jsonString);
      throw new Error("Failed to parse Gemini API response as JSON");
    }

    // Validate the response structure
    if (!jsonObject || typeof jsonObject !== 'object') {
      throw new Error("Invalid response structure from Gemini API");
    }

    // *** START: Add Grading Breakdown Logic ***

    // Helper function to categorize assessments
    const getAssessmentCategory = (name: string | undefined): string => {
      if (!name) return "Other";
      const nameLower = name.toLowerCase();
      if (nameLower.includes("assignment")) return "Assignments";
      if (nameLower.includes("quiz")) return "Quizzes";
      if (nameLower.includes("midterm")) return "Midterm Exams";
      if (nameLower.includes("final exam")) return "Final Exam"; // More specific than just "exam"
      if (nameLower.includes("exam") || nameLower.includes("test")) return "Tests/Exams"; // General category if not Midterm/Final
      if (nameLower.includes("project")) return "Projects";
      if (nameLower.includes("lab")) return "Labs";
      if (nameLower.includes("participation") || nameLower.includes("attendance")) return "Participation";
      // Add more rules based on common syllabus terms
      return "Other"; // Fallback category
    };

    // Define the structure for the output
    interface GradingBreakdownItem {
        component: string;
        weight: string;
    }

    // Aggregate weights
    const categoryWeights: { [key: string]: number } = {};
    const assessmentsList = jsonObject.assessments || []; // Ensure it's an array

    if (Array.isArray(assessmentsList)) {
      assessmentsList.forEach((assessment: any) => { // Use 'any' or a defined type for assessment
        const category = getAssessmentCategory(assessment?.name);
        const rawWeightArray = assessment?.weight; // Expecting an array like ["10%"]

        // Try to parse the first weight in the array if it exists and is a string
        if (Array.isArray(rawWeightArray) && rawWeightArray.length > 0 && typeof rawWeightArray[0] === 'string') {
          const weightString = rawWeightArray[0];
          try {
            const weightValue = parseFloat(weightString.replace('%', ''));
            if (!isNaN(weightValue)) {
              categoryWeights[category] = (categoryWeights[category] || 0) + weightValue;
            } else {
               console.warn(`Could not parse weight value from string '${weightString}' for assessment '${assessment?.name}'`);
            }
          } catch (e) {
            console.warn(`Error parsing weight string '${weightString}' for assessment '${assessment?.name}':`, e);
          }
        } else {
           // Log if weight format is unexpected (optional)
           // console.warn(`Skipping assessment due to missing or invalid weight format: ${assessment?.name}`, rawWeightArray);
        }
      });
    }

    // Format the results
    const gradingBreakdown: GradingBreakdownItem[] = Object.entries(categoryWeights).map(
      ([category, totalWeight]) => ({
        component: category,
        // Format weight back to string, handling potential floating point inaccuracies
        weight: `${totalWeight.toFixed(0)}%` // Adjust precision (e.g., .1f) if needed
      })
    );

    // Add the breakdown to the jsonObject BEFORE merging with defaults
    jsonObject.grading_breakdown = gradingBreakdown;

    // *** END: Add Grading Breakdown Logic ***

    // Ensure all required fields exist with default values
    const defaultResponse = {
      course_info: {
        course_name: "",
        course_code: "",
        department: "",
        course_website: ""
      },
      instructors: [],
      class_schedule: {
        meeting_days_times: "",
        location: ""
      },
      tutorial_info: {
        tutorial_times: "",
        tutorial_locations: "",
        tas: []
      },
      assessments: [],
      grading_breakdown: [],
      important_deadlines: [],
      policies: {
        attendance: "",
        late_work: "",
        academic_integrity: "",
        other: ""
      },
      textbooks: "",
      other_details: "",
      ics_events: [],
      youtube_videos: [],
      youtube_channels: []
    };

    // Merge the response with default values
    const mergedResponse = {
      ...defaultResponse,
      ...jsonObject
    };
    
    // Enhance the data with Rate My Professor links
    const enhancedResponse = addRateMyProfLinks(mergedResponse);
    
    return enhancedResponse;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Gemini API request timed out after 60 seconds");
    }
    console.error("Gemini analysis error:", error);
    throw new Error(`Gemini analysis error: ${error.message}`);
  }
}



