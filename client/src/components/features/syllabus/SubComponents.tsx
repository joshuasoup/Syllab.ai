import React from "react";
import { cn } from "@/lib/utils";

// Helper Functions

/**
 * Extracts percentage from text
 */
export const extractPercentage = (text: string): string | null => {
  const match = text.match(/(\d+)%/);
  return match ? match[1] + "%" : null;
};

/**
 * Extracts date from text using regex
 */
export const extractDateFromText = (text: string): { date: string; isApproximate: boolean } | null => {
  // Match patterns like "January 1", "Jan 1", "Jan. 1", "1st of January", etc.
  const monthNames = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
    "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec"
  ];
  
  const monthPattern = monthNames.join("|");
  const dateRegex = new RegExp(`(${monthPattern})\\s+(\\d+)|(\\d+)(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${monthPattern})`, "i");
  
  const match = text.match(dateRegex);
  if (!match) return null;
  
  let month, day;
  if (match[1] && match[2]) {
    // Format: Month Day
    month = match[1].toLowerCase();
    day = parseInt(match[2]);
  } else if (match[3] && match[4]) {
    // Format: Day Month
    month = match[4].toLowerCase();
    day = parseInt(match[3]);
  } else {
    return null;
  }
  
  // Convert month name to month number (0-11)
  let monthNum;
  if (month.startsWith("jan")) monthNum = 0;
  else if (month.startsWith("feb")) monthNum = 1;
  else if (month.startsWith("mar")) monthNum = 2;
  else if (month.startsWith("apr")) monthNum = 3;
  else if (month.startsWith("may")) monthNum = 4;
  else if (month.startsWith("jun")) monthNum = 5;
  else if (month.startsWith("jul")) monthNum = 6;
  else if (month.startsWith("aug")) monthNum = 7;
  else if (month.startsWith("sep")) monthNum = 8;
  else if (month.startsWith("oct")) monthNum = 9;
  else if (month.startsWith("nov")) monthNum = 10;
  else if (month.startsWith("dec")) monthNum = 11;
  else return null;
  
  // Create date (use current year as default)
  const dateObj = new Date();
  dateObj.setMonth(monthNum);
  dateObj.setDate(day);
  
  // Format the date string using the formatDateWithOrdinal function
  const formattedDate = formatDateWithOrdinal(dateObj);
  
  // Return the object with date string and isApproximate flag
  return {
    date: formattedDate,
    isApproximate: false // Default to false as we don't have logic to determine approximation
  };
};

/**
 * Gets ordinal suffix for a number (e.g., 1st, 2nd, 3rd)
 */
export const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

/**
 * Formats date with ordinal suffix and abbreviated month (e.g., Oct. 15th, 2023)
 */
export const formatDateWithOrdinal = (date: Date): string => {
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const year = date.getFullYear();
  
  // Get month abbreviation and add period
  const month = date.toLocaleDateString('en-US', { month: 'short' }).replace(/\.?$/, '.');
  
  return `${month} ${day}${suffix}, ${year}`;
};

/**
 * Checks if a string is a website field (contains URL pattern)
 */
export const isWebsiteField = (text: string): boolean => {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+\.(com|org|edu|net))/i;
  return urlRegex.test(text);
};

/**
 * Converts text to title case, replacing underscores with spaces
 */
export const toTitleCase = (text: string): string => {
  return text
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Converts URLs in text to clickable links
 */
export const linkify = (text: string): React.ReactNode => {
  if (!text) return "";
  
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+\.(com|org|edu|net)[^\s]*)/gi;
  const parts = text.split(urlRegex);
  
  return (
    <>
      {parts.map((part, i) => {
        if (urlRegex.test(part)) {
          let href = part;
          if (!href.match(/^https?:\/\//i)) {
            href = "http://" + href;
          }
          return (
            <a 
              key={i}
              href={href} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {part}
            </a>
          );
        } else {
          return part;
        }
      })}
    </>
  );
};

// Component Interfaces

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

interface SubSectionProps {
  title: string;
  content: string | React.ReactNode;
  className?: string;
}

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

interface TimelineItemProps {
  date: string;
  title: string;
  description?: string;
  percentage?: string | null;
  isApproximate?: boolean;
  className?: string;
}

interface DateItemProps {
  date: string;
  description: string;
  name: string;
  isApproximateDate?: boolean;
  className?: string;
}

interface GradeItemProps {
  name: string;  // Required property
  weight?: string;  // Optional property
  description?: string;  // Optional property
  className?: string;  // Optional property for styling
}

// Components

/**
 * Section component for grouping content
 */
export const Section: React.FC<SectionProps> = ({ title, children, className }) => {
  return (
    <div className={cn("mb-6", className)}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {children}
      </div>
    </div>
  );
};

/**
 * SubSection component for content within sections
 */
export const SubSection: React.FC<SubSectionProps> = ({ title, content, className }) => {
  return (
    <div className={cn("mb-4", className)}>
      <h3 className="font-medium text-lg mb-1">{title}</h3>
      <div className="text-gray-700">
        {typeof content === "string" ? linkify(content) : content}
      </div>
    </div>
  );
};

/**
 * Floating action button component
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, icon, label, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-full bg-primary text-white px-4 py-2 shadow-lg hover:bg-primary/90 transition-colors",
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

/**
 * TimelineItem component for displaying events
 */
export const TimelineItem: React.FC<TimelineItemProps> = ({ 
  date, 
  title, 
  description, 
  percentage, 
  className 
}) => {
  return (
    <div className={cn("flex items-start mb-4", className)}>
      <div className="min-w-24 font-medium">{date}</div>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {description && <div className="text-sm text-gray-600">{description}</div>}
      </div>
      {percentage && (
        <div className="ml-2 font-medium text-blue-600">{percentage}</div>
      )}
    </div>
  );
};

/**
 * Formats complex date strings for better readability
 */
export const formatComplexDateString = (dateString: string): React.ReactNode => {
  // Check if it's a long date string or contains multiple dates
  const isLongDateString = dateString.length > 30 || dateString.includes(",");
  
  if (!isLongDateString) {
    return dateString;
  }
  
  // Split multiple dates by commas
  const dateParts = dateString.split(/,\s*/);
  
  if (dateParts.length > 1) {
    return (
      <div className="flex flex-col items-end space-y-1">
        {dateParts.map((part, index) => (
          <div key={index} className="text-right">
            {part}
          </div>
        ))}
      </div>
    );
  } else {
    // For a single long date string, try to break it into logical parts
    const parts = dateString.split(/\s+(?=and|\+|to|through|until)/i);
    
    if (parts.length > 1) {
      return (
        <div className="flex flex-col items-end space-y-1">
          {parts.map((part, index) => (
            <div key={index} className="text-right">
              {index > 0 && <span className="text-gray-400 mr-1">→</span>}{part.trim()}
            </div>
          ))}
        </div>
      );
    }
    
    // If it's just long but can't be easily split, add line breaks at reasonable points
    if (dateString.length > 40) {
      const midPoint = Math.floor(dateString.length / 2);
      const breakPoint = dateString.indexOf(' ', midPoint);
      
      if (breakPoint !== -1) {
        return (
          <div className="flex flex-col items-end space-y-1">
            <div>{dateString.substring(0, breakPoint)}</div>
            <div>{dateString.substring(breakPoint + 1)}</div>
          </div>
        );
      }
    }
    
    return dateString;
  }
};

/**
 * DateItem component for displaying dates
 */
export const DateItem: React.FC<DateItemProps> = ({ date, description, name, isApproximateDate, className }) => {
  return (
    <div className={cn("flex items-start justify-between mb-2", className)}>
      <div className="flex-1 text-gray-700">
        {name && <span className="font-medium mr-2">{name}</span>}
        {description}
      </div>
      <div className="ml-4 font-medium text-right">
        {isApproximateDate && <span className="text-gray-500 text-sm mr-1">Approx.</span>}
        {formatComplexDateString(date)}
      </div>
    </div>
  );
};

/**
 * GradeItem component for displaying grade information
 */
export const GradeItem: React.FC<GradeItemProps> = ({ name, weight, description, className }) => {
  return (
    <div className={cn("flex justify-between items-center mb-2", className)}>
      <div className="flex-1">
        <div className="font-semibold text-black whitespace-nowrap">{name}</div>
        {description && <div className="text-sm text-gray-600">{description}</div>}
      </div>
      {weight && <div className="font-medium text-gray-400 ml-2">{weight}</div>}
    </div>
  );
};