import React, { useState, useEffect } from 'react';
import { Hero3DCanvas } from '../components/Hero3DCanvas';
import { EngineeringLab3D } from '../components/EngineeringLab3D';
import { SilphorLogo } from '../components/SilphorLogo';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Zap,
  Cpu,
  Layers,
  CheckCircle2,
  Users,
  Compass,
  Sparkles,
  BookOpen,
  Star,
  ExternalLink
} from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [cRes, catRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/categories')
        ]);
        if (cRes.ok) {
          const cData = await cRes.json();
          setFeaturedCourses(cData.courses.slice(0, 4));
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION WITH 3D INTERACTIVE PCB CANVAS */}
      <section className="relative bg-[#0B192C] text-white overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00A896_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono tracking-wide">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span>Next-Gen Engineering Academy • Bengaluru Campus</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Master Electrical & Automation Engineering with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-sky-400 to-teal-200">
                  Interactive 3D Hardware
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Silphor Technologies bridges theoretical circuit mathematics with physical hardware commissioning. Learn Siemens PLC programming, automotive EV inverters, high-speed multilayer PCB layouts, and power grid stability directly in your browser.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate('/courses')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Accredited Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/engineering-lab')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Cpu className="w-4 h-4 text-teal-400" />
                  <span>Launch 3D Virtual Lab</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white">100% INR</div>
                  <div className="text-xs text-slate-400 mt-0.5">Indian Rupee Pricing (₹)</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-teal-400">IEEE & ISO</div>
                  <div className="text-xs text-slate-400 mt-0.5">Industrial Standards</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-sky-400">QR Verified</div>
                  <div className="text-xs text-slate-400 mt-0.5">Academic Credentials</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Microcontroller PCB Canvas */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-2 shadow-2xl backdrop-blur-md">
                <Hero3DCanvas />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ENGINEERING DISCIPLINES / CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-teal-700 font-bold">
              Engineering Disciplines
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Curricula Designed for Real-World Industry
            </h2>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Programs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/courses?category=${cat.id}`)}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="text-[11px] font-mono text-teal-700 font-medium flex items-center justify-between pt-2 border-t border-slate-100">
                <span>{cat.courses_count || 1} Courses</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED COURSES WITH REAL DATABASE PRICING (INR ₹) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-teal-700 font-bold">
              Featured Programs
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Top Engineering Certifications
            </h2>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/courses/${c.slug}`)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={c.thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-md border border-slate-700">
                    {c.level}
                  </div>
                  <div className="absolute top-3 right-3 bg-teal-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded shadow">
                    {c.duration}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-[11px] font-mono text-teal-700 font-semibold uppercase">
                    {c.category_name || 'Engineering'}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {c.short_description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-base font-extrabold text-slate-900 font-mono">
                      ₹{Number(c.price).toLocaleString('en-IN')}
                    </div>
                    {c.discount_price && (
                      <div className="text-[10px] text-slate-400 line-through font-mono">
                        ₹{Number(c.discount_price).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold group-hover:bg-teal-600 transition-colors flex items-center gap-1">
                    <span>Enroll</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INTERACTIVE 3D VIRTUAL LAB SHOWCASE */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold">
              Virtual Laboratory Workbench
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hardware-in-the-Loop Simulation Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Manipulate 3-phase transformers, industrial PLCs, traction inverters, induction motors, and multilayer PCBs in full 3D. Inspect realtime apparent power, magnetic flux linkage, and thermal gradients directly.
            </p>
          </div>

          <EngineeringLab3D initialModel="transformer" />
        </div>
      </section>

      {/* 5. THE SILPHOR CREED BENTO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <SilphorLogo variant="monogram" className="mx-auto h-12" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              The Engineering Creed
            </h2>
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
              DESIGN • INNOVATE • VERIFY • DELIVER
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-teal-700 font-mono font-bold text-sm">01. DESIGN</div>
              <h3 className="font-bold text-slate-900 text-sm">First-Principles Rigor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Derive circuit topologies from fundamental Maxwell equations and electromagnetic laws before simulating or soldering.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-teal-700 font-mono font-bold text-sm">02. INNOVATE</div>
              <h3 className="font-bold text-slate-900 text-sm">Silicon Carbide & RTOS</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Master modern Wide-Bandgap semiconductors (SiC/GaN), FreeRTOS preemptive schedulers, and automotive CAN fieldbuses.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-teal-700 font-mono font-bold text-sm">03. VERIFY</div>
              <h3 className="font-bold text-slate-900 text-sm">HIL & Laboratory Bench</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stress-test thermal dissipation, transient surge voltages, and electromagnetic emissions under strict industrial tolerance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-teal-700 font-mono font-bold text-sm">04. DELIVER</div>
              <h3 className="font-bold text-slate-900 text-sm">Industry Accreditation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive verifiable credentials complete with QR verification registry codes and authorized faculty endorsement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
