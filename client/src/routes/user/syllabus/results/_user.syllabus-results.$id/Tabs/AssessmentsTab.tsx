// web/routes/_user.syllabus-results.$id/Tabs/AssessmentsTab.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DateItem,
  GradeItem,
  extractDateFromText,
} from "@/components/features/syllabus/SubComponents";
import { getNumberedAssessmentName } from "../SyllabusHelpers";

// Function to format dates in the "Oct. 15, 2023" format
// showYear parameter controls whether to include the year in the output
const formatDate = (dateString: string, showYear: boolean = true): string => {
  if (!dateString) return "Date TBD";
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format date with or without year based on parameter
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    
    return showYear ? `${month}. ${day}, ${year}` : `${month}. ${day}`;
  } catch (error) {
    // If parsing fails, return the original string
    return dateString;
  }
};

// Function to get year from a date string
const getYearFromDate = (dateString: string): number | null => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date.getFullYear();
  } catch (error) {
    return null;
  }
};

// Function to group assessments by name
const groupAssessmentsByName = (assessments: any[]): Record<string, any[]> => {
  const groups: Record<string, any[]> = {};
  
  assessments.forEach((assessment: any, index: number) => {
    const name = getNumberedAssessmentName(assessments, index);
    
    if (!groups[name]) {
      groups[name] = [];
    }
    
    groups[name].push({
      originalIndex: index,
      assessment
    });
  });
  
  return groups;
};

interface AssessmentsTabProps {
  assessments: any[];
}

const AssessmentsTab: React.FC<AssessmentsTabProps> = ({ assessments }) => {
  if (!assessments || assessments.length === 0) return null;

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="flex items-center gap-2 text-primary text-2xl">
          <span className="text-3xl">📝</span> Assessments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-base font-semibold mb-2 text-blue-600 flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> Important Dates
            </h3>
            <div className="bg-blue-50/30 rounded-lg border border-blue-100/70 pl-0 flex relative">
              <div className="w-1 bg-blue-200/70 rounded-l-lg"></div>
              <div className="p-3 w-full">
                <div className="flex justify-between mb-1.5">
                  <h4 className="text-xs font-medium text-blue-500">Timeline</h4>
                  {(() => {
                    // Count items with dates or date-related keywords
                    const itemCount = assessments.filter((assessment: any) => {
                      if (typeof assessment === "string") {
                        return extractDateFromText(assessment) !== null || 
                          assessment.toLowerCase().includes("final") ||
                          assessment.toLowerCase().includes("exam") ||
                          assessment.toLowerCase().includes("due") ||
                          assessment.toLowerCase().includes("deadline");
                      }
                      
                      if (typeof assessment === "object") {
                        return assessment.due_date ||
                          assessment.date || 
                          (assessment.name && (
                            assessment.name.toLowerCase().includes("final") ||
                            assessment.name.toLowerCase().includes("exam") ||
                            assessment.name.toLowerCase().includes("due") ||
                            assessment.name.toLowerCase().includes("deadline")
                          )) ||
                          (assessment.description && extractDateFromText(assessment.description) !== null);
                      }
                      
                      return false;
                    }).length;
                    
                    return (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                    );
                  })()}
                </div>
                <ScrollArea className="h-[250px] pr-3 overflow-visible">
                  <div className="space-y-2">
                {(() => {
                  // Filter assessments with dates or date-related keywords
                  const filteredAssessments = assessments.filter((assessment: any) => {
                    if (typeof assessment === "string") {
                      // Check if string assessment contains date information
                      return (
                        extractDateFromText(assessment) !== null || 
                        assessment.toLowerCase().includes("final") ||
                        assessment.toLowerCase().includes("exam") ||
                        assessment.toLowerCase().includes("due") ||
                        assessment.toLowerCase().includes("deadline")
                      );
                    }
                    
                    if (typeof assessment === "object") {
                      // Check if object assessment has date property or date in description
                      return (
                        assessment.due_date ||
                        assessment.date || 
                        (assessment.name && (
                          assessment.name.toLowerCase().includes("final") ||
                          assessment.name.toLowerCase().includes("exam") ||
                          assessment.name.toLowerCase().includes("due") ||
                          assessment.name.toLowerCase().includes("deadline")
                        )) ||
                        (assessment.description && extractDateFromText(assessment.description) !== null)
                      );
                    }
                    
                    return false;
                  });
                  
                  // Group filtered assessments by name
                  const groupedAssessments: Record<string, any[]> = {};
                  
                  filteredAssessments.forEach((assessment: any) => {
                    const originalIndex = assessments.findIndex((a: any) => a === assessment);
                    const name = getNumberedAssessmentName(assessments, originalIndex);
                    
                    if (!groupedAssessments[name]) {
                      groupedAssessments[name] = [];
                    }
                    
                    groupedAssessments[name].push({
                      assessment,
                      originalIndex
                    });
                  });
                  
                  // Render grouped assessments
                  return Object.entries(groupedAssessments).map(([name, items], groupIndex) => {
                    // Collect all dates from all items in this group
                    let allDates: string[] = [];
                    let isApproximateDate = false;
                    let description = "";
                    
                    // Process each item to extract dates
                    items.forEach(({assessment}) => {
                      if (typeof assessment === "string") {
                        const extractedDate = extractDateFromText(assessment);
                        if (extractedDate) {
                          allDates.push(extractedDate);
                        }
                        isApproximateDate = isApproximateDate || 
                          assessment.toLowerCase().includes("approximately") || 
                          assessment.toLowerCase().includes("around") ||
                          assessment.toLowerCase().includes("about") ||
                          assessment.toLowerCase().includes("estimated");
                        
                        // Use the first item's description, or concatenate if needed
                        if (!description) {
                          description = assessment;
                        }
                      } else if (typeof assessment === "object") {
                        // Extract dates from object
                        if (assessment.due_date) {
                          if (Array.isArray(assessment.due_date)) {
                            allDates = [...allDates, ...assessment.due_date];
                          } else {
                            allDates.push(assessment.due_date);
                          }
                        } else if (assessment.date) {
                          if (Array.isArray(assessment.date)) {
                            allDates = [...allDates, ...assessment.date];
                          } else {
                            allDates.push(assessment.date);
                          }
                        } else if (assessment.description) {
                          const extractedDate = extractDateFromText(assessment.description);
                          if (extractedDate) {
                            allDates.push(extractedDate);
                          }
                        }
                        
                        const descText = assessment.description || "";
                        isApproximateDate = isApproximateDate || 
                          descText.toLowerCase().includes("approximately") || 
                          descText.toLowerCase().includes("around") ||
                          descText.toLowerCase().includes("about") ||
                          descText.toLowerCase().includes("estimated");
                        
                        // Use the first item's description, or concatenate if needed
                        if (!description && assessment.description) {
                          description = assessment.description;
                        }
                      }
                    });
                    
                    // Format dates for reference, but we'll display them differently now
                    let formattedDates = null;
                    if (allDates.length > 0) {
                      if (allDates.length === 1) {
                        // For single dates, we'll display in the header so just keep reference
                        formattedDates = null;
                      } else {
                        // For multiple dates, we'll display each directly in the container
                        formattedDates = allDates;
                      }
                    }
                    
                    // Create card layout for each assessment type
                    return (
                      <div 
                        key={`group-${groupIndex}`}
                        className="bg-blue-100/50 transition-transform duration-200 hover:bg-blue-100/80 hover:-translate-y-0.5 hover:shadow-sm p-2 rounded-md flex items-center"
                      >
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-black font-semibold">{name}</div>
                            {allDates.length === 1 && (
                              <div className="text-sm text-gray-400">
                                {formatDate(allDates[0], true)}
                                {isApproximateDate && <span className="text-xs ml-1">(Approximate)</span>}
                              </div>
                            )}
                          </div>
                          {allDates.length === 0 ? (
                            <div className="text-sm text-gray-400">
                              Date TBD {isApproximateDate && <span className="text-xs">(Approximate)</span>}
                            </div>
                          ) : (
                            <>
                              {allDates.length > 1 && (
                                <div className="flex justify-between items-start mt-1">
                                  <div className="text-xs text-gray-400">
                                    {isApproximateDate && "(Approximate dates)"}
                                  </div>
                                  <div className="flex flex-col items-end">
                                    {allDates.map((date, index) => (
                                      <div 
                                        key={`date-${index}`} 
                                        className="text-sm text-gray-400 py-1.5 mb-1 border-b border-blue-50 last:border-b-0 last:mb-0"
                                      >
                                        {formatDate(date, true)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          {description && (
                            <div className="text-xs text-gray-600 mt-1 line-clamp-3">{description}</div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
                  </div>
                </ScrollArea>
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-blue-50/30 to-transparent pointer-events-none" style={{ borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}></div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-2 text-purple-600 flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Grade Breakdown
            </h3>
            <div className="bg-purple-50/30 rounded-lg border border-purple-100/70 pl-0 flex relative">
              <div className="w-1 bg-purple-200/70 rounded-l-lg"></div>
              <div className="p-3 w-full">
                <div className="flex justify-between mb-1.5">
                  <h4 className="text-xs font-medium text-purple-500">Grade Components</h4>
                  {(() => {
                    // Count items with grade weights
                    const hasGradeWeights = assessments.some((a: any) => typeof a === "object" && a.weight);
                    const groupedAssessments = groupAssessmentsByName(assessments);
                    const itemCount = Object.keys(groupedAssessments).length;
                    
                    return (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                    );
                  })()}
                </div>
                <ScrollArea className="h-[250px] pr-3">
                  <div className="space-y-2">
                {(() => {
                  // Group assessments by name first
                  const groupedAssessments = groupAssessmentsByName(assessments);
                  
                  return Object.entries(groupedAssessments).map(([name, items], groupIndex) => {
                    // Find the weight from any item in the group (prefer the first one with a weight)
                    let weight = undefined;
                    let description = null;
                    
                    for (const { assessment } of items) {
                      if (typeof assessment === "object") {
                        if (assessment.weight && weight === undefined) {
                          weight = assessment.weight;
                        }
                        if (assessment.description && description === null) {
                          description = assessment.description;
                        }
                        // If we found both weight and description, we can stop looking
                        if (weight !== undefined && description !== null) break;
                      }
                    }
                    
                    return (
                      <div 
                        key={`group-${groupIndex}`}
                        className="bg-purple-100/50 transition-transform duration-200 hover:bg-purple-100/80 hover:-translate-y-0.5 hover:shadow-sm p-2 rounded-md flex items-center"
                      >
                        <GradeItem
                          name={name}
                          weight={weight}
                          description={description}
                        />
                      </div>
                    );
                  });
                })()}
                {/* If no grade weights found */}
                {!assessments.some(
                  (a: any) => typeof a === "object" && a.weight
                ) && (
                  <div className="text-center py-6 text-muted-foreground bg-purple-50/20 rounded-md">
                    <FileText className="h-8 w-8 mx-auto text-purple-200 mb-1.5" />
                    <p className="text-sm">No specific grade weights found in syllabus.</p>
                  </div>
                )}
                  </div>
                </ScrollArea>
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-purple-50/30 to-transparent pointer-events-none" style={{ borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentsTab;
