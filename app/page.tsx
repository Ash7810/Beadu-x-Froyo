"use client";

import { Header } from "@/components/ecom/Header";
import { HeroSection } from "@/components/ecom/HeroSection";
import { CategoryMarquee } from "@/components/ecom/CategoryMarquee";
import { FeaturedSection } from "@/components/ecom/FeaturedSection";
import { MaterialShowcase } from "@/components/ecom/MaterialShowcase";
import { CustomerReviews } from "@/components/ecom/CustomerReviews";
import { ContactForm } from "@/components/ecom/ContactForm";
import { Footer } from "@/components/ecom/Footer";
import { BottomNavigation } from "@/components/ecom/BottomNavigation";
import { Toast } from "@/components/ecom/Toast";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <Header />

      <main className="flex-1">
        {/* Wavy Frame Hero Section */}
        <HeroSection />

        {/* Category Marquee Carousel */}
        <CategoryMarquee />

        {/* Featured Best Sellers & New Arrivals */}
        <FeaturedSection />

        {/* Eco & Natural Materials Showcase */}
        <MaterialShowcase />

        {/* Customer Reviews */}
        <CustomerReviews />

        {/* Contact & Inquiry Terminal */}
        <ContactForm />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavigation />

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
}
