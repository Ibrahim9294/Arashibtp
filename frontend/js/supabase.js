// Import du SDK Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Ton URL Supabase (tirée de ta photo)
const SUPABASE_URL = "https://cjmunzphzqazivbkgrdq.supabase.co"; 

// Ta clé Anon publique (tirée de ta photo)
const SUPABASE_ANON_KEY = "sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu"; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const STORAGE_BUCKET = "products";
