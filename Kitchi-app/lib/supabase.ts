//import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zxrhffopuknrbqqvqrtq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cmhmZm9wdWtucmJxcXZxcnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDg1NTIsImV4cCI6MjA3MTcyNDU1Mn0.h4c8At87SBNbAIz8Fet6YfH6Td0bteLo3S-F4VdOmkg";


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})