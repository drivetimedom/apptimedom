import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import { useLessons } from '@/hooks/useLessons';
import { useStudentCourseAccess } from '@/hooks/useStudentAccess';
import { Search, BookOpen, PlayCircle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  type: 'course' | 'lesson';
  title: string;
  subtitle?: string;
  courseId?: string;
}

const GlobalSearch: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate();
  const { user, isAdmin, isInstructor, isStudent, isTeamMember, profile } = useAuth();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: courses = [] } = useCourses();
  const { data: lessons = [] } = useLessons();
  const { data: studentCourseIds = [] } = useStudentCourseAccess();

  // Fetch team_member allowed courses
  const { data: teamMemberSettings } = useQuery({
    queryKey: ['team-member-global-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_member_global_settings')
        .select('allowed_course_ids')
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: isTeamMember,
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const accessibleCourseIds = useMemo(() => {
    // Admin/instructor/regular user → all published courses
    if (isAdmin || isInstructor || (!isStudent && !isTeamMember)) {
      return null; // null = no filter
    }
    if (isStudent) {
      return new Set(studentCourseIds);
    }
    if (isTeamMember && teamMemberSettings?.allowed_course_ids) {
      return new Set(teamMemberSettings.allowed_course_ids);
    }
    return new Set<string>(); // empty = no access
  }, [isAdmin, isInstructor, isStudent, isTeamMember, studentCourseIds, teamMemberSettings]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const matched: SearchResult[] = [];

    const publishedCourses = courses.filter(c => {
      if (c.status !== 'published') return false;
      if (accessibleCourseIds === null) return true;
      return accessibleCourseIds.has(c.id);
    });

    for (const course of publishedCourses) {
      if (
        course.title.toLowerCase().includes(q) ||
        course.subtitle?.toLowerCase().includes(q) ||
        course.description?.toLowerCase().includes(q)
      ) {
        matched.push({
          id: course.id,
          type: 'course',
          title: course.title,
          subtitle: course.subtitle || course.description?.slice(0, 60),
        });
      }
      if (matched.length >= 20) break;
    }

    const accessibleCourseIdSet = accessibleCourseIds === null
      ? null
      : accessibleCourseIds;

    for (const lesson of lessons) {
      if (accessibleCourseIdSet !== null && !accessibleCourseIdSet.has(lesson.courseId || '')) {
        continue;
      }
      if (
        lesson.title.toLowerCase().includes(q) ||
        lesson.description?.toLowerCase().includes(q)
      ) {
        const parentCourse = courses.find(c => c.id === lesson.courseId);
        if (parentCourse?.status !== 'published') continue;
        matched.push({
          id: lesson.id,
          type: 'lesson',
          title: lesson.title,
          subtitle: parentCourse?.title,
          courseId: lesson.courseId,
        });
      }
      if (matched.length >= 20) break;
    }

    return matched.slice(0, 15);
  }, [query, courses, lessons, accessibleCourseIds]);

  const handleSelect = (result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    if (result.type === 'course') {
      navigate(`/course/${result.id}`);
    } else {
      navigate(`/course/${result.courseId}/lesson/${result.id}`);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Buscar cursos, aulas..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        className="pl-9 pr-8 bg-input border-border text-sm"
      />
      {query && (
        <button
          onClick={() => { setQuery(''); setIsOpen(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Results dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado para "{query}"
            </div>
          ) : (
            <div className="py-1">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {result.type === 'course' ? (
                      <BookOpen className="w-4 h-4 text-primary" />
                    ) : (
                      <PlayCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground flex-shrink-0 mt-1">
                    {result.type === 'course' ? 'Curso' : 'Aula'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
