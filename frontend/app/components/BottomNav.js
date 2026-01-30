import React from 'react';
import { Home, List, PieChart, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BottomNav({ activeTab, setActiveTab, onAddClick }) {
    const tabs = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'history', icon: List, label: 'History' },
        { id: 'analytics', icon: PieChart, label: 'Analytics' },
    ];

    return (
        <>
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-card rounded-2xl p-1.5 flex justify-between items-center shadow-xl z-50">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        </button>
                    );
                })}
            </div>

            {activeTab === 'home' && (
                <button
                    onClick={onAddClick}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary/90 text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 transition-transform hover:scale-105 active:scale-95 z-50 animate-in fade-in slide-in-from-bottom-4"
                >
                    <Plus size={32} />
                </button>
            )}
        </>
    );
}
