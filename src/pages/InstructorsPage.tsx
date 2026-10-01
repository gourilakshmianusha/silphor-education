import React, { useState, useEffect } from 'react';
import { Award, BookOpen, Mail, Phone, ExternalLink, Zap } from 'lucide-react';

interface InstructorsPageProps {
  navigate: (path: string) => void;
}

export const InstructorsPage: React.FC<InstructorsPageProps> = ({ navigate }) => {
  const facultyMembers = [
    {
      id: 'usr-staff-1',
      name: 'Dr. Rajesh Sharma',
      designation: 'Lead Industrial Automation & PLC Specialist',
      expertise: ['Siemens TIA Portal', 'SCADA / HMI', 'Allen Bradley ControlLogix', 'IEC 61131-3'],
      experience: '16+ Years Industrial Commissioning & Consultancy',
      bio: 'Ph.D. in Industrial Control Systems with over 16 years leading large-scale automation projects in petrochemical, pharmaceutical, and automotive plants across India and Germany.',
      coursesCount: 5
    },
    {
      id: 'usr-staff-2',
      name: 'Prof. Ananya Sen',
      designation: 'Principal Embedded & EV Systems Architect',
      expertise: ['Automotive BMS', 'Silicon Carbide Inverters', 'FreeRTOS & ARM Cortex', 'ISO 26262'],
      experience: '14+ Years Automotive Powertrain & Firmware R&D',
      bio: 'Former principal firmware architect specializing in high-voltage lithium battery management systems, field-oriented motor control, and automotive functional safety.',
      coursesCount: 4
    },
    {
      id: 'usr-admin-1',
      name: 'Dr. K. S. Ramanathan',
      designation: 'Chief Technology Officer & Dean of Engineering',
      expertise: ['Power Systems', 'Renewable Microgrids', 'High-Voltage Engineering', 'Numerical Modeling'],
      experience: '22+ Years Academic Governance & Grid Consulting',
      bio: 'Fellow of the Institution of Engineers. Directs Silphor Technologies curriculum standards, laboratory accreditation, and corporate research testbeds.',
      coursesCount: 3
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold text-teal-700 uppercase tracking-widest">
            World-Class Engineering Faculty
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Learn Directly from Industry Practitioners
          </h1>
          <p className="text-xs text-slate-600">
            Our instructors are licensed professional engineers, active consultants, and industry veterans who teach what they commission in actual production environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {facultyMembers.map((fac) => (
            <div
              key={fac.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="p-8 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0B192C] text-teal-400 font-extrabold text-2xl flex items-center justify-center shadow-md">
                    {fac.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{fac.name}</h3>
                    <p className="text-xs text-teal-700 font-medium leading-tight mt-0.5">{fac.designation}</p>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">{fac.experience}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {fac.bio}
                </p>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Core Technical Disciplines</div>
                  <div className="flex flex-wrap gap-1.5">
                    {fac.expertise.map((exp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-700"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {fac.coursesCount} Programs Led
                </span>

                <button
                  onClick={() => navigate('/courses')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                  <span>View Courses</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
