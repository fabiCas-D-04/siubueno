import pool from './connection';

export async function createTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS careers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        total_credits INTEGER NOT NULL DEFAULT 160,
        total_semesters INTEGER NOT NULL DEFAULT 10
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        student_code VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20) DEFAULT '',
        birth_date DATE,
        career_id INTEGER REFERENCES careers(id),
        semester INTEGER DEFAULT 1,
        campus VARCHAR(100) DEFAULT 'Principal',
        photo_url VARCHAR(500) DEFAULT '',
        status VARCHAR(20) DEFAULT 'active',
        admission_date DATE DEFAULT CURRENT_DATE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        career_id INTEGER REFERENCES careers(id),
        semester INTEGER NOT NULL,
        credits INTEGER NOT NULL DEFAULT 3,
        description TEXT DEFAULT ''
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id),
        semester VARCHAR(10) NOT NULL,
        group_code VARCHAR(10) NOT NULL DEFAULT 'A',
        status VARCHAR(20) DEFAULT 'enrolled',
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
        partial1 REAL,
        partial2 REAL,
        practices REAL,
        project REAL,
        final_exam REAL,
        final_grade REAL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'present'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        title VARCHAR(200) NOT NULL,
        description TEXT DEFAULT '',
        due_date DATE NOT NULL,
        due_time VARCHAR(10) NOT NULL DEFAULT '23:59',
        max_score REAL DEFAULT 100
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER REFERENCES assignments(id),
        student_id INTEGER REFERENCES students(id),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        file_url VARCHAR(500),
        notes TEXT DEFAULT '',
        score REAL,
        status VARCHAR(20) DEFAULT 'submitted'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schedule (
        id SERIAL PRIMARY KEY,
        enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
        day_of_week VARCHAR(20) NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        classroom VARCHAR(50) NOT NULL DEFAULT 'A-101'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS academic_events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT DEFAULT '',
        event_type VARCHAR(30) NOT NULL DEFAULT 'event',
        start_date DATE NOT NULL,
        end_date DATE,
        course_id INTEGER REFERENCES courses(id),
        color VARCHAR(20) DEFAULT '#3B82F6'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        reference VARCHAR(50) UNIQUE NOT NULL,
        concept VARCHAR(200) NOT NULL,
        amount REAL NOT NULL,
        payment_date DATE,
        payment_method VARCHAR(50) DEFAULT '',
        status VARCHAR(20) DEFAULT 'pending'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        invoice_number VARCHAR(30) UNIQUE NOT NULL,
        date DATE NOT NULL,
        concept VARCHAR(200) NOT NULL,
        amount REAL NOT NULL,
        status VARCHAR(20) DEFAULT 'pending'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT DEFAULT '',
        notification_type VARCHAR(30) DEFAULT 'general',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        request_type VARCHAR(100) NOT NULL,
        description TEXT DEFAULT '',
        status VARCHAR(20) DEFAULT 'pending',
        observations TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}
