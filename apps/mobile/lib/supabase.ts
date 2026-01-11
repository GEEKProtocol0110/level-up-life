import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";

import { createSupabaseClient } from "@level-up-life/api";

export const supabase = createSupabaseClient(undefined, undefined, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
