import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SilphorLogo } from './SilphorLogo';
import {
  BookOpen,
  Box,
  Layers,
  Award,
  Users,
  Info,
  Mail,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Courses', path: '/courses', icon: BookOpen },
    { label: '3D Engineering Lab', path: '/engineering-lab', icon: Box },
    { label: 'Instructors', path: '/instructors', icon: Users },
    { label: 'Verify Credential', path: '/verify-certificate/SP-EE-2026-3347', icon: Award },
    { label: 'About', path: '/about', icon: Info },
    { label: 'Contact', path: '/contact', icon: Mail },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'staff') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B192C]/95 backdrop-blur-md border-b border-slate-800 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo Monogram & Name */}
        <div
          onClick={() => handleNav('/')}
          className="cursor-pointer group flex items-center transition-transform active:scale-98"
        >
          <SilphorLogo theme="dark" variant="full" className="h-10" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-teal-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User / Authentication CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-teal-500/50 text-xs text-white transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="font-semibold truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[10px] text-teal-400 capitalize font-mono leading-none">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs divide-y divide-slate-800">
                  <div className="p-2 space-y-0.5">
                    <div className="font-bold text-white truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-400 truncate font-mono">{user.email}</div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => handleNav(getDashboardPath())}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-teal-500/10 hover:text-teal-300 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-teal-400" />
                      <span>{user.role === 'admin' ? 'Admin Console' : user.role === 'staff' ? 'Faculty Terminal' : 'Scholar Dashboard'}</span>
                    </button>

                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleNav('/admin/dashboard')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        logout();
                        handleNav('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav('/login')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                Join Academy
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 text-xs">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-teal-400 font-medium text-left"
            >
              <item.icon className="w-4 h-4 text-teal-400" />
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-4 border-t border-slate-800 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNav(getDashboardPath())}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-500 text-slate-950 font-bold flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Terminal ({user.role})</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    handleNav('/');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 text-red-400 font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 text-white font-semibold text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="py-2.5 px-3 rounded-xl bg-teal-500 text-slate-950 font-bold text-center"
                >
                  Join Academy
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
