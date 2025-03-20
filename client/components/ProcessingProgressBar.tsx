import { Progress } from "@/components/ui/progress";

interface ProcessingProgressBarProps {
  progress: number;
  stage: string;
}

export function ProcessingProgressBar({ progress, stage }: ProcessingProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{stage}</span>
        <span className="text-sm font-medium text-gray-700">{progress}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
} 