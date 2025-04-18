import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarWidgetProps {
  bgColor: string;
  events: any[]; // Adjust type as needed
  isDarkMode: boolean;
  locationPath: string;
  syllabusId: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  bgColor,
  events,
  isDarkMode,
  locationPath,
  syllabusId,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((event) => event.date === today);

  return (
    <Link
      to={`/user/syllabus-results/${syllabusId}/calendar`}
      className={cn(
        'rounded-xl shadow-lg hover:shadow-xl transition-all block group border',
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      )}
      state={{ from: locationPath }}
    >
      <div className={cn('p-6 relative', isDarkMode ? 'bg-[#202020]' : 'bg-white')}>
        <h2
          className={cn(
            'text-2xl font-bold mb-6 pb-2 border-b flex items-center justify-between group-hover:text-[color:var(--theme-color)] transition-colors',
            isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-200 text-gray-900'
          )}
          style={{ '--theme-color': bgColor } as React.CSSProperties}
        >
          <div className="flex items-center">
            <CalendarIcon
              className="mr-2 h-5 w-5 group-hover:text-[color:var(--theme-color)] transition-colors group-hover:drop-shadow-md"
              style={{ color: bgColor, '--theme-color': bgColor } as React.CSSProperties}
            />
            <span className="group-hover:drop-shadow-sm">Calendar</span>
          </div>
          <ChevronRight
            className="w-5 h-5 group-hover:text-[color:var(--theme-color)] transition-transform group-hover:translate-x-1"
            style={{ '--theme-color': bgColor } as React.CSSProperties}
          />
        </h2>
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode ? `${bgColor}33` : `${bgColor}1a`,
          }}
        >
          <div
            className={cn(
              'text-sm font-medium mb-2',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}
          >
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="space-y-2">
            {todayEvents.length === 0 ? (
              <div
                className={cn(
                  'text-sm',
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                )}
              >
                No events today
              </div>
            ) : (
              todayEvents.map((event, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start p-2 rounded-md',
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                  )}
                >
                  <div
                    className="w-2 h-2 rounded-full mr-2 mt-1.5"
                    style={{ backgroundColor: bgColor }}
                  ></div>
                  <div className="flex-1">
                    <div
                      className={cn(
                        'font-medium text-sm',
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      )}
                    >
                      {event.title}
                    </div>
                    {event.location && (
                      <div
                        className={cn(
                          'text-xs flex items-center',
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        )}
                      >
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CalendarWidget;
