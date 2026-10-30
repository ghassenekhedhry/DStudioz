import {
  MarketId,
  PriceRecord,
  ServiceItem,
  PackageOffer,
  Promotion,
  MultiServiceDiscountRule,
  Department,
} from '../types';
import { MARKETS } from '../data/initialData';

export function roundPriceToMarketIncrement(amount: number, marketId: MarketId): number {
  if (isNaN(amount) || amount <= 0) return 0;
  switch (marketId) {
    case 'tn':
      return Math.round(amount / 10) * 10;
    case 'dz':
      return Math.round(amount / 500) * 500;
    case 'ly':
      return Math.round(amount / 10) * 10;
    case 'eu':
    case 'ca':
    case 'int':
    default:
      return Math.round(amount / 5) * 5;
  }
}

export interface BulkPriceAdjustmentConfig {
  type: 'percent_decrease' | 'percent_increase' | 'fixed_add' | 'fixed_subtract';
  value: number;
  marketScope?: MarketId | 'all';
  departmentId?: string | 'all';
}

export function applyPriceAdjustment(
  record: PriceRecord,
  operation: BulkPriceAdjustmentConfig
): PriceRecord {
  // If scoped to a specific market and record doesn't match, return untouched
  if (operation.marketScope && operation.marketScope !== 'all' && record.marketId !== operation.marketScope) {
    return { ...record };
  }

  if (record.priceType === 'quote' || record.priceType === 'unpublished') {
    return { ...record };
  }

  const adjustValue = (val: number | undefined): number | undefined => {
    if (val === undefined) return undefined;
    let nextVal = val;
    if (operation.type === 'percent_decrease') {
      nextVal = val * (1 - Math.abs(operation.value) / 100);
    } else if (operation.type === 'percent_increase') {
      nextVal = val * (1 + Math.abs(operation.value) / 100);
    } else if (operation.type === 'fixed_add') {
      nextVal = val + Math.abs(operation.value);
    } else if (operation.type === 'fixed_subtract') {
      nextVal = Math.max(0, val - Math.abs(operation.value));
    }
    return Math.max(0, roundPriceToMarketIncrement(nextVal, record.marketId));
  };

  return {
    ...record,
    amount: adjustValue(record.amount),
    minAmount: adjustValue(record.minAmount),
    maxAmount: adjustValue(record.maxAmount),
    updatedAt: new Date().toISOString(),
  };
}

export function formatCurrency(amount: number, marketId: MarketId): string {
  const market = MARKETS[marketId] || MARKETS.int;
  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);

  if (market.format === 'suffix') {
    return `${formattedNumber} ${market.symbol}`;
  }
  return `${market.symbol}${formattedNumber}`;
}

export function renderPriceRecord(
  record: PriceRecord | undefined,
  marketId: MarketId
): { display: string; isQuote: boolean; isRecurring: boolean; amount?: number } {
  if (!record || !record.isPublished) {
    return { display: 'Price on request', isQuote: true, isRecurring: false };
  }

  const isRecurring = record.billingInterval === 'monthly';

  if (record.priceType === 'quote') {
    return { display: 'Request a quote', isQuote: true, isRecurring };
  }

  if (record.priceType === 'unpublished') {
    return { display: 'Price on request', isQuote: true, isRecurring };
  }

  if (record.priceType === 'range' && record.minAmount && record.maxAmount) {
    const min = formatCurrency(record.minAmount, marketId);
    const max = formatCurrency(record.maxAmount, marketId);
    return {
      display: `${min} – ${max}${isRecurring ? ' / month' : ''}`,
      isQuote: false,
      isRecurring,
      amount: record.minAmount,
    };
  }

  if (record.priceType === 'starting_at' && record.amount) {
    const amt = formatCurrency(record.amount, marketId);
    return {
      display: `From ${amt}${isRecurring ? ' / month' : ''}`,
      isQuote: false,
      isRecurring,
      amount: record.amount,
    };
  }

  if (record.amount !== undefined) {
    const amt = formatCurrency(record.amount, marketId);
    return {
      display: `${amt}${isRecurring ? ' / mo' : ''}`,
      isQuote: false,
      isRecurring,
      amount: record.amount,
    };
  }

  return { display: 'Request a quote', isQuote: true, isRecurring };
}

export function getServicePrice(service: ServiceItem, marketId: MarketId): PriceRecord {
  return (
    service.prices[marketId] ||
    service.prices.int || {
      marketId,
      currency: MARKETS[marketId]?.currency || 'USD',
      priceType: 'quote',
      billingInterval: 'one_time',
      isPublished: true,
    }
  );
}

export function getPackagePrice(pkg: PackageOffer, marketId: MarketId): PriceRecord {
  return (
    pkg.prices[marketId] ||
    pkg.prices.int || {
      marketId,
      currency: MARKETS[marketId]?.currency || 'USD',
      priceType: 'quote',
      billingInterval: pkg.billingType,
      isPublished: true,
    }
  );
}

export interface SelectionCalculationResult {
  oneTimeSubtotal: number;
  oneTimeDiscount: number;
  oneTimeTotal: number;

  monthlySubtotal: number;
  monthlyDiscount: number;
  monthlyTotal: number;

  hasUnpricedItems: boolean;
  duplicateServiceIds: string[];
  appliedDiscounts: Array<{ label: string; amount: number; type: string }>;
  currencySymbol: string;
}

export function calculateSelection(
  selectedServices: ServiceItem[],
  selectedPackage: PackageOffer | null,
  marketId: MarketId,
  promotions: Promotion[],
  multiServiceRule: MultiServiceDiscountRule
): SelectionCalculationResult {
  const currencySymbol = MARKETS[marketId]?.symbol || '$';
  let oneTimeSubtotal = 0;
  let monthlySubtotal = 0;
  let hasUnpricedItems = false;
  const duplicateServiceIds: string[] = [];
  const appliedDiscounts: Array<{ label: string; amount: number; type: string }> = [];

  // Check which services are already covered inside the selected package to avoid double charges
  const packageIncludedIds = new Set(selectedPackage?.includedServiceIds || []);

  // 1. Calculate Package cost if selected
  let packageDiscountAmount = 0;
  if (selectedPackage) {
    const pkgPriceRecord = getPackagePrice(selectedPackage, marketId);
    if (pkgPriceRecord.priceType === 'quote' || !pkgPriceRecord.amount || !pkgPriceRecord.isPublished) {
      hasUnpricedItems = true;
    } else {
      const pkgAmount = pkgPriceRecord.amount;
      if (pkgPriceRecord.billingInterval === 'monthly') {
        monthlySubtotal += pkgAmount;
      } else {
        oneTimeSubtotal += pkgAmount;
      }

      // Check active promotions on this package
      const activePackagePromo = promotions.find(
        (p) =>
          p.isEnabled &&
          p.targetPackageIds.includes(selectedPackage.id) &&
          p.eligibleMarkets.includes(marketId)
      );

      if (activePackagePromo) {
        if (activePackagePromo.discountType === 'percentage') {
          packageDiscountAmount = Math.round((pkgAmount * activePackagePromo.discountValue) / 100);
        } else {
          packageDiscountAmount = Math.min(pkgAmount, activePackagePromo.discountValue);
        }
        appliedDiscounts.push({
          label: `${activePackagePromo.headline} (${activePackagePromo.discountValue}% off ${selectedPackage.name})`,
          amount: packageDiscountAmount,
          type: 'package_promo',
        });
      }
    }
  }

  // 2. Calculate Services cost
  const standaloneServices: ServiceItem[] = [];

  for (const s of selectedServices) {
    if (packageIncludedIds.has(s.id)) {
      duplicateServiceIds.push(s.id);
      continue; // Duplicate covered by package, charge $0
    }

    standaloneServices.push(s);
    const sPrice = getServicePrice(s, marketId);
    if (sPrice.priceType === 'quote' || !sPrice.amount || !sPrice.isPublished) {
      hasUnpricedItems = true;
    } else {
      if (sPrice.billingInterval === 'monthly') {
        monthlySubtotal += sPrice.amount;
      } else {
        oneTimeSubtotal += sPrice.amount;
      }
    }
  }

  // 3. Multi-service bundle discount
  let bundleDiscountAmount = 0;
  if (
    multiServiceRule.isEnabled &&
    standaloneServices.length >= multiServiceRule.minServices &&
    !hasUnpricedItems
  ) {
    // Apply to one-time services sum
    const eligibleOneTimeSum = standaloneServices
      .filter((s) => !multiServiceRule.excludedServiceIds.includes(s.id))
      .reduce((sum, s) => {
        const pr = getServicePrice(s, marketId);
        return pr.billingInterval !== 'monthly' && pr.amount ? sum + pr.amount : sum;
      }, 0);

    if (eligibleOneTimeSum > 0) {
      bundleDiscountAmount = Math.round(
        (eligibleOneTimeSum * multiServiceRule.discountPercentage) / 100
      );
      appliedDiscounts.push({
        label: `Multi-Service Bundle (${multiServiceRule.discountPercentage}% off ${standaloneServices.length} individual services)`,
        amount: bundleDiscountAmount,
        type: 'bundle_discount',
      });
    }
  }

  const oneTimeDiscount = packageDiscountAmount + bundleDiscountAmount;
  const oneTimeTotal = Math.max(0, oneTimeSubtotal - oneTimeDiscount);
  const monthlyDiscount = 0;
  const monthlyTotal = Math.max(0, monthlySubtotal - monthlyDiscount);

  return {
    oneTimeSubtotal,
    oneTimeDiscount,
    oneTimeTotal,
    monthlySubtotal,
    monthlyDiscount,
    monthlyTotal,
    hasUnpricedItems,
    duplicateServiceIds,
    appliedDiscounts,
    currencySymbol,
  };
}
