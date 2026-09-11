export interface User {
  id: number;
  username: string;
  role: string;
}

export interface Student {
  id: number;
  user_id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  career_id: number;
  career_name?: string;
  career_code?: string;
  semester: number;
  campus: string;
  photo_url: string;
  status: string;
  admission_date: string;
  total_credits?: number;
  total_semesters?: number;
}

export interface Career {
  id: number;
  name: string;
  code: string;
  total_credits: number;
  total_semesters: number;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  career_id: number;
  semester: number;
  credits: number;
  description: string;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  semester: string;
  group_code: string;
  status: string;
  course_name: string;
  course_code: string;
  credits: number;
  description?: string;
  partial1: number | null;
  partial2: number | null;
  practices: number | null;
  project: number | null;
  final_exam: number | null;
  final_grade: number | null;
}

export interface GradeRow {
  semester: string;
  group_code: string;
  course_name: string;
  course_code: string;
  credits: number;
  partial1: number | null;
  partial2: number | null;
  practices: number | null;
  project: number | null;
  final_exam: number | null;
  final_grade: number | null;
}

export interface ScheduleEntry {
  id: number;
  enrollment_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  classroom: string;
  course_name: string;
  course_code: string;
  group_code: string;
}

export interface AttendanceSummaryItem {
  enrollment_id: number;
  course_id: number;
  course_name: string;
  course_code: string;
  total_classes: number;
  present_count: number;
  late_count: number;
  absent_count: number;
  justified_count: number;
}

export interface AttendanceRecord {
  id: number;
  enrollment_id: number;
  date: string;
  status: string;
}

export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description: string;
  due_date: string;
  due_time: string;
  max_score: number;
  course_name: string;
  course_code: string;
  score: number | null;
  submission_status: string | null;
  submitted_at: string | null;
  submission_id: number | null;
}

export interface AcademicEvent {
  id: number;
  title: string;
  description: string;
  event_type: 'class' | 'exam' | 'assignment' | 'event' | 'holiday';
  start_date: string;
  end_date: string | null;
  course_id: number | null;
  color: string;
}

export interface Payment {
  id: number;
  reference: string;
  concept: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  date: string;
  concept: string;
  amount: number;
  status: string;
}

export interface AppNotification {
  id: number;
  title: string;
  description: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface AppRequest {
  id: number;
  request_type: string;
  description: string;
  status: string;
  observations: string;
  created_at: string;
}

export interface DashboardData {
  student: Student;
  gpa: number;
  enrolledCourses: Enrollment[];
  schedule: ScheduleEntry[];
  upcomingAssignments: Assignment[];
  attendanceRate: number;
  pendingAmount: number;
  creditsCompleted: number;
  advancePercent: number;
  recentNotifications: AppNotification[];
}