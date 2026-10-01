import React, { useState, useEffect } from 'react';
import { SilphorLogo } from '../components/SilphorLogo';
import { Award, ShieldCheck, CheckCircle2, Download, Printer, ExternalLink, Calendar, User, BookOpen } from 'lucide-react';

interface CertificateVerifyPageProps {
  code: string;
  navigate: (path: string) => void;
}

export const CertificateVerifyPage: React.FC<CertificateVerifyPageProps> = ({ code, navigate }) => {
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await fetch(`/api/certificates/verify/${code}`);
        const data = await res.json();
        if (res.ok && data.valid) {
          setCert(data.certificate);
        } else {
          setError(data.message || 'Certificate record could not be found');
        }
      } catch (e: any) {
        setError(e.message || 'Verification service error');
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [code]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Verifying credential against registry...</p>
        </div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-red-200 text-center shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Certificate Verification Failed</h2>
          <p className="text-xs text-slate-500">
            {error || `No verified credential exists for ID: ${code}. Please verify with the issuing office.`}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Explore Verified Curricula
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-10 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Verification Status Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                Official Credential Verified
              </div>
              <div className="text-xs text-emerald-700">
                Issued by Silphor Technologies Academic Governance Board • Registry ID: <span className="font-mono font-bold">{cert.certificate_code}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* The Official Certificate Canvas */}
        <div className="relative bg-white rounded-2xl border-8 border-double border-slate-300 p-8 sm:p-14 shadow-2xl overflow-hidden print:border-4 print:p-8 print:shadow-none text-center">
          {/* Subtle Watermark Monogram Emblem */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
            <SilphorLogo variant="monogram" className="w-96 h-72" />
          </div>

          {/* Top Logo Lockup */}
          <div className="flex justify-center mb-6">
            <SilphorLogo variant="full" className="h-20" showTagline={false} />
          </div>

          <div className="text-[11px] font-mono tracking-[0.3em] uppercase text-teal-800 font-extrabold mb-3">
            CERTIFICATE OF ENGINEERING ACCOMPLISHMENT
          </div>

          <p className="text-xs text-slate-500 italic max-w-lg mx-auto">
            This certifies that the candidate has successfully completed all laboratory curricula, mathematical modeling, and hardware-in-the-loop assignments for
          </p>

          {/* Candidate Name */}
          <div className="my-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B192C] tracking-tight border-b-2 border-slate-200 pb-2 inline-block px-8 font-serif">
              {cert.student_name}
            </h2>
          </div>

          {/* Course Name */}
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            In Recognition of Rigorous Completion of
          </p>
          <h3 className="text-lg sm:text-2xl font-bold text-teal-900 mt-1 max-w-xl mx-auto leading-snug">
            {cert.course_name}
          </h3>

          <p className="text-xs text-slate-500 mt-2">
            Level: {cert.course_level || 'Advanced'} • Duration: {cert.course_duration || '8 Weeks'}
          </p>

          {/* Bottom Accreditation Block: Signatures & QR Code */}
          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            {/* Signature 1 */}
            <div className="space-y-1">
              <div className="font-serif italic text-base text-slate-800 font-bold border-b border-slate-300 pb-1">
                {cert.instructor_name}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Lead Faculty Architect</div>
              <div className="text-[9px] text-slate-400">Silphor Technologies</div>
            </div>

            {/* Central Seal & QR Code */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-20 h-20 bg-slate-900 rounded-xl p-2 flex items-center justify-center border border-teal-500/30 shadow-md">
                {/* Visual QR Code Generator */}
                <svg viewBox="0 0 100 100" className="w-full h-full fill-teal-300">
                  <rect x="10" y="10" width="25" height="25" />
                  <rect x="15" y="15" width="15" height="15" fill="#0f172a" />
                  <rect x="65" y="10" width="25" height="25" />
                  <rect x="70" y="15" width="15" height="15" fill="#0f172a" />
                  <rect x="10" y="65" width="25" height="25" />
                  <rect x="15" y="70" width="15" height="15" fill="#0f172a" />
                  <rect x="42" y="15" width="8" height="8" />
                  <rect x="52" y="25" width="8" height="8" />
                  <rect x="42" y="45" width="16" height="16" />
                  <rect x="70" y="45" width="8" height="12" />
                  <rect x="42" y="72" width="10" height="10" />
                  <rect x="65" y="68" width="18" height="18" />
                </svg>
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                ID: {cert.certificate_code}
              </span>
            </div>

            {/* Signature 2 */}
            <div className="space-y-1">
              <div className="font-serif italic text-base text-slate-800 font-bold border-b border-slate-300 pb-1">
                Dr. K. S. Ramanathan
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Director of Academic Affairs</div>
              <div className="text-[9px] text-slate-400">
                Issued: {new Date(cert.issue_date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Seal Tagline */}
          <div className="mt-8 text-[9px] font-mono tracking-widest text-slate-400 uppercase">
            DESIGN • INNOVATE • VERIFY • DELIVER
          </div>
        </div>
      </div>
    </div>
  );
};
