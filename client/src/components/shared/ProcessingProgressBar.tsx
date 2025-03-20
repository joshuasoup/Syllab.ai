import { cn } from "@/lib/utils";
import { FC } from "react";

export interface ProcessingProgressBarProps {
  progress: number;
  stage?: string;
  className?: string;
}

export const ProcessingProgressBar: FC<ProcessingProgressBarProps> = ({
  progress,
  stage,
  className
}) => {
  // Ensure progress is between 0-100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 w-full rounded-full overflow-hidden relative bg-gray-200">
        <div
          className="h-full transition-all duration-500 ease-in-out relative bg-[#0066FF]"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Wave overlay - very subtle */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 left-0 bottom-0 opacity-10 animate-wave">
              <svg className="absolute w-full h-12 top-[-200%]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M0,0 C300,30 600,100 1200,30 L1200,120 L0,120 Z" className="fill-white"></path>
              </svg>
            </div>
            <div className="absolute top-0 right-0 left-0 bottom-0 opacity-10 animate-wave-reverse">
              <svg className="absolute w-full h-12 top-[-160%]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M0,30 C300,0 600,60 1200,0 L1200,120 L0,120 Z" className="fill-white"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      {stage && (
        <div className="mt-2 text-sm text-gray-600 font-medium">{stage}</div>
      )}
    </div>
  );
};

export default ProcessingProgressBar;

// Add these animations to your global CSS or tailwind.config.js
// @keyframes wave {
//   0% { transform: translateX(-100%) }
//   100% { transform: translateX(100%) }
// }
// @keyframes wave-reverse {
//   0% { transform: translateX(100%) }
//   100% { transform: translateX(-100%) }
// }

// In tailwind.config.js:
// extend: {
//   animation: {
//     'wave': 'wave 7s linear infinite',
//     'wave-reverse': 'wave-reverse 9s linear infinite',
//   }
// }