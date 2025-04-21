import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

interface BreakdownItem {
  component: string;
  weight: string; // Expecting weight as a string like "25%"
}

interface AssessmentBreakdownChartProps {
  data: BreakdownItem[];
  bgColor?: string; // Optional theme color for consistency
}

// Define a set of visually distinct colors for the chart
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#8dd1e1',
];

const AssessmentBreakdownChart: React.FC<AssessmentBreakdownChartProps> = ({
  data = [],
  bgColor = '#3b82f6',
}) => {
  const { isDarkMode } = useTheme();

  const chartData = data
    .map(item => {
      const weightValue = parseFloat(item.weight.replace('%', ''));
      return {
        name: item.component,
        value: isNaN(weightValue) ? 0 : weightValue,
      };
    })
    .filter(item => item.value > 0); // Filter out items with invalid or zero weight

  if (!chartData || chartData.length === 0) {
    return (
      <div className={cn("text-center p-4", isDarkMode ? "text-gray-400" : "text-gray-600")}>
        No grading breakdown data available to display chart.
      </div>
    );
  }

  // Calculate total weight to check if it sums up to 100% (optional validation)
  const totalWeight = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn(
      'rounded-xl p-4 shadow-lg border flex flex-col font-sans', 
      isDarkMode ? 'bg-[#202020] border-gray-700' : 'bg-white border-gray-200'
    )}>
      <h3 className={cn(
        "text-xl font-semibold mb-2 font-sans",
        isDarkMode ? "text-white" : "text-gray-900"
      )}>
        Grading Breakdown
      </h3>
      {totalWeight !== 100 && (
         <p className={cn("text-xs mb-2", isDarkMode ? "text-yellow-400" : "text-yellow-600")}>
           Note: Weights add up to {totalWeight}%, not 100%.
         </p>
       )}
      <div className="flex-grow flex items-center justify-center"> {/* Center chart */}
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} // Optional label on slices
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value}%`, name]}
              contentStyle={{
                backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDarkMode ? '#555' : '#ccc',
                borderRadius: '8px',
                color: isDarkMode ? '#eee' : '#333',
              }}
            />
            <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssessmentBreakdownChart; 
