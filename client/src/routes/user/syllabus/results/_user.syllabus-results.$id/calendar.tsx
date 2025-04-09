import React, { useMemo } from "react";
import { useParams, useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { useFindOne } from "@/hooks/useFindOne";
import { api } from "@/services/api";
import { Calendar } from "@/components/features/syllabus/Calendar";
import { ArrowLeft } from "lucide-react";
import type { Syllabus, ICSEvent } from "@/types/syllabus";
import { extractDateFromText } from "@/components/features/syllabus/SubComponents";
import type { AuthOutletContext } from "@/routes/layout/_user";
import { Button } from "@/components/ui/button";

export default function CalendarRoute() {
  const { id } = useParams();
  const { user } = useOutletContext<AuthOutletContext>();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch syllabus data with proper caching and throttling
  const [{ data: syllabus, fetching, error }] = useFindOne<Syllabus>(
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
    if (!syllabus?.highlights) return [];

    const { highlights } = syllabus;
    const data = highlights || {};

    // Process assessments
    const assessmentDates = (data.assessments || [])
      .filter(assessment => assessment.due_date && assessment.due_date.length > 0)
      .flatMap(assessment => 
        assessment.due_date.map(date => ({
          date,
          title: assessment.name,
          type: 'assessment' as const
        }))
      );

    // Process deadlines
    const deadlineDates = (data.important_deadlines || [])
      .filter(deadline => {
        const date = deadline.date || extractDateFromText(deadline.description)?.date;
        return date && typeof date === 'string';
      })
      .map(deadline => {
        const date = deadline.date || extractDateFromText(deadline.description)?.date;
        return {
          date: date as string,
          title: deadline.description,
          type: 'deadline' as const
        };
      });

    // Process class schedule
    const classDates = (data.ics_events || [])
      .filter((event: ICSEvent) => {
        // Only process events with valid recurrence patterns
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

    // Combine and sort all dates
    const allEvents = [...assessmentDates, ...deadlineDates, ...classDates];
    
    // Log the number of events for debugging
    console.log('Total events:', allEvents.length);
    console.log('Assessment events:', assessmentDates.length);
    console.log('Deadline events:', deadlineDates.length);
    console.log('Class events:', classDates.length);
    
    return allEvents.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [syllabus]);

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
          <p className="text-gray-600 mb-4">
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
    <div className="container mx-auto p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1" 
            onClick={() => {
              if (location.state && location.state.from) {
                navigate(location.state.from);
              } else {
                navigate(`/user/syllabus-results/${id}`);
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-8">Course Calendar</h1>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
          <Calendar dates={allDates} />
        </div>
      </div>
    </div>
  );
} 
