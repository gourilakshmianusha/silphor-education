import React, { useState } from 'react';
import { SilphorLogo } from '../components/SilphorLogo';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, ShieldCheck, Compass } from 'lucide-react';

interface ContactPageProps {
  navigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Course Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || 'Your inquiry has been logged in our academic advisory desk at Malleswaram Campus.');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        setErrorMessage(data.error || 'Failed to submit contact message');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold text-teal-700 uppercase tracking-widest">
            Academic Advisory & Campus Helpdesk
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Connect with SILPHOR TECHNOLOGIES
          </h1>
          <p className="text-xs text-slate-600">
            Have questions regarding curriculum prerequisites, corporate cohort training, or 3D simulation access? Our faculty advisers respond within 24 business hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Official Campus Coordinates */}
          <div className="lg:col-span-5 bg-[#0B192C] text-white p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-8 shadow-xl">
            <div>
              <SilphorLogo theme="dark" variant="horizontal" className="h-8" showTagline={false} />
              <div className="mt-3 text-[10px] font-mono tracking-widest text-teal-400 uppercase">
                ENGINEERING FACILITY & ADVISORY
              </div>
            </div>

            <div className="space-y-6 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Malleswaram Campus</div>
                  <div className="text-slate-400 mt-1 leading-relaxed">
                    #45 East Road, Malleswaram, Bangalore, Karnataka - 560003, India
                  </div>
                  <div className="text-[11px] text-teal-400 font-medium mt-1">
                    Landmark: Near 8th Cross Cultural Hub & Malleswaram Ground
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Direct Line</div>
                  <a href="tel:+917829455663" className="text-slate-300 font-mono mt-0.5 hover:text-teal-400 transition-colors block">
                    +91 7829455663
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Admissions & Verification</div>
                  <a href="mailto:silphortechnologies@gmail.com" className="text-slate-300 font-mono mt-0.5 hover:text-teal-400 transition-colors block">
                    silphortechnologies@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Lab & Operational Hours</div>
                  <div className="text-slate-400 mt-1 space-y-0.5 text-[11px]">
                    <div>Mon - Fri: 9:00 AM - 7:00 PM IST</div>
                    <div>Sat: 9:30 AM - 5:30 PM IST</div>
                    <div className="text-slate-400">Sun: Closed for Laboratory Calibration</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-teal-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>All inquiries recorded directly to the backend database</span>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Send an Academic Inquiry</h2>

            {successMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>{successMessage}</div>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 7829455663"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Course Inquiry">Course & Curriculum Inquiry</option>
                    <option value="Corporate Training">Corporate / College Lab Training</option>
                    <option value="Certificate Verification">Certificate Verification Assistance</option>
                    <option value="Technical Support">Platform & Simulation Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Message *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Detail your inquiry or background..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Transmitting to Advisory Desk...' : 'Submit Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
