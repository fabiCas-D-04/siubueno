import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getCourses,
  getCourseById,
  getGrades,
  getSchedule,
  getAttendance,
  getAttendanceByCourse,
  getAssignments,
  submitAssignment,
  getCalendar,
  getPayments,
  getInvoices,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getRequests,
  createRequest,
  getPensum,
  getDashboard,
  getHistory,
} from '../controllers/studentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', getDashboard);
router.get('/students/profile', getProfile);
router.put('/students/profile', updateProfile);
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.get('/grades', getGrades);
router.get('/schedule', getSchedule);
router.get('/attendance', getAttendance);
router.get('/attendance/:courseId', getAttendanceByCourse);
router.get('/assignments', getAssignments);
router.post('/assignments/:id/submit', submitAssignment);
router.get('/calendar', getCalendar);
router.get('/payments', getPayments);
router.get('/invoices', getInvoices);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);
router.get('/requests', getRequests);
router.post('/requests', createRequest);
router.get('/pensum', getPensum);
router.get('/history', getHistory);

export default router;