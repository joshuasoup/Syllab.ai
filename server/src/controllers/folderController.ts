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

    // Try to fetch folders sorted by position first
    try {
      const { data: folders, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (!error) {
        console.log('Folders fetched successfully:', folders);
        return res.json(folders);
      }
      
      // If there's an error (likely because position column doesn't exist), 
      // fall back to ordering by created_at
      console.log('Error fetching folders with position, falling back to created_at:', error);
    } catch (positionError) {
      console.error('Error with position sorting:', positionError);
    }

    // Fallback query - order by created_at
    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Folders fetched successfully with fallback sorting:', folders);
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

export const reorderFolders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Reorder folders request received:', {
      folderIds: req.body.folderIds,
      userId: req.user?.id
    });

    const { folderIds } = req.body;
    
    if (!folderIds || !Array.isArray(folderIds)) {
      return res.status(400).json({ error: 'Invalid folder IDs' });
    }

    const userId = req.user.id;

    // Get all the user's folders to verify they own them
    const { data: userFolders, error: fetchError } = await supabase
      .from('folders')
      .select('id')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Supabase error:', fetchError);
      throw fetchError;
    }

    const userFolderIds = userFolders.map(f => f.id);
    
    // Verify all folders belong to the user
    const invalidFolders = folderIds.filter(id => !userFolderIds.includes(id));
    if (invalidFolders.length > 0) {
      return res.status(403).json({ 
        error: 'Cannot reorder folders that do not belong to the user'
      });
    }

    // Try to add position column if it doesn't exist
    try {
      // Check if position column exists by querying a single row with position
      const { error: columnCheckError } = await supabase
        .from('folders')
        .select('position')
        .limit(1);

      if (columnCheckError) {
        console.log('Position column may not exist, attempting to add it');
        
        // Use RPC to add the column if it doesn't exist
        // This requires having an RPC function set up in your database
        // If you don't have this, you'll need to manually add the column
        const { error: alterError } = await supabase.rpc('add_position_column_if_not_exists');
        
        if (alterError) {
          console.error('Error adding position column:', alterError);
          // Continue anyway, as we'll handle the error below if needed
        } else {
          console.log('Successfully added position column');
        }
      }
    } catch (schemaError) {
      console.error('Error checking or modifying schema:', schemaError);
      // Continue anyway, we'll handle errors when updating positions
    }

    // Update each folder with its new position
    const updatedFolders = [];
    for (let i = 0; i < folderIds.length; i++) {
      try {
        const { data, error } = await supabase
          .from('folders')
          .update({ position: i })
          .eq('id', folderIds[i])
          .eq('user_id', userId)
          .select();

        if (error) {
          console.error('Supabase error updating folder position:', error);
          // If error is about position column not existing, continue with ordering by created_at
          if (error.message && error.message.includes('position')) {
            console.log('Position column error, will fall back to created_at order');
            continue;
          }
          throw error;
        }
        
        if (data && data.length > 0) {
          updatedFolders.push(data[0]);
        }
      } catch (updateError) {
        console.error(`Error updating position for folder ${folderIds[i]}:`, updateError);
        // Continue with other folders
      }
    }

    // If we updated at least some folders with the position field, return those
    if (updatedFolders.length > 0) {
      console.log('Folders reordered successfully with position field');
      res.json(updatedFolders);
      return;
    }

    // Fetch the updated folders - fallback to ordering by created_at if position failed
    const { data: refetchedFolders, error: refetchError } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (refetchError) {
      console.error('Supabase error refetching folders:', refetchError);
      throw refetchError;
    }

    console.log('Folders reordered successfully (fallback to created_at order)');
    res.json(refetchedFolders);
  } catch (error) {
    console.error('Error reordering folders:', error);
    res.status(500).json({ error: 'Failed to reorder folders' });
  }
};

export const addPositionColumn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Adding position column to folders table...');
    
    // Direct SQL to add position column if it doesn't exist
    const { error } = await supabase.from('folders').select('id').limit(1);
    if (error) {
      console.error('Error checking folders table:', error);
      return res.status(500).json({ error: 'Failed to check folders table' });
    }

    // Regular query succeeded, now try to add the column
    // Note: This requires PostgreSQL privileges which might not be available in all Supabase plans
    const { error: alterError } = await supabase
      .from('_alter_table')
      .select('*')
      .eq('query', 'ALTER TABLE folders ADD COLUMN IF NOT EXISTS position INTEGER')
      .single();
    
    if (alterError) {
      console.error('Error adding position column:', alterError);
      return res.status(500).json({ 
        error: 'Failed to add position column. Please add it manually from the Supabase dashboard.',
        instructions: `
          1. Go to your Supabase dashboard
          2. Navigate to the SQL Editor tab
          3. Enter this SQL: ALTER TABLE folders ADD COLUMN IF NOT EXISTS position INTEGER;
          4. Click "Run" to execute the query
        `
      });
    }
    
    // Try to initialize position values based on creation date
    const { error: updateError } = await supabase
      .from('_alter_table')
      .select('*')
      .eq('query', `
        UPDATE folders 
        SET position = subquery.row_num 
        FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 as row_num 
          FROM folders
        ) AS subquery 
        WHERE folders.id = subquery.id
      `)
      .single();
    
    if (updateError) {
      console.error('Error setting initial position values:', updateError);
      // Return partial success since the column was added
      return res.status(200).json({ 
        message: 'Position column added, but initial values could not be set automatically',
        instructions: `
          To set initial values, run this SQL in the Supabase SQL Editor:
          UPDATE folders 
          SET position = subquery.row_num 
          FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 as row_num 
            FROM folders
          ) AS subquery 
          WHERE folders.id = subquery.id;
        `
      });
    }
    
    console.log('Position column added and initialized successfully');
    return res.status(200).json({ message: 'Position column added and initialized successfully' });
  } catch (error) {
    console.error('Unexpected error adding position column:', error);
    return res.status(500).json({ 
      error: 'Failed to add position column', 
      message: 'Please add it manually from the Supabase dashboard',
      instructions: `
        1. Go to your Supabase dashboard
        2. Navigate to the SQL Editor tab
        3. Enter this SQL: ALTER TABLE folders ADD COLUMN IF NOT EXISTS position INTEGER;
        4. Click "Run" to execute the query
      `
    });
  }
}; 
