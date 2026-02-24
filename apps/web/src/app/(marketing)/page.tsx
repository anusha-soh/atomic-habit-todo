/**
 * Landing Page — Cozy Notebook aesthetic
 * Scroll sequence: Hero → Features → Testimonials → Final CTA → Footer
 * Route Group: (marketing) — no app Navbar shown here.
 */
import type { Metadata } from 'next';
import { NotebookNav } from '@/components/marketing/notebook-nav';
import { Hero } from '@/components/marketing/hero';
import { Features } from '@/components/marketing/features';
import { Testimonials } from '@/components/marketing/testimonials';
import { FinalCta } from '@/components/marketing/final-cta';
import { Footer } from '@/components/marketing/footer';

export const metadata: Metadata = {
  title: 'Atomic Habits — Build Better Habits, One Day at a Time',
  description:
    'A cozy notebook-inspired app for building lasting habits and tracking your daily tasks. Turn tiny actions into life-changing results — no spreadsheet required.',
  openGraph: {
    title: 'Atomic Habits — Build Better Habits, One Day at a Time',
    description:
      'A cozy notebook-inspired app for building lasting habits and tracking your daily tasks.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <>
      <NotebookNav />
      <Hero />
      <Features />
      <Testimonials />
      <FinalCta />
      <Footer />
    </>
  );
}
