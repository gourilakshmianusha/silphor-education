import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  Zap,
  Clock,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

interface CoursesPageProps {
  navigate: (path: string) => void;
  initialCategory?: string;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ navigate, initialCategory }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    };
    fetchCats();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLevel && selectedLevel !== 'all') params.append('level', selectedLevel);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/courses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (e) {
      console.error('Failed to load courses', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title & Description */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-teal-700 font-bold">
            Public Academic Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Accredited Engineering Curricula
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            All tuitions are denominated in Indian Rupee (INR / ₹) with full access to the 3D Virtual Lab, hardware-in-the-loop assignments, and QR verified credentials.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by course title, skill, or keyword (e.g. Electrical Machines, PLC, BMS, Inverter)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50/50"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category Chips and Level Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Discipline:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Curricula
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Skill Level:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-slate-100 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Stream */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Querying live PostgreSQL database...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No matching engineering courses found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No published courses match your current search query or filter. If an administrator recently published a new course, ensure it has been marked as published.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedLevel('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/courses/${c.slug}`)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
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

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-teal-700 font-semibold uppercase">
                      <span>{c.category_name || 'Engineering'}</span>
                      <span className="text-slate-400 font-normal">
                        {c.modules_count || 1} Modules • {c.lessons_count || 1} Lessons
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-700 transition-colors">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {c.short_description}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                      <span>Instructor:</span>
                      <span className="font-semibold text-slate-700">{c.instructor_name || 'Faculty Member'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-lg font-extrabold text-slate-900 font-mono">
                        ₹{Number(c.price).toLocaleString('en-IN')}
                      </div>
                      {c.discount_price && (
                        <div className="text-[11px] text-slate-400 line-through font-mono">
                          ₹{Number(c.discount_price).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    <span className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold group-hover:bg-teal-600 transition-colors flex items-center gap-1.5 shadow-sm">
                      <span>View Syllabus</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
