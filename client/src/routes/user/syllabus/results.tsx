import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFindOne } from "@/hooks/useFindOne";
import { api } from "@/services/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { Syllabus, Assessment, Deadline } from "@/types/syllabus";

export default function SyllabusResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [{ data: syllabus, fetching, error }] = useFindOne<Syllabus>(
    () => api.syllabus.getById(id!),
    { 
      enabled: !!id,
      maxRetries: 3,
      retryDelay: 2000
    }
  );

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !syllabus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {error ? "Unable to load syllabus" : "Syllabus not found"}
          </p>
          <button 
            onClick={() => navigate('/user/syllabus-upload')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const extractedDates: Array<{ date: string; description: string; }> = [];
  if (syllabus.highlights) {
    const highlights = syllabus.highlights;
    if (highlights.assessments && Array.isArray(highlights.assessments)) {
      highlights.assessments.forEach((assessment: Assessment) => {
        if (assessment.date && assessment.title) {
          extractedDates.push({ date: assessment.date, description: assessment.title });
        }
      });
    }
    if (highlights.important_deadlines && Array.isArray(highlights.important_deadlines)) {
      highlights.important_deadlines.forEach((deadline: Deadline) => {
        if (deadline.date && deadline.description) {
          extractedDates.push({ date: deadline.date, description: deadline.description });
        }
      });
    }
  }
  extractedDates.sort((a, b) => {
    try {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } catch (e) {
      return 0;
    }
  });

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <div className="bg-gray-100 rounded-xl p-8 min-h-[500px]">
          <h2 className="text-2xl font-bold mb-8">Calendar</h2>
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            super minimalistic calendar
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Course Info Section */}
          <div className="bg-gray-100 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Course Info</h2>
            <div className="text-gray-500">
              *insert grade breakdown, teachers, ta's, professors, current grade
            </div>
          </div>

          {/* Course Website/Policies Section */}
          <div className="bg-gray-100 rounded-xl p-8">
            <h2 className="text-xl font-bold mb-4">Course website/policies</h2>
            <div className="text-gray-500">
              links, and warnings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 