import React from "react";
import { useParams, useOutletContext, useNavigate, useLocation } from "react-router-dom";
import { useFindOne } from "@/hooks/useFindOne";
import { api } from "@/services/api";
import KanbanBoard from "@/components/features/syllabus/KanbanBoard";
import { Loader2, ArrowLeft } from "lucide-react";
import type { Syllabus, ICSEvent } from "@/types/syllabus";
import { extractDateFromText } from "@/components/features/syllabus/SubComponents";
import type { AuthOutletContext } from "@/routes/layout/_user";
import { Button } from "@/components/ui/button";

export default function CalendarRoute() {
  const { id } = useParams();
  const { user } = useOutletContext<AuthOutletContext>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [{ data: syllabus, fetching, error }] = useFindOne<Syllabus>(
    () => api.syllabus.getById(id!),
    { 
      enabled: !!id,
      maxRetries: 3,
      retryDelay: 2000
    }
  );

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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

  const { highlights } = syllabus;
  const data = highlights || {};

  // Combine all dates for the calendar
  const allDates = [
    // Assessment dates
    ...(data.assessments || [])
      .filter(assessment => assessment.due_date && assessment.due_date.length > 0)
      .flatMap(assessment => 
        assessment.due_date.map(date => ({
          date,
          title: assessment.name,
          type: 'assessment' as const
        }))
      ),
    // Important deadlines
    ...(data.important_deadlines || [])
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
      }),
    // Class schedule from ics_events
    ...(data.ics_events || [])
      .filter((event: ICSEvent) => event.recurrence && event.recurrence.includes('Every'))
      .flatMap((event: ICSEvent) => {
        // Parse the recurrence string to get days and times
        const recurrencePattern = event.recurrence.replace('Every ', '');
        const schedules = recurrencePattern.split(', ').map((schedule: string) => {
          const [day, time] = schedule.split(' ');
          const [startTime, endTime] = time.split('-');
          return { day, startTime, endTime };
        });

        // Get the current month's dates for these days
        const currentDate = new Date();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const classEvents = [];
        for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
          const daySchedule = schedules.find((s: { day: string }) => 
            s.day.toLowerCase() === date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
          );
          
          if (daySchedule) {
            const dateStr = date.toISOString().split('T')[0];
            classEvents.push({
              date: dateStr,
              title: event.event_title || 'Class',
              type: 'class' as const,
              location: event.location
            });
          }
        }
        
        return classEvents;
      })
  ];

  // Sort dates chronologically
  allDates.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

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
        <h1 className="text-3xl font-bold mb-8">Course Timeline</h1>
        <KanbanBoard dates={allDates} />
      </div>
    </div>
  );
} 
