import { User } from '@/types/user';
import { Syllabus } from '@/types/syllabus';
import { getSession } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

// Base URL for your backend API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for making API requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Get the current session
    const session = await getSession();
    
    // Add the authorization header if we have a session
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    });
    
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    // If we get a 401, try to refresh the session
    if (response.status === 401) {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      if (newSession?.access_token) {
        headers.set('Authorization', `Bearer ${newSession.access_token}`);
        const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          credentials: 'include',
          headers,
        });
        if (!retryResponse.ok) {
          throw new Error(`API error: ${retryResponse.statusText}`);
        }
        return retryResponse.json();
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `API error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Request failed:', {
      url: `${BASE_URL}${endpoint}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// API endpoints
export const api = {
  auth: {
    signIn: (email: string, password: string) =>
      fetchApi<{ user: User }>('/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    signUp: (email: string, password: string, firstName?: string, lastName?: string) =>
      fetchApi<{ user: User }>('/auth/sign-up', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName, lastName }),
      }),
    signOut: () =>
      fetchApi('/auth/sign-out', { method: 'POST' }),
    resetPassword: (email: string) =>
      fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    googleAuth: (token: string) =>
      fetchApi<{ user: User }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
  },
  user: {
    getCurrent: () => fetchApi<User>('/user'),
    updateProfile: (data: Partial<User>) =>
      fetchApi<User>('/user', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  syllabus: {
    upload: async (file: File): Promise<Syllabus> => {
      const formData = new FormData();
      formData.append('file', file);
      return fetchApi<Syllabus>('/syllabi', {
        method: 'POST',
        body: formData,
        headers: {},
      });
    },
    getAll: () => fetchApi<Syllabus[]>('/syllabi'),
    getById: (id: string) => fetchApi<Syllabus>(`/syllabi/${id}`),
    delete: (id: string) =>
      fetchApi(`/syllabi/${id}`, { method: 'DELETE' }),
    getResults: (id: string) =>
      fetchApi<{ results: any }>(`/syllabi/${id}/results`),
    process: async (id: string): Promise<Syllabus> =>
      fetchApi<Syllabus>(`/syllabi/${id}/process`, { method: 'POST' }),
  },
  chat: {
    sendMessage: (syllabusId: string, message: string) =>
      fetchApi(`/syllabi/${syllabusId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    getHistory: (syllabusId: string) =>
      fetchApi(`/syllabi/${syllabusId}/chat`),
  },
}; 