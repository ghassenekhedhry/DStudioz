import { MarketId, ServiceItem, PackageOffer } from '../types';
import { MARKETS } from '../data/initialData';

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export function buildWhatsAppServiceUrl(
  whatsappNumber: string,
  service: ServiceItem,
  marketId: MarketId
): string | null {
  const clean = cleanPhoneNumber(whatsappNumber);
  if (!clean) return null;

  const marketName = MARKETS[marketId]?.name || 'International';
  const text = `Hello DStudioz, I am interested in ${service.title}. Could you explain the available options and pricing for ${marketName}?`;

  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppPackageUrl(
  whatsappNumber: string,
  pkg: PackageOffer,
  marketId: MarketId
): string | null {
  const clean = cleanPhoneNumber(whatsappNumber);
  if (!clean) return null;

  const marketName = MARKETS[marketId]?.name || 'International';
  const text = `Hello DStudioz, I am interested in the ${pkg.name} package for my business (${marketName} market). I would like to discuss the scope and availability.`;

  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppMultiServiceUrl(
  whatsappNumber: string,
  services: ServiceItem[],
  marketId: MarketId
): string | null {
  const clean = cleanPhoneNumber(whatsappNumber);
  if (!clean) return null;

  const marketName = MARKETS[marketId]?.name || 'International';
  const serviceNames = services.map((s) => s.title).join(', ');
  const text = `Hello DStudioz, I am interested in the following services: ${serviceNames}. Could you provide details on timelines and bundled pricing for ${marketName}?`;

  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppGeneralUrl(
  whatsappNumber: string,
  marketId: MarketId
): string | null {
  const clean = cleanPhoneNumber(whatsappNumber);
  if (!clean) return null;

  const marketName = MARKETS[marketId]?.name || 'International';
  const text = `Hello DStudioz, I would like to discuss a digital project for my business (${marketName} region).`;

  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}
