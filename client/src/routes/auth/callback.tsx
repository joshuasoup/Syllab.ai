import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; // Adjust the import path as needed

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('Auth callback component mounted');
    
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          throw error;
        }
        
        console.log('Session retrieved:', session ? 'Valid session' : 'No session');
        
        if (session) {
          const params = new URLSearchParams(location.search);
          const redirectPath = params.get('redirectTo') || '/user/syllabus-upload';
          console.log('Redirecting to:', redirectPath);
          navigate(redirectPath);
        } else {
          console.log('No session, redirecting to sign-in');
          navigate('/auth/sign-in');
        }
      } catch (err) {
        console.error('Error during auth callback:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
        setTimeout(() => navigate('/auth/sign-in'), 3000);
      }
    };
    
    handleAuthCallback();
  }, [navigate, location]);
  
  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-[420px] text-center">
          <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
          <p className="mt-2">{error}</p>
          <p className="mt-4">Redirecting to login page...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-[420px] text-center">
        <h2 className="text-2xl font-bold">Completing authentication...</h2>
        <p className="mt-2">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
