import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Calendar as CalendarIcon,
  Trash2,
  MessageCircle,
  Palette,
  Download,
  Clock,
  MapPin,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { DeleteSyllabusButton } from '@/components/features/syllabus/DeleteSyllabusButton';
import ChatbotDialog from '@/components/features/chat/ChatbotDialog';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import type { Syllabus } from '@/types/syllabus';

// Import the icons (using corrected path)
import appleIconUrl from '@/images/appleIcon.png';
import googleIconUrl from '@/images/googleIcon.webp';

interface SyllabusHeaderProps {
  syllabus: Syllabus;
  bgColor: string;
  onColorChange: (color: string) => void;
  onDownloadCalendar: () => void;
}

const SyllabusHeader: React.FC<SyllabusHeaderProps> = ({
  syllabus,
  bgColor,
  onColorChange,
  onDownloadCalendar,
}) => {
  const { isDarkMode } = useTheme();
  const [chatOpen, setChatOpen] = useState(false);
  const schedule = syllabus.highlights?.class_schedule;

  const colorOptions = [
    { color: '#3b82f6', name: 'Blue' },
    { color: '#8b5cf6', name: 'Purple' },
    { color: '#ec4899', name: 'Pink' },
    { color: '#ef4444', name: 'Red' },
    { color: '#f97316', name: 'Orange' },
    { color: '#eab308', name: 'Yellow' },
    { color: '#22c55e', name: 'Green' },
    { color: '#06b6d4', name: 'Cyan' },
    { color: '#6366f1', name: 'Indigo' },
    { color: '#475569', name: 'Slate' },
  ];

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const color = `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    onColorChange(color);
  };

  const resetColor = () => {
    onColorChange('#3b82f6');
  };

  return (
    <div
      className={cn(
        'rounded-xl p-6 mb-6 relative',
        isDarkMode ? 'bg-[#202020]' : 'bg-white'
      )}
      style={{ background: bgColor }}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h1
            className={cn(
              'text-2xl sm:text-3xl font-bold whitespace-normal min-w-0 pr-4',
              isDarkMode ? 'text-gray-200' : 'text-white'
            )}
          >
            {syllabus.title.replace(/\.pdf$/i, '')}
          </h1>
        </div>
        <div className="flex items-center flex-nowrap gap-2 mt-1 lg:mt-0">
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors whitespace-nowrap text-sm h-auto",
              isDarkMode
                ? "bg-gray-800/50 hover:bg-gray-800/70 text-gray-200"
                : "bg-white/70 hover:bg-white/90 text-gray-900"
            )}
            onClick={onDownloadCalendar}
            aria-label="Add calendar events to your calendar (.ics download)"
          >
            Add to Calendar
            <img src={googleIconUrl} alt="Google Calendar icon" className="h-5 w-5" />
            <img src={appleIconUrl} alt="Apple Calendar icon" className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div 
        className={cn(
          'font-medium text-sm mb-2 flex items-center gap-x-4 gap-y-1 flex-wrap',
          isDarkMode ? 'text-gray-300' : 'text-white/90'
        )}
      >
        {schedule && (schedule.meeting_days_times || schedule.location) ? (
          <>
            {schedule.meeting_days_times && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{schedule.meeting_days_times}</span>
              </span>
            )}
            {schedule.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{schedule.location}</span>
              </span>
            )}
          </>
        ) : (
          <span>Class schedule details not available.</span>
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors',
              isDarkMode
                ? 'bg-gray-800/50 hover:bg-gray-800/70'
                : 'bg-white/70 hover:bg-white/90'
            )}
          >
            <Palette
              className={cn(
                'w-4 h-4',
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              )}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            'w-64 p-3 rounded-xl shadow-lg border',
            isDarkMode ? 'bg-[#202020] border-gray-700' : 'bg-white border-gray-200'
          )}
          side="top"
        >
          <div className="space-y-3">
            <h4
              className={cn(
                'font-medium text-sm',
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              )}
            >
              Dashboard Color
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.color}
                  className={cn(
                    'w-10 h-10 rounded-md hover:scale-110 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                    isDarkMode ? 'focus:ring-gray-700' : 'focus:ring-gray-200'
                  )}
                  style={{ backgroundColor: option.color }}
                  onClick={() => onColorChange(option.color)}
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
  );
};

export default SyllabusHeader;
