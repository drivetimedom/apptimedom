import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  HomeBlock,
  BannerBlockData,
  CoursesBlockData,
  TextBlockData,
  ButtonBlockData,
  VideoBlockData,
  DividerBlockData
} from '@/hooks/useHomeBlocks';
import VerticalCourseCard from '@/components/courses/VerticalCourseCard';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useAuth } from '@/contexts/AuthContext';

interface BlockRendererProps {
  block: HomeBlock;
}

// Banner Block Component
const BannerBlock: React.FC<{ data: BannerBlockData }> = ({ data }) => {
  const { imageUrl, link, height, openInNewTab } = data;

  if (!imageUrl) return null;

  const handleClick = () => {
    if (link) {
      if (openInNewTab || link.startsWith('http')) {
        window.open(link, '_blank');
      } else {
        window.location.href = link;
      }
    }
  };

  return (
    <div
      className="w-full cursor-pointer overflow-hidden"
      style={{ height }}
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt="Banner"
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
};

// Courses Block Component
const CoursesBlock: React.FC<{ data: CoursesBlockData }> = ({ data }) => {
  const { title, filterType, categoryId, courseId, layout, itemsPerRow, limit } = data;
  const { data: userProgressList = [] } = useUserProgress();
  const { profile, isAdmin, isInstructor } = useAuth();

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-block', filterType, categoryId, courseId],
    queryFn: async () => {
      let query = supabase.from('courses').select('*').eq('status', 'published');

      if (filterType === 'category' && categoryId) {
        query = query.contains('category_ids', [categoryId]);
      } else if (filterType === 'single' && courseId) {
        query = query.eq('id', courseId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return limit ? (data || []).slice(0, limit) : (data || []);
    }
  });

  const getProgress = (courseId: string) =>
    userProgressList.find(p => p.courseId === courseId);

  const isCourseUnlocked = (course: any) => {
    if (isAdmin || isInstructor) return true;
    if (!course.locked) return true;
    return profile?.unlocked_courses?.includes(course.id) || false;
  };

  const gridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };

  if (courses.length === 0) return null;

  return (
    <section className="py-8 px-4 md:px-8 lg:px-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>

      {layout === 'carousel' ? (
        <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {courses.map((course: any) => (
            <VerticalCourseCard
              key={course.id}
              course={course}
              progress={getProgress(course.id)}
              isLocked={!isCourseUnlocked(course)}
            />
          ))}
        </div>
      ) : (
        <div className={`grid ${gridCols[itemsPerRow] || gridCols[3]} gap-6`}>
          {courses.map((course: any) => (
            <VerticalCourseCard
              key={course.id}
              course={course}
              progress={getProgress(course.id)}
              isLocked={!isCourseUnlocked(course)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// Text Block Component
const TextBlock: React.FC<{ data: TextBlockData }> = ({ data }) => {
  const { title, subtitle, alignment } = data;

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[alignment];

  return (
    <div className={`py-8 px-4 md:px-8 lg:px-12 ${alignClass}`}>
      <h2 className="text-3xl font-bold text-foreground">{title}</h2>
      {subtitle && (
        <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>
      )}
    </div>
  );
};

// Button Block Component
const ButtonBlock: React.FC<{ data: ButtonBlockData }> = ({ data }) => {
  const { text, link, color, size } = data;
  const navigate = useNavigate();

  const sizeClasses = {
    small: 'px-6 py-3 text-sm',
    medium: 'px-8 py-4',
    large: 'px-10 py-5 text-lg'
  };

  const handleClick = () => {
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      navigate(link);
    }
  };

  return (
    <div className="py-8 px-4 md:px-8 lg:px-12 flex justify-center">
      <button
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-lg font-semibold text-white transition-opacity hover:opacity-90`}
        style={{ backgroundColor: color }}
      >
        {text}
      </button>
    </div>
  );
};

// Video Block Component
const VideoBlock: React.FC<{ data: VideoBlockData }> = ({ data }) => {
  const { url, height } = data;

  const getEmbedUrl = (videoUrl: string): string => {
    if (videoUrl.includes('vimeo.com')) {
      const videoId = videoUrl.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = '';
      if (videoUrl.includes('youtu.be')) {
        videoId = videoUrl.split('/').pop() || '';
      } else {
        const urlParams = new URLSearchParams(new URL(videoUrl).search);
        videoId = urlParams.get('v') || '';
      }
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return videoUrl;
  };

  if (!url) return null;

  return (
    <div className="py-8 px-4 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto rounded-xl overflow-hidden" style={{ height }}>
        <iframe
          src={getEmbedUrl(url)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

// Divider Block Component
const DividerBlock: React.FC<{ data: DividerBlockData }> = ({ data }) => {
  return (
    <div style={{ height: data.spacing }} className="flex items-center px-8">
      <div className="w-full h-px bg-border" />
    </div>
  );
};

// Main Block Renderer
const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  switch (block.type) {
    case 'banner':
      return <BannerBlock data={block.data as BannerBlockData} />;
    case 'courses':
      return <CoursesBlock data={block.data as CoursesBlockData} />;
    case 'text':
      return <TextBlock data={block.data as TextBlockData} />;
    case 'button':
      return <ButtonBlock data={block.data as ButtonBlockData} />;
    case 'video':
      return <VideoBlock data={block.data as VideoBlockData} />;
    case 'divider':
      return <DividerBlock data={block.data as DividerBlockData} />;
    default:
      return null;
  }
};

export default BlockRenderer;
