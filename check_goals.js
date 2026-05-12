const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStats() {
    console.log("Checking goals...\n");

    // Total profiles
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // Waitlist
    const { count: waitlistCount } = await supabase
        .from('pro_waitlist')
        .select('*', { count: 'exact', head: true });

    // Users excluding test accounts
    const testNames = ['nisa', 'eray', 'magaza', 'intervio', 'baris', 'test'];
    const { data: users } = await supabase.from('profiles').select('full_name, email');
    
    let organicCount = 0;
    users?.forEach(u => {
        const name = (u.full_name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const isTest = testNames.some(t => name.includes(t) || email.includes(t));
        if (!isTest) {
            organicCount++;
        }
    });

    console.log(`Total Users: ${totalUsers}`);
    console.log(`Organic Users (excluding test): ${organicCount} / 100 Goal`);
    console.log(`Pro Waitlist: ${waitlistCount} / 25 Goal`);
}

checkStats();
