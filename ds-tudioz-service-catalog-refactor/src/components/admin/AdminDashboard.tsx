import React, { useState, useMemo } from 'react';
import { useStudio } from '../../context/StudioContext';
import { MARKETS } from '../../data/initialData';
import {
  MarketId,
  PriceRecord,
  PriceType,
  BillingInterval,
  Promotion,
  InquiryStatus,
  ServiceItem,
  PackageOffer,
} from '../../types';
import {
  Lock,
  Unlock,
  X,
  LayoutDashboard,
  DollarSign,
  Tag,
  Inbox,
  Settings as SettingsIcon,
  Check,
  Eye,
  Save,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  History,
  Globe,
  Briefcase,
  Package as PackageIcon,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { BulkPriceAdjustmentConfig, applyPriceAdjustment, formatCurrency } from '../../lib/pricingEngine';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    departments,
    packages,
    promotions,
    inquiries,
    settings,
    priceAudits,
    updateServicePrice,
    updatePackagePrice,
    updateServiceDetails,
    updatePackageDetails,
    applyBulkAdjustment,
    savePromotion,
    togglePromotion,
    saveSettingsState,
    updateInquiryStatus,
    resetAllToDefaults,
  } = useStudio();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active admin tab (8 tabs: overview, services, packages, pricing, discounts, orders, booking, settings)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'services' | 'packages' | 'pricing' | 'discounts' | 'orders' | 'booking' | 'settings'
  >('overview');

  // Notification state
  const [notice, setNotice] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Pricing Matrix Selection
  const [pricingTargetType, setPricingTargetType] = useState<'service' | 'package'>('service');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('brand-positioning');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('brand-foundation');

  // Bulk Pricing State
  const [bulkMode, setBulkMode] = useState<BulkPriceAdjustmentConfig['type']>('percent_decrease');
  const [bulkValue, setBulkValue] = useState<number>(10);
  const [bulkMarketScope, setBulkMarketScope] = useState<MarketId | 'all'>('all');
  const [bulkDeptScope, setBulkDeptScope] = useState<string | 'all'>('all');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Search filters
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceDeptFilter, setServiceDeptFilter] = useState('all');
  const [packageSearch, setPackageSearch] = useState('');
  const [packageFamilyFilter, setPackageFamilyFilter] = useState('all');

  // Website Settings Form state
  const [websiteSettings, setWebsiteSettings] = useState(settings);

  // New Promotion state
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);
  const [newPromoName, setNewPromoName] = useState('');
  const [newPromoHeadline, setNewPromoHeadline] = useState('');
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(15);
  const [newPromoCode, setNewPromoCode] = useState('');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (cleanPin === settings.adminPin || cleanPin === 'dstudioz2026' || cleanPin === '2026') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const allServices: ServiceItem[] = departments.flatMap((d) => d.services);
  const currentService = allServices.find((s) => s.id === selectedServiceId) || allServices[0];
  const currentPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];

  // Filtered services
  const filteredServices = allServices.filter((s) => {
    const matchesDept = serviceDeptFilter === 'all' || s.departmentId === serviceDeptFilter;
    const matchesSearch =
      serviceSearch.trim() === '' ||
      s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.outcome.toLowerCase().includes(serviceSearch.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Filtered packages
  const filteredPackages = packages.filter((p) => {
    const matchesFamily = packageFamilyFilter === 'all' || p.family === packageFamilyFilter;
    const matchesSearch =
      packageSearch.trim() === '' ||
      p.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
      p.benefit.toLowerCase().includes(packageSearch.toLowerCase());
    return matchesFamily && matchesSearch;
  });

  // Calculate bulk preview
  const bulkPreviewSamples = useMemo(() => {
    const targetMarkets: MarketId[] =
      bulkMarketScope === 'all' ? ['tn', 'dz', 'ly', 'eu', 'ca', 'int'] : [bulkMarketScope];

    const eligibleServices = allServices.filter(
      (s) => bulkDeptScope === 'all' || s.departmentId === bulkDeptScope
    );

    let totalPricesAffected = 0;
    const samples: Array<{
      name: string;
      marketId: MarketId;
      before: number;
      after: number;
    }> = [];

    eligibleServices.forEach((s) => {
      targetMarkets.forEach((mId) => {
        const pr = s.prices[mId];
        if (pr && pr.amount) {
          totalPricesAffected++;
          if (samples.length < 4) {
            const adjusted = applyPriceAdjustment(pr, {
              type: bulkMode,
              value: bulkValue,
              marketScope: bulkMarketScope,
              departmentId: bulkDeptScope,
            });
            samples.push({
              name: s.title,
              marketId: mId,
              before: pr.amount,
              after: adjusted.amount ?? pr.amount,
            });
          }
        }
      });
    });

    return { totalPricesAffected, samples };
  }, [allServices, bulkMode, bulkValue, bulkMarketScope, bulkDeptScope]);

  const handleApplyBulk = () => {
    const affected = applyBulkAdjustment(
      {
        type: bulkMode,
        value: bulkValue,
        marketScope: bulkMarketScope,
        departmentId: bulkDeptScope,
      },
      'Admin Bulk Adjustment'
    );
    setShowBulkConfirm(false);
    showNotice(`Successfully adjusted ${affected} price records across selected scope`);
  };

  const handleSaveWebsiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsState(websiteSettings);
    showNotice('Website settings successfully saved and applied to live site');
  };

  if (!isAdminOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl h-[94vh] bg-white border border-[#E3E1DA] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-[#E3E1DA] bg-[#18191B] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#252629] flex items-center justify-center text-[#DDF278]">
              {isAuthenticated ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h2 id="admin-title" className="font-display text-base font-bold text-white flex items-center gap-2">
                <span>DStudioz Administrative Hub</span>
                {isAuthenticated && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#252629] text-[#DDF278]">
                    LIVE SYNC
                  </span>
                )}
              </h2>
              <span className="text-[11px] text-[#A0A19B]">
                Central Pricing, Catalog, Content & Inquiries
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notice && (
              <span className="text-xs font-medium text-[#DDF278] bg-[#252629] px-3 py-1 rounded-md animate-in fade-in">
                {notice}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="w-8 h-8 rounded-lg bg-[#252629] hover:bg-[#343538] flex items-center justify-center text-white transition-colors cursor-pointer"
              aria-label="Close Admin Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auth Gate */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-[#F7F4ED]">
            <form
              onSubmit={handlePinSubmit}
              className="w-full max-w-sm p-8 rounded-3xl bg-white border border-[#E3E1DA] shadow-xl text-center space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] mx-auto flex items-center justify-center text-[#18191B]">
                <Lock className="w-6 h-6 text-[#FF573D]" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[#18191B]">
                  Studio Passcode Required
                </h3>
                <p className="text-xs text-[#74756F] mt-1">
                  Enter master access PIN to manage studio operations
                </p>
              </div>

              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (Default: 2026)"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-[#E3E1DA] text-center font-mono text-lg tracking-widest focus:outline-hidden focus:border-[#18191B]"
                />
                {authError && (
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    Incorrect PIN. Try 2026 or dstudioz2026.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#18191B] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Main Authenticated Layout */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-[#E3E1DA] bg-[#F7F4ED] p-3 shrink-0 flex md:flex-col justify-between overflow-x-auto md:overflow-y-auto">
              <nav className="flex md:flex-col gap-1 w-full">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'services', label: 'Services', icon: Briefcase },
                  { id: 'packages', label: 'Packages', icon: PackageIcon },
                  { id: 'pricing', label: 'Pricing & Bulk', icon: DollarSign },
                  { id: 'discounts', label: 'Discounts', icon: Tag },
                  { id: 'orders', label: 'Inquiries & Orders', icon: Inbox, badge: inquiries.length },
                  { id: 'booking', label: 'Booking', icon: Calendar },
                  { id: 'settings', label: 'Website Settings', icon: Globe },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setActiveTab(item.id as typeof activeTab)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-[#18191B] text-white shadow-2xs'
                          : 'text-[#252629] hover:bg-white hover:text-black'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#DDF278]' : 'text-[#74756F]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                            isActive ? 'bg-[#FF573D] text-white' : 'bg-[#E3E1DA] text-[#18191B]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="hidden md:block pt-3 border-t border-[#E3E1DA] mt-4">
                <button
                  type="button"
                  onClick={resetAllToDefaults}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] text-[#74756F] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset All to Defaults</span>
                </button>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-5 sm:p-6 overflow-y-auto bg-white">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#18191B]">
                      Studio Operational Summary
                    </h3>
                    <p className="text-xs text-[#74756F] mt-0.5">
                      Overview of live catalog, market pricing status, and recent activity.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA]">
                      <div className="text-[11px] uppercase font-mono text-[#74756F]">Services</div>
                      <div className="font-display text-2xl font-extrabold text-[#18191B] mt-1">
                        {allServices.length}
                      </div>
                      <div className="text-[11px] text-[#74756F]">Across 8 departments</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA]">
                      <div className="text-[11px] uppercase font-mono text-[#74756F]">Ready Packs</div>
                      <div className="font-display text-2xl font-extrabold text-[#18191B] mt-1">
                        {packages.length}
                      </div>
                      <div className="text-[11px] text-[#74756F]">Fixed scope solutions</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA]">
                      <div className="text-[11px] uppercase font-mono text-[#74756F]">Inquiries</div>
                      <div className="font-display text-2xl font-extrabold text-[#18191B] mt-1">
                        {inquiries.length}
                      </div>
                      <div className="text-[11px] text-[#74756F]">Customer submissions</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA]">
                      <div className="text-[11px] uppercase font-mono text-[#74756F]">Markets</div>
                      <div className="font-display text-2xl font-extrabold text-[#18191B] mt-1">
                        6
                      </div>
                      <div className="text-[11px] text-[#74756F]">TN, DZ, LY, EU, CA, INT</div>
                    </div>
                  </div>

                  {/* Recent Inquiries Preview */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E3E1DA] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-bold text-[#18191B]">
                        Recent Customer Inquiries
                      </h4>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-semibold text-[#FF573D] hover:underline"
                      >
                        View all
                      </button>
                    </div>

                    {inquiries.length === 0 ? (
                      <p className="text-xs text-[#74756F]">No customer inquiries yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {inquiries.slice(0, 3).map((inq) => (
                          <div
                            key={inq.id}
                            className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E3E1DA] flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-[#18191B]">{inq.clientName}</span>
                              <span className="text-[#74756F] ml-2">({inq.clientEmail})</span>
                              <div className="text-[11px] text-[#74756F]">
                                Ref: {inq.referenceNumber} • Region: {inq.marketId.toUpperCase()}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E3E1DA] font-mono text-[10px] font-bold">
                              {inq.status.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Price Audits */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E3E1DA] space-y-3">
                    <h4 className="font-display text-sm font-bold text-[#18191B]">
                      Recent Price Modifications Log
                    </h4>
                    {priceAudits.length === 0 ? (
                      <p className="text-xs text-[#74756F]">
                        No pricing edits logged yet. Edits made via individual fields or bulk tools will appear here.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {priceAudits.slice(0, 5).map((log) => (
                          <div
                            key={log.id}
                            className="p-2.5 rounded-lg bg-[#F7F4ED] text-[11px] flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-[#18191B]">{log.targetName}</span>
                              <span className="text-[#74756F] ml-2">{log.description}</span>
                            </div>
                            <span className="text-[#74756F] font-mono text-[10px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SERVICES MANAGEMENT */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#18191B]">
                        Service Catalog Management
                      </h3>
                      <p className="text-xs text-[#74756F]">
                        Edit titles, outcomes, deliverables, and popular tags across 8 departments.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#74756F]" />
                        <input
                          type="text"
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          placeholder="Search services..."
                          className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E3E1DA] text-xs w-48 focus:outline-hidden focus:border-[#18191B]"
                        />
                      </div>

                      <select
                        value={serviceDeptFilter}
                        onChange={(e) => setServiceDeptFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[#E3E1DA] text-xs bg-white focus:outline-hidden"
                      >
                        <option value="all">All Departments</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.number}. {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredServices.map((svc) => (
                      <div
                        key={svc.id}
                        className="p-4 rounded-xl border border-[#E3E1DA] bg-[#F7F4ED]/60 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              defaultValue={svc.title}
                              onBlur={(e) => {
                                if (e.target.value !== svc.title) {
                                  updateServiceDetails(svc.departmentId, svc.id, { title: e.target.value });
                                  showNotice(`Updated title for ${svc.title}`);
                                }
                              }}
                              className="font-display text-sm font-bold text-[#18191B] bg-transparent border-b border-transparent hover:border-[#E3E1DA] focus:border-[#18191B] focus:bg-white px-1 py-0.5 rounded w-full"
                            />
                            <input
                              type="text"
                              defaultValue={svc.outcome}
                              onBlur={(e) => {
                                if (e.target.value !== svc.outcome) {
                                  updateServiceDetails(svc.departmentId, svc.id, { outcome: e.target.value });
                                  showNotice(`Updated outcome for ${svc.title}`);
                                }
                              }}
                              className="text-xs text-[#74756F] bg-transparent border-b border-transparent hover:border-[#E3E1DA] focus:border-[#18191B] focus:bg-white px-1 py-0.5 rounded w-full mt-1"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-xs text-[#74756F] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={svc.popular || false}
                                onChange={(e) => {
                                  updateServiceDetails(svc.departmentId, svc.id, { popular: e.target.checked });
                                  showNotice(`Toggled popular tag on ${svc.title}`);
                                }}
                                className="rounded text-[#FF573D]"
                              />
                              <span>Popular</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                setPricingTargetType('service');
                                setSelectedServiceId(svc.id);
                                setActiveTab('pricing');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#E3E1DA] text-xs font-semibold hover:bg-[#EFEEE8]"
                            >
                              Edit Prices
                            </button>
                          </div>
                        </div>

                        {/* Deliverables tags */}
                        <div className="pt-2 border-t border-[#E3E1DA]/60">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#74756F] block mb-1">
                            Deliverables ({svc.deliverables.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {svc.deliverables.map((item, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#E3E1DA] text-[#252629]"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PACKAGES MANAGEMENT */}
              {activeTab === 'packages' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#18191B]">
                        Ready-Made Package Management
                      </h3>
                      <p className="text-xs text-[#74756F]">
                        Manage package benefits, "Best for" statements, and deliverables.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#74756F]" />
                        <input
                          type="text"
                          value={packageSearch}
                          onChange={(e) => setPackageSearch(e.target.value)}
                          placeholder="Search packages..."
                          className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E3E1DA] text-xs w-48 focus:outline-hidden"
                        />
                      </div>

                      <select
                        value={packageFamilyFilter}
                        onChange={(e) => setPackageFamilyFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[#E3E1DA] text-xs bg-white"
                      >
                        <option value="all">All Families</option>
                        <option value="bundles">Bundles</option>
                        <option value="branding">Branding</option>
                        <option value="web-dev">Web Dev</option>
                        <option value="community">Community</option>
                        <option value="content">Content</option>
                        <option value="seo">SEO</option>
                        <option value="automation">Automation</option>
                        <option value="tech-security">Tech Security</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-4 rounded-xl border border-[#E3E1DA] bg-[#F7F4ED]/60 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              defaultValue={pkg.name}
                              onBlur={(e) => {
                                if (e.target.value !== pkg.name) {
                                  updatePackageDetails(pkg.id, { name: e.target.value });
                                  showNotice(`Updated package name to ${e.target.value}`);
                                }
                              }}
                              className="font-display text-base font-bold text-[#18191B] bg-transparent border-b border-transparent hover:border-[#E3E1DA] focus:border-[#18191B] focus:bg-white px-1 py-0.5 rounded w-full"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                defaultValue={pkg.benefit}
                                placeholder="Benefit statement"
                                onBlur={(e) => {
                                  if (e.target.value !== pkg.benefit) {
                                    updatePackageDetails(pkg.id, { benefit: e.target.value });
                                    showNotice(`Updated benefit for ${pkg.name}`);
                                  }
                                }}
                                className="text-xs text-[#FF573D] font-medium bg-transparent border-b border-transparent hover:border-[#E3E1DA] focus:border-[#18191B] focus:bg-white px-1 py-0.5 rounded flex-1"
                              />
                            </div>
                            <div className="flex items-center gap-1.5 pt-1">
                              <span className="text-[11px] font-semibold text-[#18191B] shrink-0">
                                Best for:
                              </span>
                              <input
                                type="text"
                                defaultValue={pkg.bestFor || pkg.intendedNeed}
                                placeholder="Target customer or scenario"
                                onBlur={(e) => {
                                  if (e.target.value !== (pkg.bestFor || pkg.intendedNeed)) {
                                    updatePackageDetails(pkg.id, { bestFor: e.target.value });
                                    showNotice(`Updated Best for statement for ${pkg.name}`);
                                  }
                                }}
                                className="text-xs text-[#74756F] bg-transparent border-b border-transparent hover:border-[#E3E1DA] focus:border-[#18191B] focus:bg-white px-1 py-0.5 rounded flex-1"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPricingTargetType('package');
                                setSelectedPackageId(pkg.id);
                                setActiveTab('pricing');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E3E1DA] text-xs font-semibold hover:bg-[#EFEEE8]"
                            >
                              Edit Prices
                            </button>
                          </div>
                        </div>

                        {/* Deliverables & Exclusions preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E3E1DA]">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#18191B] block mb-1">
                              Deliverables ({pkg.includedDeliverables.length})
                            </span>
                            <ul className="text-xs text-[#252629] space-y-0.5">
                              {pkg.includedDeliverables.map((item, idx) => (
                                <li key={idx}>• {item}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#74756F] block mb-1">
                              Limits & Exclusions ({pkg.limitsAndExclusions.length})
                            </span>
                            <ul className="text-xs text-[#74756F] space-y-0.5">
                              {pkg.limitsAndExclusions.map((ex, idx) => (
                                <li key={idx}>• {ex}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PRICING MATRIX & BULK ADJUSTMENT */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  {/* Top Bar: Target selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3E1DA]">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#18191B]">
                        Regional Pricing & Bulk Adjustment Engine
                      </h3>
                      <p className="text-xs text-[#74756F]">
                        Manage individual market pricing or apply bulk adjustments with live preview & audit logging.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPricingTargetType('service')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          pricingTargetType === 'service'
                            ? 'bg-[#18191B] text-white'
                            : 'bg-[#EFEEE8] text-[#252629]'
                        }`}
                      >
                        Single Service
                      </button>
                      <button
                        type="button"
                        onClick={() => setPricingTargetType('package')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          pricingTargetType === 'package'
                            ? 'bg-[#18191B] text-white'
                            : 'bg-[#EFEEE8] text-[#252629]'
                        }`}
                      >
                        Package
                      </button>
                    </div>
                  </div>

                  {/* Bulk Controls Accordion Card */}
                  <div className="p-5 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#FF573D]" />
                        <h4 className="font-display text-sm font-bold text-[#18191B]">
                          Bulk Pricing Controls (With Market-Specific Rounding)
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono text-[#74756F]">
                        {bulkPreviewSamples.totalPricesAffected} records match scope
                      </span>
                    </div>

                    {/* Bulk Parameters Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                          Adjustment Type
                        </label>
                        <select
                          value={bulkMode}
                          onChange={(e) => setBulkMode(e.target.value as typeof bulkMode)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs font-medium"
                        >
                          <option value="percent_decrease">Percentage Decrease (-%)</option>
                          <option value="percent_increase">Percentage Increase (+%)</option>
                          <option value="fixed_subtract">Fixed Subtract (- Amount)</option>
                          <option value="fixed_add">Fixed Add (+ Amount)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                          Value ({bulkMode.startsWith('percent') ? '%' : 'Amount'})
                        </label>
                        <input
                          type="number"
                          value={bulkValue}
                          onChange={(e) => setBulkValue(Number(e.target.value))}
                          min="1"
                          className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                          Market Target
                        </label>
                        <select
                          value={bulkMarketScope}
                          onChange={(e) => setBulkMarketScope(e.target.value as typeof bulkMarketScope)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs"
                        >
                          <option value="all">All 6 Markets</option>
                          <option value="tn">Tunisia (TND)</option>
                          <option value="dz">Algeria (DZD)</option>
                          <option value="ly">Libya (LYD)</option>
                          <option value="eu">Europe (EUR)</option>
                          <option value="ca">Canada (CAD)</option>
                          <option value="int">International (USD)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                          Department Target
                        </label>
                        <select
                          value={bulkDeptScope}
                          onChange={(e) => setBulkDeptScope(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs"
                        >
                          <option value="all">All Departments & Packages</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.number}. {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Pre-Application Live Calculation Preview */}
                    <div className="p-3 rounded-xl bg-white border border-[#E3E1DA] space-y-2">
                      <div className="text-[11px] font-bold text-[#18191B] flex items-center justify-between">
                        <span>Pre-application Calculation Preview (Sample entries):</span>
                        <span className="text-[10px] text-[#74756F]">
                          Auto-rounds to market increments (10 TND, 500 DZD, 10 LYD, 5 EUR/USD)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {bulkPreviewSamples.samples.map((sm, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-[#F7F4ED] border border-[#E3E1DA]">
                            <div className="font-semibold text-[#18191B] truncate">{sm.name}</div>
                            <div className="text-[10px] text-[#74756F] uppercase">{sm.marketId}</div>
                            <div className="mt-1 font-mono">
                              <span className="line-through text-[#74756F]">
                                {formatCurrency(sm.before, sm.marketId)}
                              </span>{' '}
                              →{' '}
                              <span className="font-bold text-[#18191B]">
                                {formatCurrency(sm.after, sm.marketId)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confirmation Step */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      {!showBulkConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowBulkConfirm(true)}
                          className="px-4 py-2 rounded-xl bg-[#18191B] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
                        >
                          Preview & Apply Bulk Change
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 animate-in fade-in">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="text-xs text-amber-900 font-medium">
                            Apply {bulkMode.replace('_', ' ')} {bulkValue}
                            {bulkMode.startsWith('percent') ? '%' : ''} to{' '}
                            {bulkPreviewSamples.totalPricesAffected} prices?
                          </span>
                          <button
                            type="button"
                            onClick={handleApplyBulk}
                            className="px-3 py-1.5 rounded-lg bg-[#FF573D] text-white text-xs font-bold hover:bg-[#E0472F]"
                          >
                            Confirm & Apply
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowBulkConfirm(false)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E3E1DA] text-xs text-[#252629]"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Individual Matrix Editor */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#18191B]">Select item to edit:</span>
                      {pricingTargetType === 'service' ? (
                        <select
                          value={selectedServiceId}
                          onChange={(e) => setSelectedServiceId(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-[#E3E1DA] text-xs font-bold bg-white max-w-sm"
                        >
                          {allServices.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={selectedPackageId}
                          onChange={(e) => setSelectedPackageId(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-[#E3E1DA] text-xs font-bold bg-white max-w-sm"
                        >
                          {packages.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* 6 Markets Matrix Table */}
                    <div className="border border-[#E3E1DA] rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#18191B] text-white font-mono uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Market</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Interval</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E3E1DA]">
                          {(Object.keys(MARKETS) as MarketId[]).map((mId) => {
                            const marketInfo = MARKETS[mId];
                            const currentPrice: PriceRecord =
                              pricingTargetType === 'service'
                                ? currentService.prices[mId] || {
                                    marketId: mId,
                                    currency: marketInfo.currency,
                                    priceType: 'fixed',
                                    billingInterval: 'one_time',
                                    isPublished: true,
                                  }
                                : currentPackage.prices[mId] || {
                                    marketId: mId,
                                    currency: marketInfo.currency,
                                    priceType: 'fixed',
                                    billingInterval: currentPackage.billingType,
                                    isPublished: true,
                                  };

                            return (
                              <tr key={mId} className="hover:bg-[#F7F4ED]/50 transition-colors">
                                <td className="p-3 font-semibold text-[#18191B]">
                                  <div className="flex items-center gap-2">
                                    <span>{marketInfo.flag}</span>
                                    <span>{marketInfo.name}</span>
                                    <span className="text-[10px] font-mono text-[#74756F]">
                                      ({marketInfo.currency})
                                    </span>
                                  </div>
                                </td>

                                <td className="p-3">
                                  <select
                                    value={currentPrice.priceType}
                                    onChange={(e) => {
                                      const nextType = e.target.value as PriceType;
                                      if (pricingTargetType === 'service') {
                                        updateServicePrice(currentService.departmentId, currentService.id, mId, {
                                          priceType: nextType,
                                        });
                                      } else {
                                        updatePackagePrice(currentPackage.id, mId, { priceType: nextType });
                                      }
                                      showNotice(`Updated price type for ${mId.toUpperCase()}`);
                                    }}
                                    className="px-2 py-1 rounded-lg border border-[#E3E1DA] bg-white text-xs"
                                  >
                                    <option value="fixed">Fixed</option>
                                    <option value="starting_at">Starting at</option>
                                    <option value="quote">Quote</option>
                                    <option value="unpublished">Unpublished</option>
                                  </select>
                                </td>

                                <td className="p-3">
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <span className="text-[#74756F]">{marketInfo.symbol}</span>
                                    <input
                                      type="number"
                                      defaultValue={currentPrice.amount || 0}
                                      onBlur={(e) => {
                                        const val = Number(e.target.value);
                                        if (val !== currentPrice.amount) {
                                          if (pricingTargetType === 'service') {
                                            updateServicePrice(currentService.departmentId, currentService.id, mId, {
                                              amount: val,
                                            });
                                          } else {
                                            updatePackagePrice(currentPackage.id, mId, { amount: val });
                                          }
                                          showNotice(`Updated amount for ${mId.toUpperCase()} to ${val}`);
                                        }
                                      }}
                                      className="w-24 px-2 py-1 rounded-lg border border-[#E3E1DA] bg-white text-xs font-bold"
                                    />
                                  </div>
                                </td>

                                <td className="p-3">
                                  <select
                                    value={currentPrice.billingInterval}
                                    onChange={(e) => {
                                      const interval = e.target.value as BillingInterval;
                                      if (pricingTargetType === 'service') {
                                        updateServicePrice(currentService.departmentId, currentService.id, mId, {
                                          billingInterval: interval,
                                        });
                                      } else {
                                        updatePackagePrice(currentPackage.id, mId, { billingInterval: interval });
                                      }
                                      showNotice(`Updated billing interval for ${mId.toUpperCase()}`);
                                    }}
                                    className="px-2 py-1 rounded-lg border border-[#E3E1DA] bg-white text-xs"
                                  >
                                    <option value="one_time">One-Time</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="project">Project</option>
                                  </select>
                                </td>

                                <td className="p-3">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={currentPrice.isPublished}
                                      onChange={(e) => {
                                        if (pricingTargetType === 'service') {
                                          updateServicePrice(currentService.departmentId, currentService.id, mId, {
                                            isPublished: e.target.checked,
                                          });
                                        } else {
                                          updatePackagePrice(currentPackage.id, mId, {
                                            isPublished: e.target.checked,
                                          });
                                        }
                                        showNotice(`Updated visibility for ${mId.toUpperCase()}`);
                                      }}
                                      className="rounded text-[#FF573D]"
                                    />
                                    <span className="text-[11px] text-[#74756F]">
                                      {currentPrice.isPublished ? 'Public' : 'Hidden'}
                                    </span>
                                  </label>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Audit Log Table */}
                  <div className="pt-4 border-t border-[#E3E1DA] space-y-3">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-[#74756F]" />
                      <h4 className="font-display text-sm font-bold text-[#18191B]">
                        Audit Trail Log
                      </h4>
                    </div>

                    <div className="border border-[#E3E1DA] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F7F4ED] text-[#74756F] font-mono text-[10px] uppercase">
                          <tr>
                            <th className="p-2.5">Time</th>
                            <th className="p-2.5">Target</th>
                            <th className="p-2.5">Type</th>
                            <th className="p-2.5">Change Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E3E1DA]">
                          {priceAudits.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-[#74756F]">
                                No audit records logged yet.
                              </td>
                            </tr>
                          ) : (
                            priceAudits.map((log) => (
                              <tr key={log.id} className="hover:bg-[#F7F4ED]/40">
                                <td className="p-2.5 font-mono text-[10px] text-[#74756F] whitespace-nowrap">
                                  {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="p-2.5 font-semibold text-[#18191B] whitespace-nowrap">
                                  {log.targetName}
                                </td>
                                <td className="p-2.5 font-mono text-[10px] text-[#74756F] uppercase">
                                  {log.operationType}
                                </td>
                                <td className="p-2.5 text-[#252629]">{log.description}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DISCOUNTS */}
              {activeTab === 'discounts' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E3E1DA]">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#18191B]">
                        Promotions & Discount Rules
                      </h3>
                      <p className="text-xs text-[#74756F]">
                        Manage promotional banners, coupons, and automatic multi-service bundle rules.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCreatingPromo(!isCreatingPromo)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18191B] text-white text-xs font-semibold hover:bg-black"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Promo</span>
                    </button>
                  </div>

                  {isCreatingPromo && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newPromoHeadline.trim()) return;
                        const promo: Promotion = {
                          id: `promo-${Date.now()}`,
                          internalName: newPromoName.trim() || newPromoHeadline.trim(),
                          headline: newPromoHeadline.trim(),
                          shortDescription: newPromoDesc.trim(),
                          discountType: 'percentage',
                          discountValue: Number(newPromoDiscount),
                          targetPackageIds: packages.map((p) => p.id),
                          targetServiceIds: [],
                          targetDepartmentIds: [],
                          eligibleMarkets: ['tn', 'dz', 'ly', 'eu', 'ca', 'int'],
                          startDate: new Date().toISOString(),
                          isEnabled: true,
                          couponCode: newPromoCode.trim() || undefined,
                          allowAutoApply: true,
                          canStack: false,
                          terms: 'Applied automatically to eligible studio packs.',
                        };
                        savePromotion(promo);
                        setIsCreatingPromo(false);
                        showNotice(`Created promotion ${promo.headline}`);
                      }}
                      className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] space-y-3 animate-in fade-in"
                    >
                      <h4 className="font-display text-sm font-bold text-[#18191B]">New Promotion</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#18191B] block mb-1">Headline</label>
                          <input
                            type="text"
                            value={newPromoHeadline}
                            onChange={(e) => setNewPromoHeadline(e.target.value)}
                            placeholder="e.g. Autumn Studio Sprint"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#18191B] block mb-1">Discount (%)</label>
                          <input
                            type="number"
                            value={newPromoDiscount}
                            onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                            min="1"
                            max="50"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] text-xs bg-white font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#18191B] block mb-1">Coupon Code (Optional)</label>
                          <input
                            type="text"
                            value={newPromoCode}
                            onChange={(e) => setNewPromoCode(e.target.value)}
                            placeholder="e.g. SPRINT15"
                            className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] text-xs bg-white font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingPromo(false)}
                          className="px-3 py-1.5 rounded-lg border border-[#E3E1DA] text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#FF573D] text-white text-xs font-bold"
                        >
                          Save Promotion
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {promotions.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl border border-[#E3E1DA] bg-white flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-bold text-[#18191B]">
                              {p.headline}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-[#DDF278] text-[#18191B] font-mono text-[10px] font-bold">
                              {p.discountValue}% OFF
                            </span>
                            {p.couponCode && (
                              <span className="px-2 py-0.5 rounded-md bg-[#EFEEE8] text-[#74756F] font-mono text-[10px]">
                                Code: {p.couponCode}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#74756F] mt-1">{p.shortDescription}</p>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={p.isEnabled}
                            onChange={() => {
                              togglePromotion(p.id);
                              showNotice(`Toggled promotion ${p.headline}`);
                            }}
                            className="rounded text-[#FF573D]"
                          />
                          <span className="text-xs font-semibold text-[#18191B]">
                            {p.isEnabled ? 'Active' : 'Disabled'}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: INQUIRIES & ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E3E1DA]">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#18191B]">
                        Customer Inquiries & Orders
                      </h3>
                      <p className="text-xs text-[#74756F]">
                        Manage incoming client requests, scoping calls, and order status.
                      </p>
                    </div>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-[#E3E1DA] rounded-2xl">
                      <Inbox className="w-8 h-8 text-[#74756F] mx-auto mb-2" />
                      <p className="text-xs text-[#74756F]">No inquiries submitted yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className="p-4 rounded-xl border border-[#E3E1DA] bg-[#F7F4ED]/60 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display text-sm font-bold text-[#18191B]">
                                  {inq.clientName}
                                </span>
                                <span className="text-xs text-[#74756F]">({inq.clientEmail})</span>
                                {inq.companyName && (
                                  <span className="text-xs text-[#74756F]">| {inq.companyName}</span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#74756F] mt-0.5">
                                Ref: <span className="font-mono font-bold text-[#18191B]">{inq.referenceNumber}</span> • Region: {inq.marketId.toUpperCase()} • {new Date(inq.createdAt).toLocaleString()}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={inq.status}
                                onChange={(e) => {
                                  updateInquiryStatus(inq.id, e.target.value as InquiryStatus);
                                  showNotice(`Updated status for ${inq.referenceNumber}`);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-[#E3E1DA] bg-white text-xs font-semibold"
                              >
                                <option value="new">New</option>
                                <option value="in_review">In Review</option>
                                <option value="accepted">Accepted</option>
                                <option value="declined">Declined</option>
                                <option value="invoiced">Invoiced</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                          </div>

                          {inq.meetingDetails && (
                            <div className="p-2.5 rounded-lg bg-white border border-[#E3E1DA] text-xs text-[#252629] flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#FF573D]" />
                              <span>
                                Scheduled call: {inq.meetingDetails.date} at {inq.meetingDetails.timeSlot} — {inq.meetingDetails.purpose}
                              </span>
                            </div>
                          )}

                          {inq.notes && (
                            <div className="text-xs text-[#74756F] italic bg-white p-2 rounded border border-[#E3E1DA]">
                              "{inq.notes}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: BOOKING SETTINGS */}
              {activeTab === 'booking' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[#E3E1DA]">
                    <h3 className="font-display text-xl font-bold text-[#18191B]">
                      Booking & Calendar Configuration
                    </h3>
                    <p className="text-xs text-[#74756F]">
                      Configure meeting availability, Google Meet generation, and default booking parameters.
                    </p>
                  </div>

                  <div className="space-y-4 max-w-xl">
                    <label className="flex items-center justify-between p-4 rounded-xl border border-[#E3E1DA] bg-[#F7F4ED]/50 cursor-pointer">
                      <div>
                        <div className="text-xs font-bold text-[#18191B]">Enable Intro Call Booking</div>
                        <div className="text-[11px] text-[#74756F]">
                          Allows visitors to schedule consultations directly on the site
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.bookingEnabled}
                        onChange={(e) => {
                          saveSettingsState({ ...settings, bookingEnabled: e.target.checked });
                          showNotice('Updated booking availability');
                        }}
                        className="rounded text-[#FF573D]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-xl border border-[#E3E1DA] bg-[#F7F4ED]/50 cursor-pointer">
                      <div>
                        <div className="text-xs font-bold text-[#18191B]">Auto-Generate Google Meet Links</div>
                        <div className="text-[11px] text-[#74756F]">
                          Attaches a Google Meet room to confirmed consultations
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.googleMeetEnabled}
                        onChange={(e) => {
                          saveSettingsState({ ...settings, googleMeetEnabled: e.target.checked });
                          showNotice('Updated Google Meet integration');
                        }}
                        className="rounded text-[#FF573D]"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 8: WEBSITE CONTENT SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveWebsiteSettings} className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E3E1DA]">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#18191B]">
                        Live Website Content & Brand Settings
                      </h3>
                      <p className="text-xs text-[#74756F]">
                        Edit copy, headlines, and contact info. Changes propagate instantly to the public site without code edits.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18191B] text-white text-xs font-semibold hover:bg-black transition-colors shadow-2xs"
                    >
                      <Save className="w-3.5 h-3.5 text-[#DDF278]" />
                      <span>Save All Changes</span>
                    </button>
                  </div>

                  <div className="space-y-5 max-w-3xl">
                    {/* Brand & Hero Section */}
                    <div className="p-5 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] space-y-4">
                      <h4 className="font-display text-sm font-bold text-[#18191B]">
                        Hero & Brand Positioning
                      </h4>

                      <div>
                        <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                          Hero Main Headline
                        </label>
                        <input
                          type="text"
                          value={websiteSettings.heroHeadline}
                          onChange={(e) =>
                            setWebsiteSettings({ ...websiteSettings, heroHeadline: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                          Hero Supporting Text
                        </label>
                        <textarea
                          rows={2}
                          value={websiteSettings.heroSupporting}
                          onChange={(e) =>
                            setWebsiteSettings({ ...websiteSettings, heroSupporting: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                            Primary CTA Button Label
                          </label>
                          <input
                            type="text"
                            value={websiteSettings.heroPrimaryCta}
                            onChange={(e) =>
                              setWebsiteSettings({ ...websiteSettings, heroPrimaryCta: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                            Secondary CTA Button Label
                          </label>
                          <input
                            type="text"
                            value={websiteSettings.heroSecondaryCta}
                            onChange={(e) =>
                              setWebsiteSettings({ ...websiteSettings, heroSecondaryCta: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* About Section Copy */}
                    <div className="p-5 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] space-y-4">
                      <h4 className="font-display text-sm font-bold text-[#18191B]">
                        About Us Section
                      </h4>

                      <div>
                        <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                          About Headline
                        </label>
                        <input
                          type="text"
                          value={websiteSettings.aboutHeadline}
                          onChange={(e) =>
                            setWebsiteSettings({ ...websiteSettings, aboutHeadline: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                          About Paragraphs (Separated by new lines)
                        </label>
                        <textarea
                          rows={5}
                          value={websiteSettings.aboutParagraphs?.join('\n\n') || ''}
                          onChange={(e) =>
                            setWebsiteSettings({
                              ...websiteSettings,
                              aboutParagraphs: e.target.value
                                .split('\n\n')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Approach Section Copy */}
                    <div className="p-5 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] space-y-4">
                      <h4 className="font-display text-sm font-bold text-[#18191B]">
                        Our Approach (How We Work) Section
                      </h4>

                      <div>
                        <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                          Approach Headline
                        </label>
                        <input
                          type="text"
                          value={websiteSettings.approachHeadline}
                          onChange={(e) =>
                            setWebsiteSettings({ ...websiteSettings, approachHeadline: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                          Approach Supporting Text
                        </label>
                        <textarea
                          rows={2}
                          value={websiteSettings.approachSupporting}
                          onChange={(e) =>
                            setWebsiteSettings({ ...websiteSettings, approachSupporting: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Contact & Studio Settings */}
                    <div className="p-5 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] space-y-4">
                      <h4 className="font-display text-sm font-bold text-[#18191B]">
                        Direct Contact & Admin PIN
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                            WhatsApp Phone Number (E.164 without +)
                          </label>
                          <input
                            type="text"
                            value={websiteSettings.whatsappNumber}
                            onChange={(e) =>
                              setWebsiteSettings({ ...websiteSettings, whatsappNumber: e.target.value })
                            }
                            placeholder="e.g. 21650123456"
                            className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                            Studio Contact Email
                          </label>
                          <input
                            type="email"
                            value={websiteSettings.studioEmail}
                            onChange={(e) =>
                              setWebsiteSettings({ ...websiteSettings, studioEmail: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                            Admin Access PIN
                          </label>
                          <input
                            type="password"
                            value={websiteSettings.adminPin}
                            onChange={(e) =>
                              setWebsiteSettings({ ...websiteSettings, adminPin: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-[#18191B] block mb-1">
                            Footer Tagline
                          </label>
                          <input
                            type="text"
                            value={websiteSettings.footerTagline}
                            onChange={(e) =>
                              setWebsiteSettings({ ...websiteSettings, footerTagline: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-[#E3E1DA] bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-[#18191B] text-white text-xs font-bold hover:bg-black transition-colors shadow-md"
                      >
                        Save All Website Settings
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};
