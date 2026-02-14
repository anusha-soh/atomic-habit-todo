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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm text-gray-500 font-medium" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          </li>
          <li>
            <span className="mx-2 text-gray-300">/</span>
          </li>
          <li>
            <Link href="/habits" className="hover:text-blue-600">Habits</Link>
          </li>
          <li>
            <span className="mx-2 text-gray-300">/</span>
          </li>
          <li className="text-gray-900 font-bold">New Habit</li>
        </ol>
      </nav>

      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Build a New Habit</h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl">
          "Your habits are how you embody your identity." — James Clear
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <HabitForm userId={user.id} />
        </div>

        <div className="space-y-8">
          <section className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <h2 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
              <span>💡</span> The 4 Laws
            </h2>
            <ul className="space-y-4 text-sm">
              <li>
                <strong className="text-orange-800 block mb-0.5">1. Make It Obvious</strong>
                <p className="text-orange-700 opacity-80">Use Habit Stacking to link this to something you already do.</p>
              </li>
              <li>
                <strong className="text-orange-800 block mb-0.5">2. Make It Attractive</strong>
                <p className="text-orange-700 opacity-80">Write your Identity Statement to focus on who you are becoming.</p>
              </li>
              <li>
                <strong className="text-orange-800 block mb-0.5">3. Make It Easy</strong>
                <p className="text-orange-700 opacity-80">Start with a version that takes less than 2 minutes.</p>
              </li>
              <li>
                <strong className="text-orange-800 block mb-0.5">4. Make It Satisfying</strong>
                <p className="text-orange-700 opacity-80">Track your progress and build a streak (coming soon!).</p>
              </li>
            </ul>
          </section>

          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Pro Tip</h2>
            <p className="text-sm text-gray-600 leading-relaxed italic">
              "Focus on the trajectory, not the current results. If you are a person who goes to the gym, you will eventually be a fit person."
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
