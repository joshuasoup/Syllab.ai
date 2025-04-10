import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { api } from '@/services/api';
import { useFindOne } from '@/hooks/useFindOne';
import type { Syllabus, ICSEvent } from '@/types/syllabus';
import { Calendar } from '@/components/features/syllabus/Calendar';
import { ArrowLeft, CalendarIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { extractDateFromText } from '@/components/features/syllabus/SubComponents';
import type { AuthOutletContext } from '@/routes/layout/_user';

export default function SyllabusCalendarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useOutletContext<AuthOutletContext>();
  
  // Initialize bgColor state with loading from localStorage
  const [bgColor, setBgColor] = useState(() => {
    if (!id) return '#3b82f6'; // Default blue color
    
    // Look for color saved for this specific syllabus
    const savedColor = localStorage.getItem(`syllabus_color_${id}`);
    return savedColor || '#3b82f6'; // Return saved color or default blue
  });

  // Update color when syllabus ID changes
  useEffect(() => {
    if (id) {
      const savedColor = localStorage.getItem(`syllabus_color_${id}`);
      if (savedColor) {
        setBgColor(savedColor);
      } else {
        // If no color is saved for this syllabus, reset to default blue
        setBgColor('#3b82f6');
      }
    }
  }, [id]);

  // Validate ID
  const isValidId =
    id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Create a memoized fetch function
  const fetchSyllabus = React.useCallback(() => {
    return api.syllabus.getById(id!);
  }, [id]);

  // Fetch syllabus data with proper dependency on id
  const [{ data: syllabus, fetching, error }] = useFindOne<Syllabus>(
    fetchSyllabus,
    { 
      enabled: Boolean(id && isValidId),
      maxRetries: 3,
      retryDelay: 2000,
    }
  );

  // Handle loading and error states
  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading calendar...</div>
      </div>
    );
  }

  if (error || !syllabus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Could not load the syllabus calendar. {error?.message}
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { highlights } = syllabus;
  const data = highlights || {};

  // Combine all dates for the calendar
  const allDates = [
    // Assessment dates
    ...(data.assessments || [])
      .filter(
        (assessment) => assessment.due_date && assessment.due_date.length > 0
      )
      .flatMap((assessment) =>
        assessment.due_date.map((date) => ({
          date,
          title: assessment.name,
          type: 'assessment',
        }))
      ),
    // Important deadlines
    ...(data.important_deadlines || [])
      .filter((deadline) => {
        const date =
          deadline.date ||
          (deadline.description
            ? extractDateFromText(deadline.description)?.date
            : null);
        return date && typeof date === 'string';
      })
      .map((deadline) => {
        const date =
          deadline.date ||
          (deadline.description
            ? extractDateFromText(deadline.description)?.date
            : null);
        return {
          date: date as string,
          title: deadline.description || 'Unnamed Deadline',
          type: 'deadline',
        };
      }),
    // Class schedule from ics_events
    ...(data.ics_events || [])
      .filter(
        (event: ICSEvent) =>
          event.recurrence && event.recurrence.includes('Every')
      )
      .flatMap((event: ICSEvent) => {
        // Parse the recurrence string to get days and times
        const recurrencePattern = event.recurrence.replace('Every ', '');
        const schedules = recurrencePattern
          .split(', ') 
          .map((schedule: string) => {
            const [day, time] = schedule.split(' ');
            const [startTime, endTime] = time.split('-');
            return { day, startTime, endTime };
          });

        // Get the current month's dates for these days
        const currentDate = new Date();
        const firstDay = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const lastDay = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        const classEvents = [];
        for (
          let date = new Date(firstDay);
          date <= lastDay;
          date.setDate(date.getDate() + 1)
        ) {
          const daySchedule = schedules.find(
            (s: { day: string }) =>
              s.day.toLowerCase() ===
              date
                .toLocaleDateString('en-US', { weekday: 'long' })
                .toLowerCase()
          );

          if (daySchedule) {
            const dateStr = date.toISOString().split('T')[0];
            classEvents.push({
              date: dateStr,
              title: event.event_title || 'Class',
              type: 'class',
              location: event.location,
            });
          }
        }

        return classEvents;
      }),
  ];

  // Sort dates chronologically
  allDates.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const handleDownloadCalendar = () => {
    if (!syllabus?.icsContent) {
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
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                // If we have a "from" state, use it, otherwise navigate to a default results page
                const fromPath = location.state?.from || `/user/syllabus/results/${id}`;
                navigate(fromPath);
              }}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <h1 
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: bgColor }}
            >
              <span className="mr-2">
                <CalendarIcon className="inline-block h-7 w-7 mb-1" />
              </span>
              {syllabus.title.replace(/\.pdf$/i, '')} Calendar
            </h1>
          </div>
          <Button 
            onClick={handleDownloadCalendar}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Add to Your Calendar
          </Button>
        </div>
      </div>

      {/* Full Page Calendar */}
      <div 
        className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md"
        style={{ borderTopColor: bgColor, borderTopWidth: '4px' }}
      >
        <div className="min-h-[650px]">
          <Calendar dates={allDates} />
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-700">Assessment</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-purple-100 border border-purple-500 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-700">Class</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 border border-gray-500 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-700">Deadline</span>
        </div>
      </div>
    </div>
  );
} 
