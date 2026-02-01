import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Need this to read all subscriptions
);

webpush.setVapidDetails(
    'mailto:admin@expensy-alpha.vercel.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export async function GET(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${process.env.PUSH_API_SECRET}`) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { data: subscriptions, error, count } = await supabase
            .from('push_subscriptions')
            .select('*', { count: 'exact' });

        if (error) throw error;

        return new Response(JSON.stringify({
            status: 'Push API is online',
            count: count,
            subscriptions: subscriptions
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${process.env.PUSH_API_SECRET}`) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { title, body, url } = await request.json();

        // 1. Fetch all subscriptions from Supabase
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('subscription');

        if (error) throw error;

        // 2. Send notifications in parallel
        const notifications = subscriptions.map((sub) => {
            return webpush.sendNotification(
                sub.subscription,
                JSON.stringify({ title, body, url })
            ).catch(async (err) => {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    // Subscription has expired or is no longer valid, delete it
                    console.log('Deleting expired subscription');
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .match({ subscription: sub.subscription });
                } else {
                    console.error('Error sending notification:', err);
                }
            });
        });

        await Promise.all(notifications);

        return new Response(JSON.stringify({ success: true, count: notifications.length }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Push Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function DELETE(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${process.env.PUSH_API_SECRET}`) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .neq('id', -1); // Deletes all rows (id is bigint)

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, message: 'All subscriptions cleared' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
