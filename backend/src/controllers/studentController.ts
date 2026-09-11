import { Request, Response } from 'express';
import pool from '../database/connection';

function getStudentId(userId: number): Promise<number | null> {
  return pool
    .query('SELECT id FROM students WHERE user_id = $1', [userId])
    .then((result) => (result.rows.length > 0 ? result.rows[0].id : null));
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const studentId = await getStudentId(req.user.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const result = await pool.query(
      `SELECT s.*, c.name as career_name, c.code as career_code, c.total_credits, c.total_semesters
       FROM students s JOIN careers c ON s.career_id = c.id
       WHERE s.id = $1`,
      [studentId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Perfil no encontrado' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const studentId = await getStudentId(req.user.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const { phone, email, photo_url } = req.body;

    const result = await pool.query(
      `UPDATE students SET
        phone = COALESCE($1, phone),
        email = COALESCE($2, email),
        photo_url = COALESCE($3, photo_url)
       WHERE id = $4 RETURNING *`,
      [phone, email, photo_url, studentId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getCourses(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const { semester, search } = req.query;
    let query = `
      SELECT e.*, c.name as course_name, c.code as course_code, c.credits, c.description,
             g.partial1, g.partial2, g.practices, g.project, g.final_exam, g.final_grade
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN grades g ON g.enrollment_id = e.id
      WHERE e.student_id = $1
    `;
    const params: any[] = [studentId];
    let paramIdx = 2;

    if (semester) {
      query += ` AND e.semester = $${paramIdx}`;
      params.push(semester);
      paramIdx++;
    }

    if (search) {
      query += ` AND (LOWER(c.name) LIKE LOWER($${paramIdx}) OR LOWER(c.code) LIKE LOWER($${paramIdx}))`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ' ORDER BY c.semester DESC, c.name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('GetCourses error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getCourseById(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.*, c.name as course_name, c.code as course_code, c.credits, c.description, c.semester as course_semester,
              g.partial1, g.partial2, g.practices, g.project, g.final_exam, g.final_grade
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN grades g ON g.enrollment_id = e.id
       WHERE e.student_id = $1 AND e.course_id = $2`,
      [studentId, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Materia no encontrada' });
      return;
    }

    const scheduleResult = await pool.query(
      'SELECT * FROM schedule WHERE enrollment_id = $1 ORDER BY CASE day_of_week WHEN \'Lunes\' THEN 1 WHEN \'Martes\' THEN 2 WHEN \'Miercoles\' THEN 3 WHEN \'Jueves\' THEN 4 WHEN \'Viernes\' THEN 5 WHEN \'Sabado\' THEN 6 END',
      [result.rows[0].id]
    );

    const attendanceResult = await pool.query(
      `SELECT
        COUNT(*) as total_classes,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'justified' THEN 1 END) as justified
       FROM attendance WHERE enrollment_id = $1`,
      [result.rows[0].id]
    );

    const assignmentsResult = await pool.query(
      `SELECT a.*, asub.score, asub.status as submission_status, asub.submitted_at
       FROM assignments a
       LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id AND asub.student_id = $2
       WHERE a.course_id = $1
       ORDER BY a.due_date ASC`,
      [id, studentId]
    );

    res.json({
      enrollment: result.rows[0],
      schedule: scheduleResult.rows,
      attendance: attendanceResult.rows[0],
      assignments: assignmentsResult.rows,
    });
  } catch (error) {
    console.error('GetCourseById error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getGrades(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const result = await pool.query(
      `SELECT e.semester, e.group_code, c.name as course_name, c.code as course_code, c.credits,
              g.partial1, g.partial2, g.practices, g.project, g.final_exam, g.final_grade
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN grades g ON g.enrollment_id = e.id
       WHERE e.student_id = $1
       ORDER BY e.semester DESC, c.name ASC`,
      [studentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('GetGrades error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getSchedule(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const result = await pool.query(
      `SELECT s.*, c.name as course_name, c.code as course_code, e.group_code,
              g.partial1, g.partial2, g.practices, g.project, g.final_exam, g.final_grade
       FROM schedule s
       JOIN enrollments e ON s.enrollment_id = e.id
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN grades g ON g.enrollment_id = e.id
       WHERE e.student_id = $1
       ORDER BY CASE s.day_of_week
         WHEN 'Lunes' THEN 1 WHEN 'Martes' THEN 2 WHEN 'Miercoles' THEN 3
         WHEN 'Jueves' THEN 4 WHEN 'Viernes' THEN 5 WHEN 'Sabado' THEN 6
       END, s.start_time ASC`,
      [studentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('GetSchedule error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getAttendance(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const result = await pool.query(
      `SELECT e.id as enrollment_id, e.course_id, c.name as course_name, c.code as course_code,
              COUNT(a.id) as total_classes,
              COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
              COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
              COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
              COUNT(CASE WHEN a.status = 'justified' THEN 1 END) as justified_count
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN attendance a ON a.enrollment_id = e.id
       WHERE e.student_id = $1 AND e.status = 'enrolled'
       GROUP BY e.id, c.name, c.code
       ORDER BY c.name`,
      [studentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('GetAttendance error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getAttendanceByCourse(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    const { courseId } = req.params;

    const enrollResult = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );

    if (enrollResult.rows.length === 0) {
      res.status(404).json({ message: 'Inscripcion no encontrada' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM attendance WHERE enrollment_id = $1 ORDER BY date DESC',
      [enrollResult.rows[0].id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('GetAttendanceByCourse error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getAssignments(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const { status, search } = req.query;
    let query = `
      SELECT a.*, c.name as course_name, c.code as course_code,
             asub.score, asub.status as submission_status, asub.submitted_at, asub.id as submission_id
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = $1
      LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id AND asub.student_id = $1
    `;
    const params: any[] = [studentId];
    let paramIdx = 2;

    if (status === 'pending') {
      query += ` AND asub.id IS NULL AND a.due_date >= CURRENT_DATE`;
    } else if (status === 'submitted') {
      query += ` AND asub.id IS NOT NULL`;
    } else if (status === 'overdue') {
      query += ` AND asub.id IS NULL AND a.due_date < CURRENT_DATE`;
    }

    if (search) {
      query += ` AND (LOWER(a.title) LIKE LOWER($${paramIdx}) OR LOWER(c.name) LIKE LOWER($${paramIdx}))`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ' ORDER BY a.due_date ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('GetAssignments error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function submitAssignment(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    const { id } = req.params;
    const { notes } = req.body;

    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const existing = await pool.query(
      'SELECT id FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2',
      [id, studentId]
    );

    if (existing.rows.length > 0) {
      res.status(400).json({ message: 'Ya has entregado esta tarea' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, notes, status)
       VALUES ($1, $2, $3, 'submitted') RETURNING *`,
      [id, studentId, notes || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('SubmitAssignment error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getCalendar(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT * FROM academic_events ORDER BY start_date ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetCalendar error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getPayments(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM payments WHERE student_id = $1 ORDER BY payment_date DESC',
      [studentId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetPayments error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getInvoices(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM invoices WHERE student_id = $1 ORDER BY date DESC',
      [studentId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetInvoices error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM notifications WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetNotifications error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    const { id } = req.params;

    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND student_id = $2',
      [id, studentId]
    );

    res.json({ message: 'Notificacion marcada como leida' });
  } catch (error) {
    console.error('MarkNotificationRead error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function markAllNotificationsRead(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE student_id = $1',
      [studentId]
    );
    res.json({ message: 'Todas las notificaciones marcadas como leidas' });
  } catch (error) {
    console.error('MarkAllNotificationsRead error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getRequests(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM requests WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetRequests error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function createRequest(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const { request_type, description } = req.body;

    if (!request_type || !description) {
      res.status(400).json({ message: 'Tipo de solicitud y descripcion son requeridos' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO requests (student_id, request_type, description, status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [studentId, request_type, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('CreateRequest error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getPensum(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const studentResult = await pool.query('SELECT career_id FROM students WHERE id = $1', [studentId]);
    if (studentResult.rows.length === 0) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const careerId = studentResult.rows[0].career_id;

    const coursesResult = await pool.query(
      `SELECT c.*,
              e.status as enrollment_status, e.semester as enrolled_semester
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id AND e.student_id = $1
       WHERE c.career_id = $2
       ORDER BY c.semester ASC, c.name ASC`,
      [studentId, careerId]
    );

    const gradesResult = await pool.query(
      `SELECT g.final_grade, e.course_id
       FROM grades g
       JOIN enrollments e ON g.enrollment_id = e.id
       WHERE e.student_id = $1 AND g.final_grade IS NOT NULL`,
      [studentId]
    );

    const gradeMap: Record<number, number> = {};
    for (const row of gradesResult.rows) {
      gradeMap[row.course_id] = parseFloat(row.final_grade);
    }

    const coursesBySemester: Record<number, any[]> = {};
    for (const course of coursesResult.rows) {
      if (!coursesBySemester[course.semester]) {
        coursesBySemester[course.semester] = [];
      }
      let status = 'pending';
      if (course.enrollment_status === 'completed') {
        const grade = gradeMap[course.id];
        status = grade >= 6 ? 'approved' : 'failed';
      } else if (course.enrollment_status === 'enrolled') {
        status = 'enrolled';
      }
      coursesBySemester[course.semester].push({ ...course, status });
    }

    res.json(coursesBySemester);
  } catch (error) {
    console.error('GetPensum error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const studentResult = await pool.query(
      `SELECT s.*, c.name as career_name, c.code as career_code, c.total_credits, c.total_semesters
       FROM students s JOIN careers c ON s.career_id = c.id
       WHERE s.id = $1`,
      [studentId]
    );
    const student = studentResult.rows[0];

    const currentGrades = await pool.query(
      `SELECT g.final_grade, c.credits
       FROM grades g
       JOIN enrollments e ON g.enrollment_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = $1 AND g.final_grade IS NOT NULL`,
      [studentId]
    );

    let totalWeighted = 0;
    let totalCredits = 0;
    for (const row of currentGrades.rows) {
      totalWeighted += parseFloat(row.final_grade) * row.credits;
      totalCredits += row.credits;
    }
    const gpa = totalCredits > 0 ? Math.round((totalWeighted / totalCredits) * 10) / 10 : 0;

    const currentEnrollments = await pool.query(
      `SELECT e.*, c.name as course_name, c.code as course_code, c.credits,
              g.partial1, g.partial2, g.practices, g.project, g.final_exam, g.final_grade
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN grades g ON g.enrollment_id = e.id
       WHERE e.student_id = $1 AND e.status = 'enrolled'`,
      [studentId]
    );

    const scheduleResult = await pool.query(
      `SELECT s.*, c.name as course_name, c.code as course_code
       FROM schedule s
       JOIN enrollments e ON s.enrollment_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = $1
       ORDER BY CASE s.day_of_week
         WHEN 'Lunes' THEN 1 WHEN 'Martes' THEN 2 WHEN 'Miercoles' THEN 3
         WHEN 'Jueves' THEN 4 WHEN 'Viernes' THEN 5 WHEN 'Sabado' THEN 6
       END, s.start_time ASC`,
      [studentId]
    );

    const assignmentsResult = await pool.query(
      `SELECT a.*, c.name as course_name,
              asub.status as submission_status
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = $1
       LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id AND asub.student_id = $1
       WHERE a.due_date >= CURRENT_DATE
       ORDER BY a.due_date ASC
       LIMIT 5`,
      [studentId]
    );

    const attendanceSummary = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END) as attended
       FROM attendance a
       JOIN enrollments e ON a.enrollment_id = e.id
       WHERE e.student_id = $1`,
      [studentId]
    );

    const attendanceRate = attendanceSummary.rows[0].total > 0
      ? Math.round((attendanceSummary.rows[0].attended / attendanceSummary.rows[0].total) * 100)
      : 0;

    const paymentsResult = await pool.query(
      `SELECT SUM(CASE WHEN status = 'pending' OR status = 'overdue' THEN amount ELSE 0 END) as pending_amount
       FROM payments WHERE student_id = $1`,
      [studentId]
    );

    const pendingAmount = parseFloat(paymentsResult.rows[0].pending_amount) || 0;

    const completedCredits = await pool.query(
      `SELECT SUM(c.credits) as total
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = $1 AND e.status = 'completed'`,
      [studentId]
    );

    const creditsCompleted = parseInt(completedCredits.rows[0].total) || 0;
    const advancePercent = student.total_credits > 0
      ? Math.round((creditsCompleted / student.total_credits) * 100)
      : 0;

    const recentNotifications = await pool.query(
      'SELECT * FROM notifications WHERE student_id = $1 ORDER BY created_at DESC LIMIT 5',
      [studentId]
    );

    res.json({
      student,
      gpa,
      enrolledCourses: currentEnrollments.rows,
      schedule: scheduleResult.rows,
      upcomingAssignments: assignmentsResult.rows,
      attendanceRate,
      pendingAmount,
      creditsCompleted,
      advancePercent,
      recentNotifications: recentNotifications.rows,
    });
  } catch (error) {
    console.error('GetDashboard error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getHistory(req: Request, res: Response): Promise<void> {
  try {
    const studentId = await getStudentId(req.user!.userId);
    if (!studentId) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
      return;
    }

    const result = await pool.query(
      `SELECT e.semester, c.name as course_name, c.code as course_code, c.credits,
              g.partial1, g.partial2, g.practices, g.project, g.final_exam, g.final_grade,
              e.status as enrollment_status
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN grades g ON g.enrollment_id = e.id
       WHERE e.student_id = $1
       ORDER BY e.semester DESC, c.name ASC`,
      [studentId]
    );

    const semesters: Record<string, any[]> = {};
    for (const row of result.rows) {
      if (!semesters[row.semester]) {
        semesters[row.semester] = [];
      }
      semesters[row.semester].push(row);
    }

    const stats = await pool.query(
      `SELECT
        SUM(CASE WHEN e.status = 'completed' AND g.final_grade >= 6 THEN c.credits ELSE 0 END) as approved_credits,
        SUM(CASE WHEN e.status = 'completed' AND (g.final_grade < 6 OR g.final_grade IS NULL) THEN c.credits ELSE 0 END) as failed_credits,
        COUNT(CASE WHEN e.status = 'completed' AND g.final_grade >= 6 THEN 1 END) as approved_courses,
        COUNT(CASE WHEN e.status = 'completed' AND (g.final_grade < 6 OR g.final_grade IS NULL) THEN 1 END) as failed_courses
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN grades g ON g.enrollment_id = e.id
       WHERE e.student_id = $1`,
      [studentId]
    );

    res.json({
      semesters,
      stats: stats.rows[0],
    });
  } catch (error) {
    console.error('GetHistory error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}
