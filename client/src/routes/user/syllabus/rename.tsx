import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { Syllabus } from "@/types/syllabus";
import { eventEmitter } from "@/utils/eventEmitter";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export default function RenameSyllabus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
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
      if (result && result.title) {
        // Emit the syllabusUpdated event with the updated syllabus
        eventEmitter.emit('syllabusUpdated', {
          ...result,
          id: id!, // Ensure ID is included
          title: trimmedTitle // Ensure we use the trimmed title
        });
        toast.success("Syllabus renamed successfully");
        
        // Add a small delay before navigation to ensure the event is processed
        setTimeout(() => {
          navigate(`/user/syllabus-results/${id}`);
        }, 100);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Error renaming syllabus:", {
        error,
        title: trimmedTitle,
        id,
        errorMessage: error.message
      });
      if (error.message?.includes('401')) {
        toast.error("Your session has expired. Please sign in again.");
        navigate('/auth/sign-in');
      } else if (error.message?.includes('404')) {
        toast.error("Syllabus not found. It may have been deleted.");
        navigate('/user');
      } else {
        toast.error(error.message || "Failed to rename syllabus");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDarkMode ? "bg-[#191919]" : "bg-white"
      )}>
        <div className={cn(
          "animate-pulse",
          isDarkMode ? "text-gray-200" : "text-primary"
        )}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      isDarkMode ? "bg-[#191919]" : "bg-white"
    )}>
      <Card className={cn(
        "w-full max-w-md",
        isDarkMode ? "bg-[#202020] border-gray-700" : "bg-white border-gray-200"
      )}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2">
              <FileText className={cn(
                "h-6 w-6",
                isDarkMode ? "text-gray-200" : "text-gray-800"
              )} />
              <h2 className={cn(
                "text-xl font-semibold",
                isDarkMode ? "text-gray-200" : "text-gray-800"
              )}>Rename Syllabus</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter syllabus name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn(
                      "w-full pl-10 pr-4 py-2 text-base rounded-lg transition-all",
                      isDarkMode 
                        ? "bg-[#202020] border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        : "border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    )}
                    autoFocus
                  />
                  <FileText className={cn(
                    "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5",
                    isDarkMode ? "text-gray-400" : "text-gray-400"
                  )} />
                </div>
                {originalTitle && (
                  <p className={cn(
                    "text-sm text-center",
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Original name: {originalTitle}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02]",
                  isDarkMode 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
