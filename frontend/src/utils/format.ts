export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
}

export function getGradeState(grade: number | null): 'approved' | 'failed' | 'pending' {
  if (grade === null) return 'pending';
  return grade >= 6 ? 'approved' : 'failed';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${firstName.split(' ')[0] ? lastName.charAt(0) : ''}`.toUpperCase();
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    approved_span: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    failed_span: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    in_process: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    overdue: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    enrolled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    dropped: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    present: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    absent: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    justified: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    late: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    graded: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    returned: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  };
  return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

export function getNotificationTypeClass(type: string): string {
  const map: Record<string, string> = {
    academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    financial: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    administrative: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return map[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

export function getAttendanceStatus(total: number, attended: number): 'excellent' | 'regular' | 'warning' | 'risk' {
  if (total === 0) return 'regular';
  const pct = (attended / total) * 100;
  if (pct >= 90) return 'excellent';
  if (pct >= 80) return 'regular';
  if (pct >= 70) return 'warning';
  return 'risk';
}