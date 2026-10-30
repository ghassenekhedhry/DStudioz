import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { renderPriceRecord, getServicePrice } from '../../lib/pricingEngine';
import { buildWhatsAppServiceUrl } from '../../lib/whatsapp';
import {
  Sparkles,
  Target,
  MessageSquare,
  Clapperboard,
  Code,
  Compass,
  Workflow,
  ShieldCheck,
  ChevronDown,
  Check,
  Plus,
  Calendar,
  MessageCircle,
  Layers,
  Info,
} from 'lucide-react';

const DEPARTMENT_ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Target,
  MessageSquare,
  Clapperboard,
  Code,
  Compass,
  Workflow,
  ShieldCheck,
};

export const ServiceExplorer: React.FC = () => {
  const {
    departments,
    market,
    expandedDepartmentId,
    setExpandedDepartmentId,
    activeServiceDetailId,
    setActiveServiceDetailId,
    toggleServiceSelection,
    isServiceSelected,
    openBookingModal,
    settings,
  } = useStudio();

  const handleToggleDepartment = (deptId: string) => {
    // If opening a new department, also close any open service detail
    if (expandedDepartmentId !== deptId) {
      setActiveServiceDetailId(null);
    }
    setExpandedDepartmentId(expandedDepartmentId === deptId ? null : deptId);
  };

  const handleToggleServiceDetail = (serviceId: string) => {
    // Enforce single-service-expanded-at-a-time
    setActiveServiceDetailId(activeServiceDetailId === serviceId ? null : serviceId);
  };

  return (
    <section id="services" className="py-14 sm:py-20 border-b border-[#E3E1DA] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF573D] mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Central Catalog</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#18191B] tracking-tight">
            Explore Services
          </h2>
          <p className="text-sm sm:text-base text-[#74756F] mt-2 leading-relaxed">
            Eight connected studio departments. Choose individual services or combine disciplines with clear deliverables and regional pricing.
          </p>
        </div>

        {/* 8 Department Compact Accordion Stack */}
        <div className="space-y-3">
          {departments.map((dept) => {
            const isExpanded = expandedDepartmentId === dept.id;
            const IconComponent = DEPARTMENT_ICONS[dept.iconName] || Sparkles;

            return (
              <div
                key={dept.id}
                id={`dept-${dept.id}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-[#18191B] bg-[#F7F4ED]/50 shadow-xs ring-1 ring-[#18191B]/10'
                    : 'border-[#E3E1DA] bg-white hover:border-[#18191B]/40'
                }`}
              >
                {/* Compact Department Header / Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleDepartment(dept.id)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer transition-colors focus:outline-hidden"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className="font-mono text-xs font-bold text-[#74756F] w-5 sm:w-6 shrink-0">
                      {dept.number}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isExpanded
                          ? 'bg-[#18191B] text-[#DDF278]'
                          : 'bg-[#EFEEE8] text-[#18191B]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base sm:text-lg font-bold text-[#18191B] tracking-tight truncate">
                          {dept.name}
                        </h3>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#EFEEE8] text-[#74756F] shrink-0">
                          {dept.services.length} services
                        </span>
                      </div>
                      <p className="text-xs text-[#74756F] truncate mt-0.5 max-w-xl">
                        {dept.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs font-medium text-[#74756F] hidden md:inline">
                      {isExpanded ? 'Collapse' : 'View services'}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 bg-[#18191B] text-white' : 'bg-[#EFEEE8] text-[#18191B]'
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>

                {/* Expanded Department Content */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-[#E3E1DA]">
                    {/* Compact Services List */}
                    <div className="space-y-2.5 mt-3">
                      {dept.services.map((service) => {
                        const isDetailOpen = activeServiceDetailId === service.id;
                        const isSelected = isServiceSelected(service.id);
                        const priceRecord = getServicePrice(service, market);
                        const priceDisplay = renderPriceRecord(priceRecord, market);
                        const waUrl = buildWhatsAppServiceUrl(settings.whatsappNumber, service, market);

                        return (
                          <div
                            key={service.id}
                            id={`service-${service.id}`}
                            className={`rounded-xl border transition-all ${
                              isSelected
                                ? 'border-[#FF573D] bg-white ring-1 ring-[#FF573D] shadow-2xs'
                                : 'border-[#E3E1DA] bg-white hover:border-[#18191B]/50'
                            }`}
                          >
                            {/* Service Compact Row */}
                            <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Left Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-display text-sm sm:text-base font-bold text-[#18191B]">
                                    {service.title}
                                  </h4>
                                  {service.popular && (
                                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#DDF278] text-[#18191B]">
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#74756F] mt-0.5 line-clamp-1">
                                  {service.outcome}
                                </p>
                              </div>

                              {/* Right Pricing & Actions */}
                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFEEE8]">
                                <div className="text-left sm:text-right">
                                  <div className="font-mono text-xs sm:text-sm font-bold text-[#18191B]">
                                    {priceDisplay.display}
                                  </div>
                                  <div className="text-[10px] text-[#74756F] uppercase">
                                    {priceRecord.billingInterval === 'monthly' ? 'Monthly' : 'One-time'}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleServiceDetail(service.id)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#18191B] bg-[#F7F4ED] hover:bg-[#EFEEE8] border border-[#E3E1DA] transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <span>{isDetailOpen ? 'Close' : 'Details'}</span>
                                    <ChevronDown
                                      className={`w-3 h-3 transition-transform ${
                                        isDetailOpen ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleServiceSelection(service.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#FF573D] text-white shadow-2xs'
                                        : 'bg-[#18191B] text-white hover:bg-black'
                                    }`}
                                    aria-label={isSelected ? `Deselect ${service.title}` : `Select ${service.title}`}
                                  >
                                    {isSelected ? (
                                      <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Selected</span>
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Select</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Service Detail Accordion Drawer (Single service open at a time) */}
                            {isDetailOpen && (
                              <div className="px-3.5 pb-4 pt-3 sm:px-4 sm:pb-4 border-t border-[#EFEEE8] bg-[#F7F4ED]/80 rounded-b-xl space-y-3">
                                <div>
                                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#18191B] mb-1.5">
                                    Deliverables
                                  </div>
                                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {service.deliverables.map((item, idx) => (
                                      <li
                                        key={idx}
                                        className="text-xs text-[#252629] flex items-start gap-2"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF573D] mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {service.optionalAddons && service.optionalAddons.length > 0 && (
                                  <div>
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#74756F] mb-1">
                                      Optional Add-ons
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {service.optionalAddons.map((addon, aIdx) => (
                                        <span
                                          key={aIdx}
                                          className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#E3E1DA] text-[#74756F]"
                                        >
                                          + {addon}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {priceRecord.scopeNote && (
                                  <div className="p-2 rounded-lg bg-white border border-[#E3E1DA] text-[11px] text-[#74756F] flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5 text-[#FF573D] shrink-0" />
                                    <span>{priceRecord.scopeNote}</span>
                                  </div>
                                )}

                                {/* Quick Inquiries & Booking */}
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openBookingModal({
                                        serviceId: service.id,
                                        purpose: `Consultation for ${service.title}`,
                                      })
                                    }
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18191B] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
                                  >
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Book Meeting</span>
                                  </button>

                                  {waUrl ? (
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E3E1DA] text-[#18191B] text-xs font-semibold hover:bg-[#EFEEE8] hover:border-[#18191B] transition-colors"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                                      <span>Ask on WhatsApp</span>
                                    </a>
                                  ) : null}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
