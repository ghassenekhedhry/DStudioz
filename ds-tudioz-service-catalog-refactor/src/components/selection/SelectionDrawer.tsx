import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { calculateSelection, getServicePrice, renderPriceRecord } from '../../lib/pricingEngine';
import { buildWhatsAppMultiServiceUrl } from '../../lib/whatsapp';
import { X, Trash2, Calendar, MessageCircle, AlertCircle, Tag, CheckCircle2 } from 'lucide-react';

export const SelectionDrawer: React.FC = () => {
  const {
    isSelectionDrawerOpen,
    setIsSelectionDrawerOpen,
    selectedServices,
    selectedPackage,
    market,
    promotions,
    multiServiceRule,
    toggleServiceSelection,
    clearSelection,
    openBookingModal,
    settings,
  } = useStudio();

  if (!isSelectionDrawerOpen) return null;

  const calculation = calculateSelection(
    selectedServices,
    selectedPackage,
    market,
    promotions,
    multiServiceRule
  );

  const waUrl = buildWhatsAppMultiServiceUrl(
    settings.whatsappNumber,
    selectedServices,
    market
  );

  const handleBookMeeting = () => {
    setIsSelectionDrawerOpen(false);
    openBookingModal({
      purpose: `Discuss ${selectedServices.length} selected services`,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="selection-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md h-full bg-white border-l border-[#E3E1DA] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E3E1DA] flex items-center justify-between">
          <div>
            <h2 id="selection-drawer-title" className="font-display text-xl font-bold text-[#18191B]">
              Selected Services
            </h2>
            <p className="text-xs text-[#74756F] mt-0.5">
              Review your customized scope and regional estimates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedServices.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs text-[#74756F] hover:text-[#FF573D] underline cursor-pointer"
                title="Clear all selections"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsSelectionDrawerOpen(false)}
              className="p-2 rounded-lg text-[#74756F] hover:text-[#18191B] hover:bg-[#EFEEE8] transition-colors"
              aria-label="Close selection drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected Items Scrollable List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {selectedServices.length === 0 && !selectedPackage ? (
            <div className="text-center py-12 text-[#74756F]">
              <AlertCircle className="w-10 h-10 mx-auto text-[#A0A19B] mb-3" />
              <div className="text-sm font-semibold text-[#18191B]">No services selected yet</div>
              <p className="text-xs mt-1">
                Browse our departments or ready-made packs and click "Select Service".
              </p>
            </div>
          ) : (
            <>
              {/* Selected Package (if any) */}
              {selectedPackage && (
                <div className="p-4 rounded-xl border border-[#FF573D] bg-[#F7F4ED]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF573D] text-white">
                      Selected Package
                    </span>
                    <span className="text-xs font-bold text-[#18191B]">
                      {selectedPackage.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Selected Services List */}
              <div className="space-y-2.5">
                {selectedServices.map((service) => {
                  const isDuplicate = calculation.duplicateServiceIds.includes(service.id);
                  const priceRec = getServicePrice(service, market);
                  const priceDisplay = renderPriceRecord(priceRec, market);

                  return (
                    <div
                      key={service.id}
                      className="p-3.5 rounded-xl border border-[#E3E1DA] bg-white flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#18191B] truncate">
                          {service.title}
                        </div>
                        {isDuplicate ? (
                          <div className="text-[10px] text-[#FF573D] font-medium flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Included in package ($0 duplicate prevented)</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#74756F]">
                            {priceDisplay.display}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleServiceSelection(service.id)}
                        className="p-1.5 rounded-lg text-[#74756F] hover:text-[#FF573D] hover:bg-[#F7F4ED] transition-colors"
                        aria-label={`Remove ${service.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Discounts & Breakdown */}
              <div className="pt-4 border-t border-[#E3E1DA] space-y-2 text-xs">
                <div className="flex justify-between text-[#74756F]">
                  <span>Subtotal</span>
                  <span className="font-mono">
                    {calculation.currencySymbol}
                    {calculation.oneTimeSubtotal.toLocaleString()}
                  </span>
                </div>

                {calculation.appliedDiscounts.map((disc, idx) => (
                  <div key={idx} className="flex justify-between text-[#FF573D] font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {disc.label}
                    </span>
                    <span className="font-mono">
                      -{calculation.currencySymbol}
                      {disc.amount.toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="pt-2 border-t border-[#EFEEE8] flex justify-between font-display text-base font-bold text-[#18191B]">
                  <span>Estimated Total</span>
                  <span className="font-mono">
                    {calculation.hasUnpricedItems
                      ? 'Custom quote'
                      : `${calculation.currencySymbol}${calculation.oneTimeTotal.toLocaleString()}`}
                  </span>
                </div>

                {calculation.monthlyTotal > 0 && (
                  <div className="flex justify-between text-xs text-[#74756F]">
                    <span>Monthly recurring portion</span>
                    <span className="font-mono">
                      {calculation.currencySymbol}
                      {calculation.monthlyTotal.toLocaleString()} / mo
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Actions */}
        <div className="p-6 border-t border-[#E3E1DA] bg-[#F7F4ED] space-y-2.5">
          <button
            onClick={handleBookMeeting}
            disabled={selectedServices.length === 0 && !selectedPackage}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#18191B] text-white text-xs sm:text-sm font-semibold hover:bg-[#252629] disabled:opacity-40 transition-all cursor-pointer shadow-xs"
          >
            <Calendar className="w-4 h-4 text-[#DDF278]" />
            <span>Book Meeting with Selections</span>
          </button>

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E3E1DA] text-[#18191B] text-xs font-semibold hover:bg-[#EFEEE8] hover:border-[#18191B] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Ask on WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
