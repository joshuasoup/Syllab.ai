// web/routes/_user.syllabus-result.$id/index.tsx

import React, { useState } from 'react';
import {
  useParams,
  Link,
  useNavigate,
  useOutletContext,
} from 'react-router-dom';
import { api } from '@/services/api';
import { useFindOne } from '@/hooks/useFindOne';
import type { Syllabus, ICSEvent } from '@/types/syllabus';
import { toast } from 'sonner';
import { filterEmptyEntries, isEmpty } from './SyllabusHelpers';
import {
  toTitleCase,
  linkify,
  TimelineItem,
  extractDateFromText,
} from '@/components/features/syllabus/SubComponents';
import { Calendar } from '@/components/features/syllabus/Calendar';
import { CourseInfo } from '@/components/features/syllabus/CourseInfo';
import { GradeBreakdown } from '@/components/features/syllabus/GradeBreakdown';
import {
  Calendar as CalendarIcon,
  Trash2,
  MessageCircle,
  ClipboardList,
  Star,
  Clock,
  ChevronRight,
  Share2,
  ExternalLink,
  Twitter,
} from 'lucide-react';
import type { AuthOutletContext } from '@/routes/_user';
import { useAction } from '@/hooks/useAction';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeleteSyllabusButton } from "@/components/features/syllabus/DeleteSyllabusButton";
import { Badge } from "@/components/ui/badge";

export default function SyllabusResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext<AuthOutletContext>();

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

  // Debug logging
  console.log('Syllabus ID:', id);
  console.log('Syllabus Data:', syllabus);
  console.log('Highlights:', highlights);
  console.log('Course Info:', data.course_info);
  console.log('Full Data:', data);
  console.log('Assessments:', data.assessments);

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
    a.download = `${syllabus.title || 'syllabus'}_calendar.ics`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Calendar downloaded successfully');
  };

  return (
    <div className="container mx-auto p-8 mt-10">
      {/* Top Section */}
      <div className="rounded-xl p-8 pb-0">
        {/* Greeting Section */}
        <div className="mb-8">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold">
                Hey{' '}
                {user?.firstName
                  ? `${user.firstName}${
                      user.lastName ? ` ${user.lastName}` : ''
                    }`
                  : 'there'}
                !
              </h1>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={handleDownloadCalendar}
                >
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">
                    Add to Calendar
                  </span>
                </div>
                <DeleteSyllabusButton 
                  syllabusId={id!}
                  variant="ghost"
                  className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors"
                  redirectTo="/user/syllabus-upload"
                />
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                  <MessageCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600 font-medium">Chat</span>
                </div>
              </div>
            </div>
            <p className="text-gray-500 mt-2" style={{ fontWeight: 500 }}>
              Welcome to {data.course_info?.name || 'your course'}! You are{' '}
              {data.assessments?.length || 0} assessments away from completing
              the course.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Completed Tasks */}
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Completed tasks</div>
              <div className="text-2xl font-bold">85%</div>
            </div>
            <ClipboardList className="w-6 h-6 text-gray-400" />
          </div>

          {/* Customer Rating */}
          <div className="bg-[#DFFB92] rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Customer rating</div>
              <div className="text-2xl font-bold">4.8</div>
            </div>
            <Star className="w-6 h-6 text-yellow-400" />
          </div>

          {/* Average Time */}
          <div className="bg-[#E9DBFB] rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Avg. time</div>
              <div className="text-2xl font-bold">3.5h</div>
            </div>
            <Clock className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Course Info Column */}
        <div className="space-y-8">
          {/* Course Info Section */}
          <div className="rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 border-b-2 border-gray-200 pb-4">
              <Link
                to={`/user/syllabus/${id}/course-info`}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate" title={data.course_info?.name}>
                    {data.course_info?.name || 'Course Info'}
                  </span>
                  {data.course_info?.code && (
                    <>
                      <span className="text-gray-400">-</span>
                      <span className="truncate" title={data.course_info.code}>
                        {data.course_info.code}
                      </span>
                    </>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CourseInfo
                instructors={data.instructors || []}
                classSchedule={data.class_schedule}
              />
              <GradeBreakdown assessments={data.assessments || []} />
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-8 border-b-2 border-gray-200 pb-4">
            <Link
              to={`/user/syllabus/${id}/calendar`}
              className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
            >
              <span>Calendar</span>
              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </h2>
          <Calendar dates={allDates} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{syllabus.title}</h1>
            <Badge variant="outline" className="text-xs">
              {syllabus.highlights?.course_info?.code || 'No course code'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard");
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = window.location.href;
                window.open(url, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = window.location.href;
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out my syllabus for ${syllabus.highlights?.course_info?.code || 'No course code'}: ${syllabus.title}`)}`, '_blank');
              }}
            >
              <Twitter className="h-4 w-4 mr-2" />
              Share on Twitter
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last updated: {new Date(syllabus.updatedAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>Created: {new Date(syllabus.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
