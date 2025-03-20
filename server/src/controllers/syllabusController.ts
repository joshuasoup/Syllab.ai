import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import supabase from '../lib/supabase';
import syllabusProcessor from '../services/syllabusProcessor/index';
import fs from 'fs';
import path from 'path';

// Create syllabus
export const createSyllabus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const userId = req.user.id;
    
    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('syllabi')
      .upload(`${userId}/${fileName}`, fileBuffer, {
        contentType: 'application/pdf'
      });
      
    if (uploadError) {
      return res.status(500).json({ error: `File upload failed: ${uploadError.message}` });
    }
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase
      .storage
      .from('syllabi')
      .getPublicUrl(`${userId}/${fileName}`);
    
    // Create syllabus record
    const { data: syllabus, error } = await supabase
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
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }
    
    // Clean up local file
    fs.unlinkSync(filePath);
    
    res.status(201).json(syllabus);
  } catch (error: any) {
    console.error('Create syllabus error:', error);
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
    const { data, error } = await supabase
      .from('syllabi')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
      
    if (error) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }
    
    res.json(data);
  } catch (error: any) {
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



