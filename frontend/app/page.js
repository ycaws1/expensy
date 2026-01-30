"use client";
import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import SummaryCard from './components/SummaryCard';
import ExpenseList from './components/ExpenseList';
import AddExpenseModal from './components/AddExpenseModal';
import Analytics from './components/Analytics';
import { cn } from './lib/utils';
import NotificationBanner from './components/NotificationBanner';
import { useRouter } from 'next/navigation';
import { LogOut, Bell } from 'lucide-react';

import { supabase, isSupabaseConfigured } from './lib/supabase';

const INITIAL_DATA = [
  { id: 1, category: 'Food', price: 12.50, date: '2025-01-20', paymentMethod: 'Card', description: 'Lunch' },
  { id: 2, category: 'Transport', price: 35.00, date: '2025-01-19', paymentMethod: 'Digital Wallet', description: 'Uber' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [expenses, setExpenses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [timeFilter, setTimeFilter] = useState('month');
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  const fetchExpenses = async () => {
    setLoading(true);
    let success = false;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedData = data.map(item => ({
            ...item,
            paymentMethod: item.payment_method
          }));
          setExpenses(formattedData);
          success = true;
        }
      } catch (error) {
        // console.warn('Supabase fetch failed, falling back to local storage:', error.message);
      }
    }

    if (!success) {
      // Fallback to local data if DB connection fails/not set up
      const stored = localStorage.getItem('expenses');
      if (stored) {
        setExpenses(JSON.parse(stored));
      } else {
        setExpenses(INITIAL_DATA);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (!session && isSupabaseConfigured) {
        router.push('/login');
      } else {
        fetchExpenses();
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && isSupabaseConfigured) {
        router.push('/login');
      }
    });

    // 10 PM Notification Logic
    const checkNotification = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 22 && now.getMinutes() === 0) {
        if (Notification.permission === 'granted') {
          new Notification('Expensy Reminder', {
            body: 'Don\'t forget to log your expenses for today!',
            icon: '/android-chrome-192x192.png'
          });
        }
      }
    }, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(checkNotification);
    };
  }, [router]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleSaveExpense = async (savedExpense) => {
    // 1. Optimistic / Fallback Local Update
    const updatedExpenses = savedExpense.id
      ? expenses.map(e => e.id === savedExpense.id ? savedExpense : e)
      : [{ ...savedExpense, id: savedExpense.id || Date.now() }, ...expenses];

    setExpenses(updatedExpenses);
    setEditingExpense(null);

    // 2. Try Sync to Supabase
    if (isSupabaseConfigured) {
      try {
        const payload = {
          date: savedExpense.date,
          price: savedExpense.price,
          category: savedExpense.category,
          payment_method: savedExpense.paymentMethod,
          description: savedExpense.description
        };

        if (savedExpense.id) {
          // Update existing
          const { error } = await supabase
            .from('expenses')
            .update(payload)
            .eq('id', savedExpense.id);
          if (error) throw error;
        } else {
          // Add new
          const { error } = await supabase
            .from('expenses')
            .insert([payload]);
          if (error) throw error;
        }
      } catch (error) {
        console.warn('Sync to Supabase failed (using local data):', error.message);
      }
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  const handleDeleteExpense = async (id) => {
    // 1. Optimistic / Fallback Local Update
    setExpenses(expenses.filter(e => e.id !== id));

    // 2. Try Sync to Supabase
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.warn('Sync to Supabase failed (using local data):', error.message);
      }
    }
  };

  const getFilteredExpenses = () => {
    const now = new Date();
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expenseDate >= weekAgo;
      } else if (timeFilter === 'month') {
        return expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear();
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getTotalSpent = () => {
    return getFilteredExpenses().reduce((sum, e) => sum + e.price, 0);
  };

  const getCategoryData = () => {
    const filtered = getFilteredExpenses();
    const categoryTotals = {};

    filtered.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.price;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  };

  const getTrendData = () => {
    const filtered = getFilteredExpenses();
    const dailyTotals = {};

    filtered.forEach(expense => {
      const date = expense.date;
      dailyTotals[date] = (dailyTotals[date] || 0) + expense.price;
    });

    return Object.entries(dailyTotals)
      .map(([date, total]) => ({
        date,
        amount: parseFloat(total.toFixed(2))
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getTrendPercentage = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const last30DaysSpend = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d >= thirtyDaysAgo && d <= now;
      })
      .reduce((sum, e) => sum + e.price, 0);

    const previous30DaysSpend = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d >= sixtyDaysAgo && d < thirtyDaysAgo;
      })
      .reduce((sum, e) => sum + e.price, 0);

    if (previous30DaysSpend === 0) return last30DaysSpend > 0 ? 100 : 0;
    return ((last30DaysSpend - previous30DaysSpend) / previous30DaysSpend) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      {/* Dynamic Background Blob */}
      <div className="fixed top-0 left-0 w-full h-96 bg-primary/10 rounded-b-[50%] blur-3xl -z-10 animate-pulse-glow" />

      <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-24">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expensy</h1>
            <p className="text-sm text-muted-foreground">Track your wealth</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 shadow-lg border-2 border-white flex items-center justify-center cursor-pointer group relative" onClick={() => supabase.auth.signOut()}>
            <LogOut size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="px-6 flex-1 space-y-6">
          {activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SummaryCard
                totalSpent={getTotalSpent()}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                trendPercentage={getTrendPercentage()}
              />

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Recent Activity</h2>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-primary text-sm font-semibold hover:underline"
                  >
                    See All
                  </button>
                </div>
                <ExpenseList
                  expenses={getFilteredExpenses()}
                  limit={5}
                  onEdit={handleEditClick}
                />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">History</h2>
                <div className="flex gap-2 bg-muted rounded-lg p-1">
                  {['week', 'month', 'all'].map(f => (
                    <button
                      key={f}
                      onClick={() => setTimeFilter(f)}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all",
                        timeFilter === f ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <ExpenseList
                expenses={getFilteredExpenses()}
                onDelete={handleDeleteExpense}
                onEdit={handleEditClick}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Analytics</h2>
                <div className="flex gap-2 bg-muted rounded-lg p-1">
                  {['week', 'month', 'all'].map(f => (
                    <button
                      key={f}
                      onClick={() => setTimeFilter(f)}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all",
                        timeFilter === f ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <Analytics trendData={getTrendData()} categoryData={getCategoryData()} />
            </div>
          )}
        </div>
        <NotificationBanner />

        {/* Notification Test Trigger */}
        <button
          onClick={() => {
            if (Notification.permission === 'granted') {
              new Notification('Expensy Test', {
                body: 'Notification system is active!',
                icon: '/android-chrome-192x192.png'
              });
            } else {
              alert('Please allow notification permission first.');
            }
          }}
          className="fixed bottom-6 left-6 w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center shadow-lg text-muted-foreground hover:text-primary transition-all active:scale-95 z-[60]"
          title="Test Notification"
        >
          <Bell size={18} />
        </button>

        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddClick={() => {
            setEditingExpense(null);
            setShowAddModal(true);
          }}
        />

        <AddExpenseModal
          key={showAddModal ? (editingExpense?.id || 'new') : 'closed'}
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingExpense(null);
          }}
          onSave={handleSaveExpense}
          initialData={editingExpense}
        />
      </div>
    </div>
  );
}