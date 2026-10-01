import fs from 'fs';
import path from 'path';
import pg from 'pg';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { config } from './config.ts';

const { Pool } = pg;

export interface DBInterface {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[] }>;
}

let dbInstance: DBInterface;
let dbProviderName: 'PostgreSQL' | 'SQLite';

// 1. Detect Database Architecture
if (config.DATABASE_URL) {
  console.log('[DB] Connecting to Production External PostgreSQL (Supabase / DATABASE_URL)...');
  dbProviderName = 'PostgreSQL';

  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  dbInstance = {
    async query<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[] }> {
      const client = await pool.connect();
      try {
        const res = await client.query(sql, params);
        return { rows: res.rows as T[] };
      } finally {
        client.release();
      }
    }
  };
} else {
  // Local Development SQLite
  dbProviderName = 'SQLite';
  const dbDir = path.resolve(config.DATABASE_DIR);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbFilePath = path.join(dbDir, 'silphor.db');
  console.log(`[DB] Using SQLite for Local Development at: ${dbFilePath}`);

  const sqlite = new Database(dbFilePath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  dbInstance = {
    async query<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[] }> {
      // Map Postgres-style $1, $2, $3 parameters to sequential SQLite ? parameters
      const sqliteParams: any[] = [];
      const sqliteSql = sql.replace(/\$(\d+)/g, (_, num) => {
        const idx = parseInt(num, 10) - 1;
        sqliteParams.push(params[idx]);
        return '?';
      });

      // Determine statement type
      const trimmed = sqliteSql.trim();
      const isSelect = /^SELECT\b/i.test(trimmed) || /^PRAGMA\b/i.test(trimmed);

      try {
        const stmt = sqlite.prepare(sqliteSql);
        if (isSelect) {
          const rows = stmt.all(...sqliteParams) as T[];
          return { rows };
        } else {
          stmt.run(...sqliteParams);
          return { rows: [] };
        }
      } catch (err: any) {
        console.error(`[SQLite Error] Query failed: ${trimmed.substring(0, 100)}...`, err);
        throw err;
      }
    }
  };
}

export const db = dbInstance;
export const getDatabaseProvider = () => dbProviderName;
export const isPostgresConfigured = () => dbProviderName === 'PostgreSQL';

// 2. Automated Schema Migrations & Seeding
export async function initDatabase(): Promise<void> {
  console.log(`[DB] Running automated migrations for ${dbProviderName}...`);
  const isPg = dbProviderName === 'PostgreSQL';

  // 1. Users Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
      phone TEXT,
      designation TEXT,
      bio TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Categories Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon_name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Courses Table (100% INR Currency)
  await db.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT NOT NULL,
      full_description TEXT NOT NULL,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      level TEXT NOT NULL DEFAULT 'Intermediate',
      duration TEXT NOT NULL DEFAULT '8 Weeks',
      language TEXT NOT NULL DEFAULT 'English',
      instructor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      price NUMERIC NOT NULL DEFAULT 4999,
      discount_price NUMERIC,
      currency TEXT NOT NULL DEFAULT 'INR',
      thumbnail_url TEXT,
      banner_url TEXT,
      video_preview_url TEXT,
      learning_objectives TEXT,
      prerequisites TEXT,
      skills TEXT,
      certificate_enabled BOOLEAN DEFAULT 1,
      is_featured BOOLEAN DEFAULT 0,
      is_published BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Course Modules Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS course_modules (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Lessons Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      duration TEXT DEFAULT '15 mins',
      video_url TEXT,
      content_markdown TEXT,
      order_index INTEGER NOT NULL DEFAULT 1,
      is_free_preview BOOLEAN DEFAULT 0,
      has_lab_simulation BOOLEAN DEFAULT 0,
      lab_config TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Enrollments Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
      completed_at TIMESTAMP,
      certificate_code TEXT,
      UNIQUE(user_id, course_id)
    );
  `);

  // 7. Course Progress Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS course_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      is_completed BOOLEAN DEFAULT 0,
      completed_at TIMESTAMP,
      UNIQUE(user_id, lesson_id)
    );
  `);

  // 8. Payments Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      payment_id TEXT UNIQUE NOT NULL,
      order_id TEXT,
      amount NUMERIC NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'captured' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
      method TEXT DEFAULT 'UPI / NetBanking',
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. Quizzes Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      passing_score INTEGER DEFAULT 75,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. Quiz Questions Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer_index INTEGER NOT NULL,
      explanation TEXT
    );
  `);

  // 11. Quiz Attempts Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      passed BOOLEAN NOT NULL,
      attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 12. Assignments Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      instructions TEXT NOT NULL,
      max_score INTEGER DEFAULT 100,
      due_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 13. Assignment Submissions Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      submission_content TEXT NOT NULL,
      file_url TEXT,
      score INTEGER,
      feedback TEXT,
      status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmitted')),
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      graded_at TIMESTAMP
    );
  `);

  // 14. Certificates Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      certificate_code TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      course_name TEXT NOT NULL,
      issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      instructor_name TEXT NOT NULL,
      qr_code_data TEXT NOT NULL,
      UNIQUE(user_id, course_id)
    );
  `);

  // 15. Announcements Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 16. Contact Messages Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 17. Settings Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin, staff, student accounts if table empty
  const userCheck = await db.query<any>(`SELECT COUNT(*) as count FROM users`);
  if (parseInt(userCheck.rows[0]?.count || '0', 10) === 0) {
    console.log('[DB] Seeding administrator, instructor, and student accounts...');
    const adminHash = await bcrypt.hash('Admin@Silphor2026', 10);
    const staffHash = await bcrypt.hash('Staff@Silphor2026', 10);
    const studentHash = await bcrypt.hash('Student@Silphor2026', 10);

    await db.query(`
      INSERT INTO users (id, name, email, password_hash, role, phone, designation, bio)
      VALUES
        ('usr-admin-1', 'Silphor Administrator', 'admin@silphortechnologies.com', $1, 'admin', '+91 7829455663', 'Chief Technology Officer', 'Head of Engineering Curriculum and Academic Governance at Silphor Technologies.'),
        ('usr-staff-1', 'Dr. Rajesh Sharma', 'instructor@silphortechnologies.com', $2, 'staff', '+91 7829455663', 'Lead Industrial Automation Specialist', 'Over 16 years leading high-voltage electrical automation and SCADA commissioning.'),
        ('usr-staff-2', 'Prof. Ananya Sen', 'ananya.sen@silphortechnologies.com', $2, 'staff', '+91 7829455663', 'Principal Embedded & EV Systems Architect', 'Expert in lithium-ion battery management systems, field-oriented control, and power electronics.'),
        ('usr-student-1', 'Arjun Patel', 'student@silphortechnologies.com', $3, 'student', '+91 91234 56780', 'Electrical Engineering Student', 'Enthusiastic electrical engineering scholar pursuing advanced automation and embedded electronics credentials.'),
        ('usr-admin-atom', 'Admin (Platform Owner)', 'atomceatomce@gmail.com', $1, 'admin', '+91 7829455663', 'Chief Academic Officer', 'Super Administrator for Silphor Technologies.')
    `, [adminHash, staffHash, studentHash]);
  }

  // Ensure atomceatomce@gmail.com always has admin role
  const atomceHash = await bcrypt.hash('Admin@Silphor2026', 10);
  await db.query(`
    INSERT INTO users (id, name, email, password_hash, role, phone, designation, bio)
    VALUES ('usr-admin-atom', 'Admin (Platform Owner)', 'atomceatomce@gmail.com', $1, 'admin', '+91 7829455663', 'Chief Academic Officer', 'Super Administrator for Silphor Technologies.')
    ON CONFLICT (email) DO UPDATE SET role = 'admin'
  `, [atomceHash]);

  // Seed Core Categories
  const catCheck = await db.query<any>(`SELECT COUNT(*) as count FROM categories`);
  if (parseInt(catCheck.rows[0]?.count || '0', 10) === 0) {
    console.log('[DB] Seeding core engineering categories...');
    await db.query(`
      INSERT INTO categories (id, name, slug, description, icon_name)
      VALUES
        ('cat-ee', 'Electrical Engineering', 'electrical-engineering', 'Foundational circuit analysis, electromagnetics, transformers, and 3-phase power distribution networks.', 'Zap'),
        ('cat-auto', 'Industrial Automation', 'industrial-automation', 'Siemens TIA Portal, Rockwell Allen-Bradley PLCs, SCADA architectures, and industrial protocols.', 'Cpu'),
        ('cat-emb', 'Embedded Systems & IoT', 'embedded-systems-iot', 'ARM Cortex-M firmware, real-time operating systems (FreeRTOS), hardware bus interfaces, and IoT sensor telemetry.', 'Microchip'),
        ('cat-pe', 'Power Electronics & EV', 'power-electronics-ev', 'Silicon Carbide (SiC) inverters, high-efficiency DC-DC buck/boost converters, and automotive battery management systems.', 'BatteryCharging'),
        ('cat-pcb', 'PCB Design & Hardware', 'pcb-design-hardware', 'Multilayer high-speed PCB layouts, impedance control, differential pairs, EMI/EMC compliance, and DFM validation.', 'Layers')
    `);
  }

  // Seed Initial Accredited Courses (including Advanced Electrical Machines)
  const courseCheck = await db.query<any>(`SELECT COUNT(*) as count FROM courses`);
  if (parseInt(courseCheck.rows[0]?.count || '0', 10) === 0) {
    console.log('[DB] Seeding core accredited curriculum courses (in ₹ INR)...');
    await db.query(`
      INSERT INTO courses (
        id, title, slug, short_description, full_description, category_id, level, duration, language,
        instructor_id, price, discount_price, currency, thumbnail_url, banner_url, video_preview_url,
        learning_objectives, prerequisites, skills, certificate_enabled, is_featured, is_published
      )
      VALUES
        (
          'crs-aem',
          'Advanced Electrical Machines',
          'advanced-electrical-machines',
          'Synchronous machines, reluctance drives, finite element electromagnetic analysis, and industrial high-efficiency standards.',
          'An advanced engineering curriculum covering modern electric motor design, slot harmonics, rotor skewed windings, silicon steel saturation modeling, and thermal cooling jackets.',
          'cat-ee',
          'Intermediate',
          '8 Weeks',
          'English',
          'usr-staff-1',
          8499,
          6999,
          'INR',
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
          'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
          '["Model synchronous reluctance machines and PMSMs","Calculate electromagnetic torque and flux linkage","Verify industrial insulation under VFD switching stress","Simulate interactive 3D machine magnetic circuits"]',
          'Electrical Engineering Fundamentals and AC circuit theory.',
          'Machine Design, Magnetic Modeling, Finite Element Simulation, VFD Interfacing',
          1,
          1,
          1
        ),
        (
          'crs-1',
          'Electrical Engineering Fundamentals',
          'electrical-engineering-fundamentals',
          'Master AC/DC circuit analysis, electromagnetics, transformers, and 3-phase power fundamentals with industry-grade numerical rigor.',
          'Comprehensive course covering basic to advanced electrical principles. Derived from foundational Maxwell equations down to practical distribution switchgear design.',
          'cat-ee',
          'Beginner',
          '6 Weeks',
          'English',
          'usr-staff-1',
          4999,
          3999,
          'INR',
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
          'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
          '["Understand Ohm, Kirchhoff, Thevenin and Norton theorems in AC/DC networks","Analyze single-phase and 3-phase transformer core losses and equivalent circuits","Model high-voltage induction motor transient characteristics","Simulate interactive circuit schematics inside the 3D Engineering Lab"]',
          'Basic high school physics and linear algebra.',
          'Circuit Theory, Phasor Analysis, Magnetic Circuits, Transformer Sizing',
          1,
          1,
          1
        ),
        (
          'crs-2',
          'Industrial Automation with Siemens PLC & SCADA',
          'industrial-automation-siemens-plc-scada',
          'Complete hands-on commissioning of Siemens S7-1200/1500 controllers, TIA Portal, ladder logic, function blocks, and WinCC SCADA.',
          'Step-by-step industrial engineering from wire terminal block assignment to complex structured text state machines and recipe management in WinCC.',
          'cat-auto',
          'Intermediate',
          '10 Weeks',
          'English',
          'usr-staff-1',
          9999,
          7999,
          'INR',
          'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80',
          'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
          '["Design IEC 61131-3 compliant Ladder Diagrams (LD) and Structured Text (ST)","Interface digital/analog I/O cards with PT100 temperature sensors and 4-20mA pressure transmitters","Configure PROFINET and Modbus TCP industrial fieldbus communication","Build real-time graphical SCADA HMIs with alarms, trends, and data logging"]',
          'Basic familiarity with digital logic and relays.',
          'PLC Programming, TIA Portal, SCADA, Industrial Ethernet, Troubleshooting',
          1,
          1,
          1
        ),
        (
          'crs-3',
          'Electric Vehicle Powertrain & Battery Management Systems',
          'electric-vehicle-powertrain-bms',
          'Design traction inverters, field-oriented PMSM motor drives, regenerative braking circuits, and lithium-ion active balancing BMS.',
          'Deep dive into the core electro-mechanical architecture of modern electric mobility. Learn state-of-charge (SoC) estimation algorithms, Kalman filtering, thermal runaway mitigation, and high-voltage isolation safety according to ISO 26262.',
          'cat-pe',
          'Advanced',
          '12 Weeks',
          'English',
          'usr-staff-2',
          14999,
          11999,
          'INR',
          'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=1600&q=80',
          'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
          '["Model lithium chemistry cell degradation, open-circuit voltage curves, and internal resistance","Implement Space Vector Pulse Width Modulation (SVPWM) for permanent magnet synchronous motors","Design high-voltage DC-DC bidirectional boost converters with synchronous rectification","Write embedded safety interlock drivers for high-voltage contactors and precharge resistors"]',
          'Power electronics foundations and basic C programming.',
          'EV Powertrain, BMS Architecture, SiC Inverters, Thermal Management, FOC Control',
          1,
          1,
          1
        )
    `);

    // Modules
    await db.query(`
      INSERT INTO course_modules (id, course_id, title, order_index)
      VALUES
        ('mod-aem-1', 'crs-aem', 'Module 1: Reluctance Topologies & Harmonic Analysis', 1),
        ('mod-aem-2', 'crs-aem', 'Module 2: High-Frequency Finite Element Modeling', 2),
        ('mod-1-1', 'crs-1', 'Module 1: Circuit Foundations & Matrix Analysis', 1),
        ('mod-2-1', 'crs-2', 'Module 1: Hardware Architecture & Wiring Standards', 1),
        ('mod-3-1', 'crs-3', 'Module 1: Lithium-ion Electro-chemistry & Cell Packaging', 1)
    `);

    // Lessons
    await db.query(`
      INSERT INTO lessons (id, module_id, course_id, title, duration, video_url, content_markdown, order_index, is_free_preview, has_lab_simulation, lab_config)
      VALUES
        ('les-aem-1', 'mod-aem-1', 'crs-aem', 'Rotor Field Distribution & Saliency Ratio', '25 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Detailed electromagnetic field breakdown of synchronous reluctance machines.', 1, 1, 1, '{"modelType":"motor","defaultVoltage":415,"frequency":50}'),
        ('les-1-1-1', 'mod-1-1', 'crs-1', 'Introduction to Dynamic Network Theorems', '22 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Detailed analysis of nodal and mesh methods in AC circuits with reactive impedance matrices.', 1, 1, 1, '{"modelType":"transformer","defaultVoltage":415,"frequency":50}'),
        ('les-2-1-1', 'mod-2-1', 'crs-2', 'Industrial Controller Hardware Architecture', '20 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Sinking vs sourcing digital inputs, galvanic optocoupler isolation, and 24V DC power distribution.', 1, 1, 1, '{"modelType":"plc","defaultVoltage":24,"frequency":0}'),
        ('les-3-1-1', 'mod-3-1', 'crs-3', 'Battery Cell Characterization & Balancing Topologies', '30 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Passive resistor bleeding vs active flying capacitor balancing networks across high-voltage cell stacks.', 1, 1, 1, '{"modelType":"inverter","defaultVoltage":400,"frequency":60}')
    `);

    // Quizzes & Questions
    await db.query(`
      INSERT INTO quizzes (id, course_id, title, passing_score)
      VALUES
        ('qiz-aem', 'crs-aem', 'Advanced Electrical Machines Assessment', 75),
        ('qiz-1', 'crs-1', 'Electrical Engineering Fundamentals Assessment', 75)
    `);

    await db.query(`
      INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_answer_index, explanation)
      VALUES
        ('qq-aem-1', 'qiz-aem', 'What is the primary factor that maximizes reluctance torque in a synchronous reluctance motor?', '["Minimizing stator resistance", "Maximizing the saliency ratio (Ld / Lq)", "Operating at low flux density", "Increasing rotor copper volume"]', 1, 'Reluctance torque is directly proportional to the difference between d-axis and q-axis inductances (Ld - Lq), requiring a high saliency ratio.'),
        ('qq-1', 'qiz-1', 'In a balanced 3-phase star (Y) connected system, what is the mathematical relation between line voltage (V_L) and phase voltage (V_ph)?', '["V_L = V_ph", "V_L = sqrt(3) * V_ph", "V_L = V_ph / sqrt(3)", "V_L = 3 * V_ph"]', 1, 'In a star connection, the line-to-line voltage is V_L = sqrt(3) * V_ph.')
    `);

    // Assignment
    await db.query(`
      INSERT INTO assignments (id, course_id, title, instructions, max_score)
      VALUES
        ('asg-aem', 'crs-aem', 'Industrial High-Efficiency Motor Design Simulation', 'Model a 15 kW synchronous reluctance motor stator and rotor geometry. Calculate torque ripple, saliency ratio, and thermal gradient at 1500 RPM full load.', 100),
        ('asg-1', 'crs-1', 'Three-Phase Substation Transformer Sizing Project', 'Provide detailed engineering calculations for an 11kV/415V distribution transformer supplying an inductive load of 750 kVA.', 100)
    `);
  }

  // Seed Website Settings with updated contact information
  await db.query(`
    INSERT INTO settings (key, value)
    VALUES
      ('website_name', 'SILPHOR TECHNOLOGIES'),
      ('tagline', 'DESIGN • INNOVATE • VERIFY • DELIVER'),
      ('currency', 'INR'),
      ('currency_symbol', '₹'),
      ('phone', '+91 7829455663'),
      ('email', 'silphortechnologies@gmail.com'),
      ('address', '#45 East Road, Malleswaram, Bangalore, Karnataka - 560003, India'),
      ('landmark', 'Near 8th Cross Cultural Hub & Malleswaram Ground'),
      ('hours_weekdays', 'Mon - Fri: 9:00 AM - 7:00 PM IST'),
      ('hours_saturday', 'Sat: 9:30 AM - 5:30 PM IST')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `);

  console.log('[DB] Schemas and seed data verified successfully.');
}
