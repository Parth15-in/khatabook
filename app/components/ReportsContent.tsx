import React from "react";
import { format, parseISO } from "date-fns";
import { SkeletonTable } from "./SkeletonLoaders";

interface Item {
    id: string;
    description: string;
    amount: number;
    type: 'earning' | 'expense';
    date: string;
}

interface ReportsContentProps {
    isDataLoading: boolean;
    reportData: Item[];
}

const ReportsContent: React.FC<ReportsContentProps> = ({ isDataLoading, reportData }) => {
    return (
        <div className="bg-[#fffdfa] border border-[#a32a2a]/15 shadow-xl rounded-lg overflow-hidden relative mb-12 transition-all">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#a32a2a]/[0.02] border-b border-[#a32a2a]/10">
                            <th className="px-8 py-5 text-[10px] font-bold text-[#887766] uppercase tracking-wider">Date</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-[#887766] uppercase tracking-wider">Description</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-[#887766] uppercase tracking-wider">Type</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-[#887766] uppercase tracking-wider text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#a32a2a]/5">
                        {isDataLoading ? (
                            <tr>
                                <td colSpan={4} className="p-0">
                                    <SkeletonTable />
                                </td>
                            </tr>
                        ) : reportData.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-[#887766]/30 font-bold italic">
                                    No records found for this period
                                </td>
                            </tr>
                        ) : (
                            reportData.map((item) => (
                                <tr key={`${item.date}-${item.id}`} className="hover:bg-[#a32a2a]/[0.01] transition-colors">
                                    <td className="px-8 py-4 text-xs font-semibold text-[#887766]">{format(parseISO(item.date), 'dd MMM yyyy')}</td>
                                    <td className="px-8 py-4 text-sm font-medium">{item.description}</td>
                                    <td className="px-8 py-4">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${item.type === 'earning' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            {item.type === 'earning' ? 'Income' : 'Expense'}
                                        </span>
                                    </td>
                                    <td className={`px-8 py-4 text-sm font-bold text-right ${item.type === 'earning' ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                        ₹{item.amount.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsContent;
