// =====================================
// ARASHI v3.0
// supabase.js
// =====================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
"https://cjmunzphzqazivbkgrdq.supabase.co";

const SUPABASE_ANON_KEY ="sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu";


export const supabase = createClient(

SUPABASE_URL,

SUPABASE_ANON_KEY,

{

auth:{

persistSession:true,

autoRefreshToken:true,

detectSessionInUrl:true

}

}

);

export const STORAGE_BUCKET="products";

// =============================
// Vérification connexion
// =============================

(async()=>{

const {error}=await supabase

.from("profiles")

.select("id")

.limit(1);

if(error){

console.error("Supabase :",error.message);

}else{

console.log("✅ Supabase connecté");

}

})();
