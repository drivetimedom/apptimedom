import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Category, 
  Course, 
  STORAGE_KEYS, 
  getFromStorage 
} from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VerticalCourseCard from '@/components/courses/VerticalCourseCard';
import { 
  BookOpen, 
  Target, 
  Gem, 
  Settings, 
  BarChart3, 
  Wrench, 
  Users, 
  Brain,
  Library
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  name: string;
  slug: string;
  icon: React.ElementType;
  color: string;
}

const tracks: Track[] = [
  { id: 'trilha-1', name: 'Demanda', slug: 'demanda', icon: Target, color: 'text-red-400 bg-red-500/10' },
  { id: 'trilha-2', name: 'Oferta', slug: 'oferta', icon: Gem, color: 'text-blue-400 bg-blue-500/10' },
  { id: 'trilha-3', name: 'Vendas', slug: 'vendas', icon: Settings, color: 'text-yellow-400 bg-yellow-500/10' },
  { id: 'trilha-4', name: 'Financeira', slug: 'financeira', icon: BarChart3, color: 'text-green-400 bg-green-500/10' },
  { id: 'trilha-5', name: 'Operações', slug: 'operacoes', icon: Wrench, color: 'text-orange-400 bg-orange-500/10' },
  { id: 'trilha-6', name: 'Liderança', slug: 'lideranca', icon: Users, color: 'text-purple-400 bg-purple-500/10' },
  { id: 'trilha-7', name: 'Mindset', slug: 'mindset', icon: Brain, color: 'text-pink-400 bg-pink-500/10' },
];

interface LibrarySectionProps {
  categoryId: string;
}

const LibrarySection: React.FC<LibrarySectionProps> = ({ categoryId }) => {
  const navigate = useNavigate();
  const [selectedTrack, setSelectedTrack] = React.useState<string | null>(null);

  const allCourses = getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);
  
  // Get courses for this category
  const categoryCourses = allCourses.filter(
    course => course.categoryIds?.includes(categoryId) && course.status === 'published'
  );

  // Filter by selected track (using subcategory)
  const filteredCourses = selectedTrack 
    ? categoryCourses.filter(c => 
        c.subcategoryId === selectedTrack
      )
    : categoryCourses;

  // Sort by sequence position
  const sortedCourses = filteredCourses.sort(
    (a, b) => (a.sequenceConfig?.position || 0) - (b.sequenceConfig?.position || 0)
  );

  return (
    <section className="mt-12">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Library className="w-5 h-5 text-primary" />
            </div>
            Biblioteca
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Track tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedTrack(null)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                !selectedTrack 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Todos
            </button>
            {tracks.map((track) => {
              const Icon = track.icon;
              const isSelected = selectedTrack === track.slug;
              
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track.slug)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : `${track.color} hover:opacity-80`
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {track.name}
                </button>
              );
            })}
          </div>

          {/* Courses grid */}
          {sortedCourses.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sortedCourses.map((course) => (
                <VerticalCourseCard 
                  key={course.id} 
                  course={course}
                  badgeType={course.sequenceConfig?.isPillar ? `T${course.sequenceConfig.position}` : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {selectedTrack 
                  ? 'Nenhum curso encontrado nesta trilha.'
                  : 'Nenhum curso disponível ainda.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default LibrarySection;
