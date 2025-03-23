import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFindOne } from "@/hooks/useFindOne";
import { api } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, Calendar, Upload } from "lucide-react";
import { toast } from "sonner";
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Unable to load syllabus</p>
              <p className="text-gray-600 mb-6">The server might be temporarily unavailable. Please try again later.</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/syllabus-upload')}>Back to Dashboard</Button>
                <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Syllabus not found</p>
              <Button onClick={() => navigate('/syllabus-upload')}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
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
    <div
      className="container w-full mx-auto flex flex-col justify-center items-center min-h-screen py-8"
      style={{
        backgroundColor: "#f8f9fa",
        backgroundImage: `
          radial-gradient(circle at center, rgba(255,255,255,0) 0%, white 95%),
          repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 25px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 25px)
        `,
        backgroundSize: "cover, 25px 25px, 25px 25px",
      }}
    >
      <Card className="max-w-xl w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] mx-auto shadow-lg rounded-2xl overflow-hidden bg-white border border-gray-100">
        <CardContent className="p-6">
          <h1 className="text-2xl font-extrabold mb-3 text-center flex items-center justify-center gap-2 text-gray-800">
            <FileText className="h-5 w-5 text-blue-600" />
            Syllabus Analysis Results
          </h1>
          <p className="text-center text-gray-600 text-sm font-medium mb-5">
            Here's what we found in your syllabus
          </p>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Important Dates
              </h2>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-2">
                  {extractedDates.map((date, index) => (
                    <div key={index} className="flex items-start mb-2 p-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
                      <div className="w-0.5 self-stretch bg-white/80 rounded-full mr-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{date.description}</p>
                        <p className="text-xs text-blue-100">{date.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="bg-white transition-all hover:bg-blue-50 text-blue-600 hover:text-blue-700 px-4 py-2 text-sm font-medium shadow-sm hover:shadow transform hover:scale-105 border border-blue-300"
              >
                Go back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 