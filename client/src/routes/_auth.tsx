import { Outlet, redirect } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import logoUrl from '@images/syllabai-logo.png';
import { getSession } from "@/lib/supabase";
import { LoaderFunctionArgs } from "react-router-dom";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const session = await getSession();
    if (session?.user) {
      console.log('User is authenticated, redirecting to syllabus upload');
      return redirect('/user/syllabus-upload');
    }
    console.log('No active session found, showing auth pages');
    return null;
  } catch (error) {
    console.error('Error checking session in auth layout:', error);
    // If there's an error getting the session, we'll just show the auth pages
    return null;
  }
};

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img 
            src={logoUrl} 
            alt="SyllabAI Logo" 
            className="w-12 h-12 object-contain"
          />
        </div>
        <Outlet />
      </div>
      <Toaster richColors />
    </div>
  );
} 