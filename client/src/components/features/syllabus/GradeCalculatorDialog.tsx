import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Assessment {
  name: string;
  weight: number;
  grade: number;
}

interface GradeCalculatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assessments: Array<{
    name: string;
    weight: number;
  }>;
}

export function GradeCalculatorDialog({
  isOpen,
  onClose,
  assessments,
}: GradeCalculatorDialogProps) {
  const [assessmentGrades, setAssessmentGrades] = useState<Assessment[]>(
    assessments.map((assessment) => ({
      name: assessment.name,
      weight: assessment.weight,
      grade: 0,
    }))
  );

  const calculateFinalGrade = () => {
    const totalWeight = assessmentGrades.reduce(
      (sum, assessment) => sum + assessment.weight,
      0
    );
    const weightedSum = assessmentGrades.reduce(
      (sum, assessment) => sum + (assessment.grade * assessment.weight) / 100,
      0
    );
    return (weightedSum / totalWeight) * 100;
  };

  const handleGradeChange = (index: number, value: string) => {
    const newGrades = [...assessmentGrades];
    newGrades[index].grade = parseFloat(value) || 0;
    setAssessmentGrades(newGrades);
  };

  const handleSubmit = () => {
    const finalGrade = calculateFinalGrade();
    toast.success(`Your calculated grade is: ${finalGrade.toFixed(2)}%`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Grade Calculator</DialogTitle>
          <DialogDescription>
            Enter your grades for each assessment to calculate your final grade.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {assessmentGrades.map((assessment, index) => (
            <div key={index} className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor={`grade-${index}`}
                className="text-right col-span-2"
              >
                {assessment.name} ({assessment.weight}%)
              </Label>
              <Input
                id={`grade-${index}`}
                type="number"
                min="0"
                max="100"
                value={assessment.grade}
                onChange={(e) => handleGradeChange(index, e.target.value)}
                className="col-span-2"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Calculate</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
