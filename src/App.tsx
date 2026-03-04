/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';
import Swal from 'sweetalert2';
import { 
  Eye, 
  EyeOff, 
  Plus, 
  Calendar, 
  DollarSign, 
  Package, 
  Clock, 
  User, 
  Lock, 
  LogOut,
  TrendingUp,
  TrendingDown,
  Wallet,
  X,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const THEMES = {
  neon: {
    primary: '#00f3ff',
    secondary: '#ff00ff',
    accent: '#39ff14',
    primaryRgb: '0, 243, 255',
    secondaryRgb: '255, 0, 255',
    accentRgb: '57, 255, 20',
    glow: 'rgba(0, 243, 255, 0.08)',
    glowSecondary: 'rgba(255, 0, 255, 0.08)'
  },
  emerald: {
    primary: '#10b981',
    secondary: '#14b8a6',
    accent: '#f59e0b',
    primaryRgb: '16, 185, 129',
    secondaryRgb: '20, 184, 166',
    accentRgb: '245, 158, 11',
    glow: 'rgba(16, 185, 129, 0.08)',
    glowSecondary: 'rgba(20, 184, 166, 0.08)'
  },
  sunset: {
    primary: '#f97316',
    secondary: '#f43f5e',
    accent: '#eab308',
    primaryRgb: '249, 115, 22',
    secondaryRgb: '244, 63, 94',
    accentRgb: '234, 179, 8',
    glow: 'rgba(249, 115, 22, 0.08)',
    glowSecondary: 'rgba(244, 63, 94, 0.08)'
  },
  ocean: {
    primary: '#3b82f6',
    secondary: '#6366f1',
    accent: '#06b6d4',
    primaryRgb: '59, 130, 246',
    secondaryRgb: '99, 102, 241',
    accentRgb: '6, 182, 212',
    glow: 'rgba(59, 130, 246, 0.08)',
    glowSecondary: 'rgba(99, 102, 241, 0.08)'
  }
};

// Firebase configuration from user's snippet
const firebaseConfig = {
  apiKey: "AIzaSyDMtl_OolzCM699u8GsXYByKGzCdZcZE0g",
  authDomain: "income-details-7831b.firebaseapp.com",
  databaseURL: "https://income-details-7831b-default-rtdb.firebaseio.com",
  projectId: "income-details-7831b",
  storageBucket: "income-details-7831b.appspot.com",
  messagingSenderId: "879276775958",
  appId: "1:879276775958:web:14546def9134efc5c4b337"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

interface Entry {
  id: string;
  text1: string; // Date
  text2: number; // Half
  text3: number; // Full
  text4: number; // Paid (Expense)
  text5: number; // Total Items (Half + Full)
  text6: number; // Income (Calculated)
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('neon');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Apply theme variables
  useEffect(() => {
    const theme = THEMES[currentTheme];
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-primary-rgb', theme.primaryRgb);
    root.style.setProperty('--theme-secondary-rgb', theme.secondaryRgb);
    root.style.setProperty('--theme-accent-rgb', theme.accentRgb);
    root.style.setProperty('--theme-glow', theme.glow);
    root.style.setProperty('--theme-glow-secondary', theme.glowSecondary);
  }, [currentTheme]);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    half: 0,
    full: 0,
    paid: 0
  });

  // Authentication
  const handleLogin = () => {
    if (password === 'sss') {
      setIsAuthenticated(true);
      Swal.fire({
        icon: 'success',
        title: 'স্বাগতম!',
        text: 'সফলভাবে লগইন করা হয়েছে।',
        timer: 1500,
        showConfirmButton: false,
        background: '#1a1a1c',
        color: '#fff'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ভুল পাসওয়ার্ড',
        text: 'অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।',
        background: '#1a1a1c',
        color: '#fff'
      });
    }
  };

  // Fetch Data
  useEffect(() => {
    if (!isAuthenticated) return;

    const dataRef = ref(database, 'Shahin');
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedEntries: Entry[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        }));
        setEntries(loadedEntries);
      } else {
        setEntries([]);
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Calculations
  const stats = useMemo(() => {
    const totalIncome = entries.reduce((sum, e) => sum + (e.text6 || 0), 0);
    const totalExpense = entries.reduce((sum, e) => sum + (e.text4 || 0), 0);
    const totalItems = entries.reduce((sum, e) => sum + (e.text5 || 0), 0);
    const totalHalf = entries.reduce((sum, e) => sum + (e.text2 || 0), 0);
    const totalFull = entries.reduce((sum, e) => sum + (e.text3 || 0), 0);
    
    const startDate = new Date('2025-07-05');
    const today = new Date();
    const daysDiff = Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgIncome = totalIncome / daysDiff;

    // Week calculations
    const eidDate = new Date('2026-03-20');
    const totalWeeks = Math.floor((eidDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const passedWeeks = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const remainingWeeks = Math.max(0, totalWeeks - passedWeeks);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      totalItems,
      totalHalf,
      totalFull,
      daysDiff,
      avgIncome,
      totalWeeks,
      passedWeeks,
      remainingWeeks
    };
  }, [entries]);

  // Upload Data
  const handleUpload = async () => {
    if (!formData.date || formData.paid === undefined) {
      Swal.fire({ icon: 'warning', title: 'অসম্পূর্ণ তথ্য', text: 'তারিখ এবং খরচ অবশ্যই দিতে হবে।' });
      return;
    }

    const income = (formData.half * 23) + (formData.full * 25);
    const totalItems = formData.half + formData.full;

    const newEntry = {
      text1: formData.date,
      text2: formData.half,
      text3: formData.full,
      text4: formData.paid,
      text5: totalItems,
      text6: income
    };

    try {
      await push(ref(database, 'Shahin'), newEntry);
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'তথ্য আপলোড করা হয়েছে।',
        timer: 1500,
        showConfirmButton: false,
        background: '#1a1a1c',
        color: '#fff'
      });
      setIsFormOpen(false);
      setFormData({ date: new Date().toISOString().split('T')[0], half: 0, full: 0, paid: 0 });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'ত্রুটি', text: 'তথ্য আপলোড করা যায়নি।' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 w-full max-w-md text-center space-y-6 neon-border relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-cyan animate-pulse" />
          
          <div className="flex flex-col items-center space-y-4">
            <motion.img 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              src="https://i.ibb.co.com/ds33S8Db/1723314004088-2.jpg" 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-4 border-neon-cyan/30 shadow-[0_0_20px_rgba(0,243,255,0.3)] object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="p-3 rounded-full bg-neon-cyan/10">
              <Lock className="w-8 h-8 text-neon-cyan" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold neon-text-cyan">MD SHAHIN ISLAM</h1>
          <p className="text-white/60">অনুগ্রহ করে পাসওয়ার্ড দিয়ে প্রবেশ করুন</p>
          
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="পাসওয়ার্ড"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-all text-center text-xl tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
            <button 
              onClick={handleLogin}
              className="w-full bg-neon-cyan text-black font-bold py-4 rounded-xl hover:bg-neon-cyan/80 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)] active:scale-95"
            >
              প্রবেশ করুন
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121214] text-white selection:bg-neon-cyan/30">
      {/* Fixed Arabic Header */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[340px]">
        <motion.div 
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="bg-white/10 backdrop-blur-md text-white py-3 px-6 rounded-b-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-center border-x border-b border-white/20"
        >
          <span className="text-xl md:text-2xl font-serif tracking-wide neon-text-cyan">
            بِسْمِ ٱللهِ ٱلرَّحْمَٰنِ ٱلرَّحِيْمِ
          </span>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 pt-20 space-y-8 pb-32">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <img 
              src="https://i.ibb.co.com/ds33S8Db/1723314004088-2.jpg" 
              alt="Profile" 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.5)] object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold neon-text-cyan">MD SHAHIN ISLAM</h1>
              <p className="text-white/40 text-xs md:text-sm">Income & Expense Tracker</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:flex gap-3 w-full md:w-auto">
            <div className="relative">
              <button 
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center justify-center p-3 glass-card hover:bg-white/10 transition-all text-neon-cyan w-full md:w-auto"
                title="Change Theme"
              >
                <Palette />
              </button>
              <AnimatePresence>
                {isThemeMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 glass-card p-2 z-50 min-w-[120px] space-y-1"
                  >
                    {Object.keys(THEMES).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setCurrentTheme(t as keyof typeof THEMES);
                          setIsThemeMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors",
                          currentTheme === t ? "bg-neon-cyan text-black font-bold" : "hover:bg-white/5"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => setShowNumbers(!showNumbers)}
              className={cn(
                "flex items-center justify-center p-3 glass-card transition-all w-full md:w-auto",
                showNumbers ? "text-neon-cyan" : "text-neon-magenta"
              )}
              title={showNumbers ? "Hide Stats" : "Show Stats"}
            >
              {showNumbers ? <Eye /> : <EyeOff />}
            </button>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-neon-cyan text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.4)] transition-all active:scale-95 shadow-lg w-full md:w-auto"
            >
              <Plus className="w-5 h-5" /> নতুন এন্ট্রি
            </button>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center justify-center p-3 glass-card hover:bg-red-500/20 transition-all text-red-400 w-full md:w-auto"
              title="Logout"
            >
              <LogOut />
            </button>
          </div>
        </header>

      {/* Week Progress */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-6 border-l-4 border-neon-lime"
      >
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="text-neon-lime" />
          <h2 className="text-lg font-semibold">সাপ্তাহিক অগ্রগতি (ঈদ পর্যন্ত)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-white/5 rounded-lg">
            <span className="text-white/40 block">মোট সপ্তাহ</span>
            <span className="text-xl font-bold">{stats.totalWeeks} সপ্তাহ</span>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <span className="text-white/40 block">অতিবাহিত</span>
            <span className="text-xl font-bold text-neon-magenta">{stats.passedWeeks} সপ্তাহ</span>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <span className="text-white/40 block">বাকি আছে</span>
            <span className="text-xl font-bold text-neon-cyan">{stats.remainingWeeks} সপ্তাহ</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<TrendingUp className="text-neon-lime" />}
          label="মোট আয়"
          value={stats.totalIncome}
          color="lime"
          show={showNumbers}
        />
        <StatCard 
          icon={<TrendingDown className="text-neon-magenta" />}
          label="মোট খরচ"
          value={stats.totalExpense}
          color="magenta"
          show={showNumbers}
        />
        <StatCard 
          icon={<Wallet className="text-neon-cyan" />}
          label="মোট পাওনা"
          value={stats.balance}
          color="cyan"
          show={showNumbers}
        />
        <StatCard 
          icon={<Package className="text-white/60" />}
          label="মোট মাল"
          value={stats.totalItems}
          color="white"
          show={showNumbers}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/10"><Clock className="text-white/60" /></div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">মোট দিন</p>
            <p className="text-xl font-bold">{stats.daysDiff} দিন</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/10"><DollarSign className="text-neon-cyan" /></div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">প্রতিদিনের গড় আয়</p>
            <p className="text-xl font-bold text-neon-cyan">
              {showNumbers ? `৳${stats.avgIncome.toFixed(2)}` : '***'}
            </p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/10"><User className="text-white/60" /></div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">মোট হাফ/ফুল</p>
            <p className="text-xl font-bold">
              {showNumbers ? `${stats.totalHalf}H / ${stats.totalFull}F` : '***'}
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neon-cyan" /> বিস্তারিত হিসাব
          </h2>
          <span className="text-xs text-white/40 uppercase tracking-widest">{entries.length} Entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-white/40 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="px-2 py-3 font-medium border-b border-white/5">তারিখ</th>
                <th className="px-2 py-3 font-medium border-b border-white/5">হাফ</th>
                <th className="px-2 py-3 font-medium border-b border-white/5">ফুল</th>
                <th className="px-2 py-3 font-medium border-b border-white/5">আয়</th>
                <th className="px-2 py-3 font-medium border-b border-white/5">খরচ</th>
                <th className="px-2 py-3 font-medium border-b border-white/5">মোট মাল</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-1 py-1.5 font-medium text-white/80 whitespace-nowrap text-xs">{entry.text1}</td>
                  <td className="px-2 py-1.5">{entry.text2}</td>
                  <td className="px-2 py-1.5">{entry.text3}</td>
                  <td className="px-2 py-1.5 text-neon-lime font-bold">৳{entry.text6}</td>
                  <td className="px-2 py-1.5 text-neon-magenta">৳{entry.text4}</td>
                  <td className="px-2 py-1.5 text-white/60">{entry.text5}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/20 italic">
                    কোন তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#050505] border-t border-neon-cyan/30 py-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-white/60 text-xs font-medium">
            © 2024 Created by <span className="text-neon-cyan">MD NAZRUL ISLAM</span>
          </p>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/30">
            <span>Secure Database</span>
            <span className="w-1 h-1 rounded-full bg-neon-lime" />
            <span>Real-time Updates</span>
          </div>
        </div>
      </footer>

      {/* Entry Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 relative z-10 neon-border"
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X />
              </button>
              <h2 className="text-2xl font-bold mb-6 neon-text-cyan flex items-center gap-2">
                <Plus /> নতুন এন্ট্রি যোগ করুন
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/40 uppercase">তারিখ</label>
                  <input 
                    type="date" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/40 uppercase">হাফ</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan"
                      value={formData.half}
                      onChange={(e) => setFormData({...formData, half: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-white/40 uppercase">ফুল</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan"
                      value={formData.full}
                      onChange={(e) => setFormData({...formData, full: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/40 uppercase">খরচ (Paid)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-magenta"
                    value={formData.paid}
                    onChange={(e) => setFormData({...formData, paid: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={handleUpload}
                    className="w-full bg-neon-cyan text-black font-bold py-4 rounded-xl hover:bg-neon-cyan/80 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                  >
                    আপলোড করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, show }: { icon: React.ReactNode, label: string, value: number, color: string, show: boolean }) {
  const colorClasses = {
    cyan: 'border-neon-cyan/30 hover:border-neon-cyan/60 bg-white/10',
    magenta: 'border-neon-magenta/30 hover:border-neon-magenta/60 bg-white/10',
    lime: 'border-neon-lime/30 hover:border-neon-lime/60 bg-white/10',
    white: 'border-white/20 hover:border-white/40 bg-white/10'
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "glass-card p-6 transition-all duration-300",
        colorClasses[color as keyof typeof colorClasses]
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white/10">{icon}</div>
      </div>
      <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className={cn(
        "text-2xl font-bold",
        color === 'cyan' && 'neon-text-cyan',
        color === 'magenta' && 'neon-text-magenta',
        color === 'lime' && 'neon-text-lime'
      )}>
        {show ? `৳${value.toLocaleString()}` : '***'}
      </p>
    </motion.div>
  );
}
