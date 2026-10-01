import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SilphorLogo } from '../components/SilphorLogo';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PlusCircle,
  FolderTree,
  FileCheck,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Bell,
  Eye,
  Database
} from 'lucide-react';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Add/Edit Course Form Modal
  const [courseModalOpen, setCourseModalOpen] = useState<boolean>(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    slug: '',
    short_description: '',
    full_description: '',
    category_id: 'cat-ee',
    level: 'Intermediate',
    duration: '8 Weeks',
    language: 'English',
    instructor_id: 'usr-staff-1',
    price: 8499,
    discount_price: '',
    learning_objectives: 'Design advanced machines\nAnalyze magnetic circuits\nVerify thermal dissipation',
    prerequisites: 'Electrical Engineering Fundamentals',
    skills: 'Machine Design, Magnetic Modeling, Finite Element Analysis',
    is_featured: true,
    is_published: true
  });
  const [submittingCourse, setSubmittingCourse] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');

  // Delete Course Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [deletingCourse, setDeletingCourse] = useState<boolean>(false);

  // Add Category Form
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');

  // Announcement Form
  const [annTitle, setAnnTitle] = useState<string>('');
  const [annMessage, setAnnMessage] = useState<string>('');

  const fetchAdminData = async () => {
    if (!token) return;
    try {
      const [statsRes, coursesRes, catsRes, usersRes, enrRes, payRes, msgRes, setRes, healthRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/courses?all=true'),
        fetch('/api/categories'),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/enrollments/all', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/payments/all', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/contact', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/settings'),
        fetch('/api/health')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (coursesRes.ok) {
        const cd = await coursesRes.json();
        setCourses(cd.courses || []);
      }
      if (catsRes.ok) {
        const catd = await catsRes.json();
        setCategories(catd.categories || []);
      }
      if (usersRes.ok) {
        const ud = await usersRes.json();
        setUsersList(ud.users || []);
      }
      if (enrRes.ok) {
        const ed = await enrRes.json();
        setEnrollments(ed.enrollments || []);
      }
      if (payRes.ok) {
        const pd = await payRes.json();
        setPayments(pd.payments || []);
      }
      if (msgRes.ok) {
        const md = await msgRes.json();
        setMessages(md.messages || []);
      }
      if (setRes.ok) {
        const sd = await setRes.json();
        setSettings(sd.settings || {});
      }
      if (healthRes.ok) {
        setHealth(await healthRes.json());
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: 'Advanced Electrical Machines',
      slug: 'advanced-electrical-machines',
      short_description: 'Synchronous machines, reluctance drives, finite element electromagnetic analysis, and industrial high-efficiency standards.',
      full_description: 'An advanced curriculum covering modern electric motor design, slot harmonics, rotor skewed windings, silicon steel saturation modeling, and thermal cooling jackets.',
      category_id: categories[0]?.id || 'cat-ee',
      level: 'Intermediate',
      duration: '8 Weeks',
      language: 'English',
      instructor_id: 'usr-staff-1',
      price: 8499,
      discount_price: '6999',
      learning_objectives: 'Model synchronous reluctance machines\nCalculate electromagnetic torque and flux linkage\nVerify industrial insulation under VFD switching stress',
      prerequisites: 'Electrical Engineering Fundamentals and AC circuit theory.',
      skills: 'Machine Design, Magnetic Modeling, Finite Element Simulation, VFD Interfacing',
      is_featured: true,
      is_published: true
    });
    setFormError('');
    setFormSuccess('');
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (c: any) => {
    setEditingCourseId(c.id);
    setCourseForm({
      title: c.title,
      slug: c.slug,
      short_description: c.short_description || '',
      full_description: c.full_description || '',
      category_id: c.category_id || 'cat-ee',
      level: c.level || 'Intermediate',
      duration: c.duration || '8 Weeks',
      language: c.language || 'English',
      instructor_id: c.instructor_id || 'usr-staff-1',
      price: Number(c.price),
      discount_price: c.discount_price ? String(c.discount_price) : '',
      learning_objectives: typeof c.learning_objectives === 'string' ? c.learning_objectives : JSON.stringify(c.learning_objectives),
      prerequisites: c.prerequisites || '',
      skills: c.skills || '',
      is_featured: Boolean(c.is_featured),
      is_published: Boolean(c.is_published)
    });
    setFormError('');
    setFormSuccess('');
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCourse(true);
    setFormError('');
    setFormSuccess('');

    try {
      const url = editingCourseId ? `/api/courses/${editingCourseId}` : '/api/courses';
      const method = editingCourseId ? 'PUT' : 'POST';

      const objectivesArray = courseForm.learning_objectives
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...courseForm,
        learning_objectives: objectivesArray,
        price: Number(courseForm.price),
        discount_price: courseForm.discount_price ? Number(courseForm.discount_price) : null
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to save course');
        return;
      }

      setFormSuccess(editingCourseId ? 'Course updated successfully!' : 'Course created & published to database!');
      await fetchAdminData();
      setTimeout(() => {
        setCourseModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Network error');
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setDeletingCourse(true);
    try {
      const res = await fetch(`/api/courses/${courseToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchAdminData();
        setDeleteModalOpen(false);
        setCourseToDelete(null);
      }
    } catch (e) {
      console.error('Delete course error:', e);
    } finally {
      setDeletingCourse(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCatName, description: newCatDesc })
      });
      if (res.ok) {
        setNewCatName('');
        setNewCatDesc('');
        fetchAdminData();
      }
    } catch (e) {
      console.error('Category create error:', e);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annMessage) return;
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: annTitle, message: annMessage })
      });
      if (res.ok) {
        setAnnTitle('');
        setAnnMessage('');
        alert('Announcement broadcasted to student portals.');
      }
    } catch (e) {
      console.error('Announcement error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#0B192C] text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <SilphorLogo theme="dark" variant="horizontal" className="h-8" showTagline={false} />
          <div className="mt-2 text-[10px] uppercase font-bold tracking-widest text-teal-400 font-mono">
            Admin Governance Console
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 text-xs overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30' : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-teal-400" />
            <span>Dashboard Overview</span>
          </button>

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Course Management
          </div>

          <button
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'courses' ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30' : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>All Courses ({courses.length})</span>
          </button>

          <button
            onClick={handleOpenAddCourse}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium hover:bg-slate-800/60 text-teal-400 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Course (CRUD)</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'categories' ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30' : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <FolderTree className="w-4 h-4 text-teal-400" />
            <span>Categories ({categories.length})</span>
          </button>

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Scholars & Faculty
          </div>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'users' ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30' : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <Users className="w-4 h-4 text-teal-400" />
            <span>Users & Roles ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enrollments')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'enrollments' ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30' : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <FileCheck className="w-4 h-4 text-teal-400" />
            <span>Enrollments ({enrollments.length})</span>
          </button>

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Finance & Communications
          </div>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'payments' ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30' : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <CreditCard className="w-4 h-4 text-teal-400" />
            <span>Payments & Revenue (₹)</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'messages' ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30' : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span>Contact Messages ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'settings' ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30' : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <Settings className="w-4 h-4 text-teal-400" />
            <span>Website Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="truncate">
              <div className="font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-teal-400 font-mono">SUPER ADMIN</div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
        {/* Top Bar Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-widest">
              <Database className="w-3.5 h-3.5" />
              <span>
                Backend Active: {health?.database?.provider || 'PostgreSQL Engine'} • Razorpay: {health?.payments?.mode?.toUpperCase() || 'TEST'} Mode
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Silphor Administration Center
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenAddCourse}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-teal-400" />
              <span>Add Course</span>
            </button>
          </div>
        </div>

        {/* TAB: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Real Database Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Students</div>
                <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                  {stats?.totalStudents || 0}
                </div>
                <div className="text-[11px] text-teal-700 mt-1 font-medium">Registered scholars</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Faculty / Staff</div>
                <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                  {stats?.totalStaff || 0}
                </div>
                <div className="text-[11px] text-teal-700 mt-1 font-medium">Instruction leads</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Courses</div>
                <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                  {stats?.activeCourses || 0} <span className="text-xs text-slate-400 font-normal">/ {stats?.totalCourses || 0}</span>
                </div>
                <div className="text-[11px] text-emerald-600 mt-1 font-medium">Published in catalog</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue (₹)</div>
                <div className="text-2xl font-extrabold text-teal-800 font-mono mt-1">
                  ₹{Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">100% INR Captured</div>
              </div>
            </div>

            {/* Secondary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Enrollments</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{stats?.totalEnrollments || 0}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Completed Courses</div>
                <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{stats?.completedCourses || 0}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Pending Payments</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">₹0</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Completion Rate</div>
                <div className="text-xl font-bold font-mono text-teal-700 mt-0.5">
                  {stats?.totalEnrollments ? Math.round(((stats.completedCourses || 0) / stats.totalEnrollments) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Charts & Distributions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Category Distribution Bar Chart */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Curriculum Discipline Breakdown</h3>
                  <span className="text-xs text-slate-400 font-mono">Live SQL Aggregation</span>
                </div>

                <div className="space-y-3 pt-2">
                  {stats?.categoryDistribution?.map((cat: any) => {
                    const count = parseInt(cat.count || '0', 10);
                    const pct = stats.totalCourses ? Math.round((count / stats.totalCourses) * 100) : 0;
                    return (
                      <div key={cat.name} className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium text-slate-700">
                          <span>{cat.name}</span>
                          <span className="font-mono text-slate-500">{count} Courses ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-teal-600 h-full rounded-full transition-all"
                            style={{ width: `${Math.max(8, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Enrollments Stream */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Recent Student Enrollments</h3>
                  <span className="text-xs text-teal-700 font-semibold cursor-pointer" onClick={() => setActiveTab('enrollments')}>
                    View All
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {stats?.recentEnrollments?.map((enr: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{enr.student_name}</div>
                        <div className="text-[11px] text-slate-500">{enr.course_title}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">₹{Number(enr.price).toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400">{new Date(enr.enrolled_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Announcement Broadcaster */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-600" />
                <span>Broadcast Platform Announcement to Scholars</span>
              </h3>
              <form onSubmit={handlePostAnnouncement} className="space-y-3">
                <input
                  type="text"
                  placeholder="Announcement Title (e.g. Schedule Update for Lab Simulations)"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <textarea
                  rows={2}
                  placeholder="Message body broadcasted to all logged-in students..."
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Send Announcement
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: COURSES CRUD */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Course Management (CRUD)</h2>
                <p className="text-xs text-slate-500">
                  Creating or editing a course immediately reflects across the public homepage, course catalog, search, and student dashboards.
                </p>
              </div>

              <button
                onClick={handleOpenAddCourse}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-teal-400" />
                <span>Add Course</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Course Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4">Tuition (₹)</th>
                    <th className="p-4">Enrolled</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 max-w-sm">
                        <div className="font-bold text-slate-900 text-sm">{c.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{c.level} • {c.duration}</div>
                      </td>
                      <td className="p-4 text-slate-700">{c.category_name || 'Engineering'}</td>
                      <td className="p-4 text-slate-700">{c.instructor_name || 'Silphor Faculty'}</td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        ₹{Number(c.price).toLocaleString('en-IN')}
                        {c.discount_price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{Number(c.discount_price).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-mono text-slate-700">{c.students_enrolled || 0}</td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.is_published
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/courses/${c.slug}`)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="View live public page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditCourse(c)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="Edit course"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setCourseToDelete(c);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                          title="Delete / Archive course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: CATEGORIES CRUD */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Engineering Categories ({categories.length})</h3>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{cat.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{cat.description}</div>
                      <div className="text-[10px] font-mono text-teal-700 mt-1">Slug: {cat.slug}</div>
                    </div>
                    <span className="font-mono text-slate-500 shrink-0">
                      {cat.courses_count || 0} Courses
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Add Engineering Category</h3>
              <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Industrial Automation"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Engineering scope and laboratory outcomes..."
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Create Category
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: USERS & ROLES */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">User Governance & Access Control</h3>
              <span className="text-xs text-slate-500 font-mono">{usersList.length} Accounts</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Designation</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700'
                              : u.role === 'staff'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-teal-50 text-teal-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{u.designation || 'Scholar'}</td>
                      <td className="p-4 text-slate-600 font-mono">{u.phone || '—'}</td>
                      <td className="p-4 text-slate-500 font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ENROLLMENTS */}
        {activeTab === 'enrollments' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Total Enrolled Scholars</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Scholar</th>
                    <th className="p-4">Course Title</th>
                    <th className="p-4">Tuition (₹)</th>
                    <th className="p-4">Enrolled At</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{enr.student_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{enr.student_email}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{enr.course_title}</td>
                      <td className="p-4 font-mono font-bold text-slate-900">₹{Number(enr.price).toLocaleString('en-IN')}</td>
                      <td className="p-4 text-slate-500 font-mono">{new Date(enr.enrolled_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 uppercase">
                          {enr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Indian Rupee Payment Transactions</h3>
                <p className="text-xs text-slate-500">Processed server-side via Razorpay Architecture in INR (₹)</p>
              </div>
              <span className="text-base font-extrabold font-mono text-teal-800">
                Total: ₹{payments.reduce((acc, p) => acc + Number(p.amount), 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Payment ID</th>
                    <th className="p-4">Scholar</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono text-slate-500 text-[11px]">{p.payment_id}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{p.user_name}</div>
                        <div className="text-[11px] text-slate-400">{p.user_email}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{p.course_title}</td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {new Date(p.payment_date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: CONTACT MESSAGES */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Public Contact & Advisory Inquiries</h3>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {messages.length === 0 ? (
                <p className="p-6 text-slate-500">No contact messages received.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm">{m.name} ({m.email})</div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-teal-700 font-semibold">{m.subject}</div>
                    <div className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {m.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: SETTINGS & SERVICE STATUS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl">
            {/* 1. External Services & Environment Status Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-teal-600" />
                    <span>External Services & Infrastructure Setup</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Production readiness and credential status for database, authentication, and payment gateways.
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md font-bold uppercase">
                  Centralized Config
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Database Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Database Engine</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      {health?.database?.provider || 'SQLite / PostgreSQL'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Storage: <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-800 font-mono">{health?.database?.storage || './data/silphor.db'}</code>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Single source of truth. Automatic migrations and schemas are verified on boot.
                  </p>
                </div>

                {/* Authentication Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">JWT Authentication</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      Active (256-Bit)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Strategy: <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-800 font-mono">HMAC-SHA256</code>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Cryptographically secure secret generated automatically by application. Stored server-side only.
                  </p>
                </div>

                {/* Razorpay Gateway Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Razorpay Gateway</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      health?.payments?.configured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {health?.payments?.configured ? 'API Key Active' : 'Test Mode (Key Pending)'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    Mode: {health?.payments?.mode?.toUpperCase() || 'TEST'} • Currency: INR (₹)
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {health?.payments?.configured
                      ? 'Razorpay credentials provided. Live/Test checkout active.'
                      : 'RAZORPAY_KEY_ID not provided. The application is running in test sandbox mode without crashing. When you later provide RAZORPAY_KEY_ID in Secrets, live orders will be initialized.'}
                  </p>
                </div>

                {/* Supabase PostgreSQL Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Supabase / External DB</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      health?.database?.is_postgres
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {health?.database?.is_postgres ? 'Connected' : 'Local SQLite Active'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Target: <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-800 font-mono">DATABASE_URL</code>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {health?.database?.is_postgres
                      ? 'Connected to external PostgreSQL database.'
                      : 'Operating on persistent local SQLite. To switch to Supabase for production, supply DATABASE_URL in server secrets.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Official Campus & Website Coordinates */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Official Campus & Academy Coordinates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Academy Brand Name</label>
                  <input
                    type="text"
                    disabled
                    value={settings.website_name || 'SILPHOR TECHNOLOGIES'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Official Tagline</label>
                  <input
                    type="text"
                    disabled
                    value={settings.tagline || 'DESIGN • INNOVATE • VERIFY • DELIVER'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Operating Currency</label>
                  <input
                    type="text"
                    disabled
                    value="Indian Rupee (INR / ₹)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Direct Phone</label>
                  <input
                    type="text"
                    disabled
                    value="+91 7829455663"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Official Email</label>
                  <input
                    type="text"
                    disabled
                    value="silphortechnologies@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Operational Hours</label>
                  <input
                    type="text"
                    disabled
                    value="Mon - Fri: 9:00 AM - 7:00 PM IST | Sat: 9:30 AM - 5:30 PM IST"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">Malleswaram Campus Address</label>
                  <input
                    type="text"
                    disabled
                    value="#45 East Road, Malleswaram, Bangalore, Karnataka - 560003, India"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                  <div className="text-[11px] text-teal-700 font-medium mt-1">
                    Landmark: Near 8th Cross Cultural Hub & Malleswaram Ground
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Course Add / Edit CRUD Modal */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCourseId ? 'Edit Course Record' : 'Add New Course to Database'}
              </h3>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveCourse} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="e.g. Advanced Electrical Machines"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={courseForm.slug}
                    onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                    placeholder="advanced-electrical-machines"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tuition Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                    placeholder="8499"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scholarship Price (₹)</label>
                  <input
                    type="number"
                    value={courseForm.discount_price}
                    onChange={(e) => setCourseForm({ ...courseForm, discount_price: e.target.value })}
                    placeholder="6999"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={courseForm.category_id}
                    onChange={(e) => setCourseForm({ ...courseForm, category_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Skill Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="8 Weeks"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instructor</label>
                  <select
                    value={courseForm.instructor_id}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="usr-staff-1">Dr. Rajesh Sharma</option>
                    <option value="usr-staff-2">Prof. Ananya Sen</option>
                    <option value="usr-admin-1">Silphor Academic Council</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  value={courseForm.short_description}
                  onChange={(e) => setCourseForm({ ...courseForm, short_description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Syllabus Description</label>
                <textarea
                  rows={3}
                  value={courseForm.full_description}
                  onChange={(e) => setCourseForm({ ...courseForm, full_description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Learning Objectives (one per line)
                </label>
                <textarea
                  rows={3}
                  value={courseForm.learning_objectives}
                  onChange={(e) => setCourseForm({ ...courseForm, learning_objectives: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={courseForm.is_published}
                    onChange={(e) => setCourseForm({ ...courseForm, is_published: e.target.checked })}
                    className="accent-teal-600 cursor-pointer"
                  />
                  <span>Publish Immediately to Public Catalog</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={courseForm.is_featured}
                    onChange={(e) => setCourseForm({ ...courseForm, is_featured: e.target.checked })}
                    className="accent-teal-600 cursor-pointer"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCourse}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md cursor-pointer"
                >
                  {submittingCourse ? 'Saving to Database...' : editingCourseId ? 'Save Changes' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Archive Confirmation Modal */}
      {deleteModalOpen && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Are you sure you want to delete this course?</h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Course: <strong>{courseToDelete.title}</strong>
              <br />
              If students are already enrolled, the platform will safely unpublish/archive the course to safeguard student credentials and academic records.
            </p>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingCourse}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md cursor-pointer"
              >
                {deletingCourse ? 'Processing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
