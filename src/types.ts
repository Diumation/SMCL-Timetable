export type DegreeType = 'PhD' | 'Master';

export interface Student {
  id: string;
  orderNumber: number;
  name: string;
  degree: DegreeType; // 'PhD' (박사 과정) or 'Master' (석사 과정)
  courses: StudentCourse[];
}

export interface StudentCourse {
  id: string; // unique id
  courseCode: string;
  department: string;
  courseName: string;
  professor: string;
  credits: number | string;
  timeString: string; // e.g. "월/수 10:30 - 12:00", "월 13:00 - 15:00", "-"
  isResearch?: boolean; // 논문연구 여부
  isSeminar?: boolean;  // 세미나 여부
}

export interface ParsedTimeSlot {
  day: '월' | '화' | '수' | '목' | '금';
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  totalMinutes: number;
}

export interface TimetableBlockItem {
  courseId: string;
  courseCode: string;
  courseName: string;
  department: string;
  professor: string;
  credits: number | string;
  timeString: string;
  slot: ParsedTimeSlot;
  students: {
    id: string;
    name: string;
    degree: DegreeType;
  }[];
  category: CourseCategory;
}

export type CourseCategory = 
  | 'aerospace'   // 항공우주/우주탐사
  | 'ai_ml'       // AI/머신러닝/AX
  | 'mechanical'  // 기계/시스템
  | 'humanities'  // HSS/체육/인문
  | 'common_req'  // 공통필수/Scientific Writing/리더십
  | 'seminar'     // 세미나
  | 'research';   // 논문연구

export type FilterDegree = 'ALL' | 'PhD' | 'Master';
export type ViewMode = 'TIMETABLE' | 'STUDENTS' | 'LAB_MATRIX' | 'COURSE_LIST' | 'PRINT_PREVIEW';
