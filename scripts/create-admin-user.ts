
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Service Role Key in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdminUser() {
    const email = "demo@interviewcoach.com";
    const password = "password123";
    const fullName = "Demo User";

    console.log(`Creating user: ${email}...`);

    // Check if user exists first to update pass or create fresh
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error("Error listing users:", listError);
        return;
    }

    const existingUser = listData.users.find(u => u.email === email);

    if (existingUser) {
        console.log("User already exists. Updating password...");
        const { data, error } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password, user_metadata: { full_name: fullName }, email_confirm: true }
        );
        if (error) {
            console.error("Error updating user:", error);
        } else {
            console.log("User updated successfully!");
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        }
    } else {
        const { data, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // This bypasses email verification!
            user_metadata: { full_name: fullName }
        });

        if (error) {
            console.error("Error creating user:", error);
        } else {
            console.log("User created successfully!");
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        }
    }
}

createAdminUser();
