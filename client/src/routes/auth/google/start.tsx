import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';

export default function GoogleAuthStart() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        // Get the token from the URL
        const token = searchParams.get('token');
        if (!token) {
          throw new Error('No token provided');
        }

        // Send the token to our backend
        await api.auth.googleAuth(token);

        // Navigate to the syllabus upload page
        navigate('/user/syllabus-upload');
      } catch (error) {
        console.error('Google auth error:', error);
        navigate('/auth/sign-in');
      }
    };

    handleGoogleAuth();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Completing sign in...</h1>
        <p className="text-muted-foreground">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
} 