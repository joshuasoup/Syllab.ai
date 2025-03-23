// web/routes/_user.syllabus-results.$id/SyllabusHeader.tsx

import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "./SyllabusHelpers";

interface SyllabusHeaderProps {
  title: string;
  fileUrl?: string | null;
  updatedAt?: string | Date | null;
  icsContent?: string | null;
  onDownloadCalendar?: () => void;
}

const SyllabusHeader: React.FC<SyllabusHeaderProps> = ({
  title,
  fileUrl,
  updatedAt,
  icsContent,
  onDownloadCalendar,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-xl shadow-lg">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Button
              asChild
              variant="outline"
              className="bg-white/20 hover:bg-white/30 border-white/30 text-white transition-all duration-300"
            >
              <Link to="/syllabus-upload">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">{title}</h1>
          <p className="text-white/80">
            Processed on {formatDate(updatedAt)}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          {fileUrl && (
            <Button
              asChild
              className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
            >
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </Button>
          )}
          {icsContent && (
            <Button
              className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              onClick={onDownloadCalendar}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Add to Calendar
            </Button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default SyllabusHeader;
