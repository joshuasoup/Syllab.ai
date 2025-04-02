// web/routes/_user.syllabus-results.$id/SyllabusHeader.tsx

import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
  const { id } = useParams();

  return (
    <div className="relative">
      {/* Header */}
      <div className="relative shadow-sm bg-white">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  asChild
                  variant="outline"
                  className="transition-all duration-300 flex-shrink-0"
                >
                  <Link to="/syllabus-upload" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Dashboard</span>
                  </Link>
                </Button>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-900 break-words pr-4">
                {title.replace(/\.pdf$/i, '')}
              </h1>
              <p className="text-gray-500">
                Processed on {formatDate(updatedAt)}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2 flex-shrink-0">
              {fileUrl && (
                <Button
                  asChild
                  className="transition-all duration-300 font-medium whitespace-nowrap"
                >
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
              )}
              {icsContent && (
                <Button
                  className="transition-all duration-300 font-medium whitespace-nowrap"
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
    </div>
  );
};

export default SyllabusHeader;
