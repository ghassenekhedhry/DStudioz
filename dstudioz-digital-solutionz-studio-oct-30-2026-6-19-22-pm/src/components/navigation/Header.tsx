import React, { useState } from 'react';
import { Logo } from '../brand/Logo';
import { useStudio } from '../../context/StudioContext';
import { MARKETS } from '../../data/initialData';
import { Globe, ArrowUpRight, Menu, X, Shield, Lock } from 'lucide-react';

export const Header: React.FC = () => {
  const { market, setIsMarketModalOpen, openBookingModal, setIsAdminOpen } = useStudio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentMarket = MARKETS[market] || MARKETS.int;

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Packs', href: '#packs' },
    { label: 'Problems We Solve', href: '#problems' },
    { label: 'How We Work', href: '#process' },
    { label: 'About', href: '#about' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E3E1DA] bg-[#F7F4ED]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <a
          href="#"
          className="flex items-center gap-3 focus:outline-hidden focus:ring-2 focus:ring-[#FF573D] rounded-lg p-1"
          aria-label="DStudioz Homepage"
        >
          <Logo variant="full" size="md" />
        </a>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#252629]">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-[#252629] hover:text-[#FF573D] transition-colors cursor-pointer py-1 text-sm font-medium tracking-tight"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Market & Currency Button */}
          <button
            onClick={() => setIsMarketModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-[#E3E1DA] bg-white hover:bg-[#EFEEE8] text-xs font-medium text-[#18191B] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#FF573D]"
            aria-label={`Current market: ${currentMarket.name}, Currency: ${currentMarket.currency}. Click to switch region.`}
          >
            <span className="text-sm sm:text-base leading-none">{currentMarket.flag}</span>
            <span className="hidden md:inline font-mono font-semibold">{currentMarket.currency}</span>
            <Globe className="w-3.5 h-3.5 text-[#74756F]" />
          </button>

          {/* Admin Lock Button (desktop) */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="hidden sm:flex p-2 rounded-xl border border-[#E3E1DA] bg-white hover:bg-[#EFEEE8] text-[#74756F] hover:text-[#18191B] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#FF573D]"
            title="Studio Admin Portal"
            aria-label="Open Studio Admin Portal"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Primary Let's Talk CTA */}
          <button
            onClick={() => openBookingModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-[#FF573D] text-white text-xs sm:text-sm font-semibold tracking-tight shadow-xs hover:bg-[#E0472F] active:translate-y-0.5 transition-all focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#FF573D]"
          >
            <span>Let's Talk</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#18191B] hover:bg-[#EFEEE8] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#FF573D]"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E3E1DA] bg-white px-5 py-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-left text-base font-medium text-[#18191B] hover:text-[#FF573D] py-2 border-b border-[#EFEEE8]"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#74756F]">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#FF573D]" />
              Independent Digital Studio
            </span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAdminOpen(true);
              }}
              className="text-[#18191B] underline font-medium"
            >
              Admin Access
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
