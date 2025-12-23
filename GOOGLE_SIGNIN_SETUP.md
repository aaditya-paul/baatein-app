# Google Sign-In Setup Guide for Baatein Mobile App

## Overview

This guide will help you set up native Google Sign-In for your Expo/React Native app with Supabase authentication.

---

## Part 1: Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project: `Baatein` (or any name you prefer)
4. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have Google Workspace)
3. Click **Create**
4. Fill in required information:
   - **App name**: Baatein
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On the Scopes page, click **Save and Continue** (default scopes are fine)
7. Add test users if needed (for testing phase)
8. Click **Save and Continue**, then **Back to Dashboard**

### Step 4: Create OAuth 2.0 Credentials

#### A. Web Client ID (Required for Supabase)

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Baatein Web Client`
5. **Authorized JavaScript origins**: Add your Supabase URL
   ```
   https://your-project-ref.supabase.co
   ```
6. **Authorized redirect URIs**: Add your Supabase callback URL
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
7. Click **Create**
8. **Save the Client ID** (you'll need this for your .env file)

#### B. iOS Client ID

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Application type: **iOS**
3. Name: `Baatein iOS`
4. **Bundle ID**: Get from your `app.json` → `expo.ios.bundleIdentifier`
   - If not set, it defaults to: `com.yourname.baatein`
5. Click **Create**
6. **Save the iOS Client ID**

#### C. Android Client ID

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Application type: **Android**
3. Name: `Baatein Android`
4. **Package name**: Get from your `app.json` → `expo.android.package`
   - If not set, it defaults to: `com.yourname.baatein`
5. **SHA-1 certificate fingerprint**:
   - For development (Expo Go):
   ```bash
   # For Expo Go development, use Expo's certificate
   # You'll get this when you run: eas credentials
   # Or use: openssl rand -base64 32 | openssl sha1 -c
   ```
   - For production: Get from your keystore
   ```bash
   keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
   ```
6. Click **Create**
7. **Save the Android Client ID**

---

## Part 2: Supabase Dashboard Setup

### Step 1: Navigate to Authentication Settings

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your **Baatein** project
3. Go to **Authentication** → **Providers**

### Step 2: Configure Google Provider

1. Find **Google** in the providers list
2. Toggle it to **Enabled**
3. Enter your **Web Client ID** (from Google Cloud Console Step 4A)
4. Enter your **Web Client Secret**:
   - Go back to Google Cloud Console
   - Go to **Credentials** → Click on your Web Client
   - Copy the **Client Secret**
5. **Authorized Client IDs**: Add all three client IDs (comma-separated):
   ```
   your_web_client_id.apps.googleusercontent.com,
   your_ios_client_id.apps.googleusercontent.com,
   your_android_client_id.apps.googleusercontent.com
   ```
6. Click **Save**

### Step 3: Additional Supabase Settings (Optional but Recommended)

1. **Site URL**: Set to your production URL or `baatein://`
2. **Redirect URLs**: Add your app's deep link
   ```
   baatein://auth-callback
   ```
3. **Email Auth**: You can disable this if you only want Google Sign-In

---

## Part 3: Configure Your App

### Step 1: Update app.json

Add your bundle identifiers if not already present:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourname.baatein"
    },
    "android": {
      "package": "com.yourname.baatein"
    },
    "scheme": "baatein"
  }
}
```

### Step 2: Create .env file

1. Copy `.env.example` to `.env`
2. Fill in your credentials:

```env
# From Supabase Dashboard → Settings → API
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# From Google Cloud Console → Credentials
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com
```

### Step 3: Update Supabase Client (if needed)

Ensure your `lib/supabase/client.ts` uses environment variables:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Part 4: Testing

### Development Testing (Expo Go)

```bash
# Start the development server
npm start

# Test on iOS
npm run ios

# Test on Android
npm run android
```

**Note**: Google Sign-In may have limitations in Expo Go. For full functionality, build a development build:

```bash
# Install EAS CLI if not already
npm install -g eas-cli

# Configure EAS
eas build:configure

# Create a development build
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

### Production Build

```bash
# Build for production
eas build --platform ios
eas build --platform android

# Submit to stores
eas submit
```

---

## Troubleshooting

### Issue: "idpiframe_initialization_failed" or "popup_closed_by_user"

- **Solution**: Make sure all redirect URIs are correctly configured in Google Cloud Console

### Issue: "Unable to resolve host"

- **Solution**: Check that your Supabase URL is correct and accessible

### Issue: "Invalid client ID"

- **Solution**:
  1. Verify the client IDs in your .env match Google Cloud Console
  2. Ensure the bundle ID/package name matches between app.json and Google Cloud Console
  3. Check that all client IDs are added to Supabase's "Authorized Client IDs"

### Issue: Android SHA-1 fingerprint error

- **Solution**:
  - For Expo Go: Use Expo's development certificate
  - For development builds: Generate and use your own
  ```bash
  eas credentials
  ```

### Issue: iOS Sign-In not working

- **Solution**:
  1. Verify your iOS bundle identifier matches in both app.json and Google Cloud Console
  2. Make sure you've added the iOS Client ID to Supabase

---

## Security Best Practices

1. **Never commit .env file** - It's already in .gitignore
2. **Use different credentials for development and production**
3. **Regularly rotate your Supabase anon key** if exposed
4. **Enable Row Level Security (RLS)** on all Supabase tables
5. **Review Google OAuth scopes** - only request what you need

---

## Additional Resources

- [React Native Google Sign-In Documentation](https://react-native-google-signin.github.io/docs/)
- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Getting SHA-1 Certificate](https://developers.google.com/android/guides/client-auth)

---

## Summary Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API
- [ ] Configured OAuth Consent Screen
- [ ] Created Web Client ID
- [ ] Created iOS Client ID
- [ ] Created Android Client ID
- [ ] Enabled Google provider in Supabase
- [ ] Added Web Client ID & Secret to Supabase
- [ ] Added all Client IDs to Supabase Authorized Client IDs
- [ ] Created .env file with all credentials
- [ ] Updated app.json with correct bundle IDs
- [ ] Tested sign-in flow on iOS
- [ ] Tested sign-in flow on Android

---

**Need Help?** Check the troubleshooting section above or review the official documentation links.
