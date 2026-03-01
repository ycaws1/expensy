"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Optional: Check if the user has an active session before allowing them to update the password.
        // Usually, clicking the email link authenticates them under the hood, but it's good practice.
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Not authenticated; maybe the link expired or they navigated directly
                // (Depends on how your Supabase is set up, typically the callback handles it)
                // You could redirect them to login with a message, but let's let Supabase throw on `updateUser` if they are unauthorized.
            }
        };
        checkUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 2000); // Redirect after 2s

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Update Password</h1>
                    <p className="mt-2 text-muted-foreground text-lg">Enter your new password below.</p>
                </div>

                <div className="bg-card p-8 rounded-3xl border border-border shadow-xl space-y-6">
                    {error && (
                        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 text-sm bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 text-center">
                            Password updated successfully! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                required
                                minLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-2"
                        >
                            {loading ? 'Processing...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
