require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const email = `test-${Date.now()}@test.com`;
  
  await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: 'password123',
    email_confirm: true
  });

  const { data } = await supabase.auth.signInWithPassword({
    email: email,
    password: 'password123'
  });

  const token = data.session.access_token;
  
  const tokenName = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
  
  // Construct the base64 session string expected by Supabase SSR
  const sessionStr = JSON.stringify([data.session.access_token, data.session.refresh_token, null, null, null]);
  const encodedSession = Buffer.from(sessionStr).toString('base64');
  
  const res = await fetch('http://localhost:3000/api/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `${tokenName}=${encodedSession}`
    },
    body: JSON.stringify({ input: "http://example.com/test", input_type: "url" })
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
run();
