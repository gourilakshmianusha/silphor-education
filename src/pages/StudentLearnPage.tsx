import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { EngineeringLab3D, ModelType } from '../components/EngineeringLab3D';
import confetti from 'canvas-confetti';
import {
  PlayCircle,
  CheckCircle,
  Circle,
  FileText,
  HelpCircle,
  Box,
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  CheckCircle2,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface StudentLearnPageProps {
  courseId: string;
  navigate: (path: string) => void;
}

export const StudentLearnPage: React.FC<StudentLearnPageProps> = ({ courseId, navigate }) => {
  const { user, token } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'video' | 'lab' | 'quiz' | 'assignment' | 'notes'>('video');
  const [studentNote, setStudentNote] = useState<string>('');
  const [savingNote, setSavingNote] = useState<boolean>(false);
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  // Quiz state
  const [quiz, setQuiz] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);

  // Assignment state
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissionText, setSubmissionText] = useState<string>('');
  const [submittingAssignment, setSubmittingAssignment] = useState<boolean>(false);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState<boolean>(false);

  // Certificate generation
  const [generatingCert, setGeneratingCert] = useState<boolean>(false);
  const [generatedCertCode, setGeneratedCertCode] = useState<string | null>(null);

  const fetchClassroomData = async () => {
    if (!token) return;
    try {
      const cRes = await fetch(`/api/courses/${courseId}`);
      if (!cRes.ok) return;
      const cData = await cRes.json();
      setCourse(cData.course);

      // Select first lesson by default
      if (cData.course.modules?.[0]?.lessons?.[0]) {
        setActiveLesson(cData.course.modules[0].lessons[0]);
      }

      // Fetch progress
      const pRes = await fetch(`/api/progress/${cData.course.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        const map: Record<string, boolean> = {};
        pData.progress?.forEach((p: any) => {
          map[p.lesson_id] = p.is_completed;
        });
        setProgressMap(map);
      }

      // Fetch quiz
      const qRes = await fetch(`/api/quizzes/${cData.course.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuiz(qData.quiz);
        setQuizQuestions(qData.questions || []);
      }

      // Fetch assignments
      const aRes = await fetch(`/api/assignments/${cData.course.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (aRes.ok) {
        const aData = await aRes.json();
        setAssignments(aData.assignments || []);
      }
    } catch (e) {
      console.error('Failed to load classroom data:', e);
    }
  };

  useEffect(() => {
    fetchClassroomData();
  }, [courseId, token]);

  const handleMarkComplete = async (lessonId: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      const res = await fetch('/api/progress/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: course.id,
          lessonId,
          isCompleted: nextStatus
        })
      });

      if (res.ok) {
        setProgressMap((prev) => ({
          ...prev,
          [lessonId]: nextStatus
        }));
      }
    } catch (e) {
      console.error('Mark progress error:', e);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    setSubmittingQuiz(true);
    try {
      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: quizAnswers
        })
      });

      if (res.ok) {
        const data = await res.json();
        setQuizResult(data);
        if (data.passed) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      }
    } catch (e) {
      console.error('Quiz submit error:', e);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleAssignmentSubmit = async (assignmentId: string) => {
    if (!submissionText.trim()) return;
    setSubmittingAssignment(true);
    try {
      const res = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          assignmentId,
          submissionContent: submissionText
        })
      });

      if (res.ok) {
        setAssignmentSubmitted(true);
        setSubmissionText('');
        fetchClassroomData();
      }
    } catch (e) {
      console.error('Assignment submission error:', e);
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleGenerateCertificate = async () => {
    setGeneratingCert(true);
    try {
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course.id })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedCertCode(data.certificate.certificate_code);
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
      }
    } catch (e) {
      console.error('Certificate generation error:', e);
    } finally {
      setGeneratingCert(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing Classroom Node...</span>
        </div>
      </div>
    );
  }

  // Calculate overall completion
  const allLessons: any[] = [];
  course.modules?.forEach((m: any) => {
    m.lessons?.forEach((l: any) => allLessons.push(l));
  });

  const completedCount = allLessons.filter((l) => progressMap[l.id]).length;
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const isEligibleForCert = progressPercent >= 100;

  // Lab Model Type resolver
  const labModelType: ModelType = (() => {
    if (activeLesson?.lab_config) {
      try {
        const parsed = JSON.parse(activeLesson.lab_config);
        if (parsed.modelType) return parsed.modelType;
      } catch {}
    }
    const slug = (course.slug || '').toLowerCase();
    if (slug.includes('plc') || slug.includes('automation')) return 'plc';
    if (slug.includes('ev') || slug.includes('inverter') || slug.includes('powertrain')) return 'inverter';
    if (slug.includes('embedded') || slug.includes('arm')) return 'pcb';
    if (slug.includes('machine') || slug.includes('motor')) return 'motor';
    return 'transformer';
  })();

  return (
    <div className="min-h-screen bg-[#07111E] text-slate-100 flex flex-col">
      {/* Top Classroom Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Return to Student Dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              {course.title}
            </h1>
            <div className="text-[10px] text-teal-400 font-mono">
              Progress: {completedCount} / {allLessons.length} Lessons ({progressPercent}%)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEligibleForCert && (
            <button
              onClick={handleGenerateCertificate}
              disabled={generatingCert}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{generatingCert ? 'Issuing...' : 'Generate Official Certificate'}</span>
            </button>
          )}

          {generatedCertCode && (
            <button
              onClick={() => navigate(`/verify-certificate/${generatedCertCode}`)}
              className="px-3 py-1.5 bg-purple-900/60 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Credential ({generatedCertCode})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Lesson Player & Interactive Tabs */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Classroom Sub-Tabs */}
          <div className="bg-slate-900/60 border-b border-slate-800 px-4 flex gap-4 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('video')}
              className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'video' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Lecture Video & Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('lab')}
              className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'lab' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-teal-400" />
              <span>3D Hardware Simulation</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'quiz' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Certification Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab('assignment')}
              className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'assignment' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Engineering Project</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'notes' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Laboratory Notes</span>
            </button>
          </div>

          {/* TAB: VIDEO & CONTENT */}
          {activeTab === 'video' && (
            <div className="p-4 sm:p-6 space-y-6">
              {/* Responsive Video Canvas */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                <iframe
                  src={activeLesson?.video_url || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'}
                  title={activeLesson?.title || 'Lesson Video'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Lesson Controls & Completion Switch */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono text-teal-400 uppercase tracking-widest">
                    ACTIVE LESSON • {activeLesson?.duration || '20 mins'}
                  </div>
                  <h2 className="text-base font-bold text-white mt-0.5">{activeLesson?.title}</h2>
                </div>

                <button
                  onClick={() => handleMarkComplete(activeLesson?.id, Boolean(progressMap[activeLesson?.id]))}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
                    progressMap[activeLesson?.id]
                      ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300'
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {progressMap[activeLesson?.id] ? 'Lesson Completed' : 'Mark as Complete'}
                  </span>
                </button>
              </div>

              {/* Lesson Text Documentation */}
              <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 space-y-3 text-xs leading-relaxed text-slate-300">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Lecture Notes & Reference Derivations
                </h3>
                <p>
                  {activeLesson?.content_markdown ||
                    'Review the circuit equations and industrial topologies discussed in this unit. Utilize the 3D Hardware Simulation tab above to verify the parameters under varying electrical load frequencies.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB: 3D LAB */}
          {activeTab === 'lab' && (
            <div className="p-4 sm:p-6">
              <EngineeringLab3D initialModel={labModelType} />
            </div>
          )}

          {/* TAB: QUIZ */}
          {activeTab === 'quiz' && (
            <div className="p-4 sm:p-6 max-w-3xl space-y-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-2">
                <h3 className="text-base font-bold text-white">
                  {quiz?.title || 'Academic Certification Assessment'}
                </h3>
                <p className="text-xs text-slate-400">
                  Passing threshold is {quiz?.passing_score || 75}%. Satisfy this exam to qualify for the official certificate of completion.
                </p>
              </div>

              {quizResult && (
                <div
                  className={`p-5 rounded-2xl border ${
                    quizResult.passed
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  } space-y-2`}
                >
                  <div className="text-sm font-bold font-mono">
                    Score: {quizResult.score}% — {quizResult.passed ? 'PASSED (Qualification Satisfied)' : 'FAILED (Review & Retry)'}
                  </div>
                  <p className="text-xs">
                    You answered {quizResult.correctCount} of {quizResult.totalQuestions} questions correctly.
                  </p>
                </div>
              )}

              <form onSubmit={handleQuizSubmit} className="space-y-6">
                {quizQuestions.map((q, qIdx) => {
                  let options: string[] = [];
                  try {
                    options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                  } catch {
                    options = ['Option A', 'Option B', 'Option C', 'Option D'];
                  }

                  return (
                    <div key={q.id} className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-3">
                      <div className="font-bold text-sm text-slate-200">
                        {qIdx + 1}. {q.question_text}
                      </div>

                      <div className="space-y-2 pt-1 text-xs">
                        {options.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                              quizAnswers[q.id] === oIdx
                                ? 'bg-teal-500/15 border-teal-500/40 text-teal-200'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`quiz-${q.id}`}
                              checked={quizAnswers[q.id] === oIdx}
                              onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIdx })}
                              className="accent-teal-400 cursor-pointer"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {quizResult && q.explanation && (
                        <div className="mt-2 p-3 rounded-xl bg-slate-950 text-[11px] text-teal-400 font-mono">
                          Engineering Rationale: {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="submit"
                  disabled={submittingQuiz || quizQuestions.length === 0}
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-95"
                >
                  {submittingQuiz ? 'Grading Assessment...' : 'Submit Answers for Verification'}
                </button>
              </form>
            </div>
          )}

          {/* TAB: ASSIGNMENT */}
          {activeTab === 'assignment' && (
            <div className="p-4 sm:p-6 max-w-3xl space-y-6">
              {assignments.map((asg) => (
                <div key={asg.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">{asg.title}</h3>
                    <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded">
                      Max Score: {asg.max_score}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    {asg.instructions}
                  </p>

                  {asg.submission ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-emerald-400 font-bold">Status: {asg.submission.status.toUpperCase()}</span>
                        <span className="text-slate-400">
                          Score: {asg.submission.score !== null ? `${asg.submission.score}/${asg.max_score}` : 'Pending Review'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] pt-1">
                        Submitted: {new Date(asg.submission.submitted_at).toLocaleDateString()}
                      </div>
                      {asg.submission.feedback && (
                        <div className="p-2.5 bg-slate-900 rounded-lg text-teal-300 text-[11px] mt-2">
                          Faculty Feedback: {asg.submission.feedback}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        rows={6}
                        placeholder="Detail your engineering calculations, simulation results, or GitHub repository URL..."
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                      />

                      <button
                        onClick={() => handleAssignmentSubmit(asg.id)}
                        disabled={submittingAssignment || !submissionText.trim()}
                        className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        {submittingAssignment ? 'Submitting...' : 'Submit Engineering Assignment'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB: NOTES */}
          {activeTab === 'notes' && (
            <div className="p-4 sm:p-6 max-w-3xl space-y-4">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Personal Laboratory Notes</h3>
                  {noteSaved && <span className="text-xs text-teal-400 font-mono">Saved locally</span>}
                </div>
                <textarea
                  rows={8}
                  placeholder="Record circuit calculations, equations, or hardware notes for this lesson..."
                  value={studentNote}
                  onChange={(e) => {
                    setStudentNote(e.target.value);
                    setNoteSaved(false);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  onClick={() => setNoteSaved(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Module & Lesson Curriculum Drawer */}
        <aside className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Curriculum Modules
            </span>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
              {progressPercent}% COMPLETE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 text-xs">
            {course.modules?.map((m: any, mIdx: number) => (
              <div key={m.id || mIdx} className="p-3">
                <div className="font-bold text-slate-300 text-[11px] mb-2 px-1">
                  {m.title}
                </div>

                <div className="space-y-1">
                  {m.lessons?.map((les: any) => {
                    const isDone = Boolean(progressMap[les.id]);
                    const isCurrent = activeLesson?.id === les.id;
                    return (
                      <button
                        key={les.id}
                        onClick={() => {
                          setActiveLesson(les);
                          setActiveTab('video');
                        }}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-teal-500/20 text-teal-200 border border-teal-500/30'
                            : 'hover:bg-slate-800/60 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                          {les.duration || '20m'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
