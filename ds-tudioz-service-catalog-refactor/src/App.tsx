import React from 'react';
import { StudioProvider } from './context/StudioContext';
import { Header } from './components/navigation/Header';
import { MarketSelectorModal } from './components/navigation/MarketSelectorModal';
import { Hero } from './components/hero/Hero';
import { ProblemsCarousel } from './components/problems/ProblemsCarousel';
import { ServiceExplorer } from './components/services/ServiceExplorer';
import { PacksSection } from './components/packs/PacksSection';
import { HowWeWork } from './components/sections/HowWeWork';
import { AboutSection } from './components/sections/AboutSection';
import { Footer } from './components/footer/Footer';
import { FloatingSelectionBar } from './components/selection/FloatingSelectionBar';
import { SelectionDrawer } from './components/selection/SelectionDrawer';
import { PromotionBanner } from './components/promotions/PromotionBanner';
import { BookingModal } from './components/booking/BookingModal';
import { PackageCheckoutModal } from './components/checkout/PackageCheckoutModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  return (
    <StudioProvider>
      <div className="min-h-screen flex flex-col bg-[#F7F4ED] text-[#18191B] selection:bg-[#FF573D] selection:text-white relative">
        {/* Navigation Header */}
        <Header />

        {/* Main Content Area with 4 Clear Entry Points */}
        <main className="flex-1">
          {/* Hero Section */}
          <Hero />

          {/* Entry 03: Human-Centered Problems Carousel */}
          <ProblemsCarousel />

          {/* Entry 01: Expandable 8-Department Service Explorer */}
          <ServiceExplorer />

          {/* Entry 02: Ready-Made Packs & Bundles */}
          <PacksSection />

          {/* How We Work: 4-Step Process */}
          <HowWeWork />

          {/* About DStudioz: Independent Brother-Led Multidisciplinary Team */}
          <AboutSection />
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Floating Real-Time Selection Bar */}
        <FloatingSelectionBar />

        {/* Interactive Modals & Drawers */}
        <MarketSelectorModal />
        <SelectionDrawer />
        <PromotionBanner />
        <BookingModal />
        <PackageCheckoutModal />
        <AdminDashboard />
      </div>
    </StudioProvider>
  );
}
