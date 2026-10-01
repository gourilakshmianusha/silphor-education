import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { EngineeringLab3D } from './components/EngineeringLab3D';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentLearnPage } from './pages/StudentLearnPage';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CertificateVerifyPage } from './pages/CertificateVerifyPage';
import { AuthPages } from './pages/AuthPages';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { InstructorsPage } from './pages/InstructorsPage';
import { ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isLoading, elevateToAdmin, quickAdminLogin, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-teal-400">
          <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span>Silphor Technologies • Booting Engineering Platform...</span>
        </div>
      </div>
    );
  }

  // Parse path and params
  const pathname = currentPath.split('?')[0];

  // Render Routes
  const renderRoute = () => {
    // 1. Home
    if (pathname === '/' || pathname === '') {
      return <HomePage navigate={navigate} />;
    }

    // 2. Courses Catalog
    if (pathname === '/courses') {
      const searchParams = new URLSearchParams(currentPath.split('?')[1] || '');
      const cat = searchParams.get('category') || undefined;
      return <CoursesPage navigate={navigate} initialCategory={cat} />;
    }

    // 3. Course Details (/courses/:slug)
    if (pathname.startsWith('/courses/')) {
      const slug = pathname.replace('/courses/', '');
      return <CourseDetailPage slug={slug} navigate={navigate} />;
    }

    // 4. 3D Engineering Lab
    if (pathname === '/engineering-lab') {
      return (
        <div className="bg-slate-50 min-h-screen py-6">
          <EngineeringLab3D />
        </div>
      );
    }

    // 5. Student Dashboard
    if (pathname === '/student/dashboard') {
      if (!user) {
        return <AuthPages mode="login" navigate={navigate} />;
      }
      return <StudentDashboard navigate={navigate} />;
    }

    // 6. Student Classroom (/student/courses/:courseId)
    if (pathname.startsWith('/student/courses/')) {
      if (!user) {
        return <AuthPages mode="login" navigate={navigate} />;
      }
      const courseId = pathname.replace('/student/courses/', '');
      return <StudentLearnPage courseId={courseId} navigate={navigate} />;
    }

    // 7. Staff Dashboard
    if (pathname === '/staff/dashboard') {
      if (!user) {
        return <AuthPages mode="login" navigate={navigate} />;
      }
      if (user.role !== 'staff' && user.role !== 'admin') {
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-500 mt-2">Only instructional faculty may access this terminal.</p>
            <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs rounded-lg">
              Return Home
            </button>
          </div>
        );
      }
      return <StaffDashboard navigate={navigate} />;
    }

    // 8. Admin Dashboard
    if (pathname === '/admin/dashboard') {
      if (!user) {
        return <AuthPages mode="login" navigate={navigate} />;
      }
      if (user.role !== 'admin') {
        return (
          <div className="min-h-[75vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-widest">
                  Access Control Gateway
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Super Administrator Access Required
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You are currently authenticated as <strong className="text-slate-800">{user.name}</strong> ({user.email}) with the role of <span className="font-mono px-1.5 py-0.5 rounded bg-slate-100 uppercase text-[10px] font-bold text-slate-700">{user.role}</span>.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={async () => {
                    const res = await elevateToAdmin();
                    if (!res.success) {
                      alert(res.error || 'Failed to elevate privileges');
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Grant Administrator Access to Current Account</span>
                </button>

                <button
                  onClick={async () => {
                    const res = await quickAdminLogin();
                    if (!res.success) {
                      alert(res.error || 'Admin login failed');
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span>Switch to Super Admin Account</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Sign Out & Choose Another Account
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => navigate('/')}
                  className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                >
                  Return to Academy Homepage
                </button>
              </div>
            </div>
          </div>
        );
      }
      return <AdminDashboard navigate={navigate} />;
    }

    // 9. Certificate Verification (/verify-certificate/:code or /certificate/:code)
    if (pathname.startsWith('/verify-certificate/') || pathname.startsWith('/certificate/')) {
      const code = pathname.startsWith('/verify-certificate/')
        ? pathname.replace('/verify-certificate/', '')
        : pathname.replace('/certificate/', '');
      return <CertificateVerifyPage code={code} navigate={navigate} />;
    }

    // 10. Auth Routes
    if (pathname === '/login') {
      return <AuthPages mode="login" navigate={navigate} />;
    }
    if (pathname === '/register') {
      return <AuthPages mode="register" navigate={navigate} />;
    }
    if (pathname === '/forgot-password') {
      return <AuthPages mode="forgot-password" navigate={navigate} />;
    }

    // 11. Institutional Pages
    if (pathname === '/about') {
      return <AboutPage navigate={navigate} />;
    }
    if (pathname === '/contact') {
      return <ContactPage navigate={navigate} />;
    }
    if (pathname === '/instructors') {
      return <InstructorsPage navigate={navigate} />;
    }

    // 404 Fallback
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900">404 — Curriculum Node Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm">
          The requested route does not map to any active engineering directory on Silphor Technologies.
        </p>
        <button onClick={() => navigate('/')} className="mt-4 px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl">
          Return to Platform Gateway
        </button>
      </div>
    );
  };

  const isDedicatedScreen = pathname === '/admin/dashboard' || pathname.startsWith('/student/courses/');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {!isDedicatedScreen && <Header currentPath={pathname} navigate={navigate} />}
      <main className="flex-1">{renderRoute()}</main>
      {!isDedicatedScreen && <Footer navigate={navigate} />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
