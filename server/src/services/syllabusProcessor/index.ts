// server/src/services/syllabusProcessor/index.ts
import { extractPdfText } from './pdfExtractor';
import { analyzeSyllabusWithGemini } from './geminiAnalyzer';
import { generateIcsContent } from './calendarUtils'; // Using the combined module
import supabase from '../../lib/supabase';
import fs from 'fs';

class SyllabusProcessor {
  // Process a syllabus
  async processSyllabus(syllabusId: string, userId: string): Promise<any> {
    console.log(`[SyllabusProcessor] Starting to process syllabus ${syllabusId} for user ${userId}`);
    let filePath: string | null = null;
    
    try {
      // Get the syllabus from Supabase
      console.log(`[SyllabusProcessor] Fetching syllabus from database`);
      const { data: syllabus, error } = await supabase
        .from('syllabi')
        .select('*')
        .eq('id', syllabusId)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error(`[SyllabusProcessor] Database error:`, error);
        throw new Error('Syllabus not found or access denied');
      }

      if (!syllabus) {
        console.error(`[SyllabusProcessor] Syllabus not found for ID: ${syllabusId}`);
        throw new Error('Syllabus not found');
      }
      
      console.log(`[SyllabusProcessor] Found syllabus:`, {
        id: syllabus.id,
        title: syllabus.title,
        file_url: syllabus.file_url ? 'Present' : 'Missing'
      });
      
      // Download file from Supabase storage
      const fileUrl = syllabus.file_url;
      if (!fileUrl) {
        console.error(`[SyllabusProcessor] No file URL found for syllabus ${syllabusId}`);
        throw new Error('No file URL found');
      }

      filePath = `/tmp/${syllabusId}.pdf`;
      console.log(`[SyllabusProcessor] Downloading file from ${fileUrl} to ${filePath}`);
      
      // Download file
      const response = await fetch(fileUrl);
      if (!response.ok) {
        console.error(`[SyllabusProcessor] Failed to download file:`, {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      const fileBuffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(fileBuffer));
      console.log(`[SyllabusProcessor] File downloaded successfully`);
      
      // Step 1: Extract text from PDF
      console.log(`[SyllabusProcessor] Extracting text from PDF`);
      const pdfText = await extractPdfText(filePath);
      console.log(`[SyllabusProcessor] PDF text extracted, length: ${pdfText.length}`);
      
      // Step 2: Analyze with Gemini
      console.log(`[SyllabusProcessor] Analyzing with Gemini`);
      const highlights = await analyzeSyllabusWithGemini(pdfText);
      console.log(`[SyllabusProcessor] Analysis complete, highlights:`, highlights);
      
      // Step 3: Generate ICS content if events exist
      let icsContent: string | null = null;
      if (highlights?.ics_events?.length > 0) {
        console.log(`[SyllabusProcessor] Generating ICS content for ${highlights.ics_events.length} events`);
        icsContent = await generateIcsContent(highlights.ics_events);
        console.log(`[SyllabusProcessor] ICS content generated`);
      }
      
      // Step 4: Update the syllabus in Supabase
      console.log(`[SyllabusProcessor] Updating syllabus in database`);
      const { data: updatedSyllabus, error: updateError } = await supabase
        .from('syllabi')
        .update({
          raw_text: pdfText,
          highlights,
          ics_content: icsContent,
          processed: true
        })
        .eq('id', syllabusId)
        .select()
        .single();
        
      if (updateError) {
        console.error(`[SyllabusProcessor] Failed to update syllabus:`, updateError);
        throw new Error(`Failed to update syllabus: ${updateError.message}`);
      }
      
      console.log(`[SyllabusProcessor] Syllabus processed successfully`);
      return updatedSyllabus;
    } catch (error: any) {
      console.error('[SyllabusProcessor] Process syllabus error:', error);
      
      // Update syllabus with error info
      console.log(`[SyllabusProcessor] Updating syllabus with error info`);
      await supabase
        .from('syllabi')
        .update({
          highlights: {
            error: error.message,
            processingFailed: true,
            timestamp: new Date().toISOString()
          },
          processed: true
        })
        .eq('id', syllabusId);
        
      throw error;
    } finally {
      // Clean up temp file if it exists
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`[SyllabusProcessor] Cleaned up temp file: ${filePath}`);
        } catch (cleanupError) {
          console.error(`[SyllabusProcessor] Error cleaning up temp file:`, cleanupError);
        }
      }
    }
  }
}

export default new SyllabusProcessor();






