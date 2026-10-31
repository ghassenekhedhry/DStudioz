import React from 'react';
import { Search, Compass, Users2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const HowWeWork: React.FC = () => {
  const { openBookingModal, settings } = useStudio();

  const headline = settings?.approachHeadline || 'Well coordinated, from start to finish.';
  const supporting =
    settings?.approachSupporting ||
    'We work remotely through a coordinated team, with the right people responsible for each part of your project.';

  const steps = [
    {
      number: '01',
      title: 'Understand',
      description:
        'We listen to your goals, review what you currently have, and determine the most sensible next step — without unnecessary upselling.',
      icon: Search,
      tag: 'Honest assessment',
    },
    {
      number: '02',
      title: 'Plan',
      description:
        'Clear scope, realistic timelines, and transparent pricing confirmed upfront so everyone is aligned before work begins.',
      icon: Compass,
      tag: 'Clear scope & price',
    },
    {
      number: '03',
      title: 'Create Together',
      description:
        'Work progresses with regular updates and direct feedback, keeping design, development, and marketing tightly connected.',
      icon: Users2,
      tag: 'Direct collaboration',
    },
    {
      number: '04',
      title: 'Deliver',
      description:
        'Handoff with all source files, credentials, documentation, and practical next steps so your team is ready to run with it.',
      icon: CheckCircle2,
      tag: 'Full ownership',
    },
  ];

  return (
    <section id="process" className="py-16 sm:py-24 border-b border-[#E3E1DA] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF573D] mb-3">
            <span>OUR APPROACH</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18191B] tracking-tight leading-[1.15]">
            {headline}
          </h2>
          <p className="text-base sm:text-lg text-[#74756F] mt-4 leading-relaxed">
            {supporting}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-6 sm:p-7 rounded-3xl border border-[#E3E1DA] bg-[#F7F4ED] hover:border-[#18191B] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-[#E3E1DA] text-[#18191B]">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E3E1DA] flex items-center justify-center text-[#18191B] group-hover:bg-[#18191B] group-hover:text-[#DDF278] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#18191B] mb-2">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#74756F] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E3E1DA] text-[11px] font-mono font-semibold text-[#18191B]">
                  {step.tag}
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing Reassurance Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#18191B] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#DDF278] mb-1">
              Flexible Coordination
            </div>
            <h4 className="font-display text-xl sm:text-2xl font-bold">
              One service or several — we organize the work around what you need.
            </h4>
          </div>
          <button
            type="button"
            onClick={() => openBookingModal()}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF573D] text-white text-sm font-semibold hover:bg-[#E0472F] transition-all cursor-pointer shadow-md"
          >
            <span>Let's Discuss Your Needs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
