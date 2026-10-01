import React from 'react';
import { SilphorLogo } from '../components/SilphorLogo';
import { ShieldCheck, Award, Zap, Cpu, Users, Target, Compass, BookOpen } from 'lucide-react';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <SilphorLogo variant="full" className="h-24 mx-auto" showTagline={true} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-6">
            Pioneering Rigorous Electrical Engineering Education
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Silphor Technologies was founded on a simple engineering premise: theoretical equations must be coupled with physical hardware verification, industrial standards, and interactive 3D modeling.
          </p>
        </div>

        {/* Mission & Vision Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Our Mission</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              To bridge the critical gap between academic electrical engineering theory and modern industrial commissioning. We train engineers to design robust power distribution networks, program industrial PLCs according to IEC standards, and engineer cutting-edge electric vehicle powertrains.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Our Vision</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              To become the global benchmark in hardware-in-the-loop technical training, empowering engineers to architect high-efficiency renewable microgrids, autonomous industrial robotics, and functional safety-compliant embedded systems.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="bg-[#0B192C] text-white rounded-3xl p-8 sm:p-14 border border-slate-800 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="text-xs font-mono text-teal-400 uppercase tracking-widest">Engineering Creed</div>
            <h2 className="text-2xl font-extrabold text-white">The Four Silphor Principles</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div className="text-teal-400 font-mono font-bold text-sm">01. DESIGN</div>
              <h3 className="text-sm font-bold text-white mt-1">First-Principles Rigor</h3>
              <p className="text-xs text-slate-400 mt-2">
                Derive transfer functions, impedance calculations, and thermal boundaries before laying a single trace.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div className="text-teal-400 font-mono font-bold text-sm">02. INNOVATE</div>
              <h3 className="text-sm font-bold text-white mt-1">Modern Topologies</h3>
              <p className="text-xs text-slate-400 mt-2">
                Harness Silicon Carbide (SiC) power semiconductors, FreeRTOS architectures, and AI predictive maintenance.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div className="text-teal-400 font-mono font-bold text-sm">03. VERIFY</div>
              <h3 className="text-sm font-bold text-white mt-1">Hardware Validation</h3>
              <p className="text-xs text-slate-400 mt-2">
                Simulate in 3D, bench-test with digital oscilloscopes, and prove safety interlocks under stress.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div className="text-teal-400 font-mono font-bold text-sm">04. DELIVER</div>
              <h3 className="text-sm font-bold text-white mt-1">Industry Certification</h3>
              <p className="text-xs text-slate-400 mt-2">
                Produce production-grade Gerber packages, PLC ladder programs, and accredited credentials.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Explore Our Accredited Curricula</h3>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Browse Course Catalog (₹ INR)
          </button>
        </div>
      </div>
    </div>
  );
};
