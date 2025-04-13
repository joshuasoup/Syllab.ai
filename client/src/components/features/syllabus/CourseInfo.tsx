import React, { useEffect, useState } from "react";
import { Clock, MapPin, ChevronRight, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { Instructor, ClassSchedule } from "@/types/syllabus";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

interface CourseInfoProps {
  instructors: Instructor[];
  classSchedule: ClassSchedule | undefined;
}

export function CourseInfo({ instructors, classSchedule }: CourseInfoProps) {
  const { id } = useParams();
  const [themeColor, setThemeColor] = useState('#3b82f6'); // Default blue
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Initialize theme color from localStorage with the correct key format
    const storedColor = localStorage.getItem(`syllabus_color_${id}`);
    if (storedColor) {
      setThemeColor(storedColor);
    }

    // Listen for theme color changes
    const handleThemeChange = (e: CustomEvent) => {
      // Check both possible formats for the color in the event
      if (e.detail && typeof e.detail === 'object' && e.detail.color) {
        setThemeColor(e.detail.color);
      } else if (e.detail && typeof e.detail === 'string') {
        setThemeColor(e.detail);
      }
    };

    window.addEventListener('themeColorChange', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('themeColorChange', handleThemeChange as EventListener);
    };
  }, [id]);

  const getRateMyProfessorUrl = (name: string) => {
    const encodedName = encodeURIComponent(name);
    return `https://www.ratemyprofessors.com/search/professors/?q=${encodedName}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className={cn(
          "text-xl font-semibold mb-4",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          Instructors & TAs
        </h3>
        <div className="space-y-4">
          {instructors.map((instructor, index) => (
            <div key={index} className={cn(
              "rounded-lg p-4 transition-all duration-200",
              isDarkMode 
                ? "border-2 border-gray-50/5" 
                : "border border-gray-200 shadow-md hover:shadow-lg bg-white"
            )}>
              <div className="flex items-center justify-between">
                <div className={cn(
                  "font-medium",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>{instructor.name}</div>
                {instructor.name && (
                  <a 
                    href={getRateMyProfessorUrl(instructor.name)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn(
                      "text-sm flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200",
                      isDarkMode 
                        ? "hover:opacity-80" 
                        : "hover:bg-gray-50"
                    )}
                    style={{ color: themeColor }}
                  >
                    Rate My Professor
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {instructor.email && (
                <div className={cn(
                  "text-sm mt-1",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>{instructor.email}</div>
              )}
              {instructor.office && (
                <div className={cn(
                  "text-sm mt-1",
                  isDarkMode ? "text-white" : "text-gray-500"
                )}>Office: {instructor.office}</div>
              )}
              {instructor.officeHours && (
                <div className={cn(
                  "text-sm mt-1",
                  isDarkMode ? "text-white" : "text-gray-500"
                )}>Hours: {instructor.officeHours}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className={cn(
          "text-xl font-semibold mb-4",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          Class Schedule
        </h3>
        <div className={cn(
          "rounded-lg p-4 transition-all duration-200",
          isDarkMode 
            ? "border-2 border-gray-50/5" 
            : "border border-gray-200 shadow-md hover:shadow-lg bg-white"
        )}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className={cn(
                "h-4 w-4",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )} />
              <span className={cn(
                isDarkMode ? "text-gray-400" : "text-gray-900"
              )}>{classSchedule?.meeting_days_times}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className={cn(
                "h-7 w-7",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )} />
              <span className={cn(
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>
                {classSchedule?.location || "No class meeting location available"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
