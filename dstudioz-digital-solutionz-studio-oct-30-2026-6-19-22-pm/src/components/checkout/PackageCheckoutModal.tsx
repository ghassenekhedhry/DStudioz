import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { getPackagePrice, renderPriceRecord } from '../../lib/pricingEngine';
import { MARKETS } from '../../data/initialData';
import {
  CreditCard,
  Building,
  CheckCircle2,
  X,
  AlertCircle,
  Copy,
  Check,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const PackageCheckoutModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    closeCheckoutModal,
    checkoutPackage,
    market,
    promotions,
    paymentProviders,
    addInquiry,
  } = useStudio();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrderRef, setConfirmedOrderRef] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isCheckoutModalOpen || !checkoutPackage) return null;

  const currentMarket = MARKETS[market] || MARKETS.int;
  const priceRecord = getPackagePrice(checkoutPackage, market);
  const priceDisplay = renderPriceRecord(priceRecord, market);

  // Check eligible promo
  const activePromo = promotions.find(
    (p) =>
      p.isEnabled &&
      p.targetPackageIds.includes(checkoutPackage.id) &&
      p.eligibleMarkets.includes(market)
  );

  const rawAmount = priceRecord.amount || 0;
  const discountAmount = activePromo
    ? activePromo.discountType === 'percentage'
      ? Math.round((rawAmount * activePromo.discountValue) / 100)
      : Math.min(rawAmount, activePromo.discountValue)
    : 0;
  const finalAmount = Math.max(0, rawAmount - discountAmount);

  // Available methods for current market
  const availableProviders = paymentProviders.filter(
    (p) => p.isEnabled && p.eligibleMarkets.includes(market)
  );

  const bankProvider = paymentProviders.find((p) => p.id === 'bank_transfer');

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProcessOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim()) {
      setErrorMsg('Please enter your name and contact email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const isBank = selectedMethod === 'bank_transfer';
      const order = addInquiry({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim() || undefined,
        type: 'package_order',
        marketId: market,
        selectedPackageId: checkoutPackage.id,
        selectedServiceIds: checkoutPackage.includedServiceIds,
        quotedAmount: {
          amount: finalAmount,
          currency: currentMarket.currency,
          isRecurring: checkoutPackage.billingType === 'monthly',
        },
        paymentMethod: selectedMethod,
        status: isBank ? 'pending' : 'pending',
        notes: `Selected Payment Method: ${selectedMethod}. Promo: ${
          activePromo ? activePromo.headline : 'None'
        }`,
      });

      setConfirmedOrderRef(order.referenceNumber);
    } catch {
      setErrorMsg('Failed to process order request. Please reach out via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white border border-[#E3E1DA] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={closeCheckoutModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#74756F] hover:text-[#18191B] hover:bg-[#EFEEE8] transition-colors"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedOrderRef ? (
          /* Order Confirmation View */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#DDF278]/40 border border-[#DDF278] text-[#18191B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[#18191B]" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FF573D]">
                Order Reference: {confirmedOrderRef}
              </span>
              <h2 className="font-display text-2xl font-bold text-[#18191B] mt-1">
                Pack Order Initiated
              </h2>
              <p className="text-xs sm:text-sm text-[#74756F] mt-1.5 max-w-md mx-auto">
                Your order for <strong>{checkoutPackage.name}</strong> has been registered.
              </p>
            </div>

            {/* Bank Transfer Instructions If Bank Chosen */}
            {selectedMethod === 'bank_transfer' && bankProvider?.bankDetails && (
              <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="font-bold text-[#18191B] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#FF573D]" />
                  <span>Bank Wire Instructions</span>
                </div>
                <p className="text-[11px] text-[#74756F]">
                  Please transfer the total of{' '}
                  <strong className="text-[#18191B]">
                    {finalAmount.toLocaleString()} {currentMarket.currency}
                  </strong>{' '}
                  and mention reference <strong className="font-mono">{confirmedOrderRef}</strong>.
                </p>

                <div className="p-3 bg-white rounded-xl border border-[#E3E1DA] space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#74756F]">Bank:</span>
                    <span className="font-semibold text-[#18191B]">{bankProvider.bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#74756F]">Account Name:</span>
                    <span className="font-semibold text-[#18191B]">{bankProvider.bankDetails.accountName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#74756F]">RIB / IBAN:</span>
                    <button
                      onClick={() => handleCopy(bankProvider.bankDetails!.ribIban, 'iban')}
                      className="inline-flex items-center gap-1 text-[#FF573D] hover:underline cursor-pointer"
                    >
                      <span>{bankProvider.bankDetails.ribIban}</span>
                      {copiedField === 'iban' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-[#74756F] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#74756F]" />
                  <span>Orders are marked as paid once confirmed by our administration.</span>
                </div>
              </div>
            )}

            <button
              onClick={closeCheckoutModal}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[#18191B] text-white text-xs font-semibold hover:bg-[#252629]"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form & Summary */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F7F4ED] border border-[#E3E1DA] flex items-center justify-center text-[#FF573D]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 id="checkout-modal-title" className="font-display text-xl sm:text-2xl font-bold text-[#18191B]">
                  Order {checkoutPackage.name}
                </h2>
                <p className="text-xs text-[#74756F]">
                  Review your defined scope and select your approved payment method.
                </p>
              </div>
            </div>

            {/* Price & Deliverables Summary */}
            <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] mb-5 space-y-2 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-[#18191B]">{checkoutPackage.name}</span>
                <span className="font-display text-base font-bold text-[#18191B]">
                  {priceDisplay.display}
                </span>
              </div>

              {activePromo && (
                <div className="flex justify-between text-[#FF573D] font-medium pt-1 border-t border-[#E3E1DA]">
                  <span>{activePromo.headline}</span>
                  <span>
                    -{currentMarket.symbol}
                    {discountAmount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-[#E3E1DA] flex justify-between font-bold text-sm text-[#18191B]">
                <span>Total Due</span>
                <span className="font-mono">
                  {currentMarket.symbol}
                  {finalAmount.toLocaleString()} {currentMarket.currency}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleProcessOrder} className="space-y-4">
              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="checkout-name" className="block text-xs font-medium text-[#18191B] mb-1">
                    Your Name *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Karim Trabelsi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E1DA] text-xs sm:text-sm text-[#18191B] focus:border-[#FF573D] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-email" className="block text-xs font-medium text-[#18191B] mb-1">
                    Email Address *
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="karim@enterprise.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E1DA] text-xs sm:text-sm text-[#18191B] focus:border-[#FF573D] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-medium text-[#18191B] mb-2">
                  Payment Method for {currentMarket.name}
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('bank_transfer')}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedMethod === 'bank_transfer'
                        ? 'border-[#FF573D] bg-[#F7F4ED] ring-1 ring-[#FF573D]'
                        : 'border-[#E3E1DA] bg-white hover:bg-[#F7F4ED]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#E3E1DA] flex items-center justify-center text-[#18191B]">
                        <Building className="w-4 h-4 text-[#FF573D]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#18191B]">
                          Manual Bank Wire / Virement Bancaire
                        </div>
                        <div className="text-[11px] text-[#74756F]">
                          Official bank details provided upon order confirmation
                        </div>
                      </div>
                    </div>
                    {selectedMethod === 'bank_transfer' && (
                      <Check className="w-4 h-4 text-[#FF573D]" />
                    )}
                  </button>

                  {/* Online providers status */}
                  <div className="p-3 rounded-xl bg-[#EFEEE8] text-[11px] text-[#74756F] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#74756F] flex-shrink-0" />
                    <span>
                      Live online gateway integrations (Stripe / Konnect) are currently in test-mode verification. Wire transfer is the active verified settlement method.
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#18191B] text-white text-xs sm:text-sm font-semibold hover:bg-[#252629] active:translate-y-0.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Confirming Order...' : 'Confirm Order & View Wire Details'}</span>
                  <ArrowRight className="w-4 h-4 text-[#DDF278]" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
