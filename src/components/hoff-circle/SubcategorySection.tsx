import React from 'react';
import { Course, Subcategory } from '@/lib/storage';
import VerticalCourseCard from '@/components/courses/VerticalCourseCard';
import { Trophy, Star, BookOpen } from 'lucide-react';

interface SubcategorySectionProps {
  subcategory: Subcategory;
  courses: Course[];
  showRoadmap?: boolean;
}

const getSubcategoryIcon = (slug: string) => {
  switch (slug) {
    case 'trilhas':
      return BookOpen;
    case 'desafios':
      return Trophy;
    case 'material-extra':
      return Star;
    default:
      return BookOpen;
  }
};

const SubcategorySection: React.FC<SubcategorySectionProps> = ({ 
  subcategory, 
  courses,
}) => {
  const Icon = getSubcategoryIcon(subcategory.slug);

  if (courses.length === 0) return null;

  // Get badge type based on course config
  const getBadgeType = (course: Course): string | undefined => {
    if (course.sequenceConfig?.isPillar) {
      return `Pilar ${course.sequenceConfig?.position}`;
    }
    if (subcategory.slug === 'desafios') {
      return 'Protocolo';
    }
    if (subcategory.slug === 'material-extra') {
      return undefined;
    }
    return 'Complementar';
  };

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">{subcategory.name}</h2>
            {subcategory.description && (
              <p className="text-sm text-muted-foreground mt-1">{subcategory.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {courses.map((course) => (
          <VerticalCourseCard 
            key={course.id} 
            course={course}
            badgeType={getBadgeType(course)}
          />
        ))}
      </div>
    </section>
  );
};

export default SubcategorySection;
