/**
 * New Habit Page
 * Phase 2 Chunk 3 - Habits MVP
 *
 * Page for creating a new habit using the HabitForm component.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, APIError } from '@/lib/api';
import { HabitForm } from '@/components/habits/HabitForm';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
}

export default function NewHabitPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.me() as { user: User };
        setUser(response.user);
      } catch (err) {
        if (err instanceof APIError && err.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notebook-ink-blue"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm font-patrick-hand text-notebook-ink-light" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="hover:text-notebook-ink-blue transition-colors">Dashboard</Link>
          </li>
          <li>
            <span className="mx-2 text-notebook-line">/</span>
          </li>
          <li>
            <Link href="/habits" className="hover:text-notebook-ink-blue transition-colors">Habits</Link>
          </li>
          <li>
            <span className="mx-2 text-notebook-line">/</span>
          </li>
          <li className="text-notebook-ink font-bold">New Habit</li>
        </ol>
      </nav>

      <header className="mb-10">
        <h1 className="text-5xl font-caveat text-notebook-ink tracking-tight">Build a New Habit</h1>
        <p className="mt-3 text-lg font-inter text-notebook-ink-medium italic max-w-2xl">
          &ldquo;Your habits are how you embody your identity.&rdquo; &mdash; James Clear
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <HabitForm userId={user.id} />
        </div>

        <div className="space-y-8">
          <section className="bg-notebook-highlight-yellow/30 p-6 rounded-2xl border border-notebook-highlight-yellow/50">
            <h2 className="text-lg font-caveat text-notebook-ink mb-4 flex items-center gap-2">
              <span>💡</span> The 4 Laws
            </h2>
            <ul className="space-y-4 text-sm font-inter">
              <li>
                <strong className="text-notebook-ink block mb-0.5">1. Make It Obvious</strong>
                <p className="text-notebook-ink-medium">Use Habit Stacking to link this to something you already do.</p>
              </li>
              <li>
                <strong className="text-notebook-ink block mb-0.5">2. Make It Attractive</strong>
                <p className="text-notebook-ink-medium">Write your Identity Statement to focus on who you are becoming.</p>
              </li>
              <li>
                <strong className="text-notebook-ink block mb-0.5">3. Make It Easy</strong>
                <p className="text-notebook-ink-medium">Start with a version that takes less than 2 minutes.</p>
              </li>
              <li>
                <strong className="text-notebook-ink block mb-0.5">4. Make It Satisfying</strong>
                <p className="text-notebook-ink-medium">Track your progress and build a streak (coming soon!).</p>
              </li>
            </ul>
          </section>

          <section className="bg-notebook-paper-alt p-6 rounded-2xl border border-notebook-line">
            <h2 className="text-sm font-patrick-hand text-notebook-ink-light uppercase tracking-wider mb-4">Pro Tip</h2>
            <p className="text-sm font-inter text-notebook-ink-medium leading-relaxed italic">
              &ldquo;Focus on the trajectory, not the current results. If you are a person who goes to the gym, you will eventually be a fit person.&rdquo;
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
