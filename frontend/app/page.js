"use client";
import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, List, Trash2, PieChart } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet'];
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [expenses, setExpenses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [timeFilter, setTimeFilter] = useState('month');
  
  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [date, setDate] = useState(getLocalDate());
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('expenses');
    if (stored) {
      setExpenses(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!price || !category || !paymentMethod) {
      alert('Please fill in all required fields');
      return;
    }

    const newExpense = {
      id: Date.now(),
      date,
      price: parseFloat(price),
      category,
      paymentMethod,
      description
    };

    setExpenses([newExpense, ...expenses]);
    setDate(getLocalDate());
    setPrice('');
    setCategory('');
    setPaymentMethod('');
    setDescription('');
    setShowAddForm(false);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
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
    });
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

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
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

  const HomeScreen = () => (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-sm opacity-90 mb-1">Total Spent This {timeFilter === 'week' ? 'Week' : timeFilter === 'month' ? 'Month' : 'Period'}</p>
        <h1 className="text-4xl font-bold">${getTotalSpent().toFixed(2)}</h1>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTimeFilter('week')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            timeFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeFilter('month')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            timeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setTimeFilter('all')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            timeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          All Time
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-3 text-gray-800">Recent Expenses</h3>
        {getFilteredExpenses().slice(0, 5).map(expense => (
          <div key={expense.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
            <div>
              <p className="font-medium text-gray-800">{expense.category}</p>
              <p className="text-xs text-gray-500">{expense.date}</p>
            </div>
            <p className="font-semibold text-gray-900">${expense.price.toFixed(2)}</p>
          </div>
        ))}
        {getFilteredExpenses().length === 0 && (
          <p className="text-gray-400 text-center py-8">No expenses yet</p>
        )}
      </div>

      <button
        onClick={() => setShowAddForm(true)}
        className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-blue-600 transition"
      >
        <PlusCircle size={24} />
        Add Expense
      </button>
    </div>
  );

  const HistoryScreen = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Transaction History</h2>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTimeFilter('week')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            timeFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeFilter('month')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            timeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setTimeFilter('all')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            timeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          All Time
        </button>
      </div>
      
      <div className="space-y-3">
        {getFilteredExpenses().map(expense => (
          <div key={expense.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-start">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{expense.category}</h3>
                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-600">{expense.description || 'No description'}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>{expense.date}</span>
                <span>{expense.paymentMethod}</span>
              </div>
            </div>
            <p className="font-bold text-lg text-gray-900 ml-4">${expense.price.toFixed(2)}</p>
          </div>
        ))}
        {getFilteredExpenses().length === 0 && (
          <p className="text-gray-400 text-center py-12">No transactions to display</p>
        )}
      </div>
    </div>
  );

  const AnalyticsScreen = () => {
    const categoryData = getCategoryData();
    const trendData = getTrendData();

    return (
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setTimeFilter('week')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              timeFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              timeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeFilter('all')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              timeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Time
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-semibold mb-4 text-gray-800">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-semibold mb-4 text-gray-800">Category Breakdown</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.map((cat, index) => (
                  <div key={cat.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">${cat.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-12">No data to display</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">Expense Tracker</h1>
      </div>

      {activeTab === 'home' && <HomeScreen />}
      {activeTab === 'history' && <HistoryScreen />}
      {activeTab === 'analytics' && <AnalyticsScreen />}
      
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 space-y-4 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select payment method</option>
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition shadow-lg"
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
            activeTab === 'home' ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          <PlusCircle size={24} />
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
            activeTab === 'history' ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          <List size={24} />
          <span className="text-xs font-medium">History</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
            activeTab === 'analytics' ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          <TrendingUp size={24} />
          <span className="text-xs font-medium">Analytics</span>
        </button>
      </nav>
    </div>
  );
}

export default App;