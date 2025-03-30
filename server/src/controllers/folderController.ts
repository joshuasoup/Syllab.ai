import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import supabase from '../lib/supabase';

export interface Folder {
  id: string;
  name: string;
  color: string;
  user_id: string;
  syllabuses: string[];
  created_at: string;
  updated_at: string;
}

export const createFolder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Create folder request received:', {
      name: req.body.name,
      color: req.body.color,
      userId: req.user?.id
    });

    const { name, color } = req.body;
    const userId = req.user.id;

    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    const { data: folder, error } = await supabase
      .from('folders')
      .insert({
        name,
        color,
        user_id: userId,
        syllabuses: []
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Folder created successfully:', folder);
    res.status(201).json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

export const getFolders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Get folders request received:', {
      userId: req.user?.id
    });

    const userId = req.user.id;

    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Folders fetched successfully:', folders);
    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
};

export const updateFolder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Update folder request received:', {
      folderId: req.params.id,
      updates: req.body,
      userId: req.user?.id
    });

    const { id } = req.params;
    const { name, color, syllabuses } = req.body;
    const userId = req.user.id;

    const { data: folder, error } = await supabase
      .from('folders')
      .update({
        name,
        color,
        syllabuses,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Folder updated successfully:', folder);
    res.json(folder);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
};

export const deleteFolder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Delete folder request received:', {
      folderId: req.params.id,
      userId: req.user?.id
    });

    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Folder deleted successfully');
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
}; 
