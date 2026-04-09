require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log("Checking DB users...");
  const { data: users, error: userError } = await supabase.from('users').select('*');
  console.log("Users:", users);
  if (userError) console.error("UserError:", userError);

  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  console.log("Auth Users:", authUsers?.users?.map(u => ({ id: u.id, email: u.email })));
  if (authError) console.error("AuthError:", authError);
}

run();
