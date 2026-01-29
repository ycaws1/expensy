import React from 'react';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

export default function SummaryCard({ totalSpent, timeFilter, setTimeFilter }) {
    const filters = [
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' },
        { id: 'all', label: 'All' },
    ];

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-2xl shadow-indigo-500/20">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-white/80 font-medium mb-1">Total Spent</p>
                        <h1 className="text-4xl font-bold tracking-tight">{formatCurrency(totalSpent)}</h1>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 flex items-center gap-1 text-sm font-medium">
                        <ArrowUpRight size={16} />
                        <span>+2.4%</span>
                    </div>
                </div>

                <div className="flex gap-2 bg-black/10 p-1 rounded-xl backdrop-blur-sm w-fit">
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setTimeFilter(filter.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${timeFilter === filter.id
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-white/70 hover:bg-white/10'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
