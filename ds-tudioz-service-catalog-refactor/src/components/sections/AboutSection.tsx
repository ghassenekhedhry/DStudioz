import React from 'react';
import { Layers, MessageSquare, Globe, ArrowRight } from 'lucide-react';
import { StudioSettings } from '../../types';
import { useStudio } from '../../context/StudioContext';

interface AboutSectionProps {
  settings?: StudioSettings;
  onOpenBooking?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings: propSettings, onOpenBooking: propBooking }) => {
  const { settings: contextSettings, openBookingModal } = useStudio();
  const settings = propSettings || contextSettings;
  const onOpenBooking = propBooking || (() => openBookingModal());

  const headline = settings?.aboutHeadline || 'Many skills. One connected team.';
  const paragraphs = settings?.aboutParagraphs && settings.aboutParagraphs.length > 0
    ? settings.aboutParagraphs
    : [
        'DStudioz is an independent digital solutions studio run by two brothers alongside skilled collaborators. We bring together creative design, web development, content creation, advertising, and technical solutions under one roof.',
        'Instead of juggling multiple freelancers or dealing with the overhead of a large agency, you work with a small, focused team that handles your project from start to finish. Every piece connects seamlessly because the people building it communicate directly.',
        'Whether you need a single service or an end-to-end digital setup, we keep things practical, well organized, and built around your goals.',
      ];

  const principles = [
    {
      icon: Layers,
      title: 'Coordinated expertise',
      description: 'Design, code, content, and marketing aligned under one unified workflow so nothing falls through the cracks.',
    },
    {
      icon: MessageSquare,
      title: 'Clear scope and communication',
      description: 'Transparent deliverables, realistic timelines, and honest updates from the people actually doing the work.',
    },
    {
      icon: Globe,
      title: 'Flexible remote collaboration',
      description: 'Working smoothly with businesses across North Africa, Europe, Canada, and globally.',
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-24 border-b border-[#E3E1DA] bg-[#F7F4ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF573D] mb-3">
            <span>ABOUT DSTUDIOZ</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18191B] tracking-tight leading-[1.15]">
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Main Story Paragraphs */}
          <div className="lg:col-span-7 space-y-5 text-base sm:text-lg text-[#252629] leading-relaxed">
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}

            <div className="pt-4 border-t border-[#E3E1DA]">
              <p className="font-display text-lg font-bold text-[#18191B]">
                One clear direction. Coordinated work. Solutions built around you.
              </p>
            </div>
          </div>

          {/* Three Principles Cards */}
          <div className="lg:col-span-5 space-y-4">
            {principles.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E1DA] shadow-xs hover:border-[#FF573D]/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F4ED] border border-[#E3E1DA] flex items-center justify-center text-[#FF573D] shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-[#18191B] mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[#74756F] leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {onOpenBooking && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#18191B] text-white text-sm font-semibold hover:bg-black transition-colors"
                >
                  <span>Schedule an intro call</span>
                  <ArrowRight className="w-4 h-4 text-[#DDF278]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
