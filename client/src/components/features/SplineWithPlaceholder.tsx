import { useState } from 'react';
import Spline from '@splinetool/react-spline';

interface SplineWithPlaceholderProps {
  scene: string;
}

export function SplineWithPlaceholder({ scene }: SplineWithPlaceholderProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      {/* LOADING OVERLAY – shows while Spline is fetching assets */}
      <div
        className={`absolute inset-0 flex items-center justify-center 
          bg-gray-50/30 rounded-lg backdrop-blur-sm transition-all duration-1000 ease-in-out
          ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4 
                         border-b-gray-200 border-l-gray-200 border-r-gray-200" />
          <p className="text-slate-500">Loading 3D element...</p>
        </div>
      </div>

      {/* SPLINE CANVAS – fades and "scales" in once loaded */}
      <div
        className={`
          transition-all duration-1000 ease-in-out transform 
          ${isLoading ? 'opacity-0 scale-98' : 'opacity-100 scale-100'}
        `}
        style={{ willChange: 'opacity, transform' }}
      >
        <Spline
          scene={scene}
          onLoad={() => {
            // Longer delay to ensure smoother transition after Spline is fully rendered
            setTimeout(() => {
              setIsLoading(false);
            }, 800);
          }}
        />
      </div>
    </div>
  );
}
