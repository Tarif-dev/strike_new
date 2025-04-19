import { useEffect, useState, useRef } from "react";

interface Banner {
  id: number;
  imageUrl: string;
  altText: string;
}

interface BannerSliderProps {
  banners: Banner[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto rotation
    if (banners.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    // Reset the interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  if (banners.length === 0) {
    return (
      <div className="relative overflow-hidden bg-[#1f2833]" style={{ height: "160px" }}>
        <div className="w-full h-full flex items-center justify-center text-white">
          No banners available
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#1f2833]" style={{ height: "160px" }}>
      <div 
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="w-full flex-shrink-0">
            <img 
              src={banner.imageUrl} 
              className="w-full h-full object-cover" 
              alt={banner.altText} 
            />
          </div>
        ))}
      </div>
      
      {/* Slider navigation dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
          {banners.map((_, index) => (
            <button 
              key={index}
              className={`w-2 h-2 rounded-full bg-white ${index === currentSlide ? 'opacity-100' : 'opacity-60'}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
