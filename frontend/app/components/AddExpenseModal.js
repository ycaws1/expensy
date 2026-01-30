import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, CreditCard, AlignLeft } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Mortgage', 'Income Tax', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Credit Card Bill', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet'];

export default function AddExpenseModal({ isOpen, onClose, onSave, initialData }) {
    const [date, setDate] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [description, setDescription] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setDate(initialData.date);
                setPrice(initialData.price.toString());
                setCategory(initialData.category);
                setPaymentMethod(initialData.paymentMethod);
                setDescription(initialData.description || '');
            } else {
                const now = new Date();
                setDate(now.toISOString().split('T')[0]);
                setPrice('');
                setCategory('');
                setPaymentMethod('');
                setDescription('');
            }
            setIsClosing(false);
        }
    }, [isOpen, initialData]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            resetForm();
            setIsClosing(false);
        }, 300);
    };

    const resetForm = () => {
        setPrice('');
        setCategory('');
        setPaymentMethod('');
        setDescription('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!price || !category || !paymentMethod) return;

        onSave({
            id: initialData?.id,
            date,
            price: parseFloat(price),
            category,
            paymentMethod,
            description
        });
        handleClose();
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            <div
                className={cn(
                    "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto",
                    isClosing ? "opacity-0" : "opacity-100"
                )}
                onClick={handleClose}
            />

            <div
                className={cn(
                    "bg-background w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl transform transition-transform duration-300 pointer-events-auto",
                    isClosing ? "translate-y-full sm:scale-95 sm:opacity-0" : "translate-y-0 sm:scale-100 sm:opacity-100"
                )}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">{initialData ? 'Edit Expense' : 'Add Expense'}</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 bg-muted rounded-full text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Price Input - Large and Focused */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <DollarSign size={24} />
                        </div>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-12 pr-4 py-6 text-4xl font-bold bg-transparent border-b-2 border-border focus:border-primary focus:outline-none placeholder:text-muted/50 transition-colors"
                            autoFocus={!initialData}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Tag size={14} /> Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none"
                                required
                            >
                                <option value="" disabled>Select</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CreditCard size={14} /> Payment
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none"
                                required
                            >
                                <option value="" disabled>Select</option>
                                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar size={14} /> Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <AlignLeft size={14} /> Description
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What was this for?"
                            className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95 mt-4"
                    >
                        {initialData ? 'Update Expense' : 'Save Expense'}
                    </button>
                </form>
            </div>
        </div>
    );
}
