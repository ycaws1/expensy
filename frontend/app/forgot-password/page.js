"use client";
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });
            if (error) throw error;
            setSuccess(true);
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
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Reset Password</h1>
                    <p className="mt-2 text-muted-foreground text-lg">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                <div className="bg-card p-8 rounded-3xl border border-border shadow-xl space-y-6">
                    {error && (
                        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 text-sm bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 text-center">
                            A password reset link has been sent to your email. Check your inbox!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-2"
                        >
                            {loading ? 'Processing...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <button
                            onClick={() => router.push('/login')}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
                        >
                            Back to login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
