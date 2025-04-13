// src/components/EnrolledCourses.tsx
import React from 'react';
import { BookOpen } from 'lucide-react';

export interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  progress?: number; // progress as a percentage, optional
}

interface EnrolledCoursesProps {
  courses: EnrolledCourse[];
}

const EnrolledCourses: React.FC<EnrolledCoursesProps> = ({ courses }) => {
  return (
    <div className="w-full mt-8">
      <div className="flex items-center mb-6">
        <BookOpen className="h-10 w-10 text-blue-500 mr-4" />
        <h2 className="text-4xl font-bold text-gray-900">Enrolled Courses</h2>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-100 p-5 flex font-semibold text-gray-700 text-lg">
          <div className="flex-1">Course Title</div>
          <div className="w-40 text-center">Instructor</div>
          <div className="w-24 text-right">Progress</div>
        </div>
        <div className="divide-y divide-gray-200">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="flex items-center p-5 text-lg">
                <div className="flex-1 font-medium">{course.title}</div>
                <div className="w-40 text-center">{course.instructor}</div>
                <div className="w-24 text-right font-semibold">
                  {course.progress !== undefined ? `${course.progress}%` : 'N/A'}
                </div>
              </div>
            ))
          ) : (
            <div className="p-5 text-center text-gray-500">
              No enrolled courses found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrolledCourses;
