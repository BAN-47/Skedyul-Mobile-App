import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://kgcrkwpuehfxhwnmbpmg.supabase.co/rest/v1/'
const supabasePublishableKey = 'sb_publishable_5PZQoSn1b_ME9dq52I4EBg_IgN0WpJP'

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})