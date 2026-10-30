export type MarketId = 'tn' | 'dz' | 'ly' | 'eu' | 'ca' | 'int';

export interface MarketInfo {
  id: MarketId;
  name: string;
  country: string;
  currency: string;
  symbol: string;
  flag: string;
  format: 'prefix' | 'suffix';
}

export type PriceType = 'fixed' | 'starting_at' | 'range' | 'monthly' | 'quote' | 'unpublished';
export type BillingInterval = 'one_time' | 'monthly' | 'project';

export interface PriceRecord {
  marketId: MarketId;
  currency: string;
  priceType: PriceType;
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  billingInterval: BillingInterval;
  isPublished: boolean;
  scopeNote?: string;
  updatedAt?: string;
}

export interface ServiceItem {
  id: string;
  departmentId: string;
  title: string;
  outcome: string;
  deliverables: string[];
  prices: Record<MarketId, PriceRecord>;
  optionalAddons?: string[];
  popular?: boolean;
}

export interface Department {
  id: string;
  number: string;
  name: string;
  description: string;
  iconName: string;
  services: ServiceItem[];
}

export type PackageFamily =
  | 'branding'
  | 'community'
  | 'content'
  | 'web-dev'
  | 'seo'
  | 'automation'
  | 'tech-security'
  | 'bundles';

export interface PackageOffer {
  id: string;
  family: PackageFamily;
  name: string;
  benefit: string;
  intendedNeed: string;
  bestFor?: string;
  billingType: BillingInterval;
  includedDeliverables: string[];
  limitsAndExclusions: string[];
  includedServiceIds: string[];
  prices: Record<MarketId, PriceRecord>;
  optionalAddons?: string[];
  featured?: boolean;
  isOnlineCheckoutEligible: boolean;
}

export interface CustomerProblem {
  id: string;
  problem: string;
  targetDepartmentId: string;
  targetServiceId?: string;
  targetPackageId?: string;
  category: string;
}

export type DiscountType = 'percentage' | 'fixed_amount';

export interface Promotion {
  id: string;
  internalName: string;
  headline: string;
  shortDescription: string;
  discountType: DiscountType;
  discountValue: number;
  targetPackageIds: string[];
  targetServiceIds: string[];
  targetDepartmentIds: string[];
  eligibleMarkets: MarketId[];
  startDate: string;
  endDate?: string;
  isEnabled: boolean;
  couponCode?: string;
  allowAutoApply: boolean;
  canStack: boolean;
  terms: string;
}

export interface MultiServiceDiscountRule {
  minServices: number;
  discountPercentage: number;
  isEnabled: boolean;
  excludedServiceIds: string[];
}

export interface PaymentProviderConfig {
  id: 'stripe' | 'paypal' | 'google_pay' | 'konnect' | 'bank_transfer';
  name: string;
  isEnabled: boolean;
  isTestMode: boolean;
  eligibleMarkets: MarketId[];
  instructions?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    ribIban: string;
    swiftBic?: string;
  };
}

export type InquiryStatus = 'pending' | 'contacted' | 'approved' | 'paid' | 'cancelled' | 'refunded';

export interface InquiryRecord {
  id: string;
  referenceNumber: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName?: string;
  type: 'booking' | 'service_quote' | 'package_order';
  marketId: MarketId;
  selectedServiceIds: string[];
  selectedPackageId?: string;
  quotedAmount?: {
    amount: number;
    currency: string;
    isRecurring: boolean;
  };
  meetingDetails?: {
    date: string;
    timeSlot: string;
    purpose: string;
    meetLink?: string;
  };
  notes?: string;
  internalNotes?: string;
  status: InquiryStatus;
  paymentMethod?: string;
}

export interface PriceAuditLog {
  id: string;
  timestamp: string;
  targetType: 'service' | 'package' | 'bulk';
  targetId: string;
  targetName: string;
  operationType: 'individual' | 'department_bulk' | 'market_bulk' | 'all_bulk';
  marketId?: MarketId;
  previousValue?: number;
  newValue?: number;
  description: string;
}

export interface StudioSettings {
  whatsappNumber: string;
  studioEmail: string;
  bookingEnabled: boolean;
  googleMeetEnabled: boolean;
  defaultMarket: MarketId;
  adminPin: string;

  // Editable Website Content
  brandTagline: string;
  heroHeadline: string;
  heroSupporting: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  aboutHeadline: string;
  aboutParagraphs: string[];
  approachHeadline: string;
  approachSupporting: string;
  footerTagline: string;
}
