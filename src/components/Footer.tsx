import React from 'react';
import { SilphorLogo } from './SilphorLogo';
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink, Cpu, Zap, Clock } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#0B192C] text-slate-400 border-t border-slate-800 text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <SilphorLogo theme="dark" variant="full" className="h-10" />
            <p className="text-slate-400 max-w-sm leading-relaxed mt-2 text-xs">
              Silphor Technologies is an institution dedicated to cutting-edge electrical engineering, industrial automation, and embedded systems education. We fuse mathematical rigor with interactive 3D simulations and hardware verification.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ISO & IEEE Standard Curricula</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-[11px]">Curriculum</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-teal-400 transition-colors">
                  All Engineering Courses
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses?category=cat-ee')} className="hover:text-teal-400 transition-colors">
                  Electrical Engineering
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses?category=cat-auto')} className="hover:text-teal-400 transition-colors">
                  Industrial Automation & PLC
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses?category=cat-pe')} className="hover:text-teal-400 transition-colors">
                  Power Electronics & EV
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses?category=cat-emb')} className="hover:text-teal-400 transition-colors">
                  Embedded Systems & IoT
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-[11px]">Laboratory</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/engineering-lab')} className="hover:text-teal-400 transition-colors">
                  3D Virtual Workbench
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/verify-certificate/SP-EE-2026-3347')} className="hover:text-teal-400 transition-colors">
                  Credential Verification
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/instructors')} className="hover:text-teal-400 transition-colors">
                  Faculty & Fellows
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-teal-400 transition-colors">
                  Accreditation & Standards
                </button>
              </li>
            </ul>
          </div>

          {/* Campus Coordinates */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-[11px]">Malleswaram Campus</h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  #45 East Road, Malleswaram, Bangalore, Karnataka - 560003, India
                  <span className="block text-[10px] text-teal-400/90 mt-0.5">
                    Landmark: Near 8th Cross Cultural Hub & Malleswaram Ground
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a href="tel:+917829455663" className="font-mono hover:text-white transition-colors">
                  +91 7829455663
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <a href="mailto:silphortechnologies@gmail.com" className="font-mono hover:text-white transition-colors truncate">
                  silphortechnologies@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-slate-800/60">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div className="text-[10px] space-y-0.5 leading-snug">
                  <div>Mon - Fri: 9:00 AM - 7:00 PM IST</div>
                  <div>Sat: 9:30 AM - 5:30 PM IST</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="text-slate-400">
            © {new Date().getFullYear()} SILPHOR TECHNOLOGIES. All rights reserved. Operating exclusively in Indian Rupee (₹ INR).
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono">
            <span>DESIGN</span>
            <span>•</span>
            <span>INNOVATE</span>
            <span>•</span>
            <span>VERIFY</span>
            <span>•</span>
            <span>DELIVER</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
