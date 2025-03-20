// web/routes/_user.syllabus-results.$id/Tabs/InstructorsTab.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Mail } from "lucide-react";
import { linkify, toTitleCase } from "@/components/syllabus/SubComponents";

interface Instructor {
  name?: string;
  email?: string;
  [key: string]: any;
}

interface InstructorsTabProps {
  instructors: Instructor[];
}

const InstructorsTab: React.FC<InstructorsTabProps> = ({ instructors }) => {
  if (!instructors || instructors.length === 0) return null;

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-3 text-primary text-4xl mb-1">
          <span className="text-5xl">👨‍🏫</span> Instructors
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {instructors.map((instructor: any, index: number) => {
            const instructorName =
              typeof instructor === "object"
                ? instructor.name || `Instructor ${index + 1}`
                : String(instructor);

            return (
              <div
                key={index}
                className=" border bg-card shadow-sm hover:shadow-lg transition-shadow duration-200 p-4"
              >
                <div className="flex flex-col">
                  {/* Top Row: Name and Rate My Professors */}
                  <div className="flex items-center justify-between mb-3">
                    {/* Instructor Name */}
                    {typeof instructor === "object" ? (
                      instructor.name && (
                        <h3 className="text-2xl font-bold break-words">
                          {instructor.name}
                        </h3>
                      )
                    ) : (
                      <h3 className="text-xl font-bold break-words">
                        {instructorName}
                      </h3>
                    )}
                    
                    {/* Rate My Professors Link */}
                    <a
                      href={`https://www.ratemyprofessors.com/search/professors?q=${encodeURIComponent(
                        (instructorName || "").trim()
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on Rate My Professors"
                      className="p-2 rounded-full border border-gray-100 hover:bg-gray-200 transition-colors duration-200"
                      aria-label="View on Rate My Professors"
                    >
                      <img
                        src="https://www.ratemyprofessors.com/assets/big_rmp_logo_black-BmJHnK61.svg"
                        alt="Rate My Professors"
                        className="h-6 w-auto hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement!;
                          parent.innerHTML = "<span class='font-bold text-xs px-1'>RMP</span>";
                          parent.classList.add("bg-gray-50");
                        }}
                      />
                    </a>
                  </div>

                  {/* Instructor Details */}
                  {typeof instructor === "object" && (
                    <div className="space-y-1">
                      {Object.entries(instructor)
                        .filter(([key]) => {
                          // Exclude name and any fields containing RMP-related terms
                          const rmpTerms = ['ratemyprof', 'rate my prof', 'rmp', 'rate professor'];
                          return key !== "name" && !rmpTerms.some(term => key.toLowerCase().includes(term));
                        })
                        .map(([key, value]) => {
                          const isEmail = key.toLowerCase().includes("email");
                          return (
                            <p
                              key={key}
                              className="text-sm text-gray-700 break-words flex items-center"
                            >
                              <span className="font-semibold">
                                {toTitleCase(key)}: &nbsp;
                              </span>
                              <span className="flex-1">
                                {isEmail && typeof value === "string" ? (
                                  <a
                                    href={`mailto:${value}`}
                                    className="text-purple-500 hover:underline"
                                  >
                                    {value}
                                  </a>
                                ) : typeof value === "string" ? (
                                  linkify(value)
                                ) : (
                                  String(value)
                                )}
                              </span>
                            </p>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructorsTab;
