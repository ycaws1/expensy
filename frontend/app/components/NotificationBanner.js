"use client";
import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function NotificationBanner() {
    const [permission, setPermission] = useState(() =>
        typeof window !== 'undefined' ? Notification.permission : 'default'
    );
    const [show, setShow] = useState(() =>
        typeof window !== 'undefined' ? Notification.permission !== 'granted' : false
    );

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then((reg) => {
                    // console.log('SW Registered', reg);
                })
                .catch((err) => console.error('SW Error', err));
        }
    }, []);

    const subscribeToPush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;

            // Check for existing subscription
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!publicKey) {
                    console.error('VAPID Public Key missing');
                    return;
                }

                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                });
            }

            // Save to Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase.from('push_subscriptions').upsert({
                    user_id: user.id,
                    subscription: subscription.toJSON()
                }, {
                    onConflict: 'user_id,subscription'
                });

                if (error) throw error;
            }

        } catch (error) {
            console.error('Push Subscription Error:', error);
        }
    };

    const requestPermission = async () => {
        if (!('Notification' in window)) return;

        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            setShow(false);
            await subscribeToPush();
        }
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-card border border-border rounded-2xl p-4 shadow-2xl z-[100] animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <Bell size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-foreground">Turn on Notifications</h3>
                    <p className="text-xs text-muted-foreground mt-1">Get daily reminders at 10 PM to update your expenses.</p>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={requestPermission}
                            className="text-xs font-bold text-white bg-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-all active:scale-95"
                        >
                            Allow Notifications
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setShow(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
