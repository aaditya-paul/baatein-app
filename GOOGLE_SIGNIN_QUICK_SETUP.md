# React Native Google Sign-In Setup

## Quick Setup Guide

### 1. Google Cloud Console

#### Create OAuth Credentials:

1. **Web Client** (for Supabase)

   - Type: Web application
   - Redirect URI: `https://your-project.supabase.co/auth/v1/callback`

2. **iOS Client**

   - Type: iOS
   - Bundle ID: `com.baatein.app`
   - Save the iOS URL scheme (format: `com.googleusercontent.apps.XXXXXXX`)

3. **Android Client**
   - Type: Android
   - Package: `com.baatein.app`
   - SHA-1: Get with `keytool -keystore ~/.android/debug.keystore -list -v` (password: android)

---

### 2. Supabase Dashboard

**Authentication → Providers → Google:**

- Enable Google
- Client ID: [Your Web Client ID]
- Client Secret: [Your Web Client Secret]
- Authorized Client IDs: `web_id,ios_id,android_id`

---

### 3. Update app.json

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_NUMBER"
        }
      ]
    ]
  }
}
```

---

### 4. Create .env file

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

### 5. Build and Test

```bash
# Create development build (required - won't work in Expo Go)
eas build --profile development --platform ios
eas build --profile development --platform android

# Start dev server
npm start
```

---

## Common Issues

**DEVELOPER_ERROR on Android:**

- Verify SHA-1 fingerprint is correct in Google Console
- Use debug keystore SHA-1 for development builds

**iOS URL Scheme Error:**

- Check `iosUrlScheme` in app.json matches your iOS Client ID number

**"Invalid client":**

- Verify Web Client ID is added to Supabase Authorized Client IDs
- Make sure you're using Web Client ID, not Android Client ID
