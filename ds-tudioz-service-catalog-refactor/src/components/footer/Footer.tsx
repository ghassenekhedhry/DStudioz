import React from 'react';
import { Logo } from '../brand/Logo';
import { useStudio } from '../../context/StudioContext';
import { MARKETS } from '../../data/initialData';
import { buildWhatsAppGeneralUrl } from '../../lib/whatsapp';
import { Globe, Lock, Shield, Mail, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { market, setIsMarketModalOpen, setIsAdminOpen, settings } = useStudio();
  const currentMarket = MARKETS[market] || MARKETS.int;
  const waUrl = buildWhatsAppGeneralUrl(settings.whatsappNumber, market);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#E3E1DA] bg-[#18191B] text-[#EFEEE8] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#252629]">
          {/* Col 1 & 2: Brand & Ethos */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="full" theme="dark" size="md" />
            <p className="text-xs sm:text-sm text-[#A0A19B] max-w-sm leading-relaxed">
              DStudioz is an independent digital solutions studio bringing creative, digital and technical expertise together to help your business move forward.
            </p>
            <div className="text-xs text-[#74756F]">
              Studio focus: <span className="text-white">"{settings.footerTagline || 'From your brand identity to your digital systems, we help turn your needs into coordinated, practical solutions.'}"</span>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DDF278] mb-4">
              Explore
            </div>
            <ul className="space-y-2.5 text-xs text-[#A0A19B]">
              <li>
                <button
                  onClick={() => scrollTo('services')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  8 Service Departments
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('packs')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Ready-Made Packs
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('problems')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Problems We Solve
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('process')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How We Work
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Our Studio
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Regional Markets */}
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DDF278] mb-4">
              Regional Markets
            </div>
            <ul className="space-y-2 text-xs text-[#A0A19B]">
              {(Object.keys(MARKETS) as (keyof typeof MARKETS)[]).map((mKey) => (
                <li key={mKey}>
                  <button
                    onClick={() => {
                      setIsMarketModalOpen(true);
                    }}
                    className={`inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer ${
                      market === mKey ? 'text-white font-semibold' : ''
                    }`}
                  >
                    <span>{MARKETS[mKey].flag}</span>
                    <span>
                      {MARKETS[mKey].name} ({MARKETS[mKey].currency})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Direct Contact */}
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DDF278] mb-4">
              Direct Contact
            </div>
            <div className="space-y-3 text-xs text-[#A0A19B]">
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white hover:text-[#25D366] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Chat</span>
                </a>
              )}
              <a
                href={`mailto:${settings.studioEmail}`}
                className="flex items-center gap-2 text-white hover:text-[#FF573D] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#FF573D]" />
                <span>{settings.studioEmail}</span>
              </a>
              <div className="pt-2 text-[11px] text-[#74756F]">
                Remote collaboration with clients internationally.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#74756F]">
          <div>
            © {new Date().getFullYear()} DStudioz • Digital Solutionz Studio. Independent Multidisciplinary Team.
          </div>

          <div className="flex items-center gap-4">
            {/* Market Picker Trigger */}
            <button
              onClick={() => setIsMarketModalOpen(true)}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>
                Region: {currentMarket.name} ({currentMarket.currency})
              </span>
            </button>

            <span>•</span>

            {/* Cookie & Region Consent Trigger */}
            <button
              onClick={() => setIsMarketModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Region Consent Settings
            </button>

            <span>•</span>

            {/* Admin Portal */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[#A0A19B]"
              title="Admin Access"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
