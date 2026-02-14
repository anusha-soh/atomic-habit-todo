/**
 * Edit Habit Page
 * Phase 2 Chunk 3 - Habits MVP
 *
 * Page for editing an existing habit.
 */
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, APIError } from '@/lib/api';
import { getHabit } from '@/lib/habits-api';
import { Habit } from '@/types/habit';
import { HabitForm } from '@/components/habits/HabitForm';
import { useToast } from '@/lib/toast-context';
import Link from 'next/link';

export default function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResponse = await authAPI.me() as { user: any };
        setUser(authResponse.user);

        const habitResponse = await getHabit(authResponse.user.id, id);
        setHabit(habitResponse);
      } catch (err) {
        if (err instanceof APIError && err.status === 401) {
          router.push('/login');
        } else {
          showToast('Failed to load habit details', 'error');
          router.push('/habits');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router, showToast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notebook-ink-blue"></div>
      </div>
    );
  }

  if (!habit || !user) return null;

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
          <li>
            <Link href={`/habits/${habit.id}`} className="hover:text-notebook-ink-blue transition-colors">Habit Detail</Link>
          </li>
          <li>
            <span className="mx-2 text-notebook-line">/</span>
          </li>
          <li className="text-notebook-ink font-bold">Edit</li>
        </ol>
      </nav>

      <header className="mb-10">
        <h1 className="text-5xl font-caveat text-notebook-ink tracking-tight">Edit Habit</h1>
        <p className="mt-3 text-lg font-inter text-notebook-ink-medium">
          Refine your identity and adjust your starter version.
        </p>
      </header>

      <div className="max-w-2xl">
        <HabitForm
          userId={user.id}
          habitId={habit.id}
          initialData={habit}
        />
      </div>
    </div>
  );
}
