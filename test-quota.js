require('dotenv').config({ path: '.env.local' });
const { checkAndIncrementQuota } = require('./.next/server/app/api/scan/route'); // too hard via compiled next

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const userId = '0c5c8e9d-95ce-48df-8caf-0d1701646c4c';
  
  const { data: user, error } = await supabase
    .from('users')
    .select('scan_quota, scans_today, quota_reset_at')
    .eq('id', userId)
    .single();

  console.log("Quota check:", user, error);
}
run();
