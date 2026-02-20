import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/lib/storage';
import { cn } from '@/lib/utils';
interface HeroBannerCarouselProps {
  banners: Banner[];
}
const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({
  banners
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const activeBanners = banners.filter(b => b.active).sort((a, b) => a.order - b.order);
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);
  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Autoplay
  useEffect(() => {
    if (isPaused || activeBanners.length <= 1) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isPaused, goToNext, activeBanners.length]);
  const handleBannerClick = (banner: Banner) => {
    if (banner.linkType === 'course') {
      navigate(`/course/${banner.linkTo}`);
    } else if (banner.linkType === 'external') {
      window.open(banner.linkTo, '_blank');
    } else if (banner.linkType === 'page') {
      if (banner.linkTo.startsWith('#')) {
        const element = document.querySelector(banner.linkTo);
        element?.scrollIntoView({
          behavior: 'smooth'
        });
      } else {
        navigate(banner.linkTo);
      }
    }
  };
  if (activeBanners.length === 0) return null;
  const currentBanner = activeBanners[currentIndex];
  return <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-background" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      {/* Slides */}
      <div className="relative w-full h-full">
        {activeBanners.map((banner, index) => <div key={banner.id} className={cn("absolute inset-0 transition-opacity duration-500 ease-in-out", index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0")}>
            {/* Background Image */}
            <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(${banner.imageUrl})`
        }} />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-[69px]">
                <div className="max-w-2xl space-y-6 md:px-0 mx-0 px-0">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                    {banner.title}
                  </h2>
                  {banner.subtitle && <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                      {banner.subtitle}
                    </p>}
                  {banner.ctaText && <button onClick={() => handleBannerClick(banner)} className="inline-flex items-center py-4 bg-foreground text-background font-semibold rounded-lg hover:bg-foreground/90 transition-all duration-200 shadow-elegant px-[20px] text-center">
                      {banner.ctaText}
                    </button>}
                </div>
              </div>
            </div>
          </div>)}
      </div>

      {/* Navigation Arrows — hidden on mobile */}
      {activeBanners.length > 1 && <>
          <button onClick={goToPrev} className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-card/80 hover:bg-card border border-border items-center justify-center transition-all duration-200 hover:scale-110" aria-label="Banner anterior">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <button onClick={goToNext} className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-card/80 hover:bg-card border border-border items-center justify-center transition-all duration-200 hover:scale-110" aria-label="Próximo banner">
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        </>}

      {/* Dot Indicators */}
      {activeBanners.length > 1 && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {activeBanners.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={cn("w-3 h-3 rounded-full transition-all duration-300 hover:scale-125", index === currentIndex ? "bg-foreground" : "bg-foreground/40 hover:bg-foreground/60")} aria-label={`Ir para banner ${index + 1}`} />)}
        </div>}
    </div>;
};
export default HeroBannerCarousel;