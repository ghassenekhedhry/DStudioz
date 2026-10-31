import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  renderPriceRecord,
  calculateSelection,
  roundPriceToMarketIncrement,
  applyPriceAdjustment,
} from './pricingEngine';
import { INITIAL_DEPARTMENTS, INITIAL_PACKAGES, INITIAL_PROMOTIONS, INITIAL_MULTI_SERVICE_RULE } from '../data/initialData';

test('formatCurrency handles prefixes and suffixes correctly per market', () => {
  // Tunisia has format suffix: 1,440 DT
  assert.equal(formatCurrency(1440, 'tn'), '1,440 DT');
  // Europe has format prefix: €1,080
  assert.equal(formatCurrency(1080, 'eu'), '€1,080');
  // International has format prefix: $1,160
  assert.equal(formatCurrency(1160, 'int'), '$1,160');
});

test('roundPriceToMarketIncrement rounds appropriately per market convention', () => {
  // Tunisia rounds to nearest 10 DT
  assert.equal(roundPriceToMarketIncrement(1234, 'tn'), 1230);
  assert.equal(roundPriceToMarketIncrement(1237, 'tn'), 1240);

  // Algeria rounds to nearest 500 DZD
  assert.equal(roundPriceToMarketIncrement(23200, 'dz'), 23000);
  assert.equal(roundPriceToMarketIncrement(23350, 'dz'), 23500);

  // Libya rounds to nearest 10 LYD
  assert.equal(roundPriceToMarketIncrement(556, 'ly'), 560);

  // Europe, Canada, International round to nearest 5
  assert.equal(roundPriceToMarketIncrement(782, 'eu'), 780);
  assert.equal(roundPriceToMarketIncrement(783, 'int'), 785);
});

test('applyPriceAdjustment computes percentage and fixed adjustments correctly', () => {
  const baseRecord = {
    marketId: 'int' as const,
    currency: 'USD',
    priceType: 'fixed' as const,
    amount: 1000,
    billingInterval: 'one_time' as const,
    isPublished: true,
  };

  // -20% adjustment
  const reduced = applyPriceAdjustment(baseRecord, {
    type: 'percent_decrease',
    value: 20,
    marketScope: 'int',
  });
  assert.equal(reduced.amount, 800);

  // +$15 fixed adjustment
  const increased = applyPriceAdjustment(baseRecord, {
    type: 'fixed_add',
    value: 15,
    marketScope: 'int',
  });
  assert.equal(increased.amount, 1015);
});

test('renderPriceRecord handles quote, range, starting_at and fixed', () => {
  const quoteRec = { marketId: 'tn' as const, currency: 'TND', priceType: 'quote' as const, billingInterval: 'one_time' as const, isPublished: true };
  assert.equal(renderPriceRecord(quoteRec, 'tn').display, 'Request a quote');

  const fixedRec = { marketId: 'eu' as const, currency: 'EUR', priceType: 'fixed' as const, amount: 680, billingInterval: 'one_time' as const, isPublished: true };
  assert.equal(renderPriceRecord(fixedRec, 'eu').display, '€680');

  const monthlyRec = { marketId: 'eu' as const, currency: 'EUR', priceType: 'monthly' as const, amount: 520, billingInterval: 'monthly' as const, isPublished: true };
  assert.equal(renderPriceRecord(monthlyRec, 'eu').display, '€520 / mo');

  const startingRec = { marketId: 'int' as const, currency: 'USD', priceType: 'starting_at' as const, amount: 1680, billingInterval: 'project' as const, isPublished: true };
  assert.equal(renderPriceRecord(startingRec, 'int').display, 'From $1,680');
});

test('calculateSelection handles multi-service bundle discount with 20% reduced catalog', () => {
  const brandServices = INITIAL_DEPARTMENTS[0].services;
  const service1 = brandServices[0]; // Brand Positioning ($760 int)
  const service2 = brandServices[1]; // Brand Identity ($1160 int)

  const result = calculateSelection(
    [service1, service2],
    null,
    'int',
    [],
    INITIAL_MULTI_SERVICE_RULE // 2+ services = 10% discount
  );

  // Subtotal = 760 + 1160 = 1920
  assert.equal(result.oneTimeSubtotal, 1920);
  assert.equal(result.oneTimeDiscount, 192); // 10% of 1920
  assert.equal(result.oneTimeTotal, 1728);
  assert.equal(result.appliedDiscounts.length, 1);
});

test('calculateSelection prevents double charging when service is already inside selected package', () => {
  const pkg = INITIAL_PACKAGES.find((p) => p.id === 'brand-foundation')!;
  // Brand Foundation includes 'logo-design' and 'visual-identity-assets'
  const logoService = INITIAL_DEPARTMENTS[0].services.find((s) => s.id === 'logo-design')!;
  const independentService = INITIAL_DEPARTMENTS[0].services.find((s) => s.id === 'brand-positioning')!;

  const result = calculateSelection(
    [logoService, independentService],
    pkg,
    'eu',
    [],
    INITIAL_MULTI_SERVICE_RULE
  );

  // Logo design should be detected as duplicate and not charged on top of package
  assert.deepEqual(result.duplicateServiceIds, ['logo-design']);
  // Package price for eu: 780 EUR. Independent service brand-positioning: 680 EUR. Total: 1460 EUR.
  assert.equal(result.oneTimeSubtotal, 780 + 680);
});

test('calculateSelection applies active promotion on package', () => {
  const pkg = INITIAL_PACKAGES.find((p) => p.id === 'brand-foundation')!;
  const promo = INITIAL_PROMOTIONS[0]; // 15% off brand-foundation

  const result = calculateSelection(
    [],
    pkg,
    'int',
    [promo],
    INITIAL_MULTI_SERVICE_RULE
  );

  // Package amount for int is $920
  // 15% of 920 is 138
  assert.equal(result.oneTimeSubtotal, 920);
  assert.equal(result.oneTimeDiscount, 138);
  assert.equal(result.oneTimeTotal, 782);
  assert.equal(result.appliedDiscounts[0].type, 'package_promo');
});
