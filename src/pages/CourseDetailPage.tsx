import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Layers,
  PlayCircle,
  FileText,
  User,
  Zap,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface CourseDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ slug, navigate }) => {
  const { user, token } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [paymentSuccessModal, setPaymentSuccessModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await fetch(`/api/courses/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data.course);

          // Check enrollment if user is logged in
          if (token && data.course) {
            const enrRes = await fetch('/api/enrollments/my', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (enrRes.ok) {
              const enrData = await enrRes.json();
              const found = enrData.enrollments?.some(
                (e: any) => e.course_id === data.course.id || e.slug === data.course.slug
              );
              setIsEnrolled(Boolean(found));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [slug, token]);

  const handleEnrollment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEnrolled) {
      navigate(`/student/courses/${course.id}`);
      return;
    }

    setEnrolling(true);
    try {
      // Direct academic admission flow (Razorpay deferred for future setup)
      const res = await fetch('/api/enrollments/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course.id })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsEnrolled(true);
        setPaymentSuccessModal(true);
      } else {
        alert(data.error || 'Enrollment could not be processed');
      }
    } catch (e: any) {
      alert(e.message || 'Enrollment error');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Retrieving curriculum specifications...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Course Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The requested curriculum does not exist or has been archived.</p>
        <button
          onClick={() => navigate('/courses')}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Return to Course Catalog
        </button>
      </div>
    );
  }

  const learningObjectives: string[] = (() => {
    try {
      if (Array.isArray(course.learning_objectives)) return course.learning_objectives;
      if (typeof course.learning_objectives === 'string') {
        const parsed = JSON.parse(course.learning_objectives);
        if (Array.isArray(parsed)) return parsed;
        return course.learning_objectives.split('\n');
      }
    } catch {
      if (typeof course.learning_objectives === 'string') {
        return course.learning_objectives.split('\n').filter(Boolean);
      }
    }
    return [
      'Master core mathematical derivations and practical circuit formulations',
      'Deploy hardware-in-the-loop laboratory tests inside the browser',
      'Satisfy ISO and IEEE electrical standards for industrial commissioning'
    ];
  })();

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-[#0B192C] text-white py-12 lg:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                  {course.category_name || 'Engineering'}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-300 text-xs font-medium">{course.level} Level</span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-300 text-xs font-mono">{course.duration}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                {course.short_description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    {course.instructor_name?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Lead Instructor</div>
                    <div className="font-semibold text-white">{course.instructor_name || 'Faculty Member'}</div>
                  </div>
                </div>

                <div className="border-l border-slate-700 pl-6">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Enrolled Scholars</div>
                  <div className="font-semibold text-teal-400 font-mono">{course.students_enrolled || 0} Students</div>
                </div>
              </div>
            </div>

            {/* Sticky Pricing / Enrollment Card (INR ₹) */}
            <div className="lg:col-span-4 bg-slate-900 rounded-3xl border border-slate-700/80 p-6 shadow-2xl space-y-5">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-800">
                <img
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-teal-400 drop-shadow-lg" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    ₹{Number(course.price).toLocaleString('en-IN')}
                  </span>
                  {course.discount_price && (
                    <span className="text-sm text-slate-400 line-through font-mono">
                      ₹{Number(course.discount_price).toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs text-teal-400 font-mono uppercase font-semibold">100% INR</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Includes full curriculum, interactive 3D virtual lab simulation, and QR verified certificate.
                </p>
              </div>

              <button
                onClick={handleEnrollment}
                disabled={enrolling}
                className="w-full py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {enrolling ? (
                  <span>Enrolling into Classroom...</span>
                ) : isEnrolled ? (
                  <>
                    <span>Enter Student Classroom</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Enroll Now — Direct Admission</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="space-y-2 pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Permanent Lifetime Access across all devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>3D Hardware-in-the-Loop Workbench included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Accredited Certificate of Engineering Mastery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Learning Objectives Bento */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-600" />
                <span>What You Will Master in this Curriculum</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {learningObjectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Full Description */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Curriculum Syllabus Overview</h2>
              <div className="prose prose-sm text-slate-700 leading-relaxed max-w-none text-xs">
                <p>{course.full_description || course.short_description}</p>
              </div>

              {course.prerequisites && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Prerequisites
                  </h3>
                  <p className="text-xs text-slate-600">{course.prerequisites}</p>
                </div>
              )}
            </div>

            {/* Modules and Lessons Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Course Syllabus & Modules</h2>
                <span className="text-xs font-mono text-slate-400">
                  {course.modules?.length || 1} Modules
                </span>
              </div>

              <div className="space-y-4">
                {course.modules?.map((mod: any, mIdx: number) => (
                  <div key={mod.id || mIdx} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 p-4 font-bold text-slate-900 text-xs flex justify-between items-center">
                      <span>{mod.title}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-normal">
                        {mod.lessons?.length || 0} Lessons
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {mod.lessons?.map((les: any, lIdx: number) => (
                        <div key={les.id || lIdx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <PlayCircle className="w-4 h-4 text-teal-600 shrink-0" />
                            <span className="text-slate-800 font-medium">{les.title}</span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                            {les.is_free_preview && (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                                Free Preview
                              </span>
                            )}
                            <span>{les.duration || '20 mins'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Instructor Profile & Credentials */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Instruction Lead
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0B192C] text-teal-400 font-extrabold text-lg flex items-center justify-center shadow-md">
                  {course.instructor_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{course.instructor_name || 'Silphor Faculty'}</h4>
                  <p className="text-xs text-teal-700 font-medium">{course.instructor_designation || 'Lead Engineering Faculty'}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {course.instructor_bio || 'Fellow of the Academic Advisory Council with over 15 years in industrial high-voltage automation, switchgear protection, and power electronics commissioning.'}
              </p>
            </div>

            <div className="bg-[#0B192C] text-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800">
              <div className="flex items-center gap-2 text-teal-400">
                <Award className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wider">Accredited Credential</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Upon successfully finishing all modules, passing the technical quiz at ≥75%, and submitting your engineering project, you will receive an official verifiable certificate with registry QR codes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Success Modal */}
      {paymentSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-5 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <div className="text-[11px] font-mono text-emerald-700 font-bold uppercase tracking-widest">
                Academic Admission Confirmed
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                Welcome to {course.title}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Your course enrollment has been permanently saved to the database. You now have immediate lifetime access to all lecture modules, interactive 3D simulations, and project assignments.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate(`/student/courses/${course.id}`)}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Launch Classroom Terminal</span>
                <ArrowRight className="w-4 h-4 text-teal-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
