// src/controllers/chatController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import supabase from '../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const chatWithSyllabi = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.body.query) {
      return res.status(400).json({ error: 'Missing required parameter: query' });
    }
    
    // Fetch all processed syllabi for user
    const { data: syllabi, error } = await supabase
      .from('syllabi')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('processed', true);
      
    if (error) {
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }
    
    if (!syllabi || syllabi.length === 0) {
      return res.status(200).json({
        response: "You don't have any processed syllabi yet. Please upload and process at least one syllabus before using this feature."
      });
    }
    
    // Initialize Gemini API
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API configuration error. Please contact support.' });
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Prepare content from all syllabi
    const allSyllabiContent = syllabi.map(syllabus => {
      const content: string[] = [];
      
      content.push(`--- SYLLABUS: ${syllabus.title} (ID: ${syllabus.id}) ---`);
      
      if (syllabus.raw_text) {
        content.push(`Full Content: ${syllabus.raw_text}`);
      } else if (syllabus.highlights) {
        content.push(`Highlights: ${JSON.stringify(syllabus.highlights)}`);
      }
      
      if (syllabus.ics_content) {
        content.push(`Calendar Content: ${syllabus.ics_content}`);
      }
      
      return content.join('\n');
    });
    
    // Create prompt for Gemini
    const prompt = `
    You are an AI assistant helping a student with information from multiple syllabi.
    Here is the content from all their syllabi:
    
    ${allSyllabiContent.join('\n\n')}
    
    The student asked: ${req.body.query}
    
    Provide a helpful, concise response based on the syllabi content. If you find the information, please mention which syllabus (by title and ID) it came from. If the information isn't in any of the syllabi, just say you don't see that information in any of the syllabi.
    `;
    
    // Generate response
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    res.json({ response: text });
  } catch (error: any) {
    console.error('Chat with syllabi error:', error);
    res.status(500).json({ error: 'Failed to generate a response. Please try again later.' });
  }
};
