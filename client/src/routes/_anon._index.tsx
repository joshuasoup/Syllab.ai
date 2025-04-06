import { Button } from '@/components/ui/button';
import { redirect, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { LogoMarquee } from '@/components/features/LogoMarquee';
import { getSession } from '@/lib/supabase';
import '../styles/landing-page.css';
import ParallaxBackground from '@/components/layout/ParallaxBackground';

// A full page background wrapper with position:relative
const FullPageBackground = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    document.documentElement.classList.add('landing-page');
    document.body.classList.add('landing-page');
    return () => {
      document.documentElement.classList.remove('landing-page');
      document.body.classList.remove('landing-page');
    };
  }, []);

  return (
    <div className="full-page-background" style={{ position: 'relative' }}>
      {children}
    </div>
  );
};

export const loader = async () => {
  try {
    const session = await getSession();
    if (session?.user) {
      return redirect('/user/syllabus-upload');
    }
    return null;
  } catch (error) {
    console.error('Error checking session in landing page loader:', error);
    return null;
  }
};

export default function LandingPage() {
  const navigate = useNavigate();

  const handleActionClick = async () => {
    try {
      const session = await getSession();
      if (session?.user) {
        navigate('/dashboard');
      } else {
        navigate('/auth/sign-in');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      navigate('/auth/sign-in');
    }
  };

  return (
    <FullPageBackground>
      {/* Navbar & all content above BG */}
      <Navbar />
      <div
        className="w-full flex flex-col justify-start pt-32 px-4 sm:px-6 md:px-8 flex-grow"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* <ParallaxBackground /> */}
        <div className="w-full max-w-7xl h-screen mx-auto">
          {/* Intro Section */}
          <div
            className="text-center space-y-10 pb-20 pt-56 grid-background"
          
          >
            <h1
              className="text-6xl md:text-8xl font-bold text-slate-900"
              style={{
                fontWeight: 800,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
              }}
            >
              Never Open
              <br />A{' '}
              <span className="syllab-ai-gradient inline-block">Syllabus</span>{' '}
              Again.
            </h1>
            <h2
              className="font-bold mt-6"
              style={{ letterSpacing: '0.02em', marginTop: '10px' }}
            >
              <span style={{ fontWeight: 500, opacity: 0.85 }}>
                Introducing{' '}
              </span>
              <span
                className="syllab-ai-gradient"
                style={{ fontWeight: 700 }}
              >
                SyllabAI
              </span>
            </h2>
          </div>

          {/* University Logo Banner */}
          <div className="w-full my-16 overflow-hidden">
            <h4 className="text-center text-xs font-bold uppercase tracking-wide text-slate-400">
              Trusted By University Students Across The Country
            </h4>
            <LogoMarquee />

            {/* Login Button */}
            <div className="flex justify-center mb-6 mt-20">
              <Button
                className="w-52 h-14 rounded-xl text-white text-lg font-semibold 
                  transition-all hover:scale-105 hover:opacity-90 flex flex-row 
                  items-center justify-center gradient-button"
                onClick={handleActionClick}
              >
                See It in Action
              </Button>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#2b2b2b] rounded-lg shadow-sm dark:bg-gray-900 m-4 relative z-1">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-10">
          <div className="sm:flex sm:items-center sm:justify-between">
            <a
              href="https://flowbite.com/"
              className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
            >
              <span className="self-center text-4xl font-semibold whitespace-nowrap text-white">
                SyllabAI
              </span>
            </a>
            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
              <li>
                <a href="#" className="hover:underline me-4 md:me-6">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline me-4 md:me-6">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline me-4 md:me-6">
                  Licensing
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2023{' '}
            <a href="https://flowbite.com/" className="hover:underline">
              SyllabAI
            </a>
            . All Rights Reserved.
          </span>
        </div>
      </footer>
    </FullPageBackground>
  );
}
