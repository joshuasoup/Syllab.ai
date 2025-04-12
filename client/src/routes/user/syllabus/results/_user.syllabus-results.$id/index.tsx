// web/routes/_user.syllabus-result.$id/index.tsx

import React, { useState, useEffect } from 'react';
import {
  useParams,
  Link,
  useNavigate,
  useOutletContext,
  useLocation,
} from 'react-router-dom';
import { api } from '@/services/api';
import { useFindOne } from '@/hooks/useFindOne';
import type { Syllabus, ICSEvent } from '@/types/syllabus';
import { toast } from 'sonner';
import { extractDateFromText } from '@/components/features/syllabus/SubComponents';
import { CourseInfo } from '@/components/features/syllabus/CourseInfo';
import {
  Calendar as CalendarIcon,
  Trash2,
  MessageCircle,
  ClipboardList,
  ChevronRight,
  Palette,
  CheckCircle,
  Circle,
  Moon,
  Sun,
} from 'lucide-react';
import type { AuthOutletContext } from "@/routes/layout/_user";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { DeleteSyllabusButton } from '@/components/features/syllabus/DeleteSyllabusButton';
import { GradeCalculator } from '@/components/features/syllabus/GradeCalculator';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

// Define an interface for completed tasks
interface CompletedTask {
  id: string;
  title: string;
  date: string;
}

export default function SyllabusResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext<AuthOutletContext>();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  // State declarations - all grouped together at the top
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>(() => {
    if (!id) return [];

    // Load completed tasks from localStorage
    const savedTasks = localStorage.getItem(`syllabus_completed_tasks_${id}`);
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

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
        console.log(`Loading color for syllabus ${id}: ${savedColor}`);
        setBgColor(savedColor);
      } else {
        // If no color is saved for this syllabus, reset to default blue
        console.log(`No saved color for syllabus ${id}, using default blue`);
        setBgColor('#3b82f6');
      }

      // Load completed tasks
      const savedTasks = localStorage.getItem(`syllabus_completed_tasks_${id}`);
      if (savedTasks) {
        setCompletedTasks(JSON.parse(savedTasks));
      }
    }
  }, [id]);

  // Save color when changed
  const handleColorChange = (color: string) => {
    if (!id) return;

    console.log(`Saving color for syllabus ${id}: ${color}`);
    setBgColor(color);

    // Save to localStorage with the syllabus ID as part of the key
    localStorage.setItem(`syllabus_color_${id}`, color);

    // Dispatch custom event for other components to listen for color changes
    const colorChangeEvent = new CustomEvent('themeColorChange', {
      detail: { color, syllabusId: id },
    });
    window.dispatchEvent(colorChangeEvent);
  };

  // Toggle task completion status
  const toggleTaskCompletion = (
    taskId: string,
    title: string,
    date: string
  ) => {
    if (!id) return;

    setCompletedTasks((prevTasks) => {
      // Check if task is already completed
      const isCompleted = prevTasks.some((task) => task.id === taskId);

      let newTasks;
      if (isCompleted) {
        // Remove task from completed list
        newTasks = prevTasks.filter((task) => task.id !== taskId);
      } else {
        // Add task to completed list
        newTasks = [...prevTasks, { id: taskId, title, date }];
      }

      // Save to localStorage
      localStorage.setItem(
        `syllabus_completed_tasks_${id}`,
        JSON.stringify(newTasks)
      );

      return newTasks;
    });
  };

  // Check if a task is completed
  const isTaskCompleted = (taskId: string) => {
    return completedTasks.some((task) => task.id === taskId);
  };

  // Color options
  const colorOptions = [
    { color: '#3b82f6', name: 'Blue' }, // Blue (default)
    { color: '#8b5cf6', name: 'Purple' }, // Purple
    { color: '#ec4899', name: 'Pink' }, // Pink
    { color: '#ef4444', name: 'Red' }, // Red
    { color: '#f97316', name: 'Orange' }, // Orange
    { color: '#eab308', name: 'Yellow' }, // Yellow
    { color: '#22c55e', name: 'Green' }, // Green
    { color: '#06b6d4', name: 'Cyan' }, // Cyan
    { color: '#6366f1', name: 'Indigo' }, // Indigo
    { color: '#475569', name: 'Slate' }, // Slate
  ];

  // Function to handle random color generation
  const generateRandomColor = () => {
    // Generate random RGB values
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    
    // Convert to hex
    const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    handleColorChange(color);
  };

  // Reset to default blue
  const resetColor = () => {
    handleColorChange('#3b82f6');
  };

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

  // Early returns (loading / error / invalid states)
  if (!id || !isValidId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {!id ? 'No syllabus ID was provided.' : 'Invalid syllabus ID.'}
          </p>
          <Link
            to="/syllabus-upload"
            className="text-blue-600 hover:text-blue-800"
          >
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
    // Handle authentication errors
    if (error.message.includes('Authentication failed')) {
      toast.error('Your session has expired. Please sign in again.');
      navigate('/auth/sign-in');
      return null;
    }

    // Handle not found errors
    if (error.message.includes('Not Found')) {
      toast.error('Syllabus not found. It may have been deleted.');
      navigate('/user/syllabus-upload');
      return null;
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error.message}</p>
          <Link
            to="/syllabus-upload"
            className="text-blue-600 hover:text-blue-800"
          >
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
          <Link
            to="/syllabus-upload"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </Link>
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
          weight: assessment.weight?.[0],
          description: assessment.description
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
    // User-added events
    ...(data.events || []).map(event => ({
      date: event.date,
      title: event.title,
      type: event.type,
      location: event.location,
      id: event.id
    }))
  ];

  console.log('All events:', allDates);
  console.log('User events:', data.events);

  // Sort dates chronologically
  allDates.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    const dateA = new Date(a.date + 'T12:00:00');
    const dateB = new Date(b.date + 'T12:00:00');
    return dateA.getTime() - dateB.getTime();
  });

  // Group events by status and sort within each group
  const groupedEvents = allDates
    .filter(event => event.type === 'assessment' || event.type === 'deadline')
    .reduce((groups, event) => {
      const eventDate = new Date(event.date + 'T12:00:00');
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      
      const isToday = eventDate.getTime() === today.getTime();
      const isUpcoming = !isNaN(eventDate.getTime()) && eventDate > today;
      const isPast = !isNaN(eventDate.getTime()) && eventDate < today;
      const completed = isTaskCompleted(`${event.title}-${event.date}`);
      
      const status = completed
        ? 'completed'
        : isToday
        ? 'today'
        : isPast
        ? 'past'
        : 'upcoming';
      
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(event);
      return groups;
    }, {} as Record<string, typeof allDates>);

  // Sort each group by date
  Object.keys(groupedEvents).forEach(status => {
    groupedEvents[status].sort((a, b) => {
      const dateA = new Date(a.date + 'T12:00:00');
      const dateB = new Date(b.date + 'T12:00:00');
      return dateA.getTime() - dateB.getTime();
    });
  });

  // Flatten the groups in the desired order
  const sortedEvents = [
    ...(groupedEvents['today'] || []),
    ...(groupedEvents['upcoming'] || []),
    ...(groupedEvents['past'] || []),
    ...(groupedEvents['completed'] || [])
  ];

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
    <div className={cn(
      "container mx-auto p-4 mt-2 relative",
      isDarkMode ? "bg-[#191919]" : "bg-white"
    )}>
      {/* Dashboard Header with Blue Background */}
      <div
        className={cn(
          "rounded-xl p-6 mb-6 relative",
          isDarkMode ? "bg-[#202020]" : "bg-white"
        )}
        style={{ background: bgColor }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h1 className={cn(
              "text-2xl sm:text-3xl font-bold whitespace-normal min-w-0 pr-4",
              isDarkMode ? "text-gray-200" : "text-white"
            )}>
              {syllabus.title.replace(/\.pdf$/i, '')}
            </h1>
          </div>
          <div className="flex items-center flex-nowrap gap-2 mt-1 lg:mt-0">
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-full cursor-pointer transition-colors whitespace-nowrap text-xs",
                isDarkMode 
                  ? "bg-gray-800/50 hover:bg-gray-800/70 text-gray-200" 
                  : "bg-white/70 hover:bg-white/90 text-gray-900"
              )}
              onClick={handleDownloadCalendar}
            >
              <CalendarIcon className="w-3 h-3 flex-shrink-0 text-blue-500" />
              <span className="font-medium">Add to Your Calendar</span>
            </div>
            <DeleteSyllabusButton
              syllabusId={id!}
              variant="ghost"
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-full transition-colors whitespace-nowrap text-xs h-auto",
                isDarkMode 
                  ? "bg-gray-800/50 hover:bg-gray-800/70 text-gray-200" 
                  : "bg-white/70 hover:bg-white/90 text-gray-900"
              )}
              redirectTo="/user/syllabus-upload"
            >
              <Trash2 className="w-3 h-3 flex-shrink-0 text-red-500 mr-1" />
              <span className="font-medium">Delete</span>
            </DeleteSyllabusButton>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-full cursor-pointer transition-colors whitespace-nowrap text-xs",
                isDarkMode 
                  ? "bg-gray-800/50 hover:bg-gray-800/70 text-gray-200" 
                  : "bg-white/70 hover:bg-white/90 text-gray-900"
              )}
            >
              <MessageCircle className="w-3 h-3 flex-shrink-0 text-purple-500" />
              <span className="font-medium">Chat</span>
            </div>
          </div>
        </div>
        <p className={cn(
          "font-medium text-sm mb-2",
          isDarkMode ? "text-gray-300" : "text-white/90"
        )}>
          Welcome to {data.course_info?.name || 'your course'}! You are{' '}
          {allDates
            .filter(
              (event) =>
                event.type === 'assessment' || event.type === 'deadline'
            )
            .filter((event) => !isTaskCompleted(`${event.title}-${event.date}`))
            .length || 0}{' '}
          assessments away from completing the course.
        </p>
        {/* Color Picker in Bottom Right of Header */}
        <Popover>
          <PopoverTrigger asChild>
            <div className={cn(
              "absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors",
              isDarkMode 
                ? "bg-gray-800/50 hover:bg-gray-800/70" 
                : "bg-white/70 hover:bg-white/90"
            )}>
              <Palette className={cn(
                "w-4 h-4",
                isDarkMode ? "text-gray-300" : "text-gray-600"
              )} />
            </div>
          </PopoverTrigger>
          <PopoverContent className={cn(
            "w-64 p-3 rounded-xl shadow-lg border",
            isDarkMode ? "bg-[#202020] border-gray-700" : "bg-white border-gray-200"
          )} side="top">
            <div className="space-y-3">
              <h4 className={cn(
                "font-medium text-sm",
                isDarkMode ? "text-gray-200" : "text-gray-900"
              )}>Dashboard Color</h4>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.color}
                    className={cn(
                      "w-10 h-10 rounded-md hover:scale-110 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2",
                      isDarkMode ? "focus:ring-gray-700" : "focus:ring-gray-200"
                    )}
                    style={{ backgroundColor: option.color }}
                    onClick={() => handleColorChange(option.color)}
                    title={option.name}
                  />
                ))}
              </div>
              <div className="pt-2 flex justify-between">
                <Button size="sm" onClick={generateRandomColor}>
                  Random
                </Button>
                <Button size="sm" onClick={resetColor}>
                  Reset
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Calendar and Course Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Calendar Widget - Google Calendar style */}
          <Link
            to={`/user/syllabus-results/${id}/calendar`}
            className={cn(
              "rounded-xl shadow-lg hover:shadow-xl transition-all block group border",
              isDarkMode ? "border-gray-700" : "border-gray-200"
            )}
            state={{ from: location.pathname }}
          >
            <div className={cn(
              "p-6 relative",
              isDarkMode ? "bg-[#202020]" : "bg-white"
            )}>
              <h2
                className={cn(
                  "text-2xl font-bold mb-6 pb-2 border-b flex items-center justify-between group-hover:text-[color:var(--theme-color)] transition-colors",
                  isDarkMode ? "border-gray-700 text-gray-200" : "border-gray-200 text-gray-900"
                )}
                style={{ '--theme-color': bgColor } as React.CSSProperties}
              >
                <div className="flex items-center">
                  <CalendarIcon
                    className="mr-2 h-5 w-5 group-hover:text-[color:var(--theme-color)] transition-colors group-hover:drop-shadow-md"
                    style={
                      {
                        color: bgColor,
                        '--theme-color': bgColor,
                      } as React.CSSProperties
                    }
                  />
                  <span className="group-hover:drop-shadow-sm">Calendar</span>
                </div>
                <ChevronRight
                  className="w-5 h-5 group-hover:text-[color:var(--theme-color)] transition-transform group-hover:translate-x-1"
                  style={{ '--theme-color': bgColor } as React.CSSProperties}
                />
              </h2>

              {/* Today's date - redesigned for better theme fit */}
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: isDarkMode 
                    ? `${bgColor}33`  // 20% opacity in dark mode
                    : `${bgColor}1a`  // 10% opacity in light mode
                }}
              >
                <div className={cn(
                  "text-sm font-medium mb-2",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="space-y-2">
                  {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayEvents = allDates.filter(
                      (event) => event.date === today
                    );

                    if (todayEvents.length === 0) {
                      return (
                        <div className={cn(
                          "text-sm",
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          No events today
                        </div>
                      );
                    }

                    return todayEvents.map((event, index) => (
                      <div key={index} className={cn(
                        "flex items-start p-2 rounded-md",
                        isDarkMode ? "bg-gray-800" : "bg-gray-50"
                      )}>
                        <div
                          className="w-2 h-2 rounded-full mr-2 mt-1.5"
                          style={{ backgroundColor: bgColor }}
                        ></div>
                        <div className="flex-1">
                          <div className={cn(
                            "font-medium text-sm",
                            isDarkMode ? "text-gray-200" : "text-gray-800"
                          )}>
                            {event.title}
                          </div>
                          {event.location && (
                            <div className={cn(
                              "text-xs flex items-center",
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            )}>
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </Link>

          {/* Course Info Section */}
          <div className={cn(
            "rounded-xl p-6 shadow-lg border",
            isDarkMode ? "bg-[#202020] border-gray-700" : "bg-white border-gray-200"
          )}>
            <h3 className={cn(
              "font-bold border-b pb-2 mb-3",
              isDarkMode ? "text-gray-200 border-gray-700" : "text-gray-800 border-gray-100"
            )}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="truncate" title={data.course_info?.name}>
                    {data.course_info?.name || 'Course Info'}
                  </span>
                  {data.course_info?.code && (
                    <span className={cn(
                      "text-xs",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      {data.course_info.code}
                    </span>
                  )}
                </div>
              </div>
            </h3>
            <CourseInfo
              instructors={data.instructors || []}
              classSchedule={data.class_schedule}
            />
          </div>
        </div>

        {/* Assessments List Widget */}
        <div className={cn(
          "rounded-xl p-6 shadow-lg border lg:col-span-2",
          isDarkMode ? "bg-[#202020] border-gray-700" : "bg-white border-gray-200"
        )}>
          <h2 className={cn(
            "text-2xl font-bold mb-6 pb-2 border-b flex items-center",
            isDarkMode ? "text-white border-gray-700" : "text-gray-900 border-gray-200"
          )}>
            <ClipboardList
              className="mr-2 h-5 w-5"
              style={{ color: bgColor }}
            />
            <span>Assessments &amp; Deadlines</span>
          </h2>
          <div 
            className="p-4 rounded-lg max-h-[500px] overflow-y-auto"
            style={{ 
              backgroundColor: isDarkMode 
                ? `${bgColor}33`  // 20% opacity in dark mode
                : `${bgColor}1a`  // 10% opacity in light mode
            }}
          >
            {sortedEvents.length > 0 ? (
              <div className="space-y-2">
                {sortedEvents.map((event, index) => {
                  const eventDate = new Date(event.date + 'T12:00:00');
                  const today = new Date();
                  today.setHours(12, 0, 0, 0);
                  
                  const isToday = eventDate.getTime() === today.getTime();
                  const isUpcoming = !isNaN(eventDate.getTime()) && eventDate > today;
                  const isPast = !isNaN(eventDate.getTime()) && eventDate < today;
                  const formattedDate = !isNaN(eventDate.getTime())
                    ? eventDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'No date';

                  const assessmentData = data.assessments?.find(
                    (a) =>
                      a.name &&
                      a.name.toLowerCase() === event.title.toLowerCase()
                  );

                  const weight = assessmentData?.weight?.[0];
                  const hasWeight = weight !== undefined;

                  const taskId = `${event.title}-${event.date}`;
                  const completed = isTaskCompleted(taskId);

                  const status = completed
                    ? 'completed'
                    : isToday
                    ? 'today'
                    : isPast
                    ? 'past'
                    : 'upcoming';

                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg transition-colors border",
                        isDarkMode ? "hover:bg-gray-800/70 border-gray-700" : "hover:bg-gray-100 border-gray-200"
                      )}
                    >
                      <button
                        onClick={() => toggleTaskCompletion(taskId)}
                        className={cn(
                          "flex-shrink-0 mt-1",
                          completed ? "text-green-500" : "text-gray-400"
                        )}
                      >
                        {completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className={cn(
                            "text-xs",
                            isDarkMode ? "text-white" : "text-gray-500"
                          )}>
                            {event.type === 'assessment'
                              ? 'Assessment'
                              : 'Deadline'}
                          </div>
                          <div className={cn(
                            "text-sm font-medium",
                            isDarkMode ? "text-white" : "text-gray-600"
                          )}>
                            {formattedDate}
                          </div>
                        </div>
                        <div>
                          <div
                            className={cn(
                              "font-semibold",
                              completed ? "line-through" : "",
                              isDarkMode ? "text-white" : "text-gray-900"
                            )}
                            style={{ color: completed ? bgColor : '' }}
                          >
                            {event.title}
                          </div>
                          {hasWeight && (
                            <div
                              className={cn(
                                "text-xs mt-1 flex items-center",
                                completed
                                  ? isDarkMode ? "text-white" : "text-gray-400"
                                  : isDarkMode ? "text-white" : "text-gray-600"
                              )}
                            >
                              <div className={cn(
                                "w-20 h-1.5 rounded-full overflow-hidden mr-2",
                                isDarkMode ? "bg-gray-700" : "bg-gray-200"
                              )}>
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    backgroundColor: completed
                                      ? `${bgColor}80`
                                      : bgColor,
                                    width: `${Math.min(weight, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <span>Worth: {weight}</span>
                            </div>
                          )}
                        </div>
                        {assessmentData?.description && (
                          <div
                            className={cn(
                              "text-xs italic max-w-[250px] truncate",
                              completed
                                ? isDarkMode ? "text-white" : "text-gray-400"
                                : isDarkMode ? "text-white" : "text-gray-500"
                            )}
                          >
                            {assessmentData.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={cn(
                "text-center",
                isDarkMode ? "text-white" : "text-gray-500"
              )}>
                No assessments or deadlines found
              </div>
            )}
          </div>
          <div className="mt-8 flex justify-start gap-2">
            <GradeCalculator syllabus={syllabus} />
          </div>
        </div>
      </div>
      {/* Move the dark mode toggle button to be rendered last */}
      <button
        onClick={toggleTheme}
        className={cn(
          "fixed top-4 right-4 p-2 rounded-full transition-colors z-[9999]",
          isDarkMode 
            ? "bg-gray-800 hover:bg-gray-700 text-gray-200 shadow-lg" 
            : "bg-white hover:bg-gray-100 text-gray-900 shadow-lg"
        )}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
