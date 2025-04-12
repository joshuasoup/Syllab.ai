import React, { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { useFindOne } from "@/hooks/useFindOne";
import { api } from "@/services/api";
import { Calendar } from "@/components/features/syllabus/Calendar";
import { ArrowLeft } from "lucide-react";
import type { Syllabus, ICSEvent } from "@/types/syllabus";
import { extractDateFromText } from "@/components/features/syllabus/SubComponents";
import type { AuthOutletContext } from "@/routes/layout/_user";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

export default function CalendarRoute() {
  const { id } = useParams();
  const { user } = useOutletContext<AuthOutletContext>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);

  // Fetch syllabus data with proper caching and throttling
  const [{ data: syllabus, fetching, error }, { refetch }] = useFindOne<Syllabus>(
    () => api.syllabus.getById(id!),
    { 
      enabled: !!id,
      maxRetries: 1,
      retryDelay: 1000,
      cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
      staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );

  // Process dates for the calendar
  const allDates = useMemo(() => {
    if (!syllabus?.highlights) return localEvents;

    const { highlights } = syllabus;
    const data = highlights || {};

    // Process assessments
    const assessmentDates = (data.assessments || [])
      .filter(assessment => assessment.due_date && assessment.due_date.length > 0)
      .flatMap(assessment => 
        assessment.due_date.map(date => {
          try {
            // Ensure date is in YYYY-MM-DD format
            const parsedDate = new Date(date + 'T12:00:00');
            if (isNaN(parsedDate.getTime())) {
              console.warn('Invalid date:', date);
              return null;
            }
            const formattedDate = parsedDate.toISOString().split('T')[0];
            return {
              date: formattedDate,
              title: assessment.name,
              type: 'assessment' as const
            };
          } catch (error) {
            console.warn('Error processing date:', date, error);
            return null;
          }
        })
      )
      .filter(Boolean); // Remove any null entries

    // Process deadlines
    const deadlineDates = (data.important_deadlines || [])
      .filter(deadline => {
        const date = deadline.date || extractDateFromText(deadline.description)?.date;
        return date && typeof date === 'string';
      })
      .map(deadline => {
        const date = deadline.date || extractDateFromText(deadline.description)?.date;
        try {
          // Ensure date is in YYYY-MM-DD format
          const parsedDate = new Date(date + 'T12:00:00');
          if (isNaN(parsedDate.getTime())) {
            console.warn('Invalid date:', date);
            return null;
          }
          const formattedDate = parsedDate.toISOString().split('T')[0];
          return {
            date: formattedDate,
            title: deadline.description,
            type: 'deadline' as const
          };
        } catch (error) {
          console.warn('Error processing date:', date, error);
          return null;
        }
      })
      .filter(Boolean); // Remove any null entries

    // Process class schedule
    const classDates = (data.ics_events || [])
      .filter((event: ICSEvent) => {
        return event.recurrence && 
               event.recurrence.includes('Every') && 
               event.recurrence.split(', ').length > 0;
      })
      .flatMap((event: ICSEvent) => {
        const recurrencePattern = event.recurrence.replace('Every ', '');
        const schedules = recurrencePattern.split(', ').map((schedule: string) => {
          const [day, time] = schedule.split(' ');
          return { day };
        });

        // Get current month's dates
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const classEvents = [];
        let iterDate = new Date(firstDay);
        
        while (iterDate <= lastDay) {
          const daySchedule = schedules.find(s => 
            s.day.toLowerCase() === iterDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
          );
          
          if (daySchedule) {
            const dateStr = iterDate.toISOString().split('T')[0];
            classEvents.push({
              date: dateStr,
              title: event.event_title || 'Class',
              type: 'class' as const,
              location: event.location
            });
          }
          
          const nextDay = new Date(iterDate);
          nextDay.setDate(nextDay.getDate() + 1);
          iterDate = nextDay;
        }
        
        return classEvents;
      });

    // Process user-added events
    const userEvents = (data.events || [])
      .map(event => ({
        date: event.date,
        title: event.title,
        type: event.type,
        location: event.location
      }));

    // Combine and sort all dates
    const allEvents = [...assessmentDates, ...deadlineDates, ...classDates, ...userEvents, ...localEvents];
    
    // Log the number of events for debugging
    console.log('Total events:', allEvents.length);
    console.log('Assessment events:', assessmentDates.length);
    console.log('Deadline events:', deadlineDates.length);
    console.log('Class events:', classDates.length);
    console.log('User events:', userEvents.length);
    console.log('Local events:', localEvents.length);
    
    return allEvents.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      const dateA = new Date(a.date + 'T12:00:00');
      const dateB = new Date(b.date + 'T12:00:00');
      return dateA.getTime() - dateB.getTime();
    });
  }, [syllabus, localEvents]);

  const handleAddEvent = async (event: Omit<CalendarEvent, 'date'> & { date: Date }) => {
    try {
      // Convert the event to the format expected by the API
      const eventData = {
        ...event,
        date: event.date.toISOString().split('T')[0]
      };

      // Add the event to the syllabus
      const response = await api.syllabus.addEvent(id!, eventData);
      
      // Add the event to local state with the ID from the response
      setLocalEvents(prev => [...prev, {
        ...event,
        date: event.date.toISOString().split('T')[0],
        id: response.id // Add the ID from the response
      }]);
      
      // Show success message
      toast.success('Event added successfully');
      
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await api.syllabus.deleteEvent(id!, eventId);
      // Remove the event from local state
      setLocalEvents(prev => prev.filter(event => event.id !== eventId));
      // Force a refresh of the syllabus data
      await refetch();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  if (error || !syllabus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            {error ? "Unable to load syllabus" : "Syllabus not found"}
          </p>
          <Button 
            variant="outline"
            onClick={() => navigate('/user/syllabus-upload')}
          >
            Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-1000">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "flex items-center gap-1",
              isDarkMode 
                ? "bg-[#202020] border-gray-700 hover:bg-[#2a2a2a] hover:border-gray-600 text-gray-200" 
                : "bg-white hover:bg-gray-100"
            )}
            onClick={() => {
              if (location.state && location.state.from) {
                navigate(location.state.from);
              } else {
                navigate(`/user/syllabus-results/${id}`);
              }
            }}
          >
            <ArrowLeft className={cn(
              "h-4 w-4",
              isDarkMode ? "text-gray-200" : "text-gray-600"
            )} />
            Back to Results
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-8 text-white">Course Calendar - {syllabus.title.replace(/\.pdf$/i, '')}</h1>
        <div className={cn(
          "rounded-xl border-2 p-6 shadow-md",
          isDarkMode ? "bg-[#202020] border-gray-700" : "bg-white border-gray-200"
        )}>
          <Calendar 
            dates={allDates} 
            onAddEvent={handleAddEvent} 
            onDeleteEvent={handleDeleteEvent}
          />
        </div>
      </div>
    </div>
  );
} 
