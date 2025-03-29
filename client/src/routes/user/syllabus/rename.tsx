import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { Syllabus } from "@/types/syllabus";

export default function RenameSyllabus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalTitle, setOriginalTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the original title when the component mounts
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const syllabus = await api.syllabus.getById(id!);
        setOriginalTitle(syllabus.title);
        setTitle(syllabus.title);
      } catch (error) {
        console.error("Error fetching syllabus:", error);
        toast.error("Failed to load syllabus details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSyllabus();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    
    if (!trimmedTitle) {
      toast.error("Please enter a title");
      return;
    }

    console.log("Submitting title:", {
      originalTitle,
      newTitle: trimmedTitle,
      id
    });
    
    setIsSubmitting(true);
    try {
      const result = await api.syllabus.update(id!, { title: trimmedTitle });
      console.log("Update successful:", result);
      toast.success("Syllabus renamed successfully");
      navigate(`/user/syllabus-results/${id}`);
    } catch (error: any) {
      console.error("Error renaming syllabus:", {
        error,
        title: trimmedTitle,
        id,
        errorMessage: error.message
      });
      toast.error(`Error renaming syllabus: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

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
            <Edit className="h-5 w-5 text-blue-600" />
            Name Your Syllabus
          </h1>
          <p className="text-center text-gray-600 text-sm font-medium mb-6">
            Give your syllabus a custom name to help you identify it easily
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter syllabus name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {originalTitle && (
                <p className="text-sm text-gray-500 text-center">
                  Original name: {originalTitle}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Name"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
