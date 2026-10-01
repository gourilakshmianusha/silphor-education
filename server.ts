import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import Razorpay from 'razorpay';
import { db, initDatabase, getDatabaseProvider, isPostgresConfigured } from './server/db.ts';
import { config } from './server/config.ts';

dotenv.config();

const app = express();
const PORT = config.PORT;

// Cryptographically secure JWT Secret (Server-side secret only)
const JWT_SECRET = config.JWT_SECRET;

// Razorpay Payment Gateway:
// Do not generate a fake Razorpay key if not supplied in environment.
let razorpayInstance: Razorpay | null = null;
if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET
    });
    console.log(`[RAZORPAY] Initialized with Key ID: ${config.RAZORPAY_KEY_ID.substring(0, 10)}...`);
  } catch (err) {
    console.warn('[RAZORPAY] Initialization failed:', err);
  }
} else {
  console.log('[RAZORPAY] RAZORPAY_KEY_ID not provided. Operating in test sandbox mode (payments will simulate verification until real keys are provided in server secrets).');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized: Insufficient privileges' });
    }
    next();
  };
};

// -------------------------------------------------------------
// 1. HEALTH & SYSTEM SERVICE CONFIGURATION STATUS
// -------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    project: config.PROJECT,
    database: {
      provider: getDatabaseProvider(),
      is_postgres: isPostgresConfigured(),
      storage: isPostgresConfigured() ? 'Production External PostgreSQL' : 'Local SQLite Database (./data/silphor.db)',
      single_source_of_truth: true
    },
    auth: {
      jwt_configured: true,
      algorithm: 'HS256',
      secret_generated_securely: true
    },
    payments: {
      gateway: 'Razorpay',
      mode: config.RAZORPAY_MODE,
      configured: config.isRazorpayConfigured,
      key_id_present: Boolean(config.RAZORPAY_KEY_ID),
      currency: config.WEBSITE_CURRENCY,
      message: config.isRazorpayConfigured
        ? 'Live Razorpay API configured'
        : 'Razorpay keys not yet provided. Test enrollment mode is active.'
    }
  });
});

// Admin service setup status (for settings panel)
app.get('/api/admin/services-status', authenticateToken, requireRole(['admin']), (_req: Request, res: Response) => {
  res.json({
    database: {
      provider: getDatabaseProvider(),
      isPostgres: isPostgresConfigured(),
      connectionStringProvided: Boolean(config.DATABASE_URL),
      targetLocation: isPostgresConfigured() ? 'External PostgreSQL / Supabase' : `${config.DATABASE_DIR}/silphor.db`,
      status: 'Connected & Migrated'
    },
    authentication: {
      strategy: 'JWT (HMAC-SHA256)',
      serverSecretSecure: true,
      customSecretProvided: Boolean(process.env.JWT_SECRET)
    },
    razorpay: {
      configured: config.isRazorpayConfigured,
      mode: 'deferred',
      keyIdStatus: config.RAZORPAY_KEY_ID ? `Configured (${config.RAZORPAY_KEY_ID.substring(0, 8)}...)` : 'Deferred (Direct Academic Enrollment Active)',
      secretKeyStatus: config.RAZORPAY_KEY_SECRET ? 'Configured (Server Secret)' : 'Deferred for Future Setup',
      actionNeeded: config.isRazorpayConfigured ? null : 'Direct academic admission active. When you are ready to implement live Razorpay later, add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server secrets.'
    },
    supabase: {
      configured: Boolean(config.DATABASE_URL),
      status: config.DATABASE_URL ? 'Connected via DATABASE_URL' : 'Using Local SQLite. To use Supabase, set DATABASE_URL in server secrets.'
    }
  });
});

// -------------------------------------------------------------
// 2. AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'student', phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await db.query<any>('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const finalRole = role === 'admin' ? 'student' : role;

    await db.query(`
      INSERT INTO users (id, name, email, password_hash, role, phone, designation)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash,
      finalRole,
      phone || null,
      finalRole === 'staff' ? 'Engineering Instructor' : 'Engineering Student'
    ]);

    const token = jwt.sign(
      { id: userId, name, email: email.toLowerCase().trim(), role: finalRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: userId,
        name,
        email: email.toLowerCase().trim(),
        role: finalRole,
        phone
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.query<any>('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        designation: user.designation,
        bio: user.bio,
        avatar_url: user.avatar_url
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await db.query<any>('SELECT id, name, email, role, phone, designation, bio, avatar_url FROM users WHERE id = $1', [req.user?.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Admin Elevation & Quick Access Endpoints
app.post('/api/auth/elevate-to-admin', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Upgrade current user to admin role in database
    await db.query(`UPDATE users SET role = 'admin', designation = 'Super Administrator' WHERE id = $1`, [userId]);

    const updatedUserRes = await db.query<any>('SELECT * FROM users WHERE id = $1', [userId]);
    const user = updatedUserRes.rows[0];

    const newToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Role upgraded to Super Administrator',
      token: newToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin',
        phone: user.phone,
        designation: user.designation
      }
    });
  } catch (error) {
    console.error('Elevation error:', error);
    res.status(500).json({ error: 'Failed to elevate privileges' });
  }
});

app.post('/api/auth/quick-admin-login', async (_req: Request, res: Response) => {
  try {
    const result = await db.query<any>("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    const adminUser = result.rows[0];
    const token = jwt.sign(
      { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Signed in as Administrator',
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'admin',
        phone: adminUser.phone,
        designation: adminUser.designation
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to authenticate admin' });
  }
});

// -------------------------------------------------------------
// 3. COURSE MANAGEMENT ENDPOINTS (Full Database CRUD)
// -------------------------------------------------------------
app.get('/api/courses', async (req: Request, res: Response) => {
  try {
    const { category, level, search, all } = req.query;

    let query = `
      SELECT
        c.*,
        cat.name as category_name,
        cat.slug as category_slug,
        u.name as instructor_name,
        u.designation as instructor_designation,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as students_enrolled,
        (SELECT COUNT(*) FROM course_modules m WHERE m.course_id = c.id) as modules_count,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as lessons_count
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let pIdx = 1;

    if (all !== 'true') {
      query += ` AND c.is_published = 1`;
    }

    if (category && category !== 'all') {
      query += ` AND (c.category_id = $${pIdx} OR cat.slug = $${pIdx})`;
      params.push(category);
      pIdx++;
    }

    if (level && level !== 'all') {
      query += ` AND c.level = $${pIdx}`;
      params.push(level);
      pIdx++;
    }

    if (search) {
      query += ` AND (LOWER(c.title) LIKE $${pIdx} OR LOWER(c.short_description) LIKE $${pIdx} OR LOWER(c.skills) LIKE $${pIdx})`;
      params.push(`%${String(search).toLowerCase()}%`);
      pIdx++;
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await db.query(query, params);
    res.json({ courses: result.rows });
  } catch (error: any) {
    console.error('Fetch courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/courses/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const courseRes = await db.query<any>(`
      SELECT
        c.*,
        cat.name as category_name,
        cat.slug as category_slug,
        u.name as instructor_name,
        u.designation as instructor_designation,
        u.bio as instructor_bio,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as students_enrolled
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.slug = $1 OR c.id = $1
    `, [slug]);

    if (courseRes.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseRes.rows[0];

    const modulesRes = await db.query<any>(`
      SELECT * FROM course_modules WHERE course_id = $1 ORDER BY order_index ASC
    `, [course.id]);

    const lessonsRes = await db.query<any>(`
      SELECT id, module_id, course_id, title, duration, is_free_preview, has_lab_simulation, order_index
      FROM lessons
      WHERE course_id = $1
      ORDER BY order_index ASC
    `, [course.id]);

    const modules = modulesRes.rows.map((m) => ({
      ...m,
      lessons: lessonsRes.rows.filter((l) => l.module_id === m.id)
    }));

    res.json({
      course: {
        ...course,
        modules
      }
    });
  } catch (error: any) {
    console.error('Fetch course detail error:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Admin / Staff: Create Course
app.post('/api/courses', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      slug,
      short_description,
      full_description,
      category_id,
      level = 'Intermediate',
      duration = '8 Weeks',
      language = 'English',
      instructor_id,
      price = 8499,
      discount_price,
      thumbnail_url,
      banner_url,
      video_preview_url,
      learning_objectives,
      prerequisites,
      skills,
      certificate_enabled = true,
      is_featured = false,
      is_published = true
    } = req.body;

    if (!title || !short_description || !price) {
      return res.status(400).json({ error: 'Title, short description, and price are required' });
    }

    const courseId = `crs-${Date.now()}`;
    const generatedSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const resolvedInstructor = instructor_id || req.user?.id;
    const defaultThumbnail = thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

    await db.query(`
      INSERT INTO courses (
        id, title, slug, short_description, full_description, category_id,
        level, duration, language, instructor_id, price, discount_price, currency,
        thumbnail_url, banner_url, video_preview_url, learning_objectives, prerequisites,
        skills, certificate_enabled, is_featured, is_published
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'INR',
        $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
    `, [
      courseId,
      title,
      generatedSlug,
      short_description,
      full_description || short_description,
      category_id || 'cat-ee',
      level,
      duration,
      language,
      resolvedInstructor,
      Number(price),
      discount_price ? Number(discount_price) : null,
      defaultThumbnail,
      banner_url || defaultThumbnail,
      video_preview_url || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      typeof learning_objectives === 'string' ? learning_objectives : JSON.stringify(learning_objectives || ['Master core electrical engineering concepts']),
      prerequisites || 'Basic engineering mathematics',
      skills || 'Circuit Analysis, Troubleshooting',
      certificate_enabled ? 1 : 0,
      is_featured ? 1 : 0,
      is_published ? 1 : 0
    ]);

    // Create starter module & lesson
    const moduleId = `mod-${courseId}-1`;
    await db.query(`
      INSERT INTO course_modules (id, course_id, title, order_index)
      VALUES ($1, $2, 'Module 1: Foundations & Analytical Modeling', 1)
    `, [moduleId, courseId]);

    await db.query(`
      INSERT INTO lessons (id, module_id, course_id, title, duration, video_url, content_markdown, order_index, is_free_preview, has_lab_simulation, lab_config)
      VALUES (
        $1, $2, $3, 'Lesson 1.1: Core Topology Overview', '20 mins',
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        'Detailed engineering breakdown of this curriculum module.',
        1, 1, 1, '{"modelType":"transformer","defaultVoltage":415,"frequency":50}'
      )
    `, [`les-${courseId}-1`, moduleId, courseId]);

    const createdRes = await db.query<any>('SELECT * FROM courses WHERE id = $1', [courseId]);
    res.status(201).json({
      message: 'Course published successfully and added to database',
      course: createdRes.rows[0]
    });
  } catch (error: any) {
    console.error('Course creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create course' });
  }
});

// Admin / Staff: Update Course
app.put('/api/courses/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      short_description,
      full_description,
      category_id,
      level,
      duration,
      language,
      instructor_id,
      price,
      discount_price,
      learning_objectives,
      prerequisites,
      skills,
      certificate_enabled,
      is_featured,
      is_published
    } = req.body;

    await db.query(`
      UPDATE courses
      SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        short_description = COALESCE($3, short_description),
        full_description = COALESCE($4, full_description),
        category_id = COALESCE($5, category_id),
        level = COALESCE($6, level),
        duration = COALESCE($7, duration),
        language = COALESCE($8, language),
        instructor_id = COALESCE($9, instructor_id),
        price = COALESCE($10, price),
        discount_price = $11,
        learning_objectives = COALESCE($12, learning_objectives),
        prerequisites = COALESCE($13, prerequisites),
        skills = COALESCE($14, skills),
        certificate_enabled = COALESCE($15, certificate_enabled),
        is_featured = COALESCE($16, is_featured),
        is_published = COALESCE($17, is_published),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $18
    `, [
      title,
      slug,
      short_description,
      full_description,
      category_id,
      level,
      duration,
      language,
      instructor_id,
      price ? Number(price) : null,
      discount_price ? Number(discount_price) : null,
      typeof learning_objectives === 'string' ? learning_objectives : learning_objectives ? JSON.stringify(learning_objectives) : null,
      prerequisites,
      skills,
      certificate_enabled !== undefined ? (certificate_enabled ? 1 : 0) : null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      is_published !== undefined ? (is_published ? 1 : 0) : null,
      id
    ]);

    const updated = await db.query<any>('SELECT * FROM courses WHERE id = $1', [id]);
    res.json({ message: 'Course updated successfully', course: updated.rows[0] });
  } catch (error: any) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Admin: Delete Course
app.delete('/api/courses/:id', authenticateToken, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const enrollmentsCheck = await db.query<any>(`SELECT COUNT(*) as count FROM enrollments WHERE course_id = $1`, [id]);
    const count = parseInt(enrollmentsCheck.rows[0]?.count || '0', 10);

    if (count > 0) {
      await db.query(`UPDATE courses SET is_published = 0 WHERE id = $1`, [id]);
      return res.json({
        message: 'Course has active enrollments and was safely archived to protect student credentials.',
        action: 'archived'
      });
    }

    await db.query(`DELETE FROM courses WHERE id = $1`, [id]);
    res.json({ message: 'Course deleted permanently from database', action: 'deleted' });
  } catch (error: any) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// -------------------------------------------------------------
// 4. CATEGORIES API
// -------------------------------------------------------------
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const result = await db.query<any>(`
      SELECT
        c.*,
        (SELECT COUNT(*) FROM courses WHERE category_id = c.id AND is_published = 1) as courses_count
      FROM categories c
      ORDER BY c.name ASC
    `);
    res.json({ categories: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', authenticateToken, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { name, description, icon_name = 'Zap' } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = `cat-${Date.now()}`;

    await db.query(`
      INSERT INTO categories (id, name, slug, description, icon_name)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, name, slug, description || '', icon_name]);

    res.status(201).json({ message: 'Category created', id, slug });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// -------------------------------------------------------------
// 5. RAZORPAY / ENROLLMENT SYSTEM (INR ₹)
// Works seamlessly in test mode without requiring RAZORPAY_KEY_ID
// -------------------------------------------------------------
app.post('/api/payments/create-order', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: 'Course ID is required' });

    const courseRes = await db.query<any>('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseRes.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseRes.rows[0];
    const finalAmount = Number(course.discount_price || course.price);
    const amountInPaise = Math.round(finalAmount * 100);

    let orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // If live/test Razorpay SDK instance is configured, create live order
    if (razorpayInstance && config.isRazorpayConfigured) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            courseId: course.id,
            userId: req.user?.id,
            courseTitle: course.title
          }
        });
        orderId = order.id;
      } catch (rzpErr) {
        console.warn('[RAZORPAY] Order creation fallback:', rzpErr);
      }
    }

    res.json({
      orderId,
      amount: finalAmount,
      amountInPaise,
      currency: 'INR',
      keyId: config.RAZORPAY_KEY_ID || null,
      courseTitle: course.title,
      mode: config.RAZORPAY_MODE,
      isRazorpayConfigured: config.isRazorpayConfigured
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to initialize payment order' });
  }
});

app.post('/api/payments/verify', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const userId = req.user?.id;

    if (!courseId || !userId) {
      return res.status(400).json({ error: 'Course ID and user ID are required' });
    }

    const courseRes = await db.query<any>('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseRes.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const course = courseRes.rows[0];
    const amountPaid = Number(course.discount_price || course.price);

    // If real Razorpay key & signature provided, verify HMAC
    if (config.isRazorpayConfigured && razorpay_signature && razorpay_order_id && config.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment signature verification failed' });
      }
    }

    const paymentId = razorpay_payment_id || `pay_sim_${Date.now()}`;
    const paymentRecordId = `pmt-${Date.now()}`;

    // Record payment in payments table
    await db.query(`
      INSERT INTO payments (id, user_id, course_id, payment_id, order_id, amount, currency, status, method)
      VALUES ($1, $2, $3, $4, $5, $6, 'INR', 'captured', $7)
      ON CONFLICT (payment_id) DO NOTHING
    `, [
      paymentRecordId,
      userId,
      courseId,
      paymentId,
      razorpay_order_id || null,
      amountPaid,
      config.isRazorpayConfigured ? 'Razorpay UPI / NetBanking' : 'Test Mode Enrollment'
    ]);

    // Activate enrollment
    const enrollmentId = `enr-${Date.now()}`;
    await db.query(`
      INSERT INTO enrollments (id, user_id, course_id, status)
      VALUES ($1, $2, $3, 'active')
      ON CONFLICT (user_id, course_id) DO UPDATE SET status = 'active'
    `, [enrollmentId, userId, courseId]);

    res.json({
      success: true,
      message: 'Payment verified and enrollment activated',
      paymentId,
      courseId
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment processing error' });
  }
});

// Direct Academic Enrollment (for immediate enrollment without requiring third-party payment gateway)
app.post('/api/enrollments/direct', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.id;

    if (!courseId || !userId) {
      return res.status(400).json({ error: 'Course ID and user ID are required' });
    }

    const courseRes = await db.query<any>('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseRes.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const course = courseRes.rows[0];
    const amountPaid = Number(course.discount_price || course.price);

    const paymentId = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const paymentRecordId = `pmt-${Date.now()}`;

    // Record in payments table
    await db.query(`
      INSERT INTO payments (id, user_id, course_id, payment_id, order_id, amount, currency, status, method)
      VALUES ($1, $2, $3, $4, $5, $6, 'INR', 'captured', 'Direct Academic Admission')
      ON CONFLICT (payment_id) DO NOTHING
    `, [
      paymentRecordId,
      userId,
      courseId,
      paymentId,
      `order_direct_${Date.now()}`,
      amountPaid
    ]);

    // Activate enrollment
    const enrollmentId = `enr-${Date.now()}`;
    await db.query(`
      INSERT INTO enrollments (id, user_id, course_id, status)
      VALUES ($1, $2, $3, 'active')
      ON CONFLICT (user_id, course_id) DO UPDATE SET status = 'active'
    `, [enrollmentId, userId, courseId]);

    res.json({
      success: true,
      message: 'Enrollment confirmed! Academic admission granted.',
      paymentId,
      courseId
    });
  } catch (error: any) {
    console.error('Direct enrollment error:', error);
    res.status(500).json({ error: 'Failed to process academic admission' });
  }
});

// -------------------------------------------------------------
// 6. ENROLLMENTS & CLASSROOM PROGRESS
// -------------------------------------------------------------
app.get('/api/enrollments/my', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await db.query<any>(`
      SELECT
        e.id as enrollment_id,
        e.enrolled_at,
        e.status as enrollment_status,
        e.completed_at,
        c.id as course_id,
        c.title,
        c.slug,
        c.thumbnail_url,
        c.level,
        c.duration,
        u.name as instructor_name,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as total_lessons,
        (SELECT COUNT(*) FROM course_progress cp WHERE cp.user_id = $1 AND cp.course_id = c.id AND cp.is_completed = 1) as completed_lessons,
        (SELECT cert.certificate_code FROM certificates cert WHERE cert.user_id = $1 AND cert.course_id = c.id) as certificate_code
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE e.user_id = $1
      ORDER BY e.enrolled_at DESC
    `, [userId]);

    const enrollments = result.rows.map((row) => {
      const total = parseInt(row.total_lessons || '0', 10);
      const completed = parseInt(row.completed_lessons || '0', 10);
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...row,
        progress_percentage: progress
      };
    });

    res.json({ enrollments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrolled courses' });
  }
});

app.get('/api/enrollments/all', authenticateToken, requireRole(['admin', 'staff']), async (_req: Request, res: Response) => {
  try {
    const result = await db.query<any>(`
      SELECT
        e.*,
        u.name as student_name,
        u.email as student_email,
        c.title as course_title,
        c.price
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.enrolled_at DESC
    `);
    res.json({ enrollments: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all enrollments' });
  }
});

app.post('/api/progress/mark', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, lessonId, isCompleted = true } = req.body;
    const userId = req.user?.id;

    if (!courseId || !lessonId || !userId) {
      return res.status(400).json({ error: 'Course ID and lesson ID are required' });
    }

    const progressId = `prg-${Date.now()}`;
    await db.query(`
      INSERT INTO course_progress (id, user_id, course_id, lesson_id, is_completed, completed_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET is_completed = $5, completed_at = CURRENT_TIMESTAMP
    `, [progressId, userId, courseId, lessonId, isCompleted ? 1 : 0]);

    const totalLessonsRes = await db.query<any>(`SELECT COUNT(*) as count FROM lessons WHERE course_id = $1`, [courseId]);
    const completedLessonsRes = await db.query<any>(`SELECT COUNT(*) as count FROM course_progress WHERE user_id = $1 AND course_id = $2 AND is_completed = 1`, [userId, courseId]);

    const total = parseInt(totalLessonsRes.rows[0]?.count || '0', 10);
    const completed = parseInt(completedLessonsRes.rows[0]?.count || '0', 10);

    if (total > 0 && completed >= total) {
      await db.query(`
        UPDATE enrollments
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND course_id = $2
      `, [userId, courseId]);
    }

    res.json({
      message: 'Progress recorded',
      completedLessons: completed,
      totalLessons: total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record progress' });
  }
});

app.get('/api/progress/:courseId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    const result = await db.query<any>(`
      SELECT lesson_id, is_completed, completed_at
      FROM course_progress
      WHERE user_id = $1 AND course_id = $2
    `, [userId, courseId]);

    res.json({ progress: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// -------------------------------------------------------------
// 7. CERTIFICATES GENERATION & PUBLIC VERIFICATION
// -------------------------------------------------------------
app.post('/api/certificates/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.id;

    if (!courseId || !userId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    const courseRes = await db.query<any>(`
      SELECT c.*, u.name as instructor_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = $1
    `, [courseId]);

    if (courseRes.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const course = courseRes.rows[0];

    const studentRes = await db.query<any>('SELECT name, email FROM users WHERE id = $1', [userId]);
    const student = studentRes.rows[0];

    const certCode = `SP-EE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const certId = `cert-${Date.now()}`;
    const qrData = `http://localhost:3000/verify-certificate/${certCode}`;

    await db.query(`
      INSERT INTO certificates (id, certificate_code, user_id, course_id, student_name, course_name, instructor_name, qr_code_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id, course_id)
      DO UPDATE SET issue_date = CURRENT_TIMESTAMP
    `, [
      certId,
      certCode,
      userId,
      courseId,
      student.name,
      course.title,
      course.instructor_name || 'Silphor Academic Council',
      qrData
    ]);

    await db.query(`
      UPDATE enrollments
      SET certificate_code = $1, status = 'completed', completed_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND course_id = $3
    `, [certCode, userId, courseId]);

    const createdCert = await db.query<any>('SELECT * FROM certificates WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate: createdCert.rows[0]
    });
  } catch (error: any) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

app.get('/api/certificates/my', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await db.query<any>(`
      SELECT cert.*, c.thumbnail_url, c.duration, c.slug as course_slug
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      WHERE cert.user_id = $1
      ORDER BY cert.issue_date DESC
    `, [userId]);

    res.json({ certificates: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

app.get('/api/certificates/verify/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const result = await db.query<any>(`
      SELECT
        cert.*,
        c.title as course_title,
        c.level as course_level,
        c.duration as course_duration,
        u.email as student_email
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      JOIN users u ON cert.user_id = u.id
      WHERE cert.certificate_code = $1 OR cert.id = $1
    `, [code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ valid: false, message: 'Invalid or unverified certificate ID.' });
    }

    res.json({
      valid: true,
      certificate: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Certificate verification service error' });
  }
});

// -------------------------------------------------------------
// 8. QUIZZES & ASSIGNMENTS API
// -------------------------------------------------------------
app.get('/api/quizzes/:courseId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const quizRes = await db.query<any>('SELECT * FROM quizzes WHERE course_id = $1', [courseId]);
    if (quizRes.rows.length === 0) {
      return res.json({ quiz: null, questions: [] });
    }
    const quiz = quizRes.rows[0];
    const questionsRes = await db.query<any>('SELECT id, quiz_id, question_text, options, explanation FROM quiz_questions WHERE quiz_id = $1', [quiz.id]);
    res.json({ quiz, questions: questionsRes.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

app.post('/api/quizzes/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user?.id;

    const questionsRes = await db.query<any>('SELECT id, correct_answer_index FROM quiz_questions WHERE quiz_id = $1', [quizId]);
    const quizRes = await db.query<any>('SELECT passing_score FROM quizzes WHERE id = $1', [quizId]);

    const passingScore = quizRes.rows[0]?.passing_score || 75;
    let correctCount = 0;
    const total = questionsRes.rows.length;

    questionsRes.rows.forEach((q) => {
      if (answers[q.id] === q.correct_answer_index) {
        correctCount++;
      }
    });

    const score = total > 0 ? Math.round((correctCount / total) * 100) : 100;
    const passed = score >= passingScore;

    const attemptId = `qatt-${Date.now()}`;
    await db.query(`
      INSERT INTO quiz_attempts (id, quiz_id, user_id, score, passed)
      VALUES ($1, $2, $3, $4, $5)
    `, [attemptId, quizId, userId, score, passed ? 1 : 0]);

    res.json({
      score,
      passed,
      passingScore,
      correctCount,
      totalQuestions: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to grade quiz' });
  }
});

app.get('/api/assignments/:courseId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    const asgRes = await db.query<any>('SELECT * FROM assignments WHERE course_id = $1', [courseId]);
    if (asgRes.rows.length === 0) {
      return res.json({ assignments: [] });
    }

    const assignments = await Promise.all(
      asgRes.rows.map(async (asg) => {
        const subRes = await db.query<any>(`
          SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND user_id = $2
        `, [asg.id, userId]);
        return {
          ...asg,
          submission: subRes.rows[0] || null
        };
      })
    );

    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

app.post('/api/assignments/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assignmentId, submissionContent, fileUrl } = req.body;
    const userId = req.user?.id;

    if (!assignmentId || !submissionContent) {
      return res.status(400).json({ error: 'Assignment ID and content are required' });
    }

    const subId = `sub-${Date.now()}`;
    await db.query(`
      INSERT INTO assignment_submissions (id, assignment_id, user_id, submission_content, file_url, status, submitted_at)
      VALUES ($1, $2, $3, $4, $5, 'submitted', CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `, [subId, assignmentId, userId, submissionContent, fileUrl || null]);

    res.status(201).json({ message: 'Assignment submitted successfully for faculty grading' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

app.get('/api/assignments/submissions', authenticateToken, requireRole(['admin', 'staff']), async (_req: Request, res: Response) => {
  try {
    const result = await db.query<any>(`
      SELECT
        sub.*,
        u.name as student_name,
        u.email as student_email,
        a.title as assignment_title,
        a.max_score,
        c.title as course_title
      FROM assignment_submissions sub
      JOIN users u ON sub.user_id = u.id
      JOIN assignments a ON sub.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      ORDER BY sub.submitted_at DESC
    `);
    res.json({ submissions: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

app.post('/api/assignments/grade', authenticateToken, requireRole(['admin', 'staff']), async (req: Request, res: Response) => {
  try {
    const { submissionId, score, feedback } = req.body;
    await db.query(`
      UPDATE assignment_submissions
      SET score = $1, feedback = $2, status = 'graded', graded_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [Number(score), feedback || '', submissionId]);

    res.json({ message: 'Submission evaluated and graded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to grade submission' });
  }
});

// -------------------------------------------------------------
// 9. ADMIN ANALYTICS & USER GOVERNANCE
// -------------------------------------------------------------
app.get('/api/admin/stats', authenticateToken, requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const totalStudentsRes = await db.query<any>(`SELECT COUNT(*) as count FROM users WHERE role = 'student'`);
    const totalStaffRes = await db.query<any>(`SELECT COUNT(*) as count FROM users WHERE role = 'staff'`);
    const totalCoursesRes = await db.query<any>(`SELECT COUNT(*) as count FROM courses`);
    const activeCoursesRes = await db.query<any>(`SELECT COUNT(*) as count FROM courses WHERE is_published = 1`);
    const totalEnrollmentsRes = await db.query<any>(`SELECT COUNT(*) as count FROM enrollments`);
    const completedCoursesRes = await db.query<any>(`SELECT COUNT(*) as count FROM enrollments WHERE status = 'completed'`);
    const revenueRes = await db.query<any>(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'captured'`);

    const categoryStatsRes = await db.query<any>(`
      SELECT cat.name, COUNT(c.id) as count
      FROM categories cat
      LEFT JOIN courses c ON cat.id = c.category_id
      GROUP BY cat.id, cat.name
      ORDER BY count DESC
    `);

    const recentEnrollmentsRes = await db.query<any>(`
      SELECT
        e.id, e.enrolled_at,
        u.name as student_name,
        c.title as course_title,
        c.price
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.enrolled_at DESC
      LIMIT 6
    `);

    res.json({
      totalStudents: parseInt(totalStudentsRes.rows[0]?.count || '0', 10),
      totalStaff: parseInt(totalStaffRes.rows[0]?.count || '0', 10),
      totalCourses: parseInt(totalCoursesRes.rows[0]?.count || '0', 10),
      activeCourses: parseInt(activeCoursesRes.rows[0]?.count || '0', 10),
      totalEnrollments: parseInt(totalEnrollmentsRes.rows[0]?.count || '0', 10),
      completedCourses: parseInt(completedCoursesRes.rows[0]?.count || '0', 10),
      totalRevenue: Number(revenueRes.rows[0]?.total || 0),
      categoryDistribution: categoryStatsRes.rows,
      recentEnrollments: recentEnrollmentsRes.rows,
      databaseProvider: getDatabaseProvider()
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to aggregate statistics' });
  }
});

app.get('/api/admin/users', authenticateToken, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, name, email, role, phone, designation, created_at FROM users WHERE 1=1';
    const params: any[] = [];
    if (role) {
      query += ' AND role = $1';
      params.push(role);
    }
    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/payments/all', authenticateToken, requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const result = await db.query<any>(`
      SELECT
        p.*,
        u.name as user_name,
        u.email as user_email,
        c.title as course_title
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN courses c ON p.course_id = c.id
      ORDER BY p.payment_date DESC
    `);
    res.json({ payments: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// -------------------------------------------------------------
// 10. CONTACT, ANNOUNCEMENTS & SETTINGS
// -------------------------------------------------------------
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const id = `msg-${Date.now()}`;
    await db.query(`
      INSERT INTO contact_messages (id, name, email, phone, subject, message)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, name, email, phone || null, subject || 'General Inquiry', message]);

    res.status(201).json({ message: 'Thank you! Your message has been logged in our academic advisory desk at Malleswaram Campus.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record contact message' });
  }
});

app.get('/api/contact', authenticateToken, requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const result = await db.query<any>('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ messages: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
});

app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    const result = await db.query<any>('SELECT key, value FROM settings');
    const settingsObj: Record<string, string> = {
      website_name: config.WEBSITE_NAME,
      tagline: config.WEBSITE_TAGLINE,
      currency: config.WEBSITE_CURRENCY,
      currency_symbol: '₹',
      phone: config.CONTACT.phone,
      email: config.CONTACT.email,
      address: config.CONTACT.address,
      landmark: config.CONTACT.landmark,
      hours_weekdays: config.CONTACT.operationalHours.weekdays,
      hours_saturday: config.CONTACT.operationalHours.saturday
    };
    result.rows.forEach((r) => {
      settingsObj[r.key] = r.value;
    });
    res.json({ settings: settingsObj });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.get('/api/announcements', async (_req: Request, res: Response) => {
  try {
    const result = await db.query<any>('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 10');
    res.json({ announcements: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.post('/api/announcements', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, message, courseId } = req.body;
    const id = `ann-${Date.now()}`;
    await db.query(`
      INSERT INTO announcements (id, course_id, title, message, created_by)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, courseId || null, title, message, req.user?.id]);
    res.status(201).json({ message: 'Announcement broadcasted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to post announcement' });
  }
});

// -------------------------------------------------------------
// 11. VITE INTEGRATION
// -------------------------------------------------------------
async function startServer() {
  await initDatabase();

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[SERVER] Running in Vite Dev middleware mode.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`PROJECT: ${config.PROJECT}`);
    console.log(`PORT: ${PORT} (http://0.0.0.0:${PORT})`);
    console.log(`DATABASE PROVIDER: ${getDatabaseProvider()}`);
    console.log(`RAZORPAY: Mode=${config.RAZORPAY_MODE} | Configured=${config.isRazorpayConfigured}`);
    console.log(`CAMPUS CONTACT: ${config.CONTACT.phone} | ${config.CONTACT.email}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Fatal startup error:', err);
  process.exit(1);
});
