require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
async function main() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Get interview sessions from all time
  const { data: sessions, error: sessionError } = await supabase
    .from('interview_sessions')
    .select('*');
    
  // Get all users
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const userMapById = {};
  users.forEach(u => {
      userMapById[u.id] = {
          email: (u.email || "").toLowerCase(),
          name: (u.user_metadata?.full_name || "").toLowerCase()
      };
  });
  
  // Get interview costs
  const { data: costs, error: costError } = await supabase
    .from('interview_costs')
    .select('*');
    
  const testKeywords = ['baris', 'barıi', 'eray', 'interview', 'magaza', 'nisa', 'test', 'intervio'];
  
  let organicSessions = [];
  
  sessions.forEach(s => {
    const user = userMapById[s.user_id] || { email: 'unknown', name: 'unknown' };
    const email = user.email;
    const name = user.name;
    const isOrganic = !testKeywords.some(kw => email.includes(kw) || name.includes(kw));
    
    if (isOrganic) {
        organicSessions.push(s.id);
    }
  });
  
  let totalCost = 0;
  costs.forEach(c => {
      if(organicSessions.includes(c.interview_id)) {
          totalCost += (c.estimated_cost_usd || 0);
      }
  });
  
  console.log("Total Organic Cost:", totalCost);
}
main();
