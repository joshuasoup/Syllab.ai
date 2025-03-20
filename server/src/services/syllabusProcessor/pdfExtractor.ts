// server/src/services/syllabusProcessor/pdfExtractor.ts
import pdf from 'pdf-parse';
import fs from 'fs';

/**
 * Extracts text from a PDF file
 */
export async function extractPdfText(filePath: string): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file not found at path: ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    
    // If buffer is empty or very small, it's likely not a valid PDF
    if (dataBuffer.length < 100) {
      throw new Error("PDF file appears to be invalid or empty (file too small)");
    }

    const data = await pdf(dataBuffer, { max: 0 });
    const text = data.text || "";

    if (text.trim().length === 0) {
      throw new Error("No text content extracted from PDF");
    }
    
    return text;
  } catch (error: any) {
    if (error.message?.includes("xref")) {
      throw new Error("Invalid PDF format: could not parse file structure");
    } else {
      throw new Error(`PDF extraction error: ${error.message}`);
    }
  }
}



