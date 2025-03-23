import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import logoUrl from '@images/syllabai-logo.png';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
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