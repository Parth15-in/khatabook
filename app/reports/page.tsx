"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Calendar,
    Search,
    Download,
    TrendingUp,
    TrendingDown,
    BookOpen,
    Mail,
    LogOut,
    ArrowLeft,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { SkeletonCard, SkeletonTable } from "../components/SkeletonLoaders";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { collection, getDocs, doc, onSnapshot, query, where, orderBy, documentId } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { format, subMonths, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";

const ReportsContent = dynamic(() => import("../components/ReportsContent"), {
    loading: () => <SkeletonTable />,
    ssr: false
});

interface Item {
    id: string;
    description: string;
    amount: number;
}

interface LedgerEntry {
    date: string;
    earnings: Item[];
    expenses: Item[];
}

type FilterType = "1m" | "3m" | "6m" | "custom";

export default function Reports() {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

    const [filter, setFilter] = useState<FilterType>("1m");
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Auth Sync
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Data Sync
    useEffect(() => {
        if (!user) return;

        const fetchLedgers = async () => {
            setIsDataLoading(true);
            const ledgersRef = collection(db, "users", user.uid, "ledgers");

            // Optimized: Fetch only entries within the selected range
            const rangeQuery = query(
                ledgersRef,
                where(documentId(), ">=", startDate),
                where(documentId(), "<=", endDate)
            );

            try {
                const querySnapshot = await getDocs(rangeQuery);
                const entries: LedgerEntry[] = [];
                querySnapshot.forEach((doc) => {
                    entries.push({
                        date: doc.id,
                        ...doc.data()
                    } as LedgerEntry);
                });
                // Sort by date descending
                entries.sort((a, b) => b.date.localeCompare(a.date));
                setLedgerEntries(entries);
                setIsDataLoading(false);
            } catch (error) {
                console.error("Error fetching ledgers:", error);
                setIsDataLoading(false);
            }
        };

        fetchLedgers();
    }, [user, startDate, endDate]);

    // Handle Filter Presets
    useEffect(() => {
        const now = new Date();
        if (filter === "1m") {
            setStartDate(format(subMonths(now, 1), 'yyyy-MM-dd'));
            setEndDate(format(now, 'yyyy-MM-dd'));
        } else if (filter === "3m") {
            setStartDate(format(subMonths(now, 3), 'yyyy-MM-dd'));
            setEndDate(format(now, 'yyyy-MM-dd'));
        } else if (filter === "6m") {
            setStartDate(format(subMonths(now, 6), 'yyyy-MM-dd'));
            setEndDate(format(now, 'yyyy-MM-dd'));
        }
    }, [filter]);

    // Derived Data: Filtered Entries & Search
    const reportData = useMemo(() => {
        const filteredByDate = ledgerEntries.filter(entry => {
            return entry.date >= startDate && entry.date <= endDate;
        });

        const flatItems = filteredByDate.flatMap(entry => [
            ...entry.earnings.map(item => ({ ...item, type: 'earning' as const, date: entry.date })),
            ...entry.expenses.map(item => ({ ...item, type: 'expense' as const, date: entry.date }))
        ]);

        if (!searchQuery) return flatItems;

        return flatItems.filter(item =>
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [ledgerEntries, startDate, endDate, searchQuery]);

    // Totals
    const totals = useMemo(() => {
        return reportData.reduce((acc, item) => {
            if (item.type === 'earning') acc.income += item.amount;
            else acc.expense += item.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [reportData]);

    const handleLogout = () => signOut(auth);

    const downloadPDF = async () => {
        setIsDataLoading(true);
        try {
            const { jsPDF } = await import("jspdf");
            const autoTable = (await import("jspdf-autotable")).default;

            const doc = new jsPDF() as any;

            // Header
            doc.setFontSize(22);
            doc.setTextColor(68, 51, 34); // #443322
            doc.text("Khatabook - Financial Report", 14, 22);

            doc.setFontSize(12);
            doc.setTextColor(136, 119, 102); // #887766
            doc.text(`Period: ${format(parseISO(startDate), 'dd MMM yyyy')} to ${format(parseISO(endDate), 'dd MMM yyyy')}`, 14, 32);
            doc.text(`Generated for: ${user?.email}`, 14, 38);

            // Summary Cards
            doc.setDrawColor(163, 42, 42, 0.2); // #a32a2a with opacity
            doc.rect(14, 45, 182, 30);

            doc.setFontSize(10);
            doc.text("TOTAL INCOME", 20, 55);
            doc.text("TOTAL EXPENSE", 80, 55);
            doc.text("NET PROFIT", 140, 55);

            doc.setFontSize(14);
            doc.setTextColor(46, 125, 50); // green
            doc.text(`Rs. ${totals.income.toLocaleString()}`, 20, 65);

            doc.setTextColor(198, 40, 40); // red
            doc.text(`Rs. ${totals.expense.toLocaleString()}`, 80, 65);

            doc.setTextColor(68, 51, 34);
            doc.text(`Rs. ${(totals.income - totals.expense).toLocaleString()}`, 140, 65);

            // Table
            const tableData = reportData.map(item => [
                item.date,
                item.description,
                item.type === 'earning' ? 'Income' : 'Expense',
                `Rs. ${item.amount.toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: 85,
                head: [['Date', 'Description', 'Type', 'Amount']],
                body: tableData,
                headStyles: { fillColor: [163, 42, 42] },
                alternateRowStyles: { fillColor: [252, 250, 245] },
            });

            doc.save(`Khatabook_Report_${startDate}_to_${endDate}.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
        } finally {
            setIsDataLoading(false);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-[#fcfaf5] flex flex-col items-center justify-center p-4">
                <BookOpen className="w-12 h-12 text-[#a32a2a] mb-6 animate-pulse opacity-40" />
                <div className="text-[#a32a2a]/40 font-bold text-xs tracking-[0.3em] uppercase animate-pulse">Loading Reports...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#fcfaf5] flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-[#887766] mb-4">You need to be logged in to view reports.</p>
                    <Link href="/" className="text-[#a32a2a] font-bold hover:underline">Go to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f7f2] text-[#443322] p-4 md:p-10 font-sans selection:bg-[#a32a2a]/10">
            <div className="max-w-6xl mx-auto relative">

                {/* Header */}
                <header className="flex flex-col items-center mb-12 space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center w-full text-[#a32a2a]/60 text-[10px] sm:text-xs font-semibold tracking-widest uppercase border-b border-[#a32a2a]/5 pb-4 gap-4 sm:gap-0">
                        <Link href="/" className="hover:text-[#a32a2a] transition-colors flex items-center gap-1.5 order-2 sm:order-1">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Ledger
                        </Link>
                        <div className="flex items-center gap-4 sm:gap-6 order-1 sm:order-2">
                            <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                            <button onClick={handleLogout} className="hover:text-[#a32a2a] transition-colors flex items-center gap-1.5">
                                <LogOut className="w-3.5 h-3.5" /> Sign Out
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full">
                        <div>
                            <h1 className="text-4xl font-bold text-[#2d1a13] tracking-tight font-gujarati">ૐ ગણેશાય નમઃ</h1>
                            <p className="text-[#887766]/60 text-sm font-medium mt-2">Track your business growth across time</p>
                        </div>
                    </div>
                </header>

                {/* Filters Section */}
                <div className="bg-white border border-[#a32a2a]/10 p-6 rounded-lg shadow-sm mb-8">
                    <div className="flex flex-col lg:flex-row gap-6 items-end lg:items-center">
                        {/* Range Presets */}
                        <div className="flex gap-2 p-1 bg-[#f9f7f2] rounded-md border border-[#a32a2a]/5">
                            {[
                                { id: "1m", label: "1 Month" },
                                { id: "3m", label: "3 Months" },
                                { id: "6m", label: "6 Months" },
                                { id: "custom", label: "Custom" }
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    onClick={() => setFilter(btn.id as FilterType)}
                                    className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${filter === btn.id
                                        ? "bg-[#a32a2a] text-white shadow-md"
                                        : "text-[#887766] hover:bg-[#a32a2a]/5"
                                        }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom Dates */}
                        <AnimatePresence>
                            {filter === "custom" && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-4 items-center"
                                >
                                    <div className="relative">
                                        <span className="text-[10px] absolute -top-4 left-0 font-bold text-[#887766] uppercase">From</span>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            className="bg-transparent border-b border-[#a32a2a]/20 py-1 text-sm font-semibold focus:outline-none focus:border-[#a32a2a]"
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="text-[10px] absolute -top-4 left-0 font-bold text-[#887766] uppercase">To</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="bg-transparent border-b border-[#a32a2a]/20 py-1 text-sm font-semibold focus:outline-none focus:border-[#a32a2a]"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex-1"></div>

                        {/* Search */}
                        <div className="relative w-full lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#887766]/40" />
                            <input
                                type="text"
                                placeholder="Search description..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-[#f9f7f2] border border-[#a32a2a]/10 pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:border-[#a32a2a] transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {isDataLoading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : [
                        { label: "કુલ વ્યાપાર", value: totals.income, color: "text-[#2e7d32]", bg: "bg-white", icon: <TrendingUp className="w-4 h-4" /> },
                        { label: "કુલ ખર્ચ", value: totals.expense, color: "text-[#c62828]", bg: "bg-white", icon: <TrendingDown className="w-4 h-4" /> },
                        { label: "કુલ પુરાંત", value: totals.income - totals.expense, color: "text-white", bg: "bg-[#a32a2a]", dark: true, icon: <Filter className="w-4 h-4" /> }
                    ].map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`${card.bg} border border-[#a32a2a]/10 p-7 rounded-lg shadow-sm relative overflow-hidden`}
                        >
                            <div className={`flex justify-between items-center mb-4`}>
                                <div className={`text-[14px] font-bold uppercase tracking-[0.05em] font-gujarati ${card.dark ? 'text-white/80' : 'text-[#887766]'}`}>
                                    {card.label}
                                </div>
                                <div className={card.dark ? 'text-white/40' : 'text-[#a32a2a]/20'}>{card.icon}</div>
                            </div>
                            <div className={`text-3xl font-bold flex items-baseline gap-1 ${card.color}`}>
                                <span className="text-xl opacity-50">₹</span>{card.value.toLocaleString('en-IN')}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <ReportsContent
                    isDataLoading={isDataLoading}
                    reportData={reportData}
                />

                {/* Download Section */}
                <div className="flex flex-col items-center gap-4 mb-20 px-6 box-border">
                    <button
                        onClick={downloadPDF}
                        disabled={reportData.length === 0}
                        className="group flex items-center justify-center gap-3 bg-[#a32a2a] text-white w-full max-w-sm py-4 rounded-full font-bold shadow-lg hover:bg-[#8b2323] transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                        <span className="truncate">Download Monthly Report (PDF)</span>
                    </button>
                    <p className="text-[10px] text-[#887766]/40 font-bold uppercase tracking-[0.2em] text-center">Full audit trail included</p>
                </div>

                <footer className="text-center text-[#887766]/30 font-semibold text-[10px] tracking-[0.4em] uppercase">
                    Generated via Khatabook Cloud Archive
                </footer>
            </div>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        body { background-color: #fcfaf5; }
        .font-sans { font-family: 'Outfit', sans-serif; }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0.4;
          cursor: pointer;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f9f7f2; }
        ::-webkit-scrollbar-thumb { background: #a32a2a20; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #a32a2a40; }
      `}</style>
        </div>
    );
}
