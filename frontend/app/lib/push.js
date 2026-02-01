import { supabase } from './supabase';

export function urlBase64ToUint8Array(base64String) {
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

export async function unsubscribeFromPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            // Unsubscribe from browser
            await subscription.unsubscribe();

            // Delete from Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('push_subscriptions')
                    .delete()
                    .match({
                        user_id: user.id,
                        subscription: subscription.toJSON()
                    });
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return false;
    }
}

export async function subscribeToPush() {
    try {
        const registration = await navigator.serviceWorker.ready;

        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicKey) {
                throw new Error('VAPID Public Key missing');
            }

            const applicationServerKey = urlBase64ToUint8Array(publicKey);
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey
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
            return true;
        }
        return false;
    } catch (error) {
        console.error('Subscribe error:', error);
        throw error;
    }
}
