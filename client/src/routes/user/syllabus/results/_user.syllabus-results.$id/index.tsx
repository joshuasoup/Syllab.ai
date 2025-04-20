import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { api } from '@/services/api';
import { useFindOne } from '@/hooks/useFindOne';
import type { Syllabus } from '@/types/syllabus';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import type { AuthOutletContext } from "@/routes/layout/_user";
import { Sun, Moon } from 'lucide-react';

// Importing the new smaller components:
import SyllabusHeader from '@/components/features/syllabus/SyllabusHeader';
import CourseInfoSection from '@/components/features/syllabus/CourseInfoSection';
import AssessmentsList from '@/components/features/syllabus/AssessmentsList';

export default function SyllabusResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext<AuthOutletContext>();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Validate ID
  const isValidId =
    id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Global states for color and task completion (shared among components)
  const [bgColor, setBgColor] = useState(() => {
    if (!id) return '#3b82f6';
    const savedColor = localStorage.getItem(`syllabus_color_${id}`);
    return savedColor || '#3b82f6';
  });
  const [completedTasks, setCompletedTasks] = useState(() => {
    if (!id) return [];
    const savedTasks = localStorage.getItem(`syllabus_completed_tasks_${id}`);
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  // Update states when syllabus id changes
  useEffect(() => {
    if (id) {
      const savedColor = localStorage.getItem(`syllabus_color_${id}`);
      setBgColor(savedColor || '#3b82f6');

      const savedTasks = localStorage.getItem(`syllabus_completed_tasks_${id}`);
      if (savedTasks) setCompletedTasks(JSON.parse(savedTasks));
    }
  }, [id]);

  // Data fetching: create a memoized fetch function and fetch syllabus data
  const fetchSyllabus = React.useCallback(() => {
    return api.syllabus.getById(id!);
  }, [id]);

  const [{ data: syllabus, fetching, error }] = useFindOne<Syllabus>(
    fetchSyllabus,
    {
      enabled: Boolean(id && isValidId),
      maxRetries: 3,
      retryDelay: 2000,
    }
  );

  // Loading, error, or invalid id states:
  if (!id || !isValidId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {!id ? 'No syllabus ID was provided.' : 'Invalid syllabus ID.'}
          </p>
          <Link to="/syllabus-upload" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (error) {
    console.error('Error fetching syllabus:', error);
    if (error.message.includes('Authentication failed')) {
      toast.error('Your session has expired. Please sign in again.');
      navigate('/auth/sign-in');
      return null;
    }
    if (error.message.includes('Not Found')) {
      toast.error('Syllabus not found. It may have been deleted.');
      navigate('/user/syllabus-upload');
      return null;
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error.message}</p>
          <Link to="/syllabus-upload" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Syllabus not found</p>
          <Link to="/syllabus-upload" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Extract highlights from the syllabus data, to be passed down as needed
  const { highlights } = syllabus;
  const data = highlights || {};

  // Helper function: change the dashboard color and notify other components if needed
  const handleColorChange = (color: string) => {
    if (!id) return;
    setBgColor(color);
    localStorage.setItem(`syllabus_color_${id}`, color);
    const colorChangeEvent = new CustomEvent('themeColorChange', {
      detail: { color, syllabusId: id },
    });
    window.dispatchEvent(colorChangeEvent);
  };

  // Helper function: toggle a task's completion status
  const toggleTaskCompletion = (taskId: string, title?: string, date?: string) => {
    if (!id) return;
    setCompletedTasks(prev => {
      const isCompleted = prev.some(task => task.id === taskId);
      const newTasks = isCompleted
        ? prev.filter(task => task.id !== taskId)
        : [...prev, { id: taskId, title: title || '', date: date || '' }];
      localStorage.setItem(`syllabus_completed_tasks_${id}`, JSON.stringify(newTasks));
      return newTasks;
    });
  };

  return (
    <div className={cn("container mx-auto p-4 mt-2 relative", isDarkMode ? "bg-[#191919]" : "bg-white")}>
      {/* Header section */}
      <SyllabusHeader
        syllabus={syllabus}
        bgColor={bgColor}
        onColorChange={handleColorChange}
        onDownloadCalendar={() => {
          if (!syllabus.icsContent) {
            toast.error('No calendar data available');
            return;
          }
          const blob = new Blob([syllabus.icsContent], { type: 'text/calendar' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${syllabus.title.replace(/\.pdf$/i, '')}_calendar.ics`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('Calendar downloaded successfully');
        }}
      />

      {/* Changed grid to 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"> 
        {/* Assessments List - moved to the left column */}
        <div className="lg:col-span-1">
          <AssessmentsList
            data={data}
            bgColor={bgColor}
            isDarkMode={isDarkMode}
            completedTasks={completedTasks}
            toggleTaskCompletion={toggleTaskCompletion}
          />
        </div>

        {/* Course Info Section - moved to the right column */}
        <div className="lg:col-span-1 flex flex-col gap-6"> 
          <CourseInfoSection
            courseInfo={data.course_info}
            instructors={data.instructors || []}
            classSchedule={data.class_schedule}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
      
      {/* Global theme toggle button */}
      <button
        onClick={toggleTheme}
        className={cn(
          "fixed top-4 right-4 p-2 rounded-full transition-colors z-[9999] shadow-lg",
          isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-gray-200" : "bg-white hover:bg-gray-100 text-gray-900"
        )}
        aria-label="Toggle theme"
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </div>
  );
}
