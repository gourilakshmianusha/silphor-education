import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SilphorLogo } from '../components/SilphorLogo';
import { ShieldCheck, Mail, Lock, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register' | 'forgot-password';
  navigate: (path: string) => void;
}

export const AuthPages: React.FC<AuthPageProps> = ({ mode, navigate }) => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Quick Demo fill buttons for test execution
  const fillCredentials = (demoRole: 'admin' | 'staff' | 'student') => {
    if (demoRole === 'admin') {
      setEmail('admin@silphortechnologies.com');
      setPassword('Admin@Silphor2026');
    } else if (demoRole === 'staff') {
      setEmail('instructor@silphortechnologies.com');
      setPassword('Staff@Silphor2026');
    } else {
      setEmail('student@silphortechnologies.com');
      setPassword('Student@Silphor2026');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setSubmitting(false);
      if (res.success && res.user) {
        if (res.user.role === 'admin') navigate('/admin/dashboard');
        else if (res.user.role === 'staff') navigate('/staff/dashboard');
        else navigate('/student/dashboard');
      } else {
        setError(res.error || 'Authentication failed');
      }
    } else if (mode === 'register') {
      const res = await register({ name, email, password, role, phone });
      setSubmitting(false);
      if (res.success && res.user) {
        if (res.user.role === 'admin') navigate('/admin/dashboard');
        else if (res.user.role === 'staff') navigate('/staff/dashboard');
        else navigate('/student/dashboard');
      } else {
        setError(res.error || 'Registration failed');
      }
    } else {
      // Forgot password
      setSubmitting(false);
      setForgotSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Brand Logo */}
        <div className="flex flex-col items-center justify-center text-center">
          <SilphorLogo variant="full" className="h-20" showTagline={false} />
          <h2 className="text-xl font-extrabold text-slate-900 mt-4 tracking-tight">
            {mode === 'login' ? 'Sign In to Your Terminal' : mode === 'register' ? 'Register Engineering Account' : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Access enrolled courses, simulations, and credentials'
              : mode === 'register'
              ? 'Join accredited electrical and automation programs'
              : 'Enter your verified email for recovery'}
          </p>
        </div>

        {/* Demo Quick-Fill Selectors */}
        {mode === 'login' && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick Test Credentials
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-purple-700 shadow-xs cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff')}
                className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-blue-700 shadow-xs cursor-pointer"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('student')}
                className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-teal-700 shadow-xs cursor-pointer"
              >
                Student
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            {error}
          </div>
        )}

        {forgotSuccess ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
            <p className="font-bold">Password Reset Instructions Dispatched</p>
            <p className="text-[11px] text-emerald-700">A secure reset token has been sent to {email}.</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-3 text-xs font-bold text-teal-700 hover:underline block mx-auto cursor-pointer"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Malhotra"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                        role === 'student' ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    >
                      Scholar / Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('staff')}
                      className={`py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                        role === 'staff' ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    >
                      Instructor / Staff
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 font-semibold">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? 'Sign In to Account'
                      : mode === 'register'
                      ? 'Create Account'
                      : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-teal-700 hover:text-teal-800 font-bold cursor-pointer"
              >
                Create one now
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-teal-700 hover:text-teal-800 font-bold cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
