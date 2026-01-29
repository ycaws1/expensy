import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

export default function Analytics({ trendData, categoryData }) {
    return (
        <div className="space-y-6 pb-24">
            <div className="p-4">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    Spending Trend <ArrowUpRight size={18} className="text-green-500" />
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                tickFormatter={(value) => value.split('-').slice(1).join('/')}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    color: 'var(--card-foreground)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                itemStyle={{ color: 'var(--foreground)' }}
                                labelStyle={{ color: 'var(--muted-foreground)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="var(--primary)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-bold mb-4">Category Breakdown</h3>
                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold">{categoryData.length}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Cats</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    {categoryData.map((cat, index) => (
                        <div key={cat.name} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-sm font-medium text-muted-foreground truncate max-w-[80px]">{cat.name}</span>
                            </div>
                            <span className="text-sm font-bold">{formatCurrency(cat.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
