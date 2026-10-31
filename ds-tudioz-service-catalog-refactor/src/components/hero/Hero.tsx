import React from 'react';
import { ArrowDown, Sparkles, Code, Target, Workflow } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const Hero: React.FC = () => {
  const { settings } = useStudio();

  const handlePrimaryClick = () => {
    const el = document.getElementById('services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSecondaryClick = () => {
    const el = document.getElementById('problems');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const headline =
    settings?.heroHeadline ||
    'DStudioz brings creative, digital and technical expertise together to help your business move forward.';

  const supporting =
    settings?.heroSupporting ||
    'From your brand identity to your digital systems, we help turn your needs into coordinated, practical solutions.';

  const primaryCta = settings?.heroPrimaryCta || 'I know what I need';
  const secondaryCta = settings?.heroSecondaryCta || 'Help me find the right solution';

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#E3E1DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Asymmetrical Typography & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Small Brand Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E3E1DA] shadow-2xs w-fit mb-6">
              <span className="w-2 h-2 rounded-full bg-[#FF573D] animate-pulse" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[#18191B]">
                DIGITAL SOLUTIONZ STUDIO
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18191B] tracking-tight leading-[1.12] mb-6">
              {headline}
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg lg:text-xl text-[#74756F] leading-relaxed max-w-xl mb-8">
              {supporting}
            </p>

            {/* Two Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mb-8">
              {/* Primary Action */}
              <button
                type="button"
                onClick={handlePrimaryClick}
                className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#18191B] text-white font-medium text-sm sm:text-base hover:bg-[#252629] active:translate-y-0.5 transition-all shadow-md group cursor-pointer"
              >
                <span>{primaryCta}</span>
                <span className="w-6 h-6 rounded-full bg-[#FF573D] flex items-center justify-center text-white text-xs group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </button>

              {/* Secondary Action */}
              <button
                type="button"
                onClick={handleSecondaryClick}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-white border border-[#E3E1DA] text-[#18191B] font-medium text-sm sm:text-base hover:bg-[#EFEEE8] hover:border-[#18191B] active:translate-y-0.5 transition-all cursor-pointer shadow-2xs"
              >
                <span>{secondaryCta}</span>
                <ArrowDown className="w-4 h-4 text-[#74756F]" />
              </button>
            </div>

            {/* Subtle Reassurance Line */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#74756F]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DDF278]" />
                <span>Multidisciplinary independent studio</span>
              </div>
              <span className="text-[#E3E1DA] hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF573D]" />
                <span>Coordinated team working remotely worldwide</span>
              </div>
            </div>
          </div>

          {/* Right Column: Original Connected Disciplines Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none bg-white border border-[#E3E1DA] rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
              {/* Ambient backdrop accents */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#DDF278]/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#FF573D]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Connected Disciplines Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E3E1DA]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF573D]" />
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-[#18191B]">
                    Connected Disciplines
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#EFEEE8] text-[#74756F]">
                  8 Departments
                </span>
              </div>

              {/* Graphic Composition of Nodes */}
              <div className="grid grid-cols-2 gap-3.5 relative">
                {/* Node 1: Brand & Strategy */}
                <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] hover:border-[#FF573D] transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E3E1DA] flex items-center justify-center text-[#FF573D] mb-3 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="font-display text-xs font-bold text-[#18191B]">Brand & Strategy</div>
                  <div className="text-[11px] text-[#74756F] mt-0.5">Identity & Systems</div>
                </div>

                {/* Node 2: Web & App Dev */}
                <div className="p-4 rounded-2xl bg-[#18191B] text-white border border-[#252629] group">
                  <div className="w-8 h-8 rounded-lg bg-[#252629] flex items-center justify-center text-[#DDF278] mb-3 group-hover:scale-110 transition-transform">
                    <Code className="w-4 h-4" />
                  </div>
                  <div className="font-display text-xs font-bold text-white">Web & Engineering</div>
                  <div className="text-[11px] text-[#A0A19B] mt-0.5">High-Speed Apps</div>
                </div>

                {/* Node 3: Advertising & Growth */}
                <div className="p-4 rounded-2xl bg-white border border-[#E3E1DA] hover:border-[#18191B] transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-[#F7F4ED] flex items-center justify-center text-[#18191B] mb-3 group-hover:scale-110 transition-transform">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="font-display text-xs font-bold text-[#18191B]">Digital Ads</div>
                  <div className="text-[11px] text-[#74756F] mt-0.5">Meta & Google Channels</div>
                </div>

                {/* Node 4: Automation & Tools */}
                <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] hover:border-[#DDF278] transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E3E1DA] flex items-center justify-center text-[#18191B] mb-3 group-hover:scale-110 transition-transform">
                    <Workflow className="w-4 h-4" />
                  </div>
                  <div className="font-display text-xs font-bold text-[#18191B]">AI & Automation</div>
                  <div className="text-[11px] text-[#74756F] mt-0.5">Workflow Integration</div>
                </div>
              </div>

              {/* Bottom Connector Card */}
              <div className="mt-4 p-3.5 rounded-2xl bg-[#EFEEE8] border border-[#E3E1DA] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#DDF278] flex items-center justify-center text-[#18191B] text-xs font-bold">
                    DS
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#18191B]">Single Unified Workflow</div>
                    <div className="text-[10px] text-[#74756F]">One studio. Coherent delivery.</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-1 bg-white rounded-md text-[#18191B]">
                  Connected team
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
