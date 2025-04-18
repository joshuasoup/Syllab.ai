import React from 'react';
import { ClipboardList, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GradeCalculator } from '@/components/features/syllabus/GradeCalculator';

interface AssessmentsListProps {
  data: any; // Expected to hold assessments, important_deadlines, etc.
  bgColor: string;
  isDarkMode: boolean;
  completedTasks: Array<{ id: string; title: string; date: string }>;
  toggleTaskCompletion: (taskId: string, title?: string, date?: string) => void;
}

const AssessmentsList: React.FC<AssessmentsListProps> = ({
  data,
  bgColor,
  isDarkMode,
  completedTasks,
  toggleTaskCompletion,
}) => {
  // Combine events from assessments and important deadlines.
  const allDates = [
    ...(data.assessments || [])
      .filter((assessment: any) => assessment.due_date && assessment.due_date.length > 0)
      .flatMap((assessment: any) =>
        assessment.due_date.map((date: string) => ({
          date,
          title: assessment.name,
          type: 'assessment',
          weight: assessment.weight?.[0],
          description: assessment.description,
        }))
      ),
    ...(data.important_deadlines || [])
      .filter((deadline: any) => deadline.date)
      .map((deadline: any) => ({
        date: deadline.date,
        title: deadline.description || 'Unnamed Deadline',
        type: 'deadline',
      })),
  ];

  allDates.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date + 'T12:00:00').getTime() - new Date(b.date + 'T12:00:00').getTime();
  });

  // Group events by status.
  const groupedEvents = allDates.reduce((groups: Record<string, any[]>, event: any) => {
    const eventDate = new Date(event.date + 'T12:00:00');
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const isToday = eventDate.getTime() === today.getTime();
    const isPast = eventDate < today;
    const taskId = `${event.title}-${event.date}`;
    const completed = completedTasks.some((task) => task.id === taskId);
    const status = completed ? 'completed' : isToday ? 'today' : isPast ? 'past' : 'upcoming';

    if (!groups[status]) groups[status] = [];
    groups[status].push(event);
    return groups;
  }, {} as Record<string, any[]>);

  const sortedEvents = [
    ...(groupedEvents['today'] || []),
    ...(groupedEvents['upcoming'] || []),
    ...(groupedEvents['past'] || []),
    ...(groupedEvents['completed'] || []),
  ];

  return (
    <div
      className={cn(
        'rounded-xl p-6 shadow-lg border',
        isDarkMode ? 'bg-[#202020] border-gray-700' : 'bg-white border-gray-200'
      )}
    >
      <h2
        className={cn(
          'text-2xl font-bold mb-6 pb-2 border-b flex items-center',
          isDarkMode ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'
        )}
      >
        <ClipboardList className="mr-2 h-5 w-5" style={{ color: bgColor }} />
        <span>Assessments &amp; Deadlines</span>
      </h2>
      <div
        className="p-4 rounded-lg max-h-[500px] overflow-y-auto"
        style={{ backgroundColor: isDarkMode ? `${bgColor}33` : `${bgColor}1a` }}
      >
        {sortedEvents.length > 0 ? (
          <div className="space-y-2">
            {sortedEvents.map((event, index) => {
              const eventDate = new Date(event.date + 'T12:00:00');
              const today = new Date();
              today.setHours(12, 0, 0, 0);
              const isToday = eventDate.getTime() === today.getTime();
              const formattedDate = !isNaN(eventDate.getTime())
                ? eventDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'No date';
              const taskId = `${event.title}-${event.date}`;
              const completed = completedTasks.some((task) => task.id === taskId);

              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg transition-colors border',
                    isDarkMode ? 'hover:bg-gray-800/70 border-gray-700' : 'hover:bg-gray-100 border-gray-200'
                  )}
                >
                  <button
                    onClick={() => toggleTaskCompletion(taskId, event.title, event.date)}
                    className={cn('flex-shrink-0 mt-1', completed ? 'text-green-500' : 'text-gray-400')}
                  >
                    {completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className={cn('text-xs', isDarkMode ? 'text-white' : 'text-gray-500')}>
                        {event.type === 'assessment' ? 'Assessment' : 'Deadline'}
                      </div>
                      <div className={cn('text-sm font-medium', isDarkMode ? 'text-white' : 'text-gray-600')}>
                        {formattedDate}
                      </div>
                    </div>
                    <div>
                      <div
                        className={cn('font-semibold', completed ? 'line-through' : '', isDarkMode ? 'text-white' : 'text-gray-900')}
                        style={{ color: completed ? bgColor : '' }}
                      >
                        {event.title}
                      </div>
                      {event.weight !== undefined && (
                        <div
                          className={cn(
                            'text-xs mt-1 flex items-center',
                            completed
                              ? isDarkMode
                                ? 'text-white'
                                : 'text-gray-400'
                              : isDarkMode
                              ? 'text-white'
                              : 'text-gray-600'
                          )}
                        >
                          <div
                            className={cn('w-20 h-1.5 rounded-full overflow-hidden mr-2', isDarkMode ? 'bg-gray-700' : 'bg-gray-200')}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                backgroundColor: completed ? `${bgColor}80` : bgColor,
                                width: `${Math.min(event.weight, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span>Worth: {event.weight}</span>
                        </div>
                      )}
                      {event.description && (
                        <div
                          className={cn(
                            'text-xs italic max-w-[250px] truncate',
                            completed
                              ? isDarkMode
                                ? 'text-white'
                                : 'text-gray-400'
                              : isDarkMode
                              ? 'text-white'
                              : 'text-gray-500'
                          )}
                        >
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={cn('text-center', isDarkMode ? 'text-white' : 'text-gray-500')}>
            No assessments or deadlines found
          </div>
        )}
      </div>
      <div className="mt-8 flex justify-start gap-2">
        <GradeCalculator syllabus={{ id: 'default-id', title: 'Default Title', userId: 'default-user', processed: false, highlights: data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }} />
      </div>
    </div>
  );
};

export default AssessmentsList;
