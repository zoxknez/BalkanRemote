# OAuth provider setup for Remote Balkan

Use this checklist to enable Google and GitHub sign-in for the production deployment.

## 1. Configure Supabase project settings

1. Sign in to the Supabase dashboard and open your project.
2. Go to **Authentication → URL Configuration**.
   - Set **Site URL** to your production domain, e.g. `https://balkan-remote.vercel.app`.
   - (Optional) Add additional redirect URLs (local dev, staging) separated by commas.
3. Save changes.

## 2. Enable OAuth providers

1. Navigate to **Authentication → Providers**.
2. For **Google**:
   - Click the Google provider card.
   - Toggle **Enable** on.
   - Enter your Google OAuth Client ID and Client Secret.
     - Create these in the Google Cloud Console under **APIs & Services → Credentials**.
     - Authorized redirect URI should match `https://<your-supabase-project>.supabase.co/auth/v1/callback`.
   - Save.
3. For **GitHub**:
   - Click the GitHub provider card.
   - Toggle **Enable** on.
   - Enter the OAuth Client ID and Client Secret from GitHub (Settings → Developer settings → OAuth Apps).
   - Set the authorization callback URL to `https://<your-supabase-project>.supabase.co/auth/v1/callback`.
   - Save.

> **Tip:** Supabase automatically appends the correct callback route. You only need to supply the base Supabase project URL followed by `/auth/v1/callback` when registering the app with Google/GitHub.

## 3. Expose the site URL to the frontend

Ensure `NEXT_PUBLIC_SITE_URL` is available in both local and production environments. Example `.env.local` excerpt:

```env
NEXT_PUBLIC_SUPABASE_URL=...your project URL...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...public anon key...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

On Vercel, add the same key under **Project Settings → Environment Variables** with value `https://balkan-remote.vercel.app`.

## 4. Verify the flow

1. Deploy the latest code (commit `ed69c88` or newer) that includes the updated redirect handling.
2. Visit `https://balkan-remote.vercel.app/nalog?view=register`.
3. Click **Nastavi sa Google** or **GitHub**.
4. Confirm that the provider consent screen appears and you are returned to `/nalog` after authorizing.

If you still see `"Unsupported provider"`, double-check that the provider is enabled in Supabase and that the client credentials are valid.
