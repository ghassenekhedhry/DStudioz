import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { calculateSelection } from '../../lib/pricingEngine';
import { Layers, ArrowRight, Tag } from 'lucide-react';

export const FloatingSelectionBar: React.FC = () => {
  const {
    selectedServices,
    selectedPackage,
    market,
    promotions,
    multiServiceRule,
    setIsSelectionDrawerOpen,
  } = useStudio();

  if (selectedServices.length === 0 && !selectedPackage) {
    return null;
  }

  const calculation = calculateSelection(
    selectedServices,
    selectedPackage,
    market,
    promotions,
    multiServiceRule
  );

  const hasBundleDiscount = calculation.appliedDiscounts.some(
    (d) => d.type === 'bundle_discount'
  );

  return (
    <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-xl w-full animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#18191B] text-white shadow-2xl border border-[#252629]">
        {/* Left: Summary Count & Discount Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#252629] flex items-center justify-center text-[#DDF278] flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold truncate">
                {selectedServices.length}{' '}
                {selectedServices.length === 1 ? 'service' : 'services'} selected
              </span>
              {hasBundleDiscount && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DDF278] text-[#18191B]">
                  <Tag className="w-2.5 h-2.5" />
                  Bundle Discount
                </span>
              )}
            </div>

            <div className="text-[11px] text-[#A0A19B] truncate">
              {calculation.hasUnpricedItems
                ? 'Custom quote available'
                : `Total: ${calculation.currencySymbol}${calculation.oneTimeTotal.toLocaleString()}${
                    calculation.monthlyTotal > 0
                      ? ` + ${calculation.currencySymbol}${calculation.monthlyTotal.toLocaleString()}/mo`
                      : ''
                  }`}
            </div>
          </div>
        </div>

        {/* Right: Review Action */}
        <button
          onClick={() => setIsSelectionDrawerOpen(true)}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF573D] text-white text-xs sm:text-sm font-semibold hover:bg-[#E0472F] active:translate-y-0.5 transition-all cursor-pointer shadow-xs"
        >
          <span>Review Selection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
