import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { getPackagePrice, renderPriceRecord } from '../../lib/pricingEngine';
import { buildWhatsAppPackageUrl } from '../../lib/whatsapp';
import {
  Package,
  Check,
  Calendar,
  MessageCircle,
  CreditCard,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Tag,
} from 'lucide-react';

export const PacksSection: React.FC = () => {
  const {
    packages,
    market,
    promotions,
    openBookingModal,
    openCheckoutModal,
    settings,
  } = useStudio();

  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);

  const familyFilters = [
    { id: 'all', label: 'All Packs' },
    { id: 'bundles', label: 'Cross-Department' },
    { id: 'branding', label: 'Branding' },
    { id: 'web-dev', label: 'Web & App' },
    { id: 'community', label: 'Social & Community' },
    { id: 'content', label: 'Content Engine' },
    { id: 'seo', label: 'SEO & Maps' },
    { id: 'automation', label: 'Automation' },
    { id: 'tech-security', label: 'Tech & Security' },
  ];

  const filteredPackages = packages.filter((pkg) => {
    if (selectedFamily === 'all') return true;
    return pkg.family === selectedFamily;
  });

  const togglePackageExpand = (id: string) => {
    setExpandedPackageId(expandedPackageId === id ? null : id);
  };

  return (
    <section id="packs" className="py-14 sm:py-20 border-b border-[#E3E1DA] bg-[#F7F4ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF573D] mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Defined Scope Solutions</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#18191B] tracking-tight">
            Ready-Made Packs
          </h2>
          <p className="text-sm sm:text-base text-[#74756F] mt-2 leading-relaxed">
            Predefined solution packs combining agreed deliverables into one convenient offer with clear deliverables, explicit exclusions, and transparent pricing.
          </p>
        </div>

        {/* Family Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
          {familyFilters.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setSelectedFamily(tab.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedFamily === tab.id
                  ? 'bg-[#18191B] text-white shadow-2xs'
                  : 'bg-white border border-[#E3E1DA] text-[#252629] hover:bg-[#EFEEE8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const isExpanded = expandedPackageId === pkg.id;
            const priceRec = getPackagePrice(pkg, market);
            const priceDisplay = renderPriceRecord(priceRec, market);
            const waUrl = buildWhatsAppPackageUrl(settings.whatsappNumber, pkg, market);

            // Check if active promotion applies to this package
            const activePromo = promotions.find(
              (p) =>
                p.isEnabled &&
                p.targetPackageIds.includes(pkg.id) &&
                p.eligibleMarkets.includes(market)
            );

            return (
              <div
                key={pkg.id}
                id={`pack-${pkg.id}`}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white p-5 sm:p-6 transition-all duration-200 ${
                  pkg.featured
                    ? 'border-[#FF573D] shadow-md ring-1 ring-[#FF573D]/30'
                    : 'border-[#E3E1DA] hover:border-[#18191B] hover:shadow-2xs'
                }`}
              >
                {/* Featured / Promo Badges */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {pkg.featured ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF573D] text-white text-[10px] font-bold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        Featured Pack
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#74756F] bg-[#EFEEE8] px-2 py-0.5 rounded-md">
                        {pkg.family}
                      </span>
                    )}

                    {activePromo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#DDF278] text-[#18191B] text-[10px] font-bold">
                        <Tag className="w-3 h-3" />
                        {activePromo.discountValue}% OFF
                      </span>
                    )}
                  </div>

                  {/* Title & Benefit */}
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#18191B] tracking-tight">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[#FF573D] font-medium mt-1">
                    {pkg.benefit}
                  </p>

                  {/* Best For Tag */}
                  {(pkg.bestFor || pkg.intendedNeed) && (
                    <div className="mt-2.5 p-2 rounded-lg bg-[#F7F4ED] border border-[#E3E1DA] text-[11px] text-[#252629] leading-snug">
                      <span className="font-semibold text-[#18191B]">Best for: </span>
                      <span>{pkg.bestFor || pkg.intendedNeed}</span>
                    </div>
                  )}

                  {/* Price Block */}
                  <div className="mt-4 py-3 border-y border-[#EFEEE8] flex items-baseline justify-between">
                    <div>
                      <div className="font-display text-xl sm:text-2xl font-extrabold text-[#18191B]">
                        {priceDisplay.display}
                      </div>
                      <div className="text-[10px] text-[#74756F]">
                        {pkg.billingType === 'monthly'
                          ? 'Monthly recurring scope'
                          : 'One-time project fee'}
                      </div>
                    </div>
                    {pkg.isOnlineCheckoutEligible && (
                      <span className="text-[10px] font-mono text-[#74756F] bg-[#F7F4ED] border border-[#E3E1DA] px-2 py-0.5 rounded">
                        Online Checkout
                      </span>
                    )}
                  </div>

                  {/* Deliverables Preview */}
                  <div className="mt-4 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#18191B]">
                      What's Included:
                    </div>
                    <ul className="space-y-1.5">
                      {pkg.includedDeliverables.slice(0, isExpanded ? undefined : 3).map((item, idx) => (
                        <li key={idx} className="text-xs text-[#252629] flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#FF573D] mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* See Full Details Toggle */}
                    <button
                      type="button"
                      onClick={() => togglePackageExpand(pkg.id)}
                      className="text-xs font-semibold text-[#18191B] hover:text-[#FF573D] inline-flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>
                        {isExpanded
                          ? 'Hide full details'
                          : `See full details (${pkg.includedDeliverables.length} deliverables)`}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Exclusions Note */}
                    {isExpanded && pkg.limitsAndExclusions && pkg.limitsAndExclusions.length > 0 && (
                      <div className="mt-3 p-3 rounded-xl bg-[#F7F4ED] border border-[#E3E1DA] text-[11px] text-[#74756F] space-y-1">
                        <div className="font-semibold text-[#18191B] flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-[#74756F]" />
                          Limits & Exclusions
                        </div>
                        {pkg.limitsAndExclusions.map((ex, exIdx) => (
                          <div key={exIdx}>• {ex}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-[#EFEEE8] space-y-2">
                  {pkg.isOnlineCheckoutEligible ? (
                    <button
                      type="button"
                      onClick={() => openCheckoutModal(pkg)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#18191B] text-white text-xs sm:text-sm font-semibold hover:bg-black active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-[#DDF278]" />
                      <span>Order This Pack</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        openBookingModal({
                          packageId: pkg.id,
                          purpose: `Discussion for ${pkg.name}`,
                        })
                      }
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#18191B] text-white text-xs sm:text-sm font-semibold hover:bg-black active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-[#FF573D]" />
                      <span>Book Scoping Call</span>
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openBookingModal({
                          packageId: pkg.id,
                          purpose: `Consultation regarding ${pkg.name}`,
                        })
                      }
                      className="flex-1 py-1.5 rounded-lg bg-[#EFEEE8] text-[#252629] text-[11px] font-semibold hover:bg-[#E3E1DA] transition-colors cursor-pointer"
                    >
                      Schedule Call
                    </button>

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 rounded-lg bg-white border border-[#E3E1DA] text-[#18191B] text-[11px] font-semibold hover:bg-[#F7F4ED] hover:border-[#18191B] transition-colors inline-flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3 text-[#25D366]" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
