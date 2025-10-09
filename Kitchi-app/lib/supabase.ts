// lib/supabase.ts
// ==========================
// Polyfills required for Supabase in React Native
// These ensure `URL`, `crypto`, and `fetch` APIs are available globally
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

// AsyncStorage is used to persist user sessions (e.g., login state)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase client creation
import { createClient } from '@supabase/supabase-js';

// Your Supabase project details
const SUPABASE_URL = 'https://zxrhffopuknrbqqvqrtq.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cmhmZm9wdWtucmJxcXZxcnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDg1NTIsImV4cCI6MjA3MTcyNDU1Mn0.h4c8At87SBNbAIz8Fet6YfH6Td0bteLo3S-F4VdOmkg';

// ✅ Create the Supabase client with proper configuration for React Native
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist authentication tokens locally
    storage: AsyncStorage,

    // Automatically refresh expired JWT tokens
    autoRefreshToken: true,

    // Keep user logged in between app launches
    persistSession: true,

    // Disable URL-based session detection (used only for web OAuth)
    detectSessionInUrl: false,
  },
  global: {
    // Optional header to identify requests from the Expo app
    headers: { 'x-client-info': 'expo' },
  },
});
