import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { buildWhatsAppGeneralUrl } from '../../lib/whatsapp';
import { Calendar, Clock, Video, CheckCircle2, X, MessageCircle, AlertCircle } from 'lucide-react';

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    bookingPreload,
    departments,
    packages,
    market,
    addInquiry,
    settings,
  } = useStudio();

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [purpose, setPurpose] = useState(bookingPreload?.purpose || 'General Project Consultation');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('14:00 - 14:45 GMT+1');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isBookingModalOpen) return null;

  // Selected item title if preloaded
  const preloadedService = bookingPreload?.serviceId
    ? departments.flatMap((d) => d.services).find((s) => s.id === bookingPreload.serviceId)
    : null;

  const preloadedPackage = bookingPreload?.packageId
    ? packages.find((p) => p.id === bookingPreload.packageId)
    : null;

  const availableTimeSlots = [
    '10:00 - 10:45 GMT+1',
    '11:30 - 12:15 GMT+1',
    '14:00 - 14:45 GMT+1',
    '16:00 - 16:45 GMT+1',
    '18:00 - 18:45 GMT+1',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !date) {
      setErrorMsg('Please provide your name, email, and preferred date.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const meetLink = `https://meet.google.com/dsz-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

      const newInquiry = addInquiry({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim() || undefined,
        type: 'booking',
        marketId: market,
        selectedServiceIds: bookingPreload?.serviceId ? [bookingPreload.serviceId] : [],
        selectedPackageId: bookingPreload?.packageId,
        meetingDetails: {
          date,
          timeSlot,
          purpose: purpose.trim() || (preloadedPackage ? preloadedPackage.name : preloadedService ? preloadedService.title : 'Project Consultation'),
          meetLink,
        },
        notes: notes.trim() || undefined,
        status: 'pending',
      });

      setSubmittedRef(newInquiry.referenceNumber);
    } catch {
      setErrorMsg('Could not register meeting. Please message us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    closeBookingModal();
  };

  const waFallbackUrl = buildWhatsAppGeneralUrl(settings.whatsappNumber, market);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white border border-[#E3E1DA] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#74756F] hover:text-[#18191B] hover:bg-[#EFEEE8] transition-colors"
          aria-label="Close booking modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedRef ? (
          /* Confirmation State */
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#DDF278]/40 border border-[#DDF278] text-[#18191B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[#18191B]" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FF573D]">
                Meeting Scheduled
              </span>
              <h2 className="font-display text-2xl font-bold text-[#18191B] mt-1">
                We're looking forward to talking!
              </h2>
              <p className="text-xs sm:text-sm text-[#74756F] mt-2 max-w-sm mx-auto">
                A calendar invitation with a Google Meet session has been prepared. Your reference is{' '}
                <strong className="text-[#18191B] font-mono">{submittedRef}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#E3E1DA] text-left text-xs space-y-1.5 max-w-sm mx-auto">
              <div className="flex items-center gap-2 text-[#18191B] font-medium">
                <Calendar className="w-4 h-4 text-[#FF573D]" />
                <span>Date: {date} ({timeSlot})</span>
              </div>
              <div className="flex items-center gap-2 text-[#74756F]">
                <Video className="w-4 h-4 text-[#74756F]" />
                <span>Format: Google Meet (Video Call)</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-2 max-w-sm mx-auto">
              {waFallbackUrl && (
                <a
                  href={waFallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E3E1DA] text-[#18191B] text-xs font-semibold hover:bg-[#EFEEE8]"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Confirm / Message on WhatsApp</span>
                </a>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-[#18191B] text-white text-xs font-semibold hover:bg-[#252629]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#F7F4ED] border border-[#E3E1DA] flex items-center justify-center text-[#FF573D]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 id="booking-modal-title" className="font-display text-xl sm:text-2xl font-bold text-[#18191B]">
                  Schedule a Video Call
                </h2>
                <p className="text-xs text-[#74756F]">
                  Discuss scope, timelines, or ask technical questions directly with the team.
                </p>
              </div>
            </div>

            {/* Preload Context Banner */}
            {(preloadedService || preloadedPackage) && (
              <div className="my-4 p-3 rounded-xl bg-[#F7F4ED] border border-[#E3E1DA] flex items-center justify-between text-xs">
                <span className="text-[#74756F]">Topic:</span>
                <span className="font-semibold text-[#18191B]">
                  {preloadedPackage ? preloadedPackage.name : preloadedService?.title}
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="my-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="booking-name" className="block text-xs font-medium text-[#18191B] mb-1">
                    Your Name *
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E1DA] text-xs sm:text-sm text-[#18191B] focus:border-[#FF573D] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="booking-email" className="block text-xs font-medium text-[#18191B] mb-1">
                    Email Address *
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="maya@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E1DA] text-xs sm:text-sm text-[#18191B] focus:border-[#FF573D] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Phone or WhatsApp */}
              <div>
                <label htmlFor="booking-phone" className="block text-xs font-medium text-[#18191B] mb-1">
                  WhatsApp or Phone (Optional)
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E1DA] text-xs sm:text-sm text-[#18191B] focus:border-[#FF573D] focus:outline-hidden"
                />
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="booking-date" className="block text-xs font-medium text-[#18191B] mb-1">
                    Preferred Date *
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E1DA] text-xs sm:text-sm text-[#18191B] focus:border-[#FF573D] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="booking-timeslot" className="block text-xs font-medium text-[#18191B] mb-1">
                    Available Time Slot *
                  </label>
                  <select
                    id="booking-timeslot"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E1DA] text-xs sm:text-sm text-[#18191B] focus:border-[#FF573D] focus:outline-hidden bg-white"
                  >
                    {availableTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note */}
              <div>
                <label htmlFor="booking-notes" className="block text-xs font-medium text-[#18191B] mb-1">
                  Project Notes or Questions (Optional)
                </label>
                <textarea
                  id="booking-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share any background on your business or target launch date..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E3E1DA] text-xs sm:text-sm text-[#18191B] focus:border-[#FF573D] focus:outline-hidden resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#18191B] text-white text-xs sm:text-sm font-semibold hover:bg-[#252629] active:translate-y-0.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-[#DDF278]" />
                  <span>{isSubmitting ? 'Scheduling Meeting...' : 'Confirm Call & Get Google Meet Link'}</span>
                </button>
              </div>

              {/* Alternative: Direct WhatsApp */}
              <div className="text-center pt-2">
                <span className="text-[11px] text-[#74756F]">
                  Prefer async messaging?{' '}
                  {waFallbackUrl && (
                    <a
                      href={waFallbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#18191B] font-semibold underline hover:text-[#FF573D]"
                    >
                      Chat directly on WhatsApp
                    </a>
                  )}
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
