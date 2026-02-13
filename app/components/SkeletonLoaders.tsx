import React from 'react';

export const SkeletonRow = () => (
    <div className="flex justify-between items-center py-5 border-b border-[#a32a2a]/5">
        <div className="h-4 w-32 bg-gray-100 animate-shimmer rounded"></div>
        <div className="h-6 w-20 bg-gray-100 animate-shimmer rounded"></div>
    </div>
);

export const SkeletonCard = () => (
    <div className="bg-white border border-[#a32a2a]/10 p-7 rounded-lg shadow-sm">
        <div className="h-3 w-24 bg-gray-100 animate-shimmer rounded mb-4"></div>
        <div className="h-8 w-32 bg-gray-100 animate-shimmer rounded"></div>
    </div>
);

export const SkeletonTableRow = () => (
    <tr>
        <td className="px-8 py-4"><div className="h-4 w-20 bg-gray-100 animate-shimmer rounded"></div></td>
        <td className="px-8 py-4"><div className="h-4 w-40 bg-gray-100 animate-shimmer rounded"></div></td>
        <td className="px-8 py-4"><div className="h-4 w-16 bg-gray-100 animate-shimmer rounded"></div></td>
        <td className="px-8 py-4 text-right"><div className="h-4 w-20 bg-gray-100 animate-shimmer rounded ml-auto"></div></td>
    </tr>
);

export const SkeletonTable = () => (
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
                {[1, 2, 3, 4].map(i => <SkeletonTableRow key={i} />)}
            </tbody>
        </table>
    </div>
);
