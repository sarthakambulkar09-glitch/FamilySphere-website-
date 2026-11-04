import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase configuration from environment or project details
const DEFAULT_SUPABASE_URL = 'https://vhufjomnmyazzbayfocf.supabase.co';

// Helper to safely get stored or environment keys
export const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('familysphere_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('familysphere_supabase_key') : null;

  const url = storedUrl || envUrl || DEFAULT_SUPABASE_URL;
  const key = storedKey || envKey || '';

  return {
    url,
    key,
    isConfigured: Boolean(key && key.length > 15 && key !== 'YOUR_PUBLISHABLE_KEY'),
  };
};

let activeClient: SupabaseClient | null = null;
let currentConfigKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  const configHash = `${config.url}_${config.key}`;

  if (activeClient && currentConfigKey === configHash) {
    return activeClient;
  }

  if (!config.isConfigured) {
    return null;
  }

  try {
    activeClient = createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    currentConfigKey = configHash;
    return activeClient;
  } catch (err) {
    console.warn('[FamilySphere Supabase] Initialization warning:', err);
    return null;
  }
};

// Safe direct reference for components
export const supabase = getSupabaseClient();

// Save Supabase Configuration in browser (allows Super Admin to paste key in UI)
export const setSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('familysphere_supabase_url', url.trim());
    if (key) localStorage.setItem('familysphere_supabase_key', key.trim());
    // Force recreate client
    activeClient = null;
    currentConfigKey = '';
    return getSupabaseClient();
  }
  return null;
};

// Test connection to Supabase project
export const testSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  url: string;
  hasKey: boolean;
  latencyMs?: number;
}> => {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return {
      connected: false,
      message: 'Supabase Publishable/Anon key is not configured yet. Add it via .env or Admin Settings.',
      url: config.url,
      hasKey: false,
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Could not initialize Supabase client instance.',
      url: config.url,
      hasKey: true,
    };
  }

  const startTime = Date.now();
  try {
    // Attempt lightweight ping to families table or auth service
    const { error } = await client.from('families').select('id').limit(1);
    const latencyMs = Date.now() - startTime;

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it still connects to the Supabase Postgres instance
      if (error.message.includes('relation "public.families" does not exist') || error.code === '42P01') {
        return {
          connected: true,
          message: 'Connected to Supabase project! (Tables need migration script run in SQL Editor)',
          url: config.url,
          hasKey: true,
          latencyMs,
        };
      }
      return {
        connected: false,
        message: `Supabase responded with error: ${error.message}`,
        url: config.url,
        hasKey: true,
        latencyMs,
      };
    }

    return {
      connected: true,
      message: 'Successfully connected and verified with Supabase backend database!',
      url: config.url,
      hasKey: true,
      latencyMs,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Network error attempting to reach Supabase project.',
      url: config.url,
      hasKey: true,
    };
  }
};

// Realtime Table Subscription Helper
export const subscribeToSupabaseTable = (
  tableName: string,
  onChange: (payload: any) => void
) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channel = client
    .channel(`public:${tableName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      (payload) => onChange(payload)
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
};

// Supabase Auth Helpers
export const supabaseAuth = {
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not configured');
    return client.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
  },

  signInWithPassword: async (email: string, password: string) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not configured');
    return client.auth.signInWithPassword({
      email,
      password,
    });
  },

  signOut: async () => {
    const client = getSupabaseClient();
    if (!client) return;
    return client.auth.signOut();
  },

  resetPasswordForEmail: async (email: string) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not configured');
    return client.auth.resetPasswordForEmail(email);
  },

  getSession: async () => {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    const client = getSupabaseClient();
    if (!client) return { data: { subscription: { unsubscribe: () => {} } } };
    return client.auth.onAuthStateChange(callback);
  },
};
