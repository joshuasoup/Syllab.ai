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
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(
      req.headers.authorization?.split(' ')[1] || ''
    );

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

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    console.log('Attempting to fetch all users...');
    console.log('Supabase URL:', process.env.SUPABASE_URL);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Making Supabase admin API call...');
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Successfully fetched users:', users.users.length);

    // Format the users data
    const formattedUsers = users.users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.first_name || '',
      lastName: user.user_metadata?.last_name || '',
      profilePicture: user.user_metadata?.profilePicture || '',
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
    }));

    // Sort users by creation date (newest first)
    formattedUsers.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log('Returning formatted users:', formattedUsers.length);
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, profilePicture } = req.body;

    const {
      data: { user },
      error,
    } = await supabase.auth.updateUser({
      data: {
        firstName,
        lastName,
        profilePicture,
      },
    });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
