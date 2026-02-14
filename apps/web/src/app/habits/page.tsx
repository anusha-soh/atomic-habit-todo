/**
 * Habits List Page
 * Phase 2 Chunk 3 - Habits MVP
 *
 * Page displaying all habits for the authenticated user with filtering.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI, APIError } from '@/lib/api';
import { getHabits } from '@/lib/habits-api';
import { Habit, HabitCategory, HabitStatus } from '@/types/habit';
import { HabitCard } from '@/components/habits/HabitCard';
import { CategoryFilter } from '@/components/habits/CategoryFilter';
import { StatusFilter } from '@/components/habits/StatusFilter';

interface User {
  id: string;
  email: string;
}

export default function HabitsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchingHabits, setFetchingHabits] = useState(false);
  
  // Filters
  const [category, setCategory] = useState<string | null>(null);
  const [status, setStatus] = useState<HabitStatus | 'all'>(HabitStatus.ACTIVE);

  // Auth check
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

  // Fetch habits when filters change
  useEffect(() => {
    if (!user) return;

    const fetchHabits = async () => {
      setFetchingHabits(true);
      try {
        const response = await getHabits(user.id, {
          category: category as HabitCategory || undefined,
          status: status === 'all' ? undefined : status,
          include_archived: status === 'all' || status === HabitStatus.ARCHIVED,
          limit: 100
        });
        setHabits(response.habits);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to fetch habits:', error);
      } finally {
        setFetchingHabits(false);
      }
    };

    fetchHabits();
  }, [user, category, status]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Your Habits</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            "Every action you take is a vote for the type of person you wish to become."
          </p>
        </div>
        <Link 
          href="/habits/new"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95 gap-2"
        >
          <span className="text-xl">+</span>
          <span>New Habit</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CategoryFilter selectedCategory={category} onChange={setCategory} />
          <StatusFilter selectedStatus={status} onChange={setStatus} />
        </div>
      </div>

      {/* Habits Grid */}
      {fetchingHabits ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : habits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} userId={user.id} />
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center">
          <div className="text-6xl mb-6">🌱</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No habits found</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {category || status !== HabitStatus.ACTIVE 
              ? "Try clearing your filters to see your habits."
              : "You haven't started building any habits yet. Take the first step today!"}
          </p>
          <Link 
            href="/habits/new"
            className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all"
          >
            Get Started
          </Link>
        </div>
      )}

      {/* Summary Footer */}
      {!fetchingHabits && total > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 font-medium">
            Showing {habits.length} of {total} habits
          </p>
        </div>
      )}
    </div>
  );
}
