// web/routes/_user.syllabus-result.$id/index.tsx

import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useFindOne } from "@/hooks/useFindOne";
import type { Syllabus } from "@/types/syllabus";
import { toast } from "sonner";
import { filterEmptyEntries, isEmpty } from "./SyllabusHelpers";
import { toTitleCase, linkify, TimelineItem, extractDateFromText } from "@/components/features/syllabus/SubComponents";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Calendar({ dates }: { dates: Array<{ date: string; title: string; type: string }> }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Get calendar data
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Create calendar grid
  const days = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get events for current month
  const eventsThisMonth = dates.filter(date => {
    const eventDate = new Date(date.date);
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  // Create calendar grid
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-full">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day names */}
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium p-2">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          const dateStr = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0] : '';
          const events = eventsThisMonth.filter(event => event.date.startsWith(dateStr));
          
          return (
            <div 
              key={index} 
              className={`min-h-[80px] p-1 border border-gray-200 ${
                day ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              {day && (
                <>
                  <div className="text-sm p-1">{day}</div>
                  {events.map((event, eventIndex) => (
                    <div 
                      key={eventIndex}
                      className="text-xs p-1 mb-1 bg-blue-100 rounded truncate"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SyllabusResults() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Validate ID
  const isValidId = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Fetch syllabus data
  const [{ data: syllabus, fetching, error }] = useFindOne<Syllabus>(
    () => api.syllabus.getById(id!),
    { 
      enabled: Boolean(id && isValidId),
      maxRetries: 3,
      retryDelay: 2000
    }
  );

  // Early returns (loading / error / invalid states)
  if (!id || !isValidId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {!id ? "No syllabus ID was provided." : "Invalid syllabus ID."}
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
    // Handle authentication errors
    if (error.message.includes('Authentication failed')) {
      toast.error('Your session has expired. Please sign in again.');
      navigate('/auth/sign-in');
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

  const { highlights } = syllabus;
  const data = highlights || {};

  // Debug logging
  console.log('Course Info:', data.course_info);
  console.log('Full Data:', data);

  // Combine all dates for the calendar
  const allDates = [
    ...(data.assessments || [])
      .filter(assessment => assessment.date && typeof assessment.date === 'string')
      .map(assessment => ({
        date: assessment.date,
        title: assessment.title,
        type: 'assessment'
      })),
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
          type: 'deadline'
        };
      })
  ];

  // Sort dates chronologically
  allDates.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Course Info Column */}
        <div className="space-y-8">
          {/* Course Info Section */}
          <div className="border-2 border-gray-200 rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 border-b-2 border-gray-200 pb-4">
              {data.course_info?.course_name && data.course_info?.course_code 
                ? `${data.course_info.course_name} - ${data.course_info.course_code}`
                : "Course Info"}
            </h2>
            <div className="space-y-6">
              {/* Instructors */}
              {data.instructors && data.instructors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Instructors</h3>
                  {data.instructors.map((instructor, index) => (
                    <div key={index} className="border-2 border-gray-100 rounded-lg p-4">
                      <div className="font-medium">{instructor.name}</div>
                      {instructor.email && (
                        <div className="text-sm text-gray-500">{instructor.email}</div>
                      )}
                      {instructor.office && (
                        <div className="text-sm text-gray-500">Office: {instructor.office}</div>
                      )}
                      {instructor.officeHours && (
                        <div className="text-sm text-gray-500">Hours: {instructor.officeHours}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Course Website/Policies Section */}
          <div className="border-2 border-gray-200 rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 border-b-2 border-gray-200 pb-4">Course Policies</h2>
            <div className="space-y-4">
              {data.policies && !isEmpty(data.policies) && (
                <div className="space-y-3">
                  {typeof data.policies === "string" ? (
                    <div className="border-2 border-gray-100 rounded-lg p-4">
                      {linkify(data.policies)}
                    </div>
                  ) : (
                    filterEmptyEntries(data.policies).map(([key, value]) => (
                      <div key={key} className="border-2 border-gray-100 rounded-lg p-4">
                        <div className="font-medium mb-1">{toTitleCase(key)}</div>
                        <div className="text-gray-600">
                          {typeof value === "string" ? linkify(value) : String(value)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="border-2 border-gray-200 rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-8 border-b-2 border-gray-200 pb-4">Calendar</h2>
          <Calendar dates={allDates} />
        </div>
      </div>
    </div>
  );
}
