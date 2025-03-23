import { User } from '@/types/user';
import { Syllabus } from '@/types/syllabus';

// Base URL for your backend API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for making API requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

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
      return fetchApi<Syllabus>('/syllabus', {
        method: 'POST',
        body: formData,
        headers: {},
      });
    },
    getAll: () => fetchApi<Syllabus[]>('/syllabus'),
    getById: (id: string) => fetchApi<Syllabus>(`/syllabus/${id}`),
    delete: (id: string) =>
      fetchApi(`/syllabus/${id}`, { method: 'DELETE' }),
    getResults: (id: string) =>
      fetchApi<{ results: any }>(`/syllabus/${id}/results`),
    process: async (id: string): Promise<Syllabus> =>
      fetchApi<Syllabus>(`/syllabus/${id}/process`, { method: 'POST' }),
  },
  chat: {
    sendMessage: (syllabusId: string, message: string) =>
      fetchApi(`/syllabus/${syllabusId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    getHistory: (syllabusId: string) =>
      fetchApi(`/syllabus/${syllabusId}/chat`),
  },
}; 