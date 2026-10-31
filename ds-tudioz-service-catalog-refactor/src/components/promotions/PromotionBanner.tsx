import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { MARKETS } from '../../data/initialData';
import { Tag, X, ArrowRight, Sparkles } from 'lucide-react';

export const PromotionBanner: React.FC = () => {
  const {
    promotions,
    market,
    packages,
    isPromoPanelOpen,
    setIsPromoPanelOpen,
  } = useStudio();

  const [isDismissed, setIsDismissed] = useState(false);

  // Find active promo valid for the current market and current date
  const now = new Date().toISOString();
  const activePromo = promotions.find((p) => {
    if (!p.isEnabled) return false;
    if (!p.eligibleMarkets.includes(market)) return false;
    if (p.startDate && p.startDate > now) return false;
    if (p.endDate && p.endDate < now) return false;
    return true;
  });

  if (!activePromo || isDismissed) {
    return null;
  }

  // Get eligible packages for this promotion
  const eligiblePacks = packages.filter((p) =>
    activePromo.targetPackageIds.includes(p.id)
  );

  const handleViewOffers = () => {
    setIsPromoPanelOpen(false);
    const packsElement = document.getElementById('packs');
    if (packsElement) {
      packsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Desktop Left-Edge Slim Accent Tab */}
      <div className="fixed left-0 bottom-10 z-30 hidden md:block">
        <button
          onClick={() => setIsPromoPanelOpen(true)}
          className="group flex items-center gap-2 px-3 py-2 bg-[#18191B] text-white hover:bg-[#FF573D] rounded-r-xl shadow-xl transition-all duration-200 border-y border-r border-[#252629] cursor-pointer"
          aria-label={`Open promotion: ${activePromo.headline}`}
        >
          <span className="w-2 h-2 rounded-full bg-[#DDF278]" />
          <span className="text-xs font-bold tracking-tight">
            {activePromo.discountValue}% Offer
          </span>
          <Tag className="w-3.5 h-3.5 text-[#DDF278] group-hover:text-white" />
        </button>
      </div>

      {/* Mobile Bottom Subtle Banner */}
      <div className="md:hidden fixed bottom-20 inset-x-4 z-30">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#18191B] text-white shadow-xl border border-[#252629]">
          <div
            onClick={() => setIsPromoPanelOpen(true)}
            className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
          >
            <span className="w-2 h-2 rounded-full bg-[#DDF278]" />
            <span className="text-xs font-bold truncate">
              {activePromo.headline}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPromoPanelOpen(true)}
              className="text-[11px] font-bold text-[#DDF278] underline"
            >
              Details
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-md text-[#74756F] hover:text-white"
              aria-label="Dismiss promotion banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out Promotion Panel */}
      {isPromoPanelOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="promo-panel-title"
          className="fixed inset-0 z-50 flex justify-start bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-sm h-full bg-white border-r border-[#E3E1DA] shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-left duration-300">
            {/* Top Close Row */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#DDF278] text-[#18191B] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Studio Offer
                </span>

                <button
                  onClick={() => setIsPromoPanelOpen(false)}
                  className="p-1.5 rounded-lg text-[#74756F] hover:text-[#18191B] hover:bg-[#EFEEE8]"
                  aria-label="Close promotion details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 id="promo-panel-title" className="font-display text-2xl font-bold text-[#18191B]">
                {activePromo.headline}
              </h2>
              <p className="text-xs text-[#74756F] mt-2 leading-relaxed">
                {activePromo.shortDescription}
              </p>

              {/* Promo Code If Configured */}
              {activePromo.couponCode && (
                <div className="my-5 p-3 rounded-xl bg-[#F7F4ED] border border-[#E3E1DA] flex items-center justify-between">
                  <span className="text-xs text-[#74756F]">Code applied automatically:</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-[#E3E1DA] text-[#FF573D]">
                    {activePromo.couponCode}
                  </span>
                </div>
              )}

              {/* Eligible Packages */}
              <div className="mt-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#18191B] mb-2">
                  Eligible Packages ({MARKETS[market].name})
                </div>
                <div className="space-y-1.5">
                  {eligiblePacks.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="text-xs p-2.5 rounded-lg bg-[#F7F4ED] text-[#252629] font-medium flex items-center justify-between"
                    >
                      <span>{pkg.name}</span>
                      <span className="text-[10px] text-[#FF573D] font-bold">
                        -{activePromo.discountValue}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actual Terms */}
              <div className="mt-6 pt-4 border-t border-[#EFEEE8] text-[11px] text-[#74756F] space-y-1 leading-relaxed">
                <div className="font-semibold text-[#18191B]">Terms & Conditions:</div>
                <div>• {activePromo.terms}</div>
                {activePromo.endDate && (
                  <div>
                    • Valid until {new Date(activePromo.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-6 border-t border-[#E3E1DA]">
              <button
                onClick={handleViewOffers}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FF573D] text-white text-xs sm:text-sm font-semibold hover:bg-[#E0472F] transition-colors cursor-pointer shadow-xs"
              >
                <span>View Eligible Packs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
