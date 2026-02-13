import React from "react";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonRow } from "./SkeletonLoaders";

interface Item {
    id: string;
    description: string;
    amount: number;
}

interface LedgerContentProps {
    isDataLoading: boolean;
    earnings: Item[];
    expenses: Item[];
    newEarningDesc: string;
    setNewEarningDesc: (val: string) => void;
    newEarningAmount: string;
    setNewEarningAmount: (val: string) => void;
    addEarning: (e: React.FormEvent) => void;
    removeEarning: (id: string) => void;
    newExpenseDesc: string;
    setNewExpenseDesc: (val: string) => void;
    newExpenseAmount: string;
    setNewExpenseAmount: (val: string) => void;
    addExpense: (e: React.FormEvent) => void;
    removeExpense: (id: string) => void;
}

const LedgerContent: React.FC<LedgerContentProps> = ({
    isDataLoading,
    earnings,
    expenses,
    newEarningDesc,
    setNewEarningDesc,
    newEarningAmount,
    setNewEarningAmount,
    addEarning,
    removeEarning,
    newExpenseDesc,
    setNewExpenseDesc,
    newExpenseAmount,
    setNewExpenseAmount,
    addExpense,
    removeExpense
}) => {
    return (
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
                        {isDataLoading ? (
                            <div className="space-y-0">
                                {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
                            </div>
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
                        {isDataLoading ? (
                            <div className="space-y-0">
                                {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
                            </div>
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
    );
};

export default LedgerContent;
