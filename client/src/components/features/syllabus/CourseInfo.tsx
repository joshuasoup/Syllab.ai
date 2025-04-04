import React, { useEffect, useState } from "react";
import { Clock, MapPin, ChevronRight, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { Instructor, ClassSchedule } from "@/types/syllabus";

interface CourseInfoProps {
  instructors: Instructor[];
  classSchedule: ClassSchedule | undefined;
}

export function CourseInfo({ instructors, classSchedule }: CourseInfoProps) {
  const { id } = useParams();
  const [themeColor, setThemeColor] = useState('#3b82f6'); // Default blue

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
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">
        <span>Instructors & TAs</span>
      </h3>
      {instructors && instructors.length > 0 ? (
        <div className="space-y-3">
          {instructors.map((instructor, index) => (
            <div key={index} className="border-2 border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{instructor.name}</div>
                {instructor.name && (
                  <a 
                    href={getRateMyProfessorUrl(instructor.name)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity" 
                    style={{ 
                      color: themeColor,
                      fontWeight: 500
                    }}
                  >
                    <span>Rate My Professor</span>
                    <ExternalLink className="h-3 w-3" style={{ color: themeColor }} />
                  </a>
                )}
              </div>
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
      ) : (
        <div className="text-gray-500 italic">No instructor information available</div>
      )}

      {/* Class Times Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">
          <span>Class Schedule</span>
        </h3>
        {classSchedule ? (
          <div className="border-2 border-gray-100 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{classSchedule.meeting_days_times}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{classSchedule.location}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic">No class schedule available</div>
        )}
      </div>
    </div>
  );
} 
