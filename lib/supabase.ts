import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bfrbqviprqgupaoonmdg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmcmJxdmlwcnFndXBhb29ubWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzgwMzksImV4cCI6MjA2MDE1NDAzOX0.F-K3AZvg0ZTbKP_JYP_I7SJb-hfv1R90qTrb9SBuExw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})