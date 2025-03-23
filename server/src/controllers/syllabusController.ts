import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import supabase from '../lib/supabase';
import syllabusProcessor from '../services/syllabusProcessor/index';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Create syllabus
export const createSyllabus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Create syllabus request received:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      } : null,
      userId: req.user?.id
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const userId = req.user.id;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    
    // Create a new Supabase client with the user's token
    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    
    // Upload to Supabase Storage (using service role for storage operations)
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = req.file.path;
    console.log('Reading file from path:', filePath);
    
    const fileBuffer = fs.readFileSync(filePath);
    console.log('File buffer size:', fileBuffer.length);
    
    console.log('Uploading to Supabase storage:', {
      bucket: 'syllabi',
      path: `${userId}/${fileName}`,
      contentType: 'application/pdf'
    });
    
    // Use service role client for storage operations
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('syllabi')
      .upload(`${userId}/${fileName}`, fileBuffer, {
        contentType: 'application/pdf'
      });
      
    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ error: `File upload failed: ${uploadError.message}` });
    }
    
    console.log('File uploaded successfully to Supabase');
    
    // Get public URL for the file (using service role client)
    const { data: { publicUrl } } = supabase
      .storage
      .from('syllabi')
      .getPublicUrl(`${userId}/${fileName}`);
    
    console.log('Creating syllabus record in database');
    
    // Create syllabus record using the user's token and anon key
    const { data: syllabus, error } = await userSupabase
      .from('syllabi')
      .insert({
        title: req.body.title || req.file.originalname,
        file_url: publicUrl,
        file_name: req.file.originalname,
        user_id: userId,
        processed: false
      })
      .select()
      .single();
      
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }
    
    console.log('Syllabus record created successfully');
    
    // Clean up local file
    fs.unlinkSync(filePath);
    console.log('Local file cleaned up');
    
    res.status(201).json(syllabus);
  } catch (error: any) {
    console.error('Create syllabus error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });

    // Clean up the file if it exists and hasn't been deleted yet
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up file after error');
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({ error: error.message });
  }
};

// Process syllabus
export const processSyllabus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const syllabusId = req.params.id;
    const userId = req.user.id;
    
    const result = await syllabusProcessor.processSyllabus(syllabusId, userId);
    
    res.json(result);
  } catch (error: any) {
    console.error('Process syllabus error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all syllabi for user
export const getUserSyllabi = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('syllabi')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get one syllabus
export const getSyllabus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('[getSyllabus] Request received:', {
      syllabusId: req.params.id,
      userId: req.user.id
    });

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.error('[getSyllabus] No authorization token found');
      return res.status(401).json({ error: 'Authentication token required' });
    }

    // Create a new Supabase client with the user's token
    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    console.log('[getSyllabus] Fetching syllabus from database');
    const { data, error } = await userSupabase
      .from('syllabi')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
      
    if (error) {
      console.error('[getSyllabus] Database error:', error);
      return res.status(404).json({ error: 'Syllabus not found' });
    }
    
    console.log('[getSyllabus] Syllabus found:', {
      id: data.id,
      title: data.title,
      hasFile: !!data.file_url
    });

    // Transform the data to match the client's expected structure
    const transformedData = {
      ...data,
      file: data.file_url ? {
        url: data.file_url
      } : null,
      highlights: data.highlights || {},
      processed: data.processed || false,
      icsContent: data.ics_content || null
    };
    
    res.json(transformedData);
  } catch (error: any) {
    console.error('[getSyllabus] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete syllabus
export const deleteSyllabus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: syllabus, error: fetchError } = await supabase
      .from('syllabi')
      .select('file_url')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
      
    if (fetchError) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }
    
    // Delete from storage if file exists
    if (syllabus.file_url) {
      const filePath = syllabus.file_url.split('/').pop();
      if (filePath) {
        await supabase
          .storage
          .from('syllabi')
          .remove([`${req.user.id}/${filePath}`]);
      }
    }
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('syllabi')
      .delete()
      .eq('id', req.params.id);
      
    if (deleteError) {
      return res.status(500).json({ error: `Delete failed: ${deleteError.message}` });
    }
    
    res.json({ message: 'Syllabus deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};



