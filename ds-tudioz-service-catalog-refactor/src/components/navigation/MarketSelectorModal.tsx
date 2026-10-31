import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { MARKETS } from '../../data/initialData';
import { MarketId } from '../../types';
import { Globe, Check, Shield, MapPin, X } from 'lucide-react';

export const MarketSelectorModal: React.FC = () => {
  const {
    market,
    setMarket,
    consentStatus,
    setConsentStatus,
    isMarketModalOpen,
    setIsMarketModalOpen,
  } = useStudio();

  const [detecting, setDetecting] = useState(false);
  const [detectNotice, setDetectNotice] = useState<string | null>(null);

  if (!isMarketModalOpen) return null;

  const handleSelectMarket = (mId: MarketId) => {
    setMarket(mId);
    setConsentStatus('manual_chosen');
    setDetectNotice(null);
    setIsMarketModalOpen(false);
  };

  const handleDetectRegion = async () => {
    setDetecting(true);
    setDetectNotice(null);

    // Simulating privacy-safe server-side IP lookup without browser geolocation/GPS
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Check timezone heuristic for privacy-safe regional fallback
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      let detected: MarketId = 'int';

      if (timeZone.includes('Tunis')) detected = 'tn';
      else if (timeZone.includes('Algiers')) detected = 'dz';
      else if (timeZone.includes('Tripoli')) detected = 'ly';
      else if (timeZone.includes('Paris') || timeZone.includes('Rome') || timeZone.includes('Madrid') || timeZone.includes('Berlin') || timeZone.includes('Europe')) detected = 'eu';
      else if (timeZone.includes('Toronto') || timeZone.includes('Montreal') || timeZone.includes('Vancouver')) detected = 'ca';

      setMarket(detected);
      setConsentStatus('accepted_detect');
      setDetectNotice(`Detected ${MARKETS[detected].name} (${MARKETS[detected].currency}). Regional prices applied.`);
      setTimeout(() => {
        setIsMarketModalOpen(false);
        setDetectNotice(null);
      }, 1200);
    } catch {
      setDetectNotice('Detection could not determine region. Defaulting to International (USD).');
      setMarket('int');
      setConsentStatus('accepted_detect');
    } finally {
      setDetecting(false);
    }
  };

  const handleEssentialOnly = () => {
    setConsentStatus('essential_only');
    setIsMarketModalOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="market-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#E3E1DA] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setIsMarketModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#74756F] hover:text-[#18191B] hover:bg-[#EFEEE8] transition-colors"
          aria-label="Close market selector"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#F7F4ED] border border-[#E3E1DA] flex items-center justify-center text-[#FF573D]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 id="market-modal-title" className="font-display text-xl font-bold text-[#18191B]">
              See pricing configured for your region.
            </h2>
            <p className="text-xs text-[#74756F] mt-0.5">
              We can suggest your regional price list and remember your choice.
            </p>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="my-4 p-3.5 bg-[#F7F4ED] border border-[#E3E1DA] rounded-xl text-xs text-[#252629] leading-relaxed flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-[#74756F] flex-shrink-0 mt-0.5" />
          <span>
            Every market has its own deliberately configured price list, not an automatic currency conversion. We do not use GPS or device location.
          </span>
        </div>

        {detectNotice && (
          <div className="mb-4 p-3 bg-[#DDF278]/25 border border-[#DDF278] text-[#18191B] rounded-xl text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-[#18191B]" />
            {detectNotice}
          </div>
        )}

        {/* Action Buttons for Consent / Region */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
          <button
            onClick={handleDetectRegion}
            disabled={detecting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#18191B] text-white text-xs font-semibold hover:bg-[#252629] transition-colors disabled:opacity-50"
          >
            <MapPin className="w-3.5 h-3.5 text-[#DDF278]" />
            {detecting ? 'Detecting...' : 'Accept & Detect My Market'}
          </button>
          <button
            onClick={handleEssentialOnly}
            className="px-4 py-2.5 rounded-xl bg-[#EFEEE8] text-[#252629] text-xs font-medium hover:bg-[#E3E1DA] transition-colors"
          >
            Essential Only
          </button>
        </div>

        {/* Manual Grid of 6 Markets */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#74756F] mb-3">
            Or Choose Region Manually
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {(Object.keys(MARKETS) as MarketId[]).map((mKey) => {
              const m = MARKETS[mKey];
              const isSelected = market === mKey;
              return (
                <button
                  key={mKey}
                  onClick={() => handleSelectMarket(mKey)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#FF573D] bg-[#FF573D]/5 text-[#18191B] font-semibold ring-1 ring-[#FF573D]'
                      : 'border-[#E3E1DA] bg-white text-[#252629] hover:bg-[#F7F4ED] hover:border-[#18191B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{m.flag}</span>
                    <div>
                      <div className="text-xs font-medium">{m.name}</div>
                      <div className="text-[11px] text-[#74756F]">
                        {m.currency} ({m.symbol})
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#FF573D]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-[#E3E1DA] flex items-center justify-between text-[11px] text-[#74756F]">
          <span>Current active: {MARKETS[market].name} ({MARKETS[market].currency})</span>
          <span className="text-[10px]">Change anytime via header</span>
        </div>
      </div>
    </div>
  );
};
