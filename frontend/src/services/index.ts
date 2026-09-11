import api from './api';
import type {
  Student,
  Enrollment,
  GradeRow,
  ScheduleEntry,
  AttendanceSummaryItem,
  AttendanceRecord,
  Assignment,
  AcademicEvent,
  Payment,
  Invoice,
  AppNotification,
  AppRequest,
  DashboardData,
} from '../types';

export const authService = {
  async login(username: string, password: string) {
    const { data } = await api.post('/auth/login', { username, password });
    return data;
  },
  async logout() {
    await api.post('/auth/logout');
  },
  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export const studentService = {
  async getProfile(): Promise<Student> {
    const { data } = await api.get('/students/profile');
    return data;
  },
  async updateProfile(payload: { phone?: string; email?: string; photo_url?: string }): Promise<Student> {
    const { data } = await api.put('/students/profile', payload);
    return data;
  },
};

export const courseService = {
  async getCourses(filter?: { semester?: string; search?: string }): Promise<Enrollment[]> {
    const { data } = await api.get('/courses', { params: filter });
    return data;
  },
  async getCourseById(id: number) {
    const { data } = await api.get(`/courses/${id}`);
    return data;
  },
};

export const gradeService = {
  async getGrades(): Promise<GradeRow[]> {
    const { data } = await api.get('/grades');
    return data;
  },
};

export const scheduleService = {
  async getSchedule(): Promise<ScheduleEntry[]> {
    const { data } = await api.get('/schedule');
    return data;
  },
};

export const attendanceService = {
  async getAttendance(): Promise<AttendanceSummaryItem[]> {
    const { data } = await api.get('/attendance');
    return data;
  },
  async getAttendanceByCourse(courseId: number): Promise<AttendanceRecord[]> {
    const { data } = await api.get(`/attendance/${courseId}`);
    return data;
  },
};

export const assignmentService = {
  async getAssignments(filter?: { status?: string; search?: string }): Promise<Assignment[]> {
    const { data } = await api.get('/assignments', { params: filter });
    return data;
  },
  async submit(id: number, notes: string): Promise<void> {
    await api.post(`/assignments/${id}/submit`, { notes });
  },
};

export const calendarService = {
  async getCalendar(): Promise<AcademicEvent[]> {
    const { data } = await api.get('/calendar');
    return data;
  },
};

export const paymentService = {
  async getPayments(): Promise<Payment[]> {
    const { data } = await api.get('/payments');
    return data;
  },
};

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    const { data } = await api.get('/invoices');
    return data;
  },
};

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    const { data } = await api.get('/notifications');
    return data;
  },
  async markRead(id: number): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },
  async markAllRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },
};

export const requestService = {
  async getRequests(): Promise<AppRequest[]> {
    const { data } = await api.get('/requests');
    return data;
  },
  async create(request_type: string, description: string): Promise<AppRequest> {
    const { data } = await api.post('/requests', { request_type, description });
    return data;
  },
};

export const pensumService = {
  async getPensum(): Promise<Record<number, any[]>> {
    const { data } = await api.get('/pensum');
    return data;
  },
};

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const { data } = await api.get('/dashboard');
    return data;
  },
};

export const historyService = {
  async getHistory() {
    const { data } = await api.get('/history');
    return data;
  },
};