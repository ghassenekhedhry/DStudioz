import React, { useRef, useState, useEffect } from 'react';
import { CUSTOMER_PROBLEMS } from '../../data/initialData';
import { useStudio } from '../../context/StudioContext';
import { ChevronLeft, ChevronRight, HelpCircle, ArrowRight } from 'lucide-react';

export const ProblemsCarousel: React.FC = () => {
  const { highlightProblem, activeProblemId } = useStudio();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  const handleProblemClick = (problem: typeof CUSTOMER_PROBLEMS[0]) => {
    highlightProblem(
      problem.id,
      problem.targetDepartmentId,
      problem.targetServiceId,
      problem.targetPackageId
    );
  };

  return (
    <section id="problems" className="py-16 sm:py-20 border-b border-[#E3E1DA] bg-[#F7F4ED] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF573D] mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Entry 03 • Recognition First</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#18191B] tracking-tight">
              What can we help you solve?
            </h2>
            <p className="text-xs sm:text-sm text-[#74756F] mt-1.5 max-w-xl">
              Choose the statement that fits your immediate challenge. We will connect you to the right service without confusing jargon.
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-xl border border-[#E3E1DA] bg-white text-[#18191B] flex items-center justify-center hover:bg-[#EFEEE8] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#FF573D]"
              aria-label="Scroll problems carousel left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-xl border border-[#E3E1DA] bg-white text-[#18191B] flex items-center justify-center hover:bg-[#EFEEE8] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#FF573D]"
              aria-label="Scroll problems carousel right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          tabIndex={0}
          aria-label="Problems we solve carousel"
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 focus:outline-hidden focus:ring-2 focus:ring-[#FF573D] rounded-2xl"
        >
          {CUSTOMER_PROBLEMS.map((item, index) => {
            const isActive = activeProblemId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleProblemClick(item)}
                className={`flex-shrink-0 w-[280px] sm:w-[320px] p-5 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isActive
                    ? 'border-[#FF573D] bg-white shadow-md ring-2 ring-[#FF573D]/20 scale-[1.01]'
                    : 'border-[#E3E1DA] bg-white hover:border-[#18191B] hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EFEEE8] text-[#74756F]">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono text-[#A0A19B]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-[#18191B] leading-snug group-hover:text-[#FF573D] transition-colors">
                    "{item.problem}"
                  </h3>
                </div>

                <div className="mt-5 pt-3 border-t border-[#EFEEE8] flex items-center justify-between text-xs font-semibold text-[#18191B]">
                  <span className="text-[11px] font-medium text-[#74756F] group-hover:text-[#18191B]">
                    See solution
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#F7F4ED] group-hover:bg-[#FF573D] group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
