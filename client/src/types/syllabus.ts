export interface Assessment {
  title: string;
  date: string;
}

export interface Deadline {
  description: string;
  date: string;
}

export interface Instructor {
  name: string;
  email?: string;
  office?: string;
  officeHours?: string;
}

export interface CourseInfo {
  course_code?: string;
  course_name?: string;
  course_website?: string;
  department?: string;
  term?: string;
  year?: string;
  credits?: string;
  description?: string;
}

export interface ClassSchedule {
  days?: string[];
  time?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}

export interface Policy {
  title: string;
  description: string;
}

export interface Textbook {
  title: string;
  author?: string;
  isbn?: string;
  required?: boolean;
}

export interface SyllabusHighlights {
  course_info?: CourseInfo;
  instructors?: Instructor[];
  class_schedule?: ClassSchedule;
  assessments?: Assessment[];
  important_deadlines?: Deadline[];
  policies?: Policy[];
  textbooks?: Textbook[];
  other_details?: string;
}

export interface File {
  url: string;
  name: string;
  type: string;
}

export interface Syllabus {
  id: string;
  title: string;
  userId: string;
  processed: boolean;
  highlights?: SyllabusHighlights;
  createdAt: string;
  updatedAt: string;
  file?: File;
  icsContent?: string;
} 