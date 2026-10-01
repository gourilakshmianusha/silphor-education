import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SilphorLogo } from '../components/SilphorLogo';
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  User,
  LogOut
} from 'lucide-react';

interface StudentDashboardProps {
  navigate: (path: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ navigate }) => {
  const { user, token, logout } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'certificates' | 'announcements'>('courses');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!token) return;
      try {
        const [enrRes, certRes, annRes] = await Promise.all([
          fetch('/api/enrollments/my', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/certificates/my', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/announcements', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (enrRes.ok) {
          const ed = await enrRes.json();
          setEnrollments(ed.enrollments || []);
        }
        if (certRes.ok) {
          const cd = await certRes.json();
          setCertificates(cd.certificates || []);
        }
        if (annRes.ok) {
          const ad = await annRes.json();
          setAnnouncements(ad.announcements || []);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [token]);

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Scholar Profile Header Banner */}
        <div className="bg-[#0B192C] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 font-extrabold text-2xl flex items-center justify-center uppercase shadow-inner">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-teal-400 uppercase font-bold">
                ELECTRICAL ENGINEERING SCHOLAR PORTAL
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-0.5">{user?.name}</h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email} • {user?.designation || 'Active Candidate'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/engineering-lab')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>3D Virtual Lab</span>
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <span>Explore More Curricula</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Real Metrics Overview Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Enrolled Curricula</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{enrollments.length}</div>
            <div className="text-[11px] text-teal-700 mt-1 font-medium">Permanent Lifetime Access</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Completed Curricula</div>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
              {enrollments.filter((e) => e.enrollment_status === 'completed' || e.progress_percentage === 100).length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">100% Course Progress</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Issued Certificates</div>
            <div className="text-2xl font-extrabold text-purple-700 font-mono mt-1">{certificates.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">QR Code Verifiable</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'courses' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Enrolled Courses ({enrollments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'certificates' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Issued Credentials ({certificates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'announcements' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Platform Announcements ({announcements.length})</span>
          </button>
        </div>

        {/* TAB 1: ENROLLED COURSES */}
        {activeTab === 'courses' && (
          <div>
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">Retrieving academic enrollments...</div>
            ) : enrollments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No active course enrollments</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse our catalog of accredited electrical engineering, PLC, and power electronics curricula to begin.
                </p>
                <button
                  onClick={() => navigate('/courses')}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Browse Course Catalog (₹ INR)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enr) => (
                  <div
                    key={enr.enrollment_id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={enr.thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
                          alt={enr.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                          {enr.level}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {enr.title}
                        </h3>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-slate-500">Curriculum Progress</span>
                            <span className="font-bold text-teal-700">{enr.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-teal-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${enr.progress_percentage}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {enr.completed_lessons} of {enr.total_lessons} Lessons Completed
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        {enr.certificate_code ? (
                          <button
                            onClick={() => navigate(`/verify-certificate/${enr.certificate_code}`)}
                            className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>View Certificate</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            {enr.progress_percentage === 100 ? 'Certificate Ready' : 'In Progress'}
                          </span>
                        )}

                        <button
                          onClick={() => navigate(`/student/courses/${enr.course_id}`)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>Classroom</span>
                          <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div>
            {certificates.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Award className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Certificates Earned Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete 100% of your course lessons, score ≥75% on the certification quiz, and generate your accredited credential.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <SilphorLogo variant="monogram" className="h-6" />
                        <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          ID: {cert.certificate_code}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {cert.course_name}
                      </h4>

                      <div className="text-xs text-slate-500">
                        Candidate: <strong className="text-slate-800">{cert.student_name}</strong>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono">
                        Issued: {new Date(cert.issue_date).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/verify-certificate/${cert.certificate_code}`)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-teal-400" />
                      <span>View & Verify Certificate</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {announcements.length === 0 ? (
              <p className="p-8 text-xs text-slate-500 text-center">No platform announcements currently posted.</p>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{ann.title}</h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
