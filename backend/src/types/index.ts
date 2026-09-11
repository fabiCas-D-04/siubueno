export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: 'student' | 'admin' | 'teacher';
  created_at: Date;
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
  semester: number;
  campus: string;
  photo_url: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  admission_date: string;
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
  status: 'enrolled' | 'completed' | 'dropped';
  enrolled_at: Date;
}

export interface Grade {
  id: number;
  enrollment_id: number;
  partial1: number | null;
  partial2: number | null;
  practices: number | null;
  project: number | null;
  final_exam: number | null;
  final_grade: number | null;
}

export interface Attendance {
  id: number;
  enrollment_id: number;
  date: string;
  status: 'present' | 'absent' | 'justified' | 'late';
}

export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description: string;
  due_date: string;
  due_time: string;
  max_score: number;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student_id: number;
  submitted_at: Date;
  file_url: string | null;
  notes: string;
  score: number | null;
  status: 'submitted' | 'graded' | 'returned';
}

export interface ScheduleEntry {
  id: number;
  enrollment_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  classroom: string;
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
  student_id: number;
  reference: string;
  concept: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Invoice {
  id: number;
  student_id: number;
  invoice_number: string;
  date: string;
  concept: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Notification {
  id: number;
  student_id: number;
  title: string;
  description: string;
  notification_type: 'academic' | 'financial' | 'administrative' | 'general';
  is_read: boolean;
  created_at: Date;
}

export interface Request {
  id: number;
  student_id: number;
  request_type: string;
  description: string;
  status: 'pending' | 'in_process' | 'approved' | 'rejected';
  observations: string;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  userId: number;
  role: string;
}
