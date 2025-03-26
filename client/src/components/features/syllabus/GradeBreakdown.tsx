import React from "react";
import type { Assessment } from "@/types/syllabus";

interface GradeBreakdownProps {
  assessments: Assessment[];
}

export function GradeBreakdown({ assessments }: GradeBreakdownProps) {
  const totalWeight = assessments.reduce((sum, assessment) => 
    sum + (assessment.weight?.[0] || 0), 0);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Grade Breakdown</h3>
      {assessments.length > 0 ? (
        <div className="space-y-3">
          {assessments.map((assessment, index) => (
            <div key={index} className="border-2 border-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">
                  {`${assessment.name} ${assessment.num_submissions?.[0] ? `(${assessment.num_submissions[0]} submissions)` : ''}`}
                </div>
                <div className="text-sm text-gray-500">
                  {assessment.weight?.[0] ? `${assessment.weight[0]}%` : 'Weight not specified'}
                </div>
              </div>
            </div>
          ))}
          {totalWeight > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="font-medium">Total Weight: {totalWeight}%</div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 italic">No grade breakdown available</div>
      )}
    </div>
  );
} 