import { User } from '@/types/user';
import { Syllabus } from '@/types/syllabus';
import { getSession } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import type { Folder } from '@/types/folder';

// Base URL for your backend API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for making API requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    console.log(`[API Request] Starting request to: ${endpoint}`);
    
    // Get the current session
    const session = await getSession();
    console.log('[API Request] Session status:', session ? 'Found' : 'Not found');
    
    // Add the authorization header if we have a session
    const headers = new Headers({
      ...options.headers,
    });
    
    // Only set Content-Type if the body is not FormData
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
      console.log('[API Request] Added authorization header');
    }

    console.log('[API Request] Making fetch request to:', `${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    console.log('[API Request] Response status:', response.status);

    // If we get a 401, try to refresh the session
    if (response.status === 401) {
      console.log('[API Request] Got 401, attempting to refresh session');
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      // If refresh fails, throw an auth error
      if (refreshError || !newSession?.access_token) {
        console.error('[API Request] Session refresh failed:', refreshError);
        throw new Error('Authentication failed. Please sign in again.');
      }

      console.log('[API Request] Session refreshed successfully');
      headers.set('Authorization', `Bearer ${newSession.access_token}`);
      const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers,
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => null);
        console.error('[API Request] Retry failed:', errorData);
        throw new Error(errorData?.message || `API error: ${retryResponse.statusText}`);
      }
      return retryResponse.json();
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[API Request] Request failed:', errorData);
      throw new Error(errorData?.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[API Request] Request successful');
    return data;
  } catch (error) {
    console.error('[API Request] Request failed:', {
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
      fetchApi<{ user: User; requiresVerification?: boolean }>('/auth/sign-up', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName, lastName }),
      }),
    signOut: async () => {
      try {
        // First sign out from our backend
        await fetchApi('/auth/sign-out', { method: 'POST' });
        
        // Sign out from Supabase
        await supabase.auth.signOut();
        
        // Clear any remaining auth data from localStorage
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        
        // Clear all cookies
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.split('=');
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        
        // Force reload the page to clear any remaining state
        window.location.href = '/auth/sign-in';
      } catch (error) {
        console.error('Error during sign out:', error);
        // Even if there's an error, try to clear everything and redirect
        window.location.href = '/auth/sign-in';
      }
    },
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
    getById: (id: string) => {
      console.log('[API] Fetching syllabus by ID:', id);
      return fetchApi<Syllabus>(`/syllabi/${id}`);
    },
    delete: (id: string) =>
      fetchApi(`/syllabi/${id}`, { method: 'DELETE' }),
    getResults: (id: string) =>
      fetchApi<{ results: any }>(`/syllabi/${id}/results`),
    process: async (id: string): Promise<Syllabus> =>
      fetchApi<Syllabus>(`/syllabi/${id}/process`, { method: 'POST' }),
    update: (id: string, data: Partial<Syllabus>) => {
      const requestBody = { title: data.title };
      console.log('[API] Updating syllabus:', {
        id,
        data: requestBody,
        method: 'PATCH'
      });
      return fetchApi<Syllabus>(`/syllabi/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
    },
  },
  chat: {
    sendMessage: (syllabusId: string, message: string) =>
      fetchApi<{ response: string }>(`/syllabi/${syllabusId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }).then(data => data.response),
    getHistory: (syllabusId: string) =>
      fetchApi<{ messages: Array<{ role: string; content: string }> }>(`/syllabi/${syllabusId}/chat`),
  },
  folders: {
    create: (name: string, color: string) => {
      console.log('Creating folder:', { name, color });
      return fetchApi<Folder>('/folders', {
        method: 'POST',
        body: JSON.stringify({ name, color }),
      });
    },
    getAll: () => {
      console.log('Fetching all folders');
      return fetchApi<Folder[]>('/folders', {
        method: 'GET',
      });
    },
    update: (id: string, data: Partial<Folder>) => {
      console.log('Updating folder:', { id, data });
      return fetchApi<Folder>(`/folders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: (id: string) => {
      console.log('Deleting folder:', { id });
      return fetchApi(`/folders/${id}`, {
        method: 'DELETE',
      });
    },
  },
}; 
