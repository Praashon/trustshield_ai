require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: scans, error } = await supabase.from('scans').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent scans:", scans);
  if (error) console.error("Error:", error);
}

run();
