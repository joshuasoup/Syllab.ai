export interface Assessment {
  name: string;
  weight: number[];
  due_date: string[];
  description?: string;
  num_submissions?: number[];
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
  code?: string;
  name?: string;
  term?: string;
  year?: string;
  credits?: string;
  description?: string;
}

export interface ClassSchedule {
  meeting_days_times: string;
  location: string;
}

export interface ICSEvent {
  event_title: string;
  start_date: string;
  end_date: string;
  recurrence: string;
  location: string;
  description: string;
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
  ics_events?: ICSEvent[];
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