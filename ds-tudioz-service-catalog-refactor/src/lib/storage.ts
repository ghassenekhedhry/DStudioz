import {
  Department,
  PackageOffer,
  MarketId,
  Promotion,
  PaymentProviderConfig,
  StudioSettings,
  InquiryRecord,
  MultiServiceDiscountRule,
  PriceAuditLog,
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_PACKAGES,
  INITIAL_PROMOTIONS,
  INITIAL_MULTI_SERVICE_RULE,
  INITIAL_PAYMENT_PROVIDERS,
  INITIAL_SETTINGS,
  INITIAL_INQUIRIES,
} from '../data/initialData';

const STORAGE_KEYS = {
  MARKET: 'dstudioz_market',
  CONSENT: 'dstudioz_market_consent',
  DEPARTMENTS: 'dstudioz_departments',
  PACKAGES: 'dstudioz_packages',
  PROMOTIONS: 'dstudioz_promotions',
  MULTI_SERVICE_RULE: 'dstudioz_multi_rule',
  PAYMENT_PROVIDERS: 'dstudioz_payment_providers',
  SETTINGS: 'dstudioz_settings',
  INQUIRIES: 'dstudioz_inquiries',
  PRICE_AUDITS: 'dstudioz_price_audits',
  PRICING_V2_APPLIED: 'dstudioz_pricing_v3_applied',
};

export type ConsentStatus = 'undecided' | 'accepted_detect' | 'essential_only' | 'manual_chosen';

// Run one-time version migration to apply new catalog & 20% price reduction
function ensureCatalogVersion() {
  try {
    const isV2 = localStorage.getItem(STORAGE_KEYS.PRICING_V2_APPLIED);
    if (!isV2) {
      // Overwrite cached departments, packages, and settings with updated v2 catalog
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_PACKAGES));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.PRICING_V2_APPLIED, 'true');
    }
  } catch {
    // ignore local storage errors in SSR or restricted environments
  }
}

// Execute migration check on module load
ensureCatalogVersion();

export function getStoredMarket(): MarketId {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.MARKET);
    if (val && ['tn', 'dz', 'ly', 'eu', 'ca', 'int'].includes(val)) {
      return val as MarketId;
    }
  } catch {
    // fallback
  }
  return 'int';
}

export function setStoredMarket(marketId: MarketId) {
  try {
    localStorage.setItem(STORAGE_KEYS.MARKET, marketId);
  } catch {
    // ignore
  }
}

export function getStoredConsent(): ConsentStatus {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.CONSENT);
    if (val && ['undecided', 'accepted_detect', 'essential_only', 'manual_chosen'].includes(val)) {
      return val as ConsentStatus;
    }
  } catch {
    // fallback
  }
  return 'undecided';
}

export function setStoredConsent(status: ConsentStatus) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONSENT, status);
  } catch {
    // ignore
  }
}

export function getStoredDepartments(): Department[] {
  ensureCatalogVersion();
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return INITIAL_DEPARTMENTS;
}

export function saveStoredDepartments(departments: Department[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  } catch {
    // ignore
  }
}

export function getStoredPackages(): PackageOffer[] {
  ensureCatalogVersion();
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return INITIAL_PACKAGES;
}

export function saveStoredPackages(packages: PackageOffer[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  } catch {
    // ignore
  }
}

export function getStoredPromotions(): Promotion[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROMOTIONS);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return INITIAL_PROMOTIONS;
}

export function saveStoredPromotions(promotions: Promotion[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promotions));
  } catch {
    // ignore
  }
}

export function getStoredMultiServiceRule(): MultiServiceDiscountRule {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MULTI_SERVICE_RULE);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return INITIAL_MULTI_SERVICE_RULE;
}

export function saveStoredMultiServiceRule(rule: MultiServiceDiscountRule) {
  try {
    localStorage.setItem(STORAGE_KEYS.MULTI_SERVICE_RULE, JSON.stringify(rule));
  } catch {
    // ignore
  }
}

export function getStoredPaymentProviders(): PaymentProviderConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_PROVIDERS);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return INITIAL_PAYMENT_PROVIDERS;
}

export function saveStoredPaymentProviders(providers: PaymentProviderConfig[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_PROVIDERS, JSON.stringify(providers));
  } catch {
    // ignore
  }
}

export function getStoredSettings(): StudioSettings {
  ensureCatalogVersion();
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with initial settings to ensure all newly added content keys exist
      return { ...INITIAL_SETTINGS, ...parsed };
    }
  } catch {
    // ignore
  }
  return INITIAL_SETTINGS;
}

export function saveStoredSettings(settings: StudioSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function getStoredInquiries(): InquiryRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return INITIAL_INQUIRIES;
}

export function saveStoredInquiries(inquiries: InquiryRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  } catch {
    // ignore
  }
}

export function getStoredPriceAudits(): PriceAuditLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICE_AUDITS);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

export function saveStoredPriceAudits(audits: PriceAuditLog[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRICE_AUDITS, JSON.stringify(audits));
  } catch {
    // ignore
  }
}

export function appendPriceAudit(audit: PriceAuditLog) {
  const current = getStoredPriceAudits();
  const updated = [audit, ...current].slice(0, 100); // Keep last 100 entries
  saveStoredPriceAudits(updated);
}
