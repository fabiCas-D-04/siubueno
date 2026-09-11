import pool from './connection';
import { createTables } from './schema';
import bcrypt from 'bcryptjs';

export async function seedDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await createTables();

    await client.query('BEGIN');

    const existingUser = await client.query('SELECT id FROM users WHERE username = $1', ['estudiante']);
    if (existingUser.rows.length > 0) {
      console.log('Seed data already exists');
      await client.query('ROLLBACK');
      return;
    }

    const passwordHash = await bcrypt.hash('Estudiante123', 10);
    const userResult = await client.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
      ['estudiante', passwordHash, 'student']
    );
    const userId = userResult.rows[0].id;

    const teacherUser = await client.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
      ['docente', await bcrypt.hash('Docente123', 10), 'teacher']
    );
    const teacherUserId = teacherUser.rows[0].id;

    await client.query(
      `INSERT INTO careers (name, code, total_credits, total_semesters) VALUES ($1, $2, $3, $4)`,
      ['Ingenieria en Sistemas Computacionales', 'ISC', 200, 10]
    );

    const studentResult = await client.query(
      `INSERT INTO students (user_id, student_code, first_name, last_name, email, phone, birth_date, career_id, semester, campus, photo_url, status, admission_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      [
        userId, 'UV-2023-001', 'Carlos', 'Mendoza Rivera',
        'carlos.mendoza@univalle.edu', '555-0101', '2002-05-15',
        1, 5, 'Campus Principal', '', 'active', '2023-01-15'
      ]
    );
    const studentId = studentResult.rows[0].id;

    const coursesData = [
      ['Matematicas I', 'MAT101', 1, 1, 8, 'Fundamentos de algebra y calculo'],
      ['Fisica I', 'FIS101', 1, 1, 6, 'Mecanica y termodinamica basica'],
      ['Programacion I', 'PRO101', 1, 1, 8, 'Introduccion a la programacion'],
      ['Ingles I', 'ING101', 1, 1, 4, 'Ingles basico'],
      ['Logica Computacional', 'LOG101', 1, 1, 4, 'Logica para computacion'],
      ['Matematicas II', 'MAT201', 1, 2, 8, 'Calculo diferencial e integral'],
      ['Fisica II', 'FIS201', 1, 2, 6, 'Electricidad y magnetismo'],
      ['Programacion II', 'PRO201', 1, 2, 8, 'Estructuras de datos'],
      ['Ingles II', 'ING201', 1, 2, 4, 'Ingles intermedio'],
      ['Base de Datos I', 'BD101', 1, 3, 6, 'Diseno de bases de datos relacionales'],
      ['Estructuras de Datos', 'ED101', 1, 3, 6, 'Listas, arboles, grafos'],
      ['Sistemas Operativos', 'SO101', 1, 3, 6, 'Fundamentos de SO'],
      ['Redes I', 'RED101', 1, 3, 4, 'Fundamentos de redes'],
      ['Ingenieria de Software', 'IS101', 1, 4, 6, 'Metodologias de desarrollo'],
      ['Bases de Datos II', 'BD201', 1, 4, 6, 'Avanzado en bases de datos'],
      ['Redes II', 'RED201', 1, 4, 4, 'Redes avanzadas'],
      ['Programacion Web', 'PW101', 1, 4, 8, 'Desarrollo web full stack'],
      ['Inteligencia Artificial', 'IA101', 1, 5, 6, 'Fundamentos de IA'],
      ['Cloud Computing', 'CC101', 1, 5, 4, 'Computacion en la nube'],
      ['Proyecto de Grado', 'PG101', 1, 5, 8, 'Desarrollo de proyecto de investigacion'],
      ['Seguridad Informatica', 'SI101', 1, 5, 4, 'Fundamentos de seguridad'],
      ['Machine Learning', 'ML101', 1, 5, 6, 'Aprendizaje automatico'],
    ];

    const courseIds: number[] = [];
    for (const c of coursesData) {
      const result = await client.query(
        'INSERT INTO courses (name, code, career_id, semester, credits, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        c
      );
      courseIds.push(result.rows[0].id);
    }

    const enrolledCourseIds = [16, 17, 18, 19, 20, 21];
    const semesters = ['2024-1', '2024-2', '2025-1', '2025-2', '2026-1'];
    const currentSemester = '2026-1';

    const completedSemesterCourses: Record<string, number[]> = {
      '2024-1': [0, 1, 2, 3, 4],
      '2024-2': [5, 6, 7, 8],
      '2025-1': [9, 10, 11, 12],
      '2025-2': [13, 14, 15],
    };

    for (const sem of semesters) {
      const courseIdsForSem = sem === currentSemester
        ? enrolledCourseIds
        : (completedSemesterCourses[sem] || []).map(idx => courseIds[idx]);

      for (let i = 0; i < courseIdsForSem.length; i++) {
        const cid = courseIdsForSem[i];
        const groupCode = String.fromCharCode(65 + (i % 3));
        const status = sem === currentSemester ? 'enrolled' : 'completed';

        const enrollmentResult = await client.query(
          'INSERT INTO enrollments (student_id, course_id, semester, group_code, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [studentId, cid, sem, groupCode, status]
        );
        const enrollmentId = enrollmentResult.rows[0].id;

        if (sem === currentSemester) {
          const p1 = Math.round((6 + Math.random() * 3.5) * 10) / 10;
          const p2 = Math.round((5 + Math.random() * 4.5) * 10) / 10;
          const pr = Math.round((6 + Math.random() * 3.5) * 10) / 10;
          const proj = Math.round((7 + Math.random() * 2.5) * 10) / 10;
          const fe = Math.round((6 + Math.random() * 3.5) * 10) / 10;
          const finalGrade = Math.round(((p1 * 0.2 + p2 * 0.2 + pr * 0.15 + proj * 0.15 + fe * 0.3)) * 10) / 10;

          await client.query(
            'INSERT INTO grades (enrollment_id, partial1, partial2, practices, project, final_exam, final_grade) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [enrollmentId, p1, p2, pr, proj, fe, finalGrade]
          );
        } else {
          const p1 = Math.round((6 + Math.random() * 3.5) * 10) / 10;
          const p2 = Math.round((5 + Math.random() * 4.5) * 10) / 10;
          const pr = Math.round((6 + Math.random() * 3.5) * 10) / 10;
          const proj = Math.round((7 + Math.random() * 2.5) * 10) / 10;
          const fe = Math.round((6 + Math.random() * 3.5) * 10) / 10;
          const finalGrade = Math.round((p1 * 0.2 + p2 * 0.2 + pr * 0.15 + proj * 0.15 + fe * 0.3) * 10) / 10;

          await client.query(
            'INSERT INTO grades (enrollment_id, partial1, partial2, practices, project, final_exam, final_grade) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [enrollmentId, p1, p2, pr, proj, fe, finalGrade]
          );
        }

        const daysOfWeek = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
        const timeSlots = ['07:00-09:00', '09:00-11:00', '11:00-13:00', '14:00-16:00', '16:00-18:00'];
        const classrooms = ['A-101', 'A-203', 'B-105', 'B-302', 'C-401', 'Lab-1'];

        if (sem === currentSemester) {
          for (let d = 0; d < 2; d++) {
            const day = daysOfWeek[(i + d) % 5];
            const timeSlot = timeSlots[i % 5];
            const [start, end] = timeSlot.split('-');
            const classroom = classrooms[i % classrooms.length];

            await client.query(
              'INSERT INTO schedule (enrollment_id, day_of_week, start_time, end_time, classroom) VALUES ($1, $2, $3, $4, $5)',
              [enrollmentId, day, start, end, classroom]
            );
          }

          for (let w = 0; w < 12; w++) {
            const date = new Date(2026, 7, 3 + w * 7);
            const statuses: Array<'present' | 'absent' | 'justified' | 'late'> = ['present', 'present', 'present', 'present', 'late', 'present', 'absent', 'present', 'present', 'justified', 'present', 'present'];
            for (const day of daysOfWeek.slice(0, 2)) {
              const classDate = new Date(date);
              const dayOffset = daysOfWeek.indexOf(day) - daysOfWeek.indexOf('Lunes');
              classDate.setDate(classDate.getDate() + dayOffset);
              if (classDate.getMonth() >= 7 && classDate.getDate() <= 30) {
                await client.query(
                  'INSERT INTO attendance (enrollment_id, date, status) VALUES ($1, $2, $3)',
                  [enrollmentId, classDate.toISOString().split('T')[0], statuses[w % statuses.length]]
                );
              }
            }
          }
        }
      }
    }

    const assignmentTitles = [
      ['Ejercicios de Algebra Lineal', 'Resolver ejercicios del capitulo 3', '2026-09-15', '14:00'],
      ['Practica: Arboles Binarios', 'Implementar arboles AVL en Java', '2026-09-18', '23:59'],
      ['Laboratorio SQL Avanzado', 'Crear procedimientos almacenados', '2026-09-20', '16:00'],
      ['Proyecto Web Full Stack', 'Desarrollar sistema de inventario', '2026-09-25', '23:59'],
      ['Examen Parcial IA', 'Estudiar capitulos 1-5', '2026-09-22', '10:00'],
      ['Tarea de Machine Learning', 'Implementar regresion lineal', '2026-09-28', '23:59'],
    ];

    for (let i = 0; i < assignmentTitles.length; i++) {
      const [title, desc, due, time] = assignmentTitles[i];
      const courseIdx = enrolledCourseIds[i % enrolledCourseIds.length] - 1;
      const cid = courseIds[courseIdx];
      const assignResult = await client.query(
        'INSERT INTO assignments (course_id, title, description, due_date, due_time, max_score) VALUES ($1, $2, $3, $4, $5, 100) RETURNING id',
        [cid, title, desc, due, time]
      );

      if (i < 3) {
        await client.query(
          'INSERT INTO assignment_submissions (assignment_id, student_id, notes, score, status) VALUES ($1, $2, $3, $4, $5)',
          [assignResult.rows[0].id, studentId, 'Entregado a tiempo', Math.round(70 + Math.random() * 25), 'graded']
        );
      }
    }

    const paymentsData = [
      ['PAGO-2026-001', 'Matricula Semestre 2026-1', 350.00, '2026-01-10', 'Transferencia', 'paid'],
      ['PAGO-2026-002', 'Mensualidad Enero 2026', 200.00, '2026-01-15', 'Efectivo', 'paid'],
      ['PAGO-2026-003', 'Mensualidad Febrero 2026', 200.00, '2026-02-10', 'Tarjeta', 'paid'],
      ['PAGO-2026-004', 'Mensualidad Marzo 2026', 200.00, '2026-03-10', 'Transferencia', 'paid'],
      ['PAGO-2026-005', 'Mensualidad Abril 2026', 200.00, '2026-04-10', '', 'pending'],
      ['PAGO-2026-006', 'Mensualidad Mayo 2026', 200.00, '2026-05-10', '', 'overdue'],
    ];

    for (const p of paymentsData) {
      await client.query(
        'INSERT INTO payments (student_id, reference, concept, amount, payment_date, payment_method, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [studentId, ...p]
      );
    }

    const invoicesData = [
      ['INV-2026-0001', '2026-01-10', 'Matricula Semestre 2026-1', 350.00, 'paid'],
      ['INV-2026-0002', '2026-01-15', 'Mensualidad Enero 2026', 200.00, 'paid'],
      ['INV-2026-0003', '2026-02-10', 'Mensualidad Febrero 2026', 200.00, 'paid'],
      ['INV-2026-0004', '2026-03-10', 'Mensualidad Marzo 2026', 200.00, 'paid'],
      ['INV-2026-0005', '2026-04-10', 'Mensualidad Abril 2026', 200.00, 'pending'],
      ['INV-2026-0006', '2026-05-10', 'Mensualidad Mayo 2026', 200.00, 'overdue'],
    ];

    for (const inv of invoicesData) {
      await client.query(
        'INSERT INTO invoices (student_id, invoice_number, date, concept, amount, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [studentId, ...inv]
      );
    }

    const notificationsData = [
      ['Calificaciones del primer parcial publicadas', 'Se han publicado las calificaciones del primer parcial del semestre 2026-1.', 'academic', false],
      ['Nuevo pago registrado', 'Su pago con referencia PAGO-2026-004 ha sido registrado exitosamente.', 'financial', false],
      ['Fecha limite de inscription', 'Recuerde que la fecha limite de inscription es el 30 de enero.', 'administrative', true],
      ['Tarea pendiente: Practica SQL', 'Tiene una tarea pendiente de entrega en la materia BD101.', 'academic', false],
      ['Bienvenido al semestre 2026-1', 'Le damos la bienvenida al nuevo semestre academico.', 'general', true],
      ['Estado de cuenta actualizado', 'Su estado de cuenta ha sido actualizado con los pagos del mes.', 'financial', true],
      ['Suspension de clases', 'Se informa suspension de clases por festividad nacional.', 'administrative', false],
      ['Examen final programado', 'El examen final de Inteligencia Artificial esta programado para el 20 de diciembre.', 'academic', false],
    ];

    for (const n of notificationsData) {
      await client.query(
        'INSERT INTO notifications (student_id, title, description, notification_type, is_read) VALUES ($1, $2, $3, $4, $5)',
        [studentId, ...n]
      );
    }

    const requestsData = [
      ['Certificado de Notas', 'Solicitud de certificado de notas para el semestre 2025-2', 'approved', 'Documento listo para recoger en coordinacion.'],
      ['Certificado de Estudiante Regular', 'Solicitud de certificado de estudiante regular 2026', 'pending', ''],
      ['Constancia de Estudios', 'Solicitud de constancia de estudios para entidad bancaria', 'in_process', 'En proceso de revision por direccion academica.'],
      ['Solicitud de Revision de Nota', 'Revision de calificacion en materia RED201', 'rejected', 'La calificacion fue verificada y se mantiene.'],
    ];

    for (const r of requestsData) {
      await client.query(
        'INSERT INTO requests (student_id, request_type, description, status, observations) VALUES ($1, $2, $3, $4, $5)',
        [studentId, ...r]
      );
    }

    const academicEventsData = [
      ['Inicio de Clases', 'Primer dia de clases semestre 2026-1', 'event', '2026-08-03', null, null, '#3B82F6'],
      ['Entrega de Parciales', 'Fecha limite para entrega de calificaciones parciales', 'event', '2026-09-20', null, null, '#F59E0B'],
      ['Semana de Examenes Parciales', 'Periodo de examenes parciales', 'exam', '2026-09-22', '2026-09-26', null, '#EF4444'],
      ['Fiestas Patrias', 'Suspension de clases por feriado nacional', 'holiday', '2026-09-28', '2026-09-30', null, '#10B981'],
      ['Semana de Examenes Finales', 'Periodo de examenes finales', 'exam', '2026-12-14', '2026-12-18', null, '#EF4444'],
      ['Cierre de Semestre', 'Ultimo dia de actividades academicas', 'event', '2026-12-20', null, null, '#3B82F6'],
      ['Entrega de Tareas - IA', 'Fecha limite entrega proyecto IA', 'assignment', '2026-09-25', null, 18, '#8B5CF6'],
      ['Examen Parcial - ML', 'Examen parcial de Machine Learning', 'exam', '2026-09-22', null, 21, '#EF4444'],
    ];

    for (const e of academicEventsData) {
      await client.query(
        'INSERT INTO academic_events (title, description, event_type, start_date, end_date, course_id, color) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        e
      );
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully');
    console.log('Credentials: estudiante / Estudiante123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await pool.end();
    });
}
