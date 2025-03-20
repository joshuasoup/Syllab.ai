export interface Assessment {
  title: string;
  date: string;
}

export interface Deadline {
  description: string;
  date: string;
}

export interface SyllabusHighlights {
  assessments?: Assessment[];
  important_deadlines?: Deadline[];
}

export interface Syllabus {
  id: string;
  title: string;
  userId: string;
  processed: boolean;
  highlights?: SyllabusHighlights;
  createdAt: string;
  updatedAt: string;
} 