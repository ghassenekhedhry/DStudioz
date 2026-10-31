import React, { useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { renderPriceRecord, getServicePrice } from '../../lib/pricingEngine';
import { buildWhatsAppServiceUrl } from '../../lib/whatsapp';
import { Calendar, Check, ChevronRight, Info, Layers, MessageCircle, Plus, Sparkles, X } from 'lucide-react';

const DEPARTMENT_ICONS: Record<string, React.ElementType> = { Sparkles, Target: Sparkles, MessageSquare: Sparkles, Clapperboard: Sparkles, Code: Sparkles, Compass: Sparkles, Workflow: Sparkles, ShieldCheck: Sparkles };

export const ServiceExplorer: React.FC = () => {
  const { departments, market, expandedDepartmentId, setExpandedDepartmentId, activeServiceDetailId, setActiveServiceDetailId, toggleServiceSelection, isServiceSelected, openBookingModal, settings } = useStudio();
  const activeDepartment = departments.find((department) => department.id === expandedDepartmentId) ?? null;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setExpandedDepartmentId(null);
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [setExpandedDepartmentId]);

  return (
    <section id="services" className="border-b border-[#E3E1DA] bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl sm:mb-10">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF573D]"><Layers className="h-3.5 w-3.5" />Central Catalog</div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#18191B] sm:text-4xl">Explore Services</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#74756F] sm:text-base">Eight connected studio departments. Choose individual services or combine disciplines with clear deliverables and regional pricing.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((department) => {
            const Icon = DEPARTMENT_ICONS[department.iconName] || Sparkles;
            return <button key={department.id} type="button" onClick={() => { setExpandedDepartmentId(department.id); setActiveServiceDetailId(null); }} className="group rounded-2xl border border-[#E3E1DA] bg-[#F7F4ED]/40 p-5 text-left transition hover:-translate-y-0.5 hover:border-[#18191B] hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF573D] focus:ring-offset-2">
              <div className="mb-5 flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#74756F]">{department.number}</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18191B] text-[#DDF278]"><Icon className="h-4 w-4" /></span></div>
              <h3 className="font-display text-base font-bold tracking-tight text-[#18191B]">{department.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#74756F]">{department.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#18191B]">View {department.services.length} services <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
            </button>;
          })}
        </div>
      </div>

      {activeDepartment && <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="service-drawer-title">
        <button type="button" aria-label="Close service drawer" onClick={() => setExpandedDepartmentId(null)} className="absolute inset-0 bg-[#18191B]/35 backdrop-blur-[2px]" />
        <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-[#F7F4ED] shadow-2xl">
          <header className="flex items-start justify-between border-b border-[#E3E1DA] bg-white px-5 py-5 sm:px-8"><div><div className="font-mono text-xs font-bold text-[#74756F]">{activeDepartment.number} / SERVICES</div><h2 id="service-drawer-title" className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#18191B]">{activeDepartment.name}</h2><p className="mt-1 max-w-lg text-sm text-[#74756F]">{activeDepartment.description}</p></div><button type="button" onClick={() => setExpandedDepartmentId(null)} className="rounded-lg p-2 text-[#74756F] hover:bg-[#EFEEE8] hover:text-[#18191B]" aria-label="Close"><X className="h-5 w-5" /></button></header>
          <div className="flex-1 space-y-3 overflow-y-auto p-5 sm:p-8">
            {activeDepartment.services.map((service) => { const detail = activeServiceDetailId === service.id; const selected = isServiceSelected(service.id); const price = getServicePrice(service, market); const whatsapp = buildWhatsAppServiceUrl(settings.whatsappNumber, service, market); return <article key={service.id} className={`rounded-2xl border bg-white transition ${selected ? 'border-[#FF573D] ring-1 ring-[#FF573D]' : 'border-[#E3E1DA]'}`}>
              <div className="flex items-start justify-between gap-4 p-4 sm:p-5"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-display font-bold text-[#18191B]">{service.title}</h3>{service.popular && <span className="rounded-full bg-[#DDF278] px-2 py-0.5 text-[10px] font-semibold uppercase">Popular</span>}</div><p className="mt-1 text-sm leading-relaxed text-[#74756F]">{service.outcome}</p></div><button type="button" onClick={() => toggleServiceSelection(service.id)} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${selected ? 'bg-[#FF573D] text-white' : 'bg-[#18191B] text-white'}`}>{selected ? <><Check className="mr-1 inline h-3.5 w-3.5" />Selected</> : <><Plus className="mr-1 inline h-3.5 w-3.5" />Select</>}</button></div>
              <div className="flex items-center justify-between border-t border-[#EFEEE8] px-4 py-3 sm:px-5"><div><div className="font-mono text-sm font-bold text-[#18191B]">{renderPriceRecord(price, market).display}</div><div className="text-[10px] uppercase text-[#74756F]">{price.billingInterval === 'monthly' ? 'Monthly' : 'One-time'}</div></div><button type="button" onClick={() => setActiveServiceDetailId(detail ? null : service.id)} className="rounded-lg border border-[#E3E1DA] bg-[#F7F4ED] px-3 py-1.5 text-xs font-semibold text-[#18191B]">{detail ? 'Hide details' : 'View details'}</button></div>
              {detail && <div className="space-y-4 border-t border-[#EFEEE8] bg-[#F7F4ED]/80 p-4 sm:p-5"><div><div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#18191B]">Deliverables</div><ul className="grid gap-2 sm:grid-cols-2">{service.deliverables.map((item) => <li key={item} className="flex gap-2 text-xs text-[#252629]"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF573D]" />{item}</li>)}</ul></div>{price.scopeNote && <div className="flex gap-2 rounded-lg border border-[#E3E1DA] bg-white p-2 text-[11px] text-[#74756F]"><Info className="h-3.5 w-3.5 shrink-0 text-[#FF573D]" />{price.scopeNote}</div>}<div className="flex flex-wrap gap-2"><button type="button" onClick={() => openBookingModal({ serviceId: service.id, purpose: `Consultation for ${service.title}` })} className="rounded-lg bg-[#18191B] px-3 py-1.5 text-xs font-semibold text-white"><Calendar className="mr-1 inline h-3.5 w-3.5" />Book Meeting</button>{whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#E3E1DA] bg-white px-3 py-1.5 text-xs font-semibold text-[#18191B]"><MessageCircle className="mr-1 inline h-3.5 w-3.5 text-[#25D366]" />Ask on WhatsApp</a>}</div></div>}
            </article>; })}
          </div>
        </aside>
      </div>}
    </section>
  );
};
