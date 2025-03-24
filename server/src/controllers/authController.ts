import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

// Log Supabase configuration (without exposing the key)
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.SUPABASE_SERVICE_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export const signUp = async (req: Request, res: Response) => {
  try {
    console.log('Sign up request received:', { email: req.body.email });
    const { email, password, firstName, lastName } = req.body;

    // Sign up with Supabase
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${process.env.CLIENT_URL}/auth/verify-email`
      },
    });

    if (signUpError) {
      console.error('Supabase sign up error:', signUpError);
      return res.status(400).json({ message: signUpError.message });
    }

    console.log('Sign up successful:', { userId: signUpData.user?.id });
    res.status(201).json({ 
      user: signUpData.user,
      message: 'Registration successful. Please check your email to verify your account.',
      requiresVerification: true
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    console.log('Sign in request received:', { email: req.body.email });
    const { email, password } = req.body;

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase sign in error:', error);
      return res.status(401).json({ message: error.message });
    }

    console.log('Sign in successful:', { userId: data.user?.id });
    res.json({ user: data.user });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Error signing in' });
  }
};

export const signOut = async (req: Request, res: Response) => {
  try {
    console.log('Sign out request received');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase sign out error:', error);
      return res.status(500).json({ message: error.message });
    }

    console.log('Sign out successful');
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ message: 'Error signing out' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    console.log('Google auth request received');
    const { token } = req.body;

    // Sign in with Google token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token,
    });

    if (error) {
      console.error('Google auth error:', error);
      return res.status(401).json({ message: error.message });
    }

    console.log('Google auth successful:', { userId: data.user?.id });
    res.json({ user: data.user });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Error authenticating with Google' });
  }
}; 