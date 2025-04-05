import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calculator } from 'lucide-react';
import { toast } from 'sonner';
import type { Syllabus } from '@/types/syllabus';

interface GradeCalculatorProps {
  className?: string;
  syllabus: Syllabus | null;
}

export const GradeCalculator: React.FC<GradeCalculatorProps> = ({
  className,
  syllabus,
}) => {
  // Initialize grades state with empty values for each assessment
  const [grades, setGrades] = useState<Record<string, string>>(() => {
    if (!syllabus?.highlights?.assessments) return {};

    return syllabus.highlights.assessments.reduce((acc, assessment) => {
      acc[assessment.name] = '';
      return acc;
    }, {} as Record<string, string>);
  });

  const [averageGrade, setAverageGrade] = useState<number | null>(null);

  const calculateAverage = (grades: Record<string, string>) => {
    console.log('Calculating average with grades:', grades);

    const validGrades = Object.entries(grades)
      .map(([name, grade]) => {
        const assessment = syllabus?.highlights?.assessments?.find(
          (a) => a.name === name
        );
        // Extract just the numeric weight value from the string
        const weightStr = String(assessment?.weight?.[0] || '0');
        const weightMatch = weightStr.match(/(\d+)%/);
        const weight = weightMatch ? parseFloat(weightMatch[1]) : 0;

        const gradeValue = parseFloat(grade);

        console.log(`Processing grade for ${name}:`, {
          gradeValue,
          weight,
          isValid: !isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= 100,
        });

        return !isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= 100
          ? { grade: gradeValue, weight }
          : null;
      })
      .filter(
        (grade): grade is { grade: number; weight: number } => grade !== null
      );

    console.log('Valid grades after filtering:', validGrades);

    if (validGrades.length === 0) {
      console.log('No valid grades found');
      return null;
    }

    const totalWeight = validGrades.reduce(
      (sum, { weight }) => sum + weight,
      0
    );
    const weightedSum = validGrades.reduce(
      (sum, { grade, weight }) => sum + grade * weight,
      0
    );

    console.log('Calculation details:', {
      totalWeight,
      weightedSum,
      finalAverage: totalWeight > 0 ? weightedSum / totalWeight : null,
    });

    return totalWeight > 0 ? weightedSum / totalWeight : null;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 85) return 'text-green-500';
    if (grade >= 80) return 'text-green-400';
    if (grade >= 77) return 'text-blue-500';
    if (grade >= 73) return 'text-blue-400';
    if (grade >= 70) return 'text-blue-300';
    if (grade >= 67) return 'text-yellow-500';
    if (grade >= 63) return 'text-yellow-400';
    if (grade >= 60) return 'text-yellow-300';
    if (grade >= 57) return 'text-orange-500';
    if (grade >= 53) return 'text-orange-400';
    if (grade >= 50) return 'text-orange-300';
    return 'text-red-600';
  };

  const getGradeLetter = (grade: number) => {
    if (grade >= 90) return 'A+';
    if (grade >= 85) return 'A';
    if (grade >= 80) return 'A-';
    if (grade >= 77) return 'B+';
    if (grade >= 73) return 'B';
    if (grade >= 70) return 'B-';
    if (grade >= 67) return 'C+';
    if (grade >= 63) return 'C';
    if (grade >= 60) return 'C-';
    if (grade >= 57) return 'D+';
    if (grade >= 53) return 'D';
    if (grade >= 50) return 'D-';
    return 'F';
  };

  const getGPA = (grade: number) => {
    if (grade >= 90) return 4.0;
    if (grade >= 85) return 4.0;
    if (grade >= 80) return 3.7;
    if (grade >= 77) return 3.3;
    if (grade >= 73) return 3.0;
    if (grade >= 70) return 2.7;
    if (grade >= 67) return 2.3;
    if (grade >= 63) return 2.0;
    if (grade >= 60) return 1.7;
    if (grade >= 57) return 1.3;
    if (grade >= 53) return 1.0;
    if (grade >= 50) return 0.7;
    return 0.0;
  };

  const getGradeDescription = (grade: number) => {
    if (grade >= 90) return 'Perfect!!! 🎉';
    if (grade >= 85) return 'Outstanding! 🌟';
    if (grade >= 80) return 'Excellent work! ⭐';
    if (grade >= 77) return 'Great job! 👍';
    if (grade >= 73) return 'Well done! 👏';
    if (grade >= 70) return 'Good effort! 💪';
    if (grade >= 67) return "You're getting there! Keep going! 🚀";
    if (grade >= 63) return 'Making progress! The A+ is in reach! 🚀';
    if (grade >= 60) return 'Keep Working! You got this! 💪';
    if (grade >= 57) return 'Not bad! You can do better! 🔥';
    if (grade >= 53) return 'Keep trying! 💫';
    if (grade >= 50) return "Don't give up! Keep going! 🌱";
    return "Don't give up! You'll get there! 💪";
  };

  const handleGradeChange = (assessmentName: string, value: string) => {
    // Only allow numbers and decimal points
    if (/^\d*\.?\d*$/.test(value)) {
      setGrades((prev) => ({
        ...prev,
        [assessmentName]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit handler called with grades:', grades);

    // Validate grades
    const isValid = Object.entries(grades).every(([name, grade]) => {
      const num = parseFloat(grade);
      const isValid = grade === '' || (!isNaN(num) && num >= 0 && num <= 100);
      console.log(`Validating grade for ${name}:`, { grade, isValid });
      return isValid;
    });

    if (!isValid) {
      console.log('Validation failed');
      toast.error('Please enter valid grades between 0 and 100');
      return;
    }

    const average = calculateAverage(grades);
    console.log('Calculated average:', average);
    setAverageGrade(average);

    if (average !== null) {
      toast.success(`Average grade calculated: ${average.toFixed(1)}%`);
    } else {
      toast.error('Could not calculate average. Please check your inputs.');
    }
  };

  if (!syllabus?.highlights?.assessments?.length) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap text-sm ${className}`}
        >
          <Calculator className="w-4 h-4 flex-shrink-0 text-blue-500" />
          <span className="font-medium text-gray-900">Grade Calculator</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="bottom">
        <div className="space-y-4">
          <h4 className="font-bold text-lg text-gray-900">Grade Calculator</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            {syllabus.highlights.assessments.map((assessment) => (
              <div key={assessment.name}>
                <label
                  htmlFor={assessment.name}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {assessment.name}
                  {assessment.weight?.[0] && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({String(assessment.weight[0]).replace(/%+/g, '%')})
                    </span>
                  )}
                </label>
                <Input
                  id={assessment.name}
                  value={grades[assessment.name] || ''}
                  onChange={(e) =>
                    handleGradeChange(assessment.name, e.target.value)
                  }
                  placeholder="Enter grade (0-100)"
                />
                {assessment.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {assessment.description}
                  </p>
                )}
              </div>
            ))}
            {averageGrade !== null && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${getGradeColor(
                      averageGrade
                    )}`}
                  >
                    {averageGrade.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Grade: {getGradeLetter(averageGrade)}
                  </div>
                  <div className="text-sm text-gray-600">
                    GPA: {getGPA(averageGrade).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getGradeDescription(averageGrade)}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="submit">Calculate</Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
};
