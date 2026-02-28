
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBarisApplication() {
    console.log('Starting manual application creation for Barış Güven...');

    // 1. Find or Create User
    const email = 'barisguven01@icloud.com';
    const password = 'password123';
    let userId = '';

    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const foundUser = existingUser.users.find(u => u.email === email);

    if (foundUser) {
        console.log(`User ${email} found. ID: ${foundUser.id}`);
        userId = foundUser.id;
    } else {
        // ... (creation logic same as before, skipping for brevity in this edit)
        console.log(`User ${email} not found. Creating...`);
        const { data: newUser, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: 'Barış Güven' }
        });
        if (newUser.user) userId = newUser.user.id;
    }

    // 2. Prepare Data (Same as before)
    const jobData = {
        title: 'Tıbbi Tanıtım Temsilcisi (Onkoloji)',
        companyName: 'Abdi Ibrahim Pharmaceuticals',
        description: `Abdi İbrahim İlaç Sanayi ve Ticaret A.Ş. ... (Full description in real run)`,
        url: 'https://www.linkedin.com/jobs/view/4353735199'
    };

    // ... (CV Data same as before)
    const cvData = {
        personal: {
            name: 'Barış Güven',
            email: 'barisguven01@icloud.com',
            location: 'İstanbul, Yenisahra',
            phone: '',
            linkedin_url: 'www.linkedin.com/in/barış-güven-ba567b329'
        },
        education: [
            {
                school: 'Maltepe Üniversitesi',
                degree: 'Lisans',
                field: 'Tıp',
                start_date: '',
                end_date: '2025'
            }
        ],
        experience: [],
        skills: ['Spor', 'Tıbbi Bilgi', 'İletişim'],
        rawText: `barış güven\nAdres: istanbul yenisahra saaharayıcedit mah bankacılar sokak\nE-Mail: barisguven01@icloud.com\nEĞİTİM\n2025 maltepe tıp\nİŞ DENEYİMİ\nKURS VE SERTİFİKALAR\nREFERANSLAR\nİLGİ ALANLARI\nspor\nKİŞİSEL BİLGİLER\nDoğum Tarihi: 22.10.2001\nDoğum Yeri: mardin\nMedeni Durum: Bekar`
    };

    const mockedMatchAnalysis = {
        match_score: 85,
        strengths: ["Tıp eğitimi", "Genç profil", "Terminoloji"],
        gaps: ["Deneyim eksik", "Ehliyet?"],
        risks: ["Adaptasyon"],
        summary: "Potansiyeli yüksek."
    };

    // 3. Insert Application (Minimal columns)
    const { data: application, error: appError } = await supabase
        .from('applications')
        .insert({
            user_id: userId,
            job_url: jobData.url,
            job_title: jobData.title,
            job_company: jobData.companyName,
            job_description: jobData.description,
            // job_requirements removed
            // job_scraped_at removed to be safe

            cv_file_path: 'manual_entry_script',
            // cv_file_name removed
            cv_parsed_data: cvData,

            match_score: mockedMatchAnalysis.match_score,
            match_analysis: mockedMatchAnalysis
        })
        .select()
        .single();

    if (appError) {
        console.error('Failed to create application:', appError);
        // Print valid columns if possible?
    } else {
        console.log('------------------------------------------------');
        console.log('SUCCESS: Application Created!');
        console.log(`Application ID: ${application.id}`);
        console.log('------------------------------------------------');
    }
}

createBarisApplication();
