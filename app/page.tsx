"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, TrendingUp, TrendingDown, BookOpen, ChevronLeft, ChevronRight, LogOut, Lock, Mail, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import {
  doc,
  setDoc,
  onSnapshot
} from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";

interface Item {
  id: string;
  description: string;
  amount: number;
}

interface DayData {
  earnings: Item[];
  expenses: Item[];
}

export default function Home() {
  const [firebaseConfigError, setFirebaseConfigError] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [earnings, setEarnings] = useState<Item[]>([]);
  const [expenses, setExpenses] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newEarningDesc, setNewEarningDesc] = useState("");
  const [newEarningAmount, setNewEarningAmount] = useState("");

  const [newExpenseDesc, setNewExpenseDesc] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");

  // Check if Firebase is configured
  useEffect(() => {
    try {
      if (!auth || !db) throw new Error();
    } catch {
      setFirebaseConfigError(true);
    }
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Ledger State from Firestore
  useEffect(() => {
    if (!user || !selectedDate) return;

    setIsLoading(true);
    const docRef = doc(db, "users", user.uid, "ledgers", selectedDate);

    // Using onSnapshot for real-time updates
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DayData;
        setEarnings(data.earnings || []);
        setExpenses(data.expenses || []);
      } else {
        setEarnings([]);
        setExpenses([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, selectedDate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!authEmail || !authPassword) return;

    try {
      if (authMode === "signup") {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      setAuthError(message);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Google Sign-In failed";
      setAuthError(message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const saveData = async (newEarnings: Item[], newExpenses: Item[]) => {
    if (!user || !selectedDate) return;
    const docRef = doc(db, "users", user.uid, "ledgers", selectedDate);
    await setDoc(docRef, { earnings: newEarnings, expenses: newExpenses });
  };

  const addEarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEarningDesc || !newEarningAmount) return;
    const newItem: Item = {
      id: Math.random().toString(36).substr(2, 9),
      description: newEarningDesc,
      amount: parseFloat(newEarningAmount)
    };
    const updated = [...earnings, newItem];
    setEarnings(updated);
    saveData(updated, expenses);
    setNewEarningDesc("");
    setNewEarningAmount("");
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseDesc || !newExpenseAmount) return;
    const newItem: Item = {
      id: Math.random().toString(36).substr(2, 9),
      description: newExpenseDesc,
      amount: parseFloat(newExpenseAmount)
    };
    const updated = [...expenses, newItem];
    setExpenses(updated);
    saveData(earnings, updated);
    setNewExpenseDesc("");
    setNewExpenseAmount("");
  };

  const removeEarning = (id: string) => {
    const updated = earnings.filter(item => item.id !== id);
    setEarnings(updated);
    saveData(updated, expenses);
  };

  const removeExpense = (id: string) => {
    const updated = expenses.filter(item => item.id !== id);
    setExpenses(updated);
    saveData(earnings, updated);
  };

  const totalEarnings = earnings.reduce((acc, item) => acc + item.amount, 0);
  const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
  const balance = totalEarnings - totalExpenses;

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-GB', options);
  };

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  if (firebaseConfigError) {
    return (
      <div className="min-h-screen bg-[#fcfaf5] flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 p-8 rounded-lg shadow-lg max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Firebase Configuration Required</h2>
          <p className="text-gray-600 mb-6">Please update the configuration in `lib/firebase.ts` with your Google Cloud keys to enable cloud storage.</p>
          <div className="bg-gray-50 p-4 rounded text-left text-xs font-mono break-all">
            Check walkthrough.md for instructions.
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcfaf5] flex items-center justify-center p-4 font-sans selection:bg-[#a32a2a]/20">
        <div className="fixed inset-0 pointer-events-none border-[1px] border-[#a32a2a]/10 z-0"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#fffdfa] border border-[#a32a2a]/20 p-8 md:p-10 shadow-xl max-w-sm w-full relative z-10 rounded-lg"
        >
          <div className="text-center mb-10">
            <BookOpen className="w-10 h-10 text-[#a32a2a] mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold text-[#443322] tracking-tight">Cloud Ledger</h2>
            <p className="text-[#887766] text-sm mt-1">Safe & Permanent Cloud Access</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-4">
              <div className="group relative">
                <Mail className="absolute left-0 bottom-2.5 w-4 h-4 text-[#a32a2a]/30 group-focus-within:text-[#a32a2a] transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[#a32a2a]/10 pl-7 py-2 focus:outline-none focus:border-[#a32a2a] transition-colors font-medium text-[#443322] placeholder:text-[#887766]/40"
                  required
                />
              </div>
              <div className="group relative">
                <Lock className="absolute left-0 bottom-2.5 w-4 h-4 text-[#a32a2a]/30 group-focus-within:text-[#a32a2a] transition-colors" />
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-[#a32a2a]/10 pl-7 py-2 focus:outline-none focus:border-[#a32a2a] transition-colors font-medium text-[#443322] placeholder:text-[#887766]/40"
                  required
                />
              </div>
            </div>

            {authError && <p className="text-xs text-red-600 font-bold">{authError}</p>}

            <button
              type="submit"
              className="w-full bg-[#a32a2a] text-white py-3 rounded-md font-semibold tracking-wide hover:bg-[#8b2323] transition-all shadow-md active:scale-[0.98] mt-4"
            >
              {authMode === "login" ? "Login" : "Sign Up"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#a32a2a]/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#fffdfa] px-2 text-[#887766]/50 font-medium">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-[#a32a2a]/15 text-[#443322] py-2.5 rounded-md font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.27l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setAuthError("");
              }}
              className="text-[#a32a2a] text-sm font-medium hover:underline opacity-80"
            >
              {authMode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f2] text-[#443322] p-4 md:p-10 font-sans selection:bg-[#a32a2a]/10">
      <div className="max-w-6xl mx-auto relative">
        <header className="flex flex-col items-center mb-16 space-y-8">
          <div className="flex justify-between items-center w-full text-[#a32a2a]/60 text-xs font-semibold tracking-widest uppercase border-b border-[#a32a2a]/5 pb-4">
            <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
            <button onClick={handleLogout} className="hover:text-[#a32a2a] transition-colors flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Sign Out</button>
          </div>

          <div className="flex flex-col items-center text-center">
            <BookOpen className="w-8 h-8 text-[#a32a2a] mb-5 opacity-40" />
            <h1 className="text-4xl md:text-5xl font-bold text-[#2d1a13] tracking-tight">
              Umiya Hardware & Electrical
            </h1>
            <div className="h-0.5 w-16 bg-[#a32a2a]/20 mt-6"></div>
          </div>

          <div className="flex items-center bg-white/60 shadow-sm px-6 py-2.5 rounded-full border border-[#a32a2a]/10 mt-2">
            <button onClick={() => changeDate(-1)} className="p-1.5 hover:text-[#a32a2a] transition-colors opacity-60 hover:opacity-100"><ChevronLeft className="w-5 h-5" /></button>
            <div className="relative flex items-center gap-3 font-semibold text-[#a32a2a] px-6 min-w-[220px] justify-center">
              <Calendar className="w-4 h-4 opacity-70" />
              <span className="text-sm tracking-wide">{formatDateLabel(selectedDate)}</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 custom-date-picker"
              />
            </div>
            <button onClick={() => changeDate(1)} className="p-1.5 hover:text-[#a32a2a] transition-colors opacity-60 hover:opacity-100"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { label: "Earnings", value: totalEarnings, color: "text-[#2e7d32]", bg: "bg-white" },
            { label: "Expenses", value: totalExpenses, color: "text-[#c62828]", bg: "bg-white" },
            { label: "Net Profit", value: balance, color: "text-white", bg: "bg-[#a32a2a]", dark: true }
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`${card.bg} border border-[#a32a2a]/10 p-7 rounded-lg shadow-sm relative overflow-hidden`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-4 ${card.dark ? 'text-white/60' : 'text-[#887766]'}`}>
                {card.label}
              </div>
              <div className={`text-4xl font-bold flex items-baseline gap-1 ${card.color}`}>
                <span className="text-xl opacity-50">₹</span>{card.value.toLocaleString('en-IN')}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-[#fffdfa] border border-[#a32a2a]/15 shadow-2xl rounded-lg overflow-hidden relative min-h-[700px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#a32a2a]/10">
            {/* Left Section: Income */}
            <div className="p-10 relative">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-bold text-[#443322] tracking-tight">Income Records</h3>
                <TrendingUp className="text-[#2e7d32]/40 w-5 h-5" />
              </div>

              <form onSubmit={addEarning} className="flex gap-4 mb-12 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-[#887766] uppercase tracking-wider mb-2">Description</label>
                  <input
                    type="text"
                    placeholder="Received from..."
                    value={newEarningDesc}
                    onChange={e => setNewEarningDesc(e.target.value)}
                    className="w-full bg-transparent border-b border-[#a32a2a]/10 py-2 focus:outline-none focus:border-[#a32a2a] transition-colors placeholder:text-[#887766]/30 text-sm font-medium"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-[10px] font-bold text-[#887766] uppercase tracking-wider mb-2">Amount</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newEarningAmount}
                    onChange={e => setNewEarningAmount(e.target.value)}
                    className="w-full bg-transparent border-b border-[#a32a2a]/10 py-2 focus:outline-none focus:border-[#a32a2a] transition-colors font-bold text-lg text-[#2e7d32]"
                  />
                </div>
                <button type="submit" className="bg-[#a32a2a] text-white p-2 rounded-md hover:bg-[#8b2323] transition-all shadow-sm">
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              <div className="space-y-0 sleek-ledger-lines">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <div className="text-center py-20 opacity-20 font-bold text-sm tracking-widest animate-pulse">SYNCING...</div>
                  ) : earnings.length === 0 ? (
                    <motion.div className="text-center py-20 opacity-10 font-bold text-sm uppercase tracking-widest italic">No Data Entry</motion.div>
                  ) : (
                    earnings.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex justify-between items-center py-5 border-b border-[#a32a2a]/5 group transition-colors hover:bg-[#a32a2a]/[0.02]"
                      >
                        <span className="font-medium text-[#443322] text-sm">{item.description}</span>
                        <div className="flex items-center gap-6">
                          <span className="font-bold text-[#2e7d32] text-lg">₹{item.amount.toLocaleString('en-IN')}</span>
                          <button onClick={() => removeEarning(item.id)} className="opacity-0 group-hover:opacity-100 text-[#c62828]/40 hover:text-[#c62828] transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Section: Expenses */}
            <div className="p-10 relative">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-bold text-[#443322] tracking-tight">Expense Records</h3>
                <TrendingDown className="text-[#c62828]/40 w-5 h-5" />
              </div>

              <form onSubmit={addExpense} className="flex gap-4 mb-12 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-[#887766] uppercase tracking-wider mb-2">Description</label>
                  <input
                    type="text"
                    placeholder="Paid for..."
                    value={newExpenseDesc}
                    onChange={e => setNewExpenseDesc(e.target.value)}
                    className="w-full bg-transparent border-b border-[#a32a2a]/10 py-2 focus:outline-none focus:border-[#a32a2a] transition-colors placeholder:text-[#887766]/30 text-sm font-medium"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-[10px] font-bold text-[#887766] uppercase tracking-wider mb-2">Amount</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newExpenseAmount}
                    onChange={e => setNewExpenseAmount(e.target.value)}
                    className="w-full bg-transparent border-b border-[#a32a2a]/10 py-2 focus:outline-none focus:border-[#a32a2a] transition-colors font-bold text-lg text-[#c62828]"
                  />
                </div>
                <button type="submit" className="bg-[#a32a2a] text-white p-2 rounded-md hover:bg-[#8b2323] transition-all shadow-sm">
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              <div className="space-y-0 sleek-ledger-lines">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <div className="text-center py-20 opacity-20 font-bold text-sm tracking-widest animate-pulse">SYNCING...</div>
                  ) : expenses.length === 0 ? (
                    <motion.div className="text-center py-20 opacity-10 font-bold text-sm uppercase tracking-widest italic">No Data Entry</motion.div>
                  ) : (
                    expenses.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex justify-between items-center py-5 border-b border-[#a32a2a]/5 group transition-colors hover:bg-[#a32a2a]/[0.02]"
                      >
                        <span className="font-medium text-[#443322] text-sm">{item.description}</span>
                        <div className="flex items-center gap-6">
                          <span className="font-bold text-[#c62828] text-lg">₹{item.amount.toLocaleString('en-IN')}</span>
                          <button onClick={() => removeExpense(item.id)} className="opacity-0 group-hover:opacity-100 text-[#c62828]/40 hover:text-[#c62828] transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center text-[#887766]/30 font-semibold text-[10px] tracking-[0.4em] uppercase">
          Digital Ledger & Archive System
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        body { background-color: #fcfaf5; }
        .font-sans { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }

        .sleek-ledger-lines {
          background-image: repeating-linear-gradient(transparent, transparent 4.2rem, #a32a2a08 4.2rem, #a32a2a08 4.3rem);
          min-height: 500px;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .custom-date-picker::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
          z-index: 10;
        }

        ::selection {
          background: #a32a2a20;
          color: #a32a2a;
        }
      `}</style>
    </div>
  );
}
