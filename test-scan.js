require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const userId = '0c5c8e9d-95ce-48df-8caf-0d1701646c4c';
  
  const payload = {
    user_id: userId,
    input: "test input",
    input_type: "url",
    risk_level: "safe",
    rule_flags: [],
    ai_explanation: "test",
    raw_ai_output: null,
  };

  console.log("Inserting scan...", payload);
  const { data, error } = await supabase.from('scans').insert(payload).select().single();
  
  if (error) {
    console.error("Scan Insert Error:", error);
  } else {
    console.log("Scan inserted successfully:", data);
  }
}

run();
