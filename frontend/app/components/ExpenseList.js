import React from 'react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { ShoppingBag, Coffee, Home, Zap, Heart, Monitor, AlertCircle, Trash2 } from 'lucide-react';

const CATEGORY_ICONS = {
    'Food': Coffee,
    'Transport': Zap,
    'Rent': Home,
    'Entertainment': Monitor,
    'Shopping': ShoppingBag,
    'Utilities': Zap,
    'Healthcare': Heart,
    'Other': AlertCircle
};

const CATEGORY_COLORS = {
    'Food': 'bg-orange-100 text-orange-600',
    'Transport': 'bg-blue-100 text-blue-600',
    'Rent': 'bg-purple-100 text-purple-600',
    'Entertainment': 'bg-pink-100 text-pink-600',
    'Shopping': 'bg-emerald-100 text-emerald-600',
    'Utilities': 'bg-yellow-100 text-yellow-600',
    'Healthcare': 'bg-red-100 text-red-600',
    'Other': 'bg-gray-100 text-gray-600'
};

export default function ExpenseList({ expenses, onDelete, onEdit, limit }) {
    const displayExpenses = limit ? expenses.slice(0, limit) : expenses;

    if (displayExpenses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShoppingBag size={48} className="mb-4 opacity-20" />
                <p>No transactions yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {displayExpenses.map((expense) => {
                const Icon = CATEGORY_ICONS[expense.category] || AlertCircle;
                const colorClass = CATEGORY_COLORS[expense.category] || 'bg-gray-100 text-gray-600';

                return (
                    <div
                        key={expense.id}
                        onClick={() => onEdit && onEdit(expense)}
                        className={cn(
                            "group relative bg-card hover:bg-muted/50 transition-colors p-4 rounded-2xl flex items-center justify-between border border-border shadow-sm",
                            onEdit && "cursor-pointer active:scale-[0.98] transition-all"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", colorClass)}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{expense.category}</h3>
                                <p className="text-xs text-muted-foreground">{formatDate(expense.date)} • {expense.paymentMethod}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-foreground">{formatCurrency(expense.price)}</span>
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(expense.id);
                                    }}
                                    className="p-2 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
