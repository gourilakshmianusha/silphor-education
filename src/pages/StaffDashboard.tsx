import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SilphorLogo } from '../components/SilphorLogo';
import {
  BookOpen,
  PlusCircle,
  FileCheck,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  Users,
  Award
} from 'lucide-react';

interface StaffDashboardProps {
  navigate: (path: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [gradeScore, setGradeScore] = useState<string>('85');
  const [feedback, setFeedback] = useState<string>('');
  const [submittingGrade, setSubmittingGrade] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStaffData = async () => {
    if (!token) return;
    try {
      const [cRes, sRes] = await Promise.all([
        fetch('/api/courses?all=true'),
        fetch('/api/assignments/submissions', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (cRes.ok) {
        const cData = await cRes.json();
        setCourses(cData.courses || []);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setSubmissions(sData.submissions || []);
      }
    } catch (e) {
      console.error('Staff data error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, [token]);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSubmittingGrade(true);
    try {
      const res = await fetch('/api/assignments/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          score: Number(gradeScore),
          feedback
        })
      });

      if (res.ok) {
        setSelectedSub(null);
        setFeedback('');
        fetchStaffData();
      }
    } catch (err) {
      console.error('Grading error:', err);
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Staff Header */}
        <div className="bg-[#0B192C] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 font-bold text-xl flex items-center justify-center border border-teal-500/30">
              {user?.name?.charAt(0) || 'F'}
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-teal-400 uppercase font-bold">
                INSTRUCTIONAL FACULTY TERMINAL
              </div>
              <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email} • {user?.designation || 'Lead Engineering Faculty'}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Curriculum Governance Console</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Curricula Supervised</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{courses.length}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Pending Submissions</div>
            <div className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
              {submissions.filter((s) => s.status !== 'graded').length}
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Evaluated Projects</div>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
              {submissions.filter((s) => s.status === 'graded').length}
            </div>
          </div>
        </div>

        {/* Submissions Evaluation Queue */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Engineering Project Queue</h2>
              <p className="text-xs text-slate-500">Evaluate laboratory calculations, code repositories, and circuit designs.</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{submissions.length} Total Submissions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {submissions.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No project submissions awaiting evaluation.</p>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{sub.student_name}</span>
                      <span className="text-xs text-slate-400 font-mono">({sub.student_email})</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                          sub.status === 'graded'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-xs text-teal-700 font-semibold">{sub.course_title} — {sub.assignment_title}</div>
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono mt-2">
                      {sub.submission_content}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {sub.status === 'graded' ? (
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-emerald-600">
                          Score: {sub.score} / {sub.max_score}
                        </span>
                        <div className="text-[10px] text-slate-400">Feedback dispatched</div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setGradeScore(String(Math.round(sub.max_score * 0.85)));
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        Evaluate & Grade
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grading Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Evaluate Assignment: {selectedSub.assignment_title}
            </h3>
            <p className="text-xs text-slate-500">
              Candidate: <strong>{selectedSub.student_name}</strong> ({selectedSub.student_email})
            </p>

            <form onSubmit={handleGrade} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Awarded Score (out of {selectedSub.max_score})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={selectedSub.max_score}
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Faculty Critique & Verification Feedback
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide technical feedback on circuit layout, state machine transitions, or impedance calculations..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGrade}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md"
                >
                  {submittingGrade ? 'Recording...' : 'Submit Grade & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
