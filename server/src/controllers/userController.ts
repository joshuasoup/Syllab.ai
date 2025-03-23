import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the user's session to access their data
    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(' ')[1] || '');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get current user' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, profilePicture } = req.body;

    const { data: { user }, error } = await supabase.auth.updateUser({
      data: {
        firstName,
        lastName,
        profilePicture,
        updatedAt: new Date().toISOString(),
      }
    });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
}; 