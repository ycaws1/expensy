# Production Readiness Plan for Expensy

To take Expensy from a local development project to a production-ready application, we need to address security, stability, and user experience.

## 1. Security (Supabase)
### Database Schema & RLS
The current database allows generic access. For production, we must explicitly link every expense to a user and enforce this via Row Level Security (RLS).
- [x] **Update Schema**: Added `user_id` to the `expenses` table.
- [x] **Enable RLS**: Created policies so users can only view, insert, update, and delete their own data.
- [ ] **Action Required**: You must run the updated `supabase_schema.sql` in your Supabase SQL Editor to apply these security rules.

### Environment Variables
Sensitive keys should never be committed to Git.
- [x] **Verify .env**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are only in `.env.local`.

## 2. Authentication Flow
### Confirmation Redirects
When users sign up, the email link needs to be handled by the app to establish a session.
- [x] **Auth Callback**: Created `app/auth/callback/route.js` using `@supabase/ssr` to handle the `code` exchange.
- [ ] **Supabase Dashboard**: Ensure your `Redirect URLs` in the Supabase Dashboard include your production domain (e.g., `https://your-app.vercel.app/auth/callback`).

## 3. User Experience (UX)
### Offline Support (PWA)
Expensy is designed as a PWA, which is great for mobile users.
- [ ] **Manifest**: Verify `public/manifest.json` has the correct names and icons.
- [ ] **Service Worker**: The existing service worker provides basic caching; consider using `next-pwa` for more robust offline support if needed.

### Error Handling
- [ ] **Global Error Boundary**: Add a `loading.js` and `error.js` in the `app` directory to handle unexpected crashes gracefully.

## 4. Deployment
### Vercel / Netlify
- [ ] **Configuration**: When deploying, remember to add your Supabase environment variables to the deployment platform's dashboard.
- [ ] **Build Command**: Use `npm run build` to verify the project builds without errors.

## 5. Web Push Notifications (iOS & Background support)
Expensy now supports persistent Web Push notifications that work even if the app is closed.

### Setup
1.  **Run Migration**: Execute `migrate_schema.sql` in Supabase to create the `push_subscriptions` table.
2.  **Environment Variables**: 
    - [x] VAPID Keys added to `.env.local`.
    - [ ] **Action Required**: Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local`. You can find this in Supabase Project Settings -> API.
3.  **Permissions**: Users must "Allow Notifications" on the Home Screen version of the app (iOS) or the browser.

### Triggering the 10 PM Reminder
Since the app stays closed, we now use a broadcast mechanism:
- **Local Test**: Run `./trigger_reminder.sh` to send a notification to all subscribed devices.
- **Production**: You can set up a "Cron Job" (using GitHub Actions or a service like EasyCron) to hit `https://your-app.vercel.app/api/push` every night at 10 PM UTC.

## Next Steps
1. **Apply SQL**: Paste the content of `migrate_schema.sql` into your Supabase SQL Editor.
2. **Service Role Key**: Added the service role key to your local and production environment.
3. **Build Test**: Run `npm run build` locally to catch any hidden issues before deploying.

