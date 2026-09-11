import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, ToastProvider } from './contexts';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { CoursesPage } from './pages/academic/CoursesPage';
import { CourseDetailPage } from './pages/academic/CourseDetailPage';
import { GradesPage } from './pages/academic/GradesPage';
import { HistoryPage } from './pages/academic/HistoryPage';
import { PensumPage } from './pages/academic/PensumPage';
import { SchedulePage } from './pages/academic/SchedulePage';
import { AttendancePage } from './pages/academic/AttendancePage';
import { AssignmentsPage } from './pages/academic/AssignmentsPage';
import { CalendarPage } from './pages/CalendarPage';
import { AccountPage } from './pages/finance/AccountPage';
import { PaymentsPage } from './pages/finance/PaymentsPage';
import { InvoicesPage } from './pages/finance/InvoicesPage';
import { RequestsPage } from './pages/RequestsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />

              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                <Route path="/academic/courses" element={<CoursesPage />} />
                <Route path="/academic/courses/:id" element={<CourseDetailPage />} />
                <Route path="/academic/grades" element={<GradesPage />} />
                <Route path="/academic/history" element={<HistoryPage />} />
                <Route path="/academic/pensum" element={<PensumPage />} />
                <Route path="/academic/schedule" element={<SchedulePage />} />
                <Route path="/academic/attendance" element={<AttendancePage />} />
                <Route path="/academic/assignments" element={<AssignmentsPage />} />

                <Route path="/calendar" element={<CalendarPage />} />

                <Route path="/finance/account" element={<AccountPage />} />
                <Route path="/finance/payments" element={<PaymentsPage />} />
                <Route path="/finance/invoices" element={<InvoicesPage />} />

                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
