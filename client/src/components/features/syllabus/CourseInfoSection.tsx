import React from 'react';
import { cn } from '@/lib/utils';
import type { CourseInfo as CourseInfoType } from '@/types/syllabus';
import { CourseInfo } from '@/components/features/syllabus/CourseInfo';

interface CourseInfoSectionProps {
  courseInfo?: CourseInfoType;
  instructors: any[]; // Define a more specific type if available
  classSchedule?: any; // Adjust type as needed
  isDarkMode: boolean;
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({
  courseInfo,
  instructors,
  classSchedule,
  isDarkMode,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl p-6 shadow-lg border',
        isDarkMode ? 'bg-[#202020] border-gray-700' : 'bg-white border-gray-200'
      )}
    >
      <h3
        className={cn(
          'font-bold border-b pb-2 mb-3',
          isDarkMode ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-100'
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="truncate" title={courseInfo?.name}>
              {courseInfo?.name || 'Course Info'}
            </span>
            {courseInfo?.code && (
              <span className={cn('text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
                {courseInfo.code}
              </span>
            )}
          </div>
        </div>
      </h3>
      <CourseInfo instructors={instructors} classSchedule={classSchedule} />
    </div>
  );
};

export default CourseInfoSection;
