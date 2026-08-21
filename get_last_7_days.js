require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
async function main() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: sessions } = await supabase
    .from('interview_sessions')
    .select('*')
    .gte('created_at', sevenDaysAgo.toISOString());
    
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const userMapById = {};
  users.forEach(u => {
      userMapById[u.id] = {
          email: (u.email || "").toLowerCase(),
          name: (u.user_metadata?.full_name || "").toLowerCase()
      };
  });
  
  const { data: costs } = await supabase
    .from('interview_costs')
    .select('*')
    .gte('created_at', sevenDaysAgo.toISOString());
    
  const testKeywords = ['baris', 'barıi', 'eray', 'interview', 'magaza', 'nisa', 'test', 'intervio'];
  
  let organicSessions = [];
  let organicCosts = 0;
  
  (sessions || []).forEach(s => {
    const user = userMapById[s.user_id] || { email: 'unknown', name: 'unknown' };
    const email = user.email;
    const name = user.name;
    const isOrganic = !testKeywords.some(kw => email.includes(kw) || name.includes(kw));
    
    if (isOrganic) {
        organicSessions.push({ ...s, email });
    }
  });
  
  (costs || []).forEach(c => {
      const user = userMapById[c.user_id] || { email: 'unknown', name: 'unknown' };
      const email = user.email;
      const name = user.name;
      const isOrganic = !testKeywords.some(kw => email.includes(kw) || name.includes(kw));
      if (isOrganic) {
          organicCosts += (c.estimated_cost_usd || 0);
      }
  });
  
  console.log("=== SON 7 GÜN RAPORU ===");
  console.log(`Organik Mülakat Sayısı: ${organicSessions.length}`);
  console.log(`Toplam Organik Maliyet: $${organicCosts.toFixed(4)}`);
  
  const userCount = {};
  organicSessions.forEach(s => {
      userCount[s.email] = (userCount[s.email] || 0) + 1;
  });
  
  console.log("\nMülakat Yapan Organik Kullanıcılar:");
  Object.keys(userCount).forEach(email => {
      console.log(`- ${email}: ${userCount[email]} mülakat`);
  });
}
main();
