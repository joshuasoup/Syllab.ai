// server/src/services/syllabusProcessor/index.ts
import { extractPdfText } from './pdfExtractor';
import { analyzeSyllabusWithGemini } from './geminiAnalyzer';
import { generateIcsContent } from './calendarUtils'; // Using the combined module
import supabase from '../../lib/supabase';
import fs from 'fs';

class SyllabusProcessor {
  // Process a syllabus
  async processSyllabus(syllabusId: string, userId: string): Promise<any> {
    // Get the syllabus from Supabase
    const { data: syllabus, error } = await supabase
      .from('syllabi')
      .select('*')
      .eq('id', syllabusId)
      .eq('user_id', userId)
      .single();
      
    if (error || !syllabus) {
      throw new Error('Syllabus not found or access denied');
    }
    
    try {
      // Download file from Supabase storage
      const fileUrl = syllabus.file_url;
      const filePath = `/tmp/${syllabusId}.pdf`;
      
      // Download file
      const response = await fetch(fileUrl);
      const fileBuffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(fileBuffer));
      
      // Step 1: Extract text from PDF
      const pdfText = await extractPdfText(filePath);
      
      // Step 2: Analyze with Gemini
      const highlights = await analyzeSyllabusWithGemini(pdfText);
      
      // Step 3: Generate ICS content if events exist
      let icsContent: string | null = null;
      if (highlights?.ics_events?.length > 0) {
        icsContent = await generateIcsContent(highlights.ics_events);
      }
      
      // Step 4: Update the syllabus in Supabase
      const { data: updatedSyllabus, error: updateError } = await supabase
        .from('syllabi')
        .update({
          raw_text: pdfText,
          highlights,
          ics_content: icsContent,
          processed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', syllabusId)
        .select()
        .single();
        
      if (updateError) {
        throw new Error(`Failed to update syllabus: ${updateError.message}`);
      }
      
      // Clean up temp file
      fs.unlinkSync(filePath);
      
      return updatedSyllabus;
    } catch (error: any) {
      console.error('Process syllabus error:', error);
      
      // Update syllabus with error info
      await supabase
        .from('syllabi')
        .update({
          highlights: {
            error: error.message,
            processingFailed: true,
            timestamp: new Date().toISOString()
          },
          processed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', syllabusId);
        
      throw error;
    }
  }
}

export default new SyllabusProcessor();






