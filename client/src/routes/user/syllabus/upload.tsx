import React, { useState, useRef, DragEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAction } from "@/hooks/useAction";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUp, Loader2, Calendar, Upload, X, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Progress } from "@/components/ui/progress";
import type { Syllabus, Assessment, Deadline } from "@/types/syllabus";
import { eventEmitter } from "../../../utils/eventEmitter";
import { useTheme } from "@/hooks/use-theme";

interface ProcessingProgressBarProps {
  progress: number;
  stage: string;
}

function ProcessingProgressBar({ progress, stage }: ProcessingProgressBarProps) {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className={cn(
          "text-sm font-medium",
          isDarkMode ? "text-gray-300" : "text-gray-700"
        )}>{stage}</span>
        <span className={cn(
          "text-sm font-medium",
          isDarkMode ? "text-gray-300" : "text-gray-700"
        )}>{progress}%</span>
      </div>
      <Progress 
        value={progress} 
        className={cn(
          "w-full",
          isDarkMode ? "bg-gray-700" : ""
        )} 
      />
    </div>
  );
}

export default function SyllabusUpload() {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState<string>("");
  const [importantDates, setImportantDates] = useState<
    Array<{ date: string; description: string; }>
  >([]);
  const [showDates, setShowDates] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [{ fetching: uploadFetching, error: uploadError }, uploadSyllabus] = useAction<File, Syllabus>(
    async (file: File) => {
      const result = await api.syllabus.upload(file);
      return result;
    }
  );

  const [{ fetching: processingFetching, error: processingError }, processSyllabus] = useAction<string, Syllabus>(
    async (id: string) => {
      const result = await api.syllabus.process(id);
      return result;
    }
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        setFile(null);
        return;
      }
      setFile(selected);
      setTitle(selected.name);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      setFile(droppedFile);
      setTitle(droppedFile.name);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const [isHovering, setIsHovering] = useState(false);

  const DateItem = ({ date, description }: { date: string; description: string; }) => {
    const { isDarkMode } = useTheme();
    
    return (
      <div className={cn(
        "flex items-start mb-2 p-2 rounded-md shadow-sm",
        isDarkMode 
          ? "bg-blue-900/30 border border-blue-800/30" 
          : "bg-gradient-to-r from-blue-500 to-blue-600"
      )}>
        <div className={cn(
          "w-0.5 self-stretch rounded-full mr-2",
          isDarkMode ? "bg-blue-400/50" : "bg-white/80"
        )}></div>
        <div className="flex-1">
          <p className={cn(
            "font-medium text-sm",
            isDarkMode ? "text-blue-200" : "text-white"
          )}>{description}</p>
          <p className={cn(
            "text-xs",
            isDarkMode ? "text-blue-300/80" : "text-blue-100"
          )}>{date}</p>
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }
    setIsSubmitting(true);
    setProgress(0);
    setProcessingStage("Uploading");
    
    try {
      const result = await uploadSyllabus(file);

      if (result?.id) {
        const syllabusId = result.id;
        toast.success("Syllabus uploaded! Now processing...");
        
        setProgress(30);
        setProcessingStage("Extracting text");
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setProgress(60);
        setProcessingStage("Analyzing content");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const processed = await processSyllabus(syllabusId);
        
        setProgress(100);
        setProcessingStage("Processing complete");

        // Emit the event to notify other components
        eventEmitter.emit("syllabusAdded");


        const extractedDates: Array<{ date: string; description: string; }> = [];
        if (processed?.highlights) {
          const highlights = processed.highlights;
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

        setImportantDates(extractedDates);
        setShowDates(true);
        setTimeout(() => {
          navigate(`/user/syllabus/rename/${syllabusId}`);
        }, 3000);
      } else {
        toast.error("Failed to create syllabus record");
        setIsSubmitting(false);
      }
    } catch (error: any) {
      toast.error(`Error processing syllabus: ${error.message || "Unknown error"}`);
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="container w-full mx-auto flex flex-col justify-center items-center min-h-screen py-8"
      style={{
        backgroundColor: isDarkMode ? "#191919" : "#f8f9fa",
        backgroundImage: isDarkMode 
          ? `
            radial-gradient(circle at center, rgba(0,0,0,0) 0%, #191919 95%),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 25px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 25px)
          `
          : `
            radial-gradient(circle at center, rgba(255,255,255,0) 0%, white 95%),
            repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 25px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 25px)
          `,
        backgroundSize: "cover, 25px 25px, 25px 25px",
      }}
    >
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={cn(
            "rounded-full",
            isDarkMode ? "text-blue-400 hover:bg-blue-900/20" : "text-blue-600 hover:bg-blue-50"
          )}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Card className={cn(
        "max-w-xl w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] mx-auto shadow-lg rounded-2xl overflow-hidden",
        isDarkMode ? "bg-[#202020] border-gray-700" : "bg-white border-gray-100"
      )}>
        <CardContent
          className={cn(
            isDragging ? "p-6" : "p-6 rounded-lg",
            isDarkMode ? "bg-[#202020]" : "bg-white"
          )}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <h1 className={cn(
            "text-2xl font-extrabold mb-3 text-center flex items-center justify-center gap-2",
            isDarkMode ? "text-white" : "text-gray-800"
          )}>
            <Upload className={cn(
              "h-5 w-5",
              isDarkMode ? "text-blue-400" : "text-blue-600"
            )} />
            Upload Your Syllabus
          </h1>
          <p className={cn(
            "text-center text-sm font-medium mb-5",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            {isDragging ? "Drop your PDF file here" : "Drag & drop your PDF file here, or click to browse"}
          </p>
          <div className="flex justify-center items-center w-full mx-auto">
            <div
              className={cn(
                "flex flex-col items-center justify-center mb-5 p-6 min-h-[180px] w-full rounded-lg transition-all border-2 border-dashed",
                isDarkMode 
                  ? isDragging 
                    ? "border-blue-400 bg-blue-900/20" 
                    : "border-blue-500/30 bg-blue-900/10"
                  : isDragging 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-blue-300 bg-blue-50/50"
              )}
            >
              <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <div className="text-center mb-3">
                <FileUp className={cn(
                  "h-12 w-12 mx-auto mb-2 opacity-80",
                  isDarkMode ? "text-blue-400" : "text-blue-500"
                )} />
                <p className={cn(
                  "text-sm mb-4",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>PDF files only</p>
              </div>
              <Button
                onClick={handleChooseFile}
                variant="outline"
                className={cn(
                  "transition-all px-4 py-2 text-sm font-medium shadow-sm hover:shadow transform hover:scale-105",
                  isDarkMode 
                    ? "bg-[#202020] hover:bg-blue-900/20 text-blue-400 hover:text-blue-300 border-blue-500/30" 
                    : "bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border-blue-300"
                )}
              >
                {file ? "Change File" : "Select PDF File"}
              </Button>
              {file && (
                <div className={cn(
                  "mt-4 flex items-center px-3 py-2 rounded-md border",
                  isDarkMode 
                    ? "bg-blue-900/20 border-blue-500/30" 
                    : "bg-blue-50 border-blue-200"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    isDarkMode ? "bg-blue-400" : "bg-blue-500"
                  )}></div>
                  <p className={cn(
                    "text-sm font-medium truncate max-w-xs",
                    isDarkMode ? "text-blue-300" : "text-blue-700"
                  )}>{file.name}</p>
                </div>
              )}
            </div>
          </div>
          <div className="text-center mt-5 w-full">
            <button
              onClick={handleSubmit}
              disabled={!file || isSubmitting}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={cn(
                "relative overflow-hidden group",
                (!file || isSubmitting) && "opacity-60 cursor-not-allowed"
              )}
              style={{
                backgroundColor: "#0066FF",
                color: "white",
                fontWeight: "600",
                padding: "12px 24px",
                borderRadius: "6px",
                fontSize: "15px",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                transition: "all 0.2s ease",
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {processingStage}
                </>
              ) : (
                <>
                  <FileUp className="h-5 w-5 mr-2" />
                  Upload Syllabus
                </>
              )}
            </button>
          </div>

          {showDates && importantDates.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className={cn(
                  "h-5 w-5",
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                )} />
                <h2 className={cn(
                  "text-lg font-semibold",
                  isDarkMode ? "text-white" : "text-gray-800"
                )}>Important Dates</h2>
              </div>
              <ScrollArea className={cn(
                "h-[200px] w-full rounded-md border p-4",
                isDarkMode ? "border-gray-700" : ""
              )}>
                {importantDates.map((date, index) => (
                  <DateItem key={index} date={date.date} description={date.description} />
                ))}
              </ScrollArea>
            </div>
          )}

          {isSubmitting && (
            <div className="mt-6">
              <ProcessingProgressBar progress={progress} stage={processingStage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
