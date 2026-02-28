
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
    console.log('Checking "applications" table columns...');
    // We can't easily "describe" table via JS client, but we can try to select * limit 0 or inspect via error
    // Alternatively, we can try to insert a dummy record with all known fields and see what fails, 
    // BUT a better way is to just fetch one mock row and see keys.

    const { data, error } = await supabase.from('applications').select('*').limit(1);

    if (error) {
        console.error('Error selecting from applications:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Existing columns based on a row:', Object.keys(data[0]));
        } else {
            console.log('No rows found. Attempting to insert minimal row to check schema...');
        }
    }
}

checkSchema();
