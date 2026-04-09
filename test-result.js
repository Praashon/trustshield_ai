require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const payload = {
    scan_id: '5ad52894-399b-4917-8bcb-5909d0a87592',
    risk_score: 50,
    reasons: [],
    explanation: "test analysis error",
    advice: [],
    model_used: "rule-engine",
    latency_ms: 0,
  };

  console.log("Inserting analysis results...", payload);
  const { data, error } = await supabase.from('analysis_results').insert(payload).select().single();
  
  if (error) {
    console.error("Result Insert Error:", error);
  } else {
    console.log("Result inserted successfully:", data);
  }
}

run();
