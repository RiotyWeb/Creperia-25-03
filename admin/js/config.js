// Public browser configuration. The publishable key is designed for client-side use.
// Access control is enforced by Supabase Auth and Row Level Security, never by this key.
window.SUPABASE_URL = "https://nbhzjdmmmxswgbllnfkw.supabase.co";
window.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_4zOxrGaOYVEmKTQuGJn9Sw_Z1VRGKeI";
window.supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_PUBLISHABLE_KEY
);