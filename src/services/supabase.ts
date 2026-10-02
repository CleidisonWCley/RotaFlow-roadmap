import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mtrfwgjpwfmqpwoehoea.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cmZ3Z2pwd2ZtcXB3b2Vob2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1ODMwMzcsImV4cCI6MjEwNTE1OTAzN30.fLi4e3amQ9Q-IHl1rM8GZ5rGPXtus_8KTAFQ0oVbj6o'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});