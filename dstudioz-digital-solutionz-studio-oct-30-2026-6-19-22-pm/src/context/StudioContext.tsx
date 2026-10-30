import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Department,
  PackageOffer,
  MarketId,
  Promotion,
  PaymentProviderConfig,
  StudioSettings,
  InquiryRecord,
  MultiServiceDiscountRule,
  ServiceItem,
  PriceRecord,
  InquiryStatus,
  PriceAuditLog,
} from '../types';
import {
  getStoredMarket,
  setStoredMarket,
  getStoredConsent,
  setStoredConsent,
  ConsentStatus,
  getStoredDepartments,
  saveStoredDepartments,
  getStoredPackages,
  saveStoredPackages,
  getStoredPromotions,
  saveStoredPromotions,
  getStoredMultiServiceRule,
  saveStoredMultiServiceRule,
  getStoredPaymentProviders,
  saveStoredPaymentProviders,
  getStoredSettings,
  saveStoredSettings,
  getStoredInquiries,
  saveStoredInquiries,
  getStoredPriceAudits,
  appendPriceAudit,
} from '../lib/storage';
import { MARKETS } from '../data/initialData';
import { BulkPriceAdjustmentConfig, applyPriceAdjustment } from '../lib/pricingEngine';

interface BookingPreload {
  serviceId?: string;
  packageId?: string;
  purpose?: string;
}

interface StudioContextType {
  market: MarketId;
  setMarket: (marketId: MarketId) => void;
  consentStatus: ConsentStatus;
  setConsentStatus: (status: ConsentStatus) => void;
  departments: Department[];
  packages: PackageOffer[];
  promotions: Promotion[];
  multiServiceRule: MultiServiceDiscountRule;
  paymentProviders: PaymentProviderConfig[];
  settings: StudioSettings;
  inquiries: InquiryRecord[];
  priceAudits: PriceAuditLog[];

  // Selections
  selectedServiceIds: string[];
  selectedPackageId: string | null;
  toggleServiceSelection: (serviceId: string) => void;
  selectPackage: (packageId: string | null) => void;
  clearSelection: () => void;
  isServiceSelected: (serviceId: string) => boolean;

  // Selected object getters
  selectedServices: ServiceItem[];
  selectedPackage: PackageOffer | null;

  // Modals & Panels
  isSelectionDrawerOpen: boolean;
  setIsSelectionDrawerOpen: (open: boolean) => void;
  isBookingModalOpen: boolean;
  bookingPreload: BookingPreload | null;
  openBookingModal: (preload?: BookingPreload) => void;
  closeBookingModal: () => void;
  isCheckoutModalOpen: boolean;
  checkoutPackage: PackageOffer | null;
  openCheckoutModal: (pkg: PackageOffer) => void;
  closeCheckoutModal: () => void;
  isMarketModalOpen: boolean;
  setIsMarketModalOpen: (open: boolean) => void;
  isPromoPanelOpen: boolean;
  setIsPromoPanelOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;

  // Navigation & Problem interaction
  activeProblemId: string | null;
  highlightProblem: (problemId: string, departmentId: string, serviceId?: string, packageId?: string) => void;
  expandedDepartmentId: string | null;
  setExpandedDepartmentId: (id: string | null) => void;
  activeServiceDetailId: string | null;
  setActiveServiceDetailId: (id: string | null) => void;

  // Admin Mutations
  updateServicePrice: (deptId: string, serviceId: string, marketId: MarketId, update: Partial<PriceRecord>) => void;
  updatePackagePrice: (pkgId: string, marketId: MarketId, update: Partial<PriceRecord>) => void;
  updateServiceDetails: (deptId: string, serviceId: string, updates: Partial<ServiceItem>) => void;
  updatePackageDetails: (pkgId: string, updates: Partial<PackageOffer>) => void;
  applyBulkAdjustment: (config: BulkPriceAdjustmentConfig, reason: string) => number;
  savePromotion: (promotion: Promotion) => void;
  togglePromotion: (promoId: string) => void;
  savePaymentProvider: (provider: PaymentProviderConfig) => void;
  saveSettingsState: (settings: StudioSettings) => void;
  addInquiry: (inquiry: Omit<InquiryRecord, 'id' | 'createdAt' | 'referenceNumber'>) => InquiryRecord;
  updateInquiryStatus: (id: string, status: InquiryStatus, internalNotes?: string) => void;
  resetAllToDefaults: () => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [market, setMarketState] = useState<MarketId>(getStoredMarket);
  const [consentStatus, setConsentStatusState] = useState<ConsentStatus>(getStoredConsent);
  const [departments, setDepartments] = useState<Department[]>(getStoredDepartments);
  const [packages, setPackages] = useState<PackageOffer[]>(getStoredPackages);
  const [promotions, setPromotions] = useState<Promotion[]>(getStoredPromotions);
  const [multiServiceRule] = useState<MultiServiceDiscountRule>(getStoredMultiServiceRule);
  const [paymentProviders, setPaymentProviders] = useState<PaymentProviderConfig[]>(getStoredPaymentProviders);
  const [settings, setSettings] = useState<StudioSettings>(getStoredSettings);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(getStoredInquiries);
  const [priceAudits, setPriceAudits] = useState<PriceAuditLog[]>(getStoredPriceAudits);

  // Selections
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  // Modals & Drawers
  const [isSelectionDrawerOpen, setIsSelectionDrawerOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPreload, setBookingPreload] = useState<BookingPreload | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutPackage, setCheckoutPackage] = useState<PackageOffer | null>(null);
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  const [isPromoPanelOpen, setIsPromoPanelOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Department / Explorer focus
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);
  const [expandedDepartmentId, setExpandedDepartmentId] = useState<string | null>('brand');
  const [activeServiceDetailId, setActiveServiceDetailId] = useState<string | null>(null);

  const setMarket = (newMarket: MarketId) => {
    setMarketState(newMarket);
    setStoredMarket(newMarket);
  };

  const setConsentStatus = (status: ConsentStatus) => {
    setConsentStatusState(status);
    setStoredConsent(status);
  };

  // Helper getters
  const allServices: ServiceItem[] = departments.flatMap((d) => d.services);
  const selectedServices = allServices.filter((s) => selectedServiceIds.includes(s.id));
  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || null;

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const selectPackage = (packageId: string | null) => {
    setSelectedPackageId(packageId);
    if (packageId) {
      setIsSelectionDrawerOpen(true);
    }
  };

  const clearSelection = () => {
    setSelectedServiceIds([]);
    setSelectedPackageId(null);
  };

  const isServiceSelected = (serviceId: string) => selectedServiceIds.includes(serviceId);

  const openBookingModal = (preload?: BookingPreload) => {
    setBookingPreload(preload || null);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingPreload(null);
  };

  const openCheckoutModal = (pkg: PackageOffer) => {
    setCheckoutPackage(pkg);
    setIsCheckoutModalOpen(true);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutPackage(null);
  };

  const highlightProblem = (
    problemId: string,
    departmentId: string,
    serviceId?: string,
    packageId?: string
  ) => {
    setActiveProblemId(problemId);
    setExpandedDepartmentId(departmentId);
    if (serviceId) {
      setActiveServiceDetailId(serviceId);
    }
    if (packageId) {
      setSelectedPackageId(packageId);
    }

    const targetElement = document.getElementById(serviceId ? `service-${serviceId}` : 'services');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Admin mutations
  const updateServicePrice = (
    deptId: string,
    serviceId: string,
    marketId: MarketId,
    update: Partial<PriceRecord>
  ) => {
    setDepartments((prev) => {
      const updated = prev.map((dept) => {
        if (dept.id !== deptId) return dept;
        return {
          ...dept,
          services: dept.services.map((svc) => {
            if (svc.id !== serviceId) return svc;
            const current = svc.prices[marketId] || {
              marketId,
              currency: MARKETS[marketId]?.currency || 'USD',
              priceType: 'quote',
              billingInterval: 'one_time',
              isPublished: true,
            };
            const prevAmount = current.amount;
            const updatedRec: PriceRecord = {
              ...current,
              ...update,
              updatedAt: new Date().toISOString(),
            };

            // Audit log
            if (update.amount !== undefined && update.amount !== prevAmount) {
              const audit: PriceAuditLog = {
                id: `audit-${Date.now()}`,
                timestamp: new Date().toISOString(),
                targetType: 'service',
                targetId: serviceId,
                targetName: svc.title,
                operationType: 'individual',
                marketId,
                previousValue: prevAmount,
                newValue: update.amount,
                description: `Updated price for ${svc.title} (${marketId.toUpperCase()}) to ${update.amount}`,
              };
              appendPriceAudit(audit);
              setPriceAudits((a) => [audit, ...a]);
            }

            return {
              ...svc,
              prices: {
                ...svc.prices,
                [marketId]: updatedRec,
              },
            };
          }),
        };
      });
      saveStoredDepartments(updated);
      return updated;
    });
  };

  const updatePackagePrice = (
    pkgId: string,
    marketId: MarketId,
    update: Partial<PriceRecord>
  ) => {
    setPackages((prev) => {
      const updated = prev.map((pkg) => {
        if (pkg.id !== pkgId) return pkg;
        const current = pkg.prices[marketId] || {
          marketId,
          currency: MARKETS[marketId]?.currency || 'USD',
          priceType: 'quote',
          billingInterval: pkg.billingType,
          isPublished: true,
        };
        const prevAmount = current.amount;
        const updatedRec: PriceRecord = {
          ...current,
          ...update,
          updatedAt: new Date().toISOString(),
        };

        if (update.amount !== undefined && update.amount !== prevAmount) {
          const audit: PriceAuditLog = {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            targetType: 'package',
            targetId: pkgId,
            targetName: pkg.name,
            operationType: 'individual',
            marketId,
            previousValue: prevAmount,
            newValue: update.amount,
            description: `Updated price for pack ${pkg.name} (${marketId.toUpperCase()}) to ${update.amount}`,
          };
          appendPriceAudit(audit);
          setPriceAudits((a) => [audit, ...a]);
        }

        return {
          ...pkg,
          prices: {
            ...pkg.prices,
            [marketId]: updatedRec,
          },
        };
      });
      saveStoredPackages(updated);
      return updated;
    });
  };

  const updateServiceDetails = (deptId: string, serviceId: string, updates: Partial<ServiceItem>) => {
    setDepartments((prev) => {
      const updated = prev.map((dept) => {
        if (dept.id !== deptId) return dept;
        return {
          ...dept,
          services: dept.services.map((svc) => (svc.id === serviceId ? { ...svc, ...updates } : svc)),
        };
      });
      saveStoredDepartments(updated);
      return updated;
    });
  };

  const updatePackageDetails = (pkgId: string, updates: Partial<PackageOffer>) => {
    setPackages((prev) => {
      const updated = prev.map((pkg) => (pkg.id === pkgId ? { ...pkg, ...updates } : pkg));
      saveStoredPackages(updated);
      return updated;
    });
  };

  const applyBulkAdjustment = (config: BulkPriceAdjustmentConfig, reason: string): number => {
    let affectedCount = 0;
    const allMarketKeys: MarketId[] = ['tn', 'dz', 'ly', 'eu', 'ca', 'int'];
    const targetMarkets = config.marketScope && config.marketScope !== 'all' ? [config.marketScope] : allMarketKeys;

    // Adjust services
    const updatedDepartments = departments.map((dept) => {
      if (config.departmentId && config.departmentId !== 'all' && dept.id !== config.departmentId) {
        return dept;
      }
      return {
        ...dept,
        services: dept.services.map((svc) => {
          const updatedPrices = { ...svc.prices };
          targetMarkets.forEach((mId) => {
            const currentRec = updatedPrices[mId];
            if (currentRec && (currentRec.amount || currentRec.minAmount)) {
              updatedPrices[mId] = applyPriceAdjustment(currentRec, config);
              affectedCount++;
            }
          });
          return { ...svc, prices: updatedPrices };
        }),
      };
    });

    // If departmentId is 'all', also adjust packages
    let updatedPackages = packages;
    if (!config.departmentId || config.departmentId === 'all') {
      updatedPackages = packages.map((pkg) => {
        const updatedPrices = { ...pkg.prices };
        targetMarkets.forEach((mId) => {
          const currentRec = updatedPrices[mId];
          if (currentRec && currentRec.amount) {
            updatedPrices[mId] = applyPriceAdjustment(currentRec, config);
            affectedCount++;
          }
        });
        return { ...pkg, prices: updatedPrices };
      });
    }

    setDepartments(updatedDepartments);
    saveStoredDepartments(updatedDepartments);

    if (updatedPackages !== packages) {
      setPackages(updatedPackages);
      saveStoredPackages(updatedPackages);
    }

    const audit: PriceAuditLog = {
      id: `bulk-audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      targetType: 'bulk',
      targetId: config.departmentId || 'all',
      targetName: `Bulk Adjustment (${config.type})`,
      operationType:
        config.departmentId && config.departmentId !== 'all'
          ? 'department_bulk'
          : config.marketScope && config.marketScope !== 'all'
          ? 'market_bulk'
          : 'all_bulk',
      description: `${reason}: ${config.type.replace('_', ' ')} ${config.value}${
        config.type.startsWith('percent') ? '%' : ''
      } applied to ${affectedCount} prices`,
    };
    appendPriceAudit(audit);
    setPriceAudits((a) => [audit, ...a]);

    return affectedCount;
  };

  const savePromotion = (promotion: Promotion) => {
    setPromotions((prev) => {
      const exists = prev.some((p) => p.id === promotion.id);
      const updated = exists ? prev.map((p) => (p.id === promotion.id ? promotion : p)) : [promotion, ...prev];
      saveStoredPromotions(updated);
      return updated;
    });
  };

  const togglePromotion = (promoId: string) => {
    setPromotions((prev) => {
      const updated = prev.map((p) => (p.id === promoId ? { ...p, isEnabled: !p.isEnabled } : p));
      saveStoredPromotions(updated);
      return updated;
    });
  };

  const savePaymentProvider = (provider: PaymentProviderConfig) => {
    setPaymentProviders((prev) => {
      const updated = prev.map((p) => (p.id === provider.id ? provider : p));
      saveStoredPaymentProviders(updated);
      return updated;
    });
  };

  const saveSettingsState = (newSettings: StudioSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const addInquiry = (inquiryData: Omit<InquiryRecord, 'id' | 'createdAt' | 'referenceNumber'>): InquiryRecord => {
    const refNum = `DSZ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: InquiryRecord = {
      ...inquiryData,
      id: `inq-${Date.now()}`,
      referenceNumber: refNum,
      createdAt: new Date().toISOString(),
    };
    setInquiries((prev) => {
      const updated = [newRecord, ...prev];
      saveStoredInquiries(updated);
      return updated;
    });
    return newRecord;
  };

  const updateInquiryStatus = (id: string, status: InquiryStatus, internalNotes?: string) => {
    setInquiries((prev) => {
      const updated = prev.map((inq) => {
        if (inq.id !== id) return inq;
        return {
          ...inq,
          status,
          ...(internalNotes ? { internalNotes } : {}),
        };
      });
      saveStoredInquiries(updated);
      return updated;
    });
  };

  const resetAllToDefaults = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      // ignore
    }
  };

  return (
    <StudioContext.Provider
      value={{
        market,
        setMarket,
        consentStatus,
        setConsentStatus,
        departments,
        packages,
        promotions,
        multiServiceRule,
        paymentProviders,
        settings,
        inquiries,
        priceAudits,
        selectedServiceIds,
        selectedPackageId,
        toggleServiceSelection,
        selectPackage,
        clearSelection,
        isServiceSelected,
        selectedServices,
        selectedPackage,
        isSelectionDrawerOpen,
        setIsSelectionDrawerOpen,
        isBookingModalOpen,
        bookingPreload,
        openBookingModal,
        closeBookingModal,
        isCheckoutModalOpen,
        checkoutPackage,
        openCheckoutModal,
        closeCheckoutModal,
        isMarketModalOpen,
        setIsMarketModalOpen,
        isPromoPanelOpen,
        setIsPromoPanelOpen,
        isAdminOpen,
        setIsAdminOpen,
        activeProblemId,
        highlightProblem,
        expandedDepartmentId,
        setExpandedDepartmentId,
        activeServiceDetailId,
        setActiveServiceDetailId,
        updateServicePrice,
        updatePackagePrice,
        updateServiceDetails,
        updatePackageDetails,
        applyBulkAdjustment,
        savePromotion,
        togglePromotion,
        savePaymentProvider,
        saveSettingsState,
        addInquiry,
        updateInquiryStatus,
        resetAllToDefaults,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
