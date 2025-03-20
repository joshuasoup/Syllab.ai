// web/routes/_user.syllabus-result.$id/SyllabusHelpers.ts
export interface SyllabusData {
  id: string;
  title: string;
  file?: {
    url: string;
    fileName?: string;
    mimeType?: string;
  } | null;
  processed: boolean;
  highlights?: Record<string, any> | null;
  icsContent?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  user?: { id: string } | null;
}

// 2. Put any helper functions here:
export const getNumberedAssessmentName = (
  assessments: any[],
  currentIndex: number
): string => {
  const currentAssessment = assessments[currentIndex];
  const name =
    typeof currentAssessment === "string"
      ? currentAssessment
      : currentAssessment.name || `Assessment ${currentIndex + 1}`;

  let totalWithSameName = 0;
  let currentCount = 0;
  for (let i = 0; i < assessments.length; i++) {
    const a = assessments[i];
    const aName =
      typeof a === "string" ? a : a.name || `Assessment ${i + 1}`;
    if (aName.toLowerCase().trim() === name.toLowerCase().trim()) {
      totalWithSameName++;
      if (i < currentIndex) {
        currentCount++;
      }
    }
  }

  if (totalWithSameName === 1) {
    return name;
  }

  return `${name} ${currentCount + 1}`;
};

export const formatDate = (date?: string | Date | null): string => {
  if (!date) return "Unknown";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
};

// Optionally, if you have other small utility checks like isEmpty(), filterEmptyEntries() etc.:
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
};

export const filterEmptyEntries = (
  obj: Record<string, any>
): [string, any][] => {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).filter(([_, value]) => !isEmpty(value));
};
