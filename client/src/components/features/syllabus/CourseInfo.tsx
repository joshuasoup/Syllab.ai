import React from "react";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { Instructor, ClassSchedule } from "@/types/syllabus";

interface CourseInfoProps {
  instructors: Instructor[];
  classSchedule: ClassSchedule | undefined;
}

export function CourseInfo({ instructors, classSchedule }: CourseInfoProps) {
  const { id } = useParams();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">
        <Link 
          to={`/user/syllabus/${id}/instructors`}
          className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
        >
          <span>Instructors & TAs</span>
          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </h3>
      {instructors && instructors.length > 0 ? (
        <div className="space-y-3">
          {instructors.map((instructor, index) => (
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
      ) : (
        <div className="text-gray-500 italic">No instructor information available</div>
      )}

      {/* Class Times Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">
          <Link 
            to={`/user/syllabus/${id}/schedule`}
            className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
          >
            <span>Class Schedule</span>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
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