
import client from './client';
import { LinkedInProfileData } from './types';

// Using 'harvestapi/linkedin-profile-scraper' — 3.5M+ runs, NO COOKIES REQUIRED
// Input: { profileUrls: ["url"] } OR { publicIdentifiers: ["username"] }
// Output: Rich profile data with experience, education, skills, certifications etc.

const PROFILE_SCRAPER_ACTOR_ID = 'harvestapi/linkedin-profile-scraper';

// Fallback actors in case the primary one fails
const FALLBACK_ACTORS = [
    'supreme_coder/linkedin-profile-scraper',
    'dev_fusion/Linkedin-Profile-Scraper',
];

export async function scrapeLinkedInProfile(profileUrl: string): Promise<LinkedInProfileData | null> {
    try {
        console.log(`[Apify Profile Scraper] Starting for: ${profileUrl}`);

        // Extract the public identifier from URL (e.g. "williamhgates" from linkedin.com/in/williamhgates)
        const match = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
        const publicIdentifier = match ? match[1] : null;

        // Strategy 1: Primary actor with URL-based input
        try {
            const input: any = {};
            if (publicIdentifier) {
                input.publicIdentifiers = [publicIdentifier];
            } else {
                input.profileUrls = [profileUrl];
            }

            const run = await client.actor(PROFILE_SCRAPER_ACTOR_ID).call(input, { timeout: 90 });
            const { items } = await client.dataset(run.defaultDatasetId).listItems();

            if (items && items.length > 0) {
                const raw = items[0] as any;
                console.log("[Apify Profile Scraper] Primary success:", raw.firstName, raw.lastName || raw.fullName);
                return mapRawToProfile(raw, profileUrl);
            }
        } catch (e1) {
            console.warn("[Apify Profile Scraper] Primary failed:", (e1 as Error).message);
        }

        // Strategy 2: Fallback actors
        for (const actorId of FALLBACK_ACTORS) {
            try {
                const run = await client.actor(actorId).call(
                    { urls: [profileUrl] },
                    { timeout: 90 }
                );
                const { items } = await client.dataset(run.defaultDatasetId).listItems();

                if (items && items.length > 0) {
                    const raw = items[0] as any;
                    console.log(`[Apify Profile Scraper] Fallback ${actorId} success:`, raw.firstName || raw.fullName);
                    return mapRawToProfile(raw, profileUrl);
                }
            } catch (e) {
                console.warn(`[Apify Profile Scraper] Fallback ${actorId} failed:`, (e as Error).message);
            }
        }

        console.error("[Apify Profile Scraper] All strategies failed.");
        return null;

    } catch (error) {
        console.error('[Apify Profile Scraper] Fatal error:', error);
        return null;
    }
}

/**
 * Map the raw Apify output (harvestapi format) to our internal LinkedInProfileData type.
 * This handles multiple possible field name formats from different actors.
 */
function mapRawToProfile(raw: any, profileUrl: string): LinkedInProfileData {
    // Build full name
    const fullName = raw.fullName ||
        [raw.firstName, raw.lastName].filter(Boolean).join(' ') ||
        'Unknown Candidate';

    // Location can be a string or object (harvestapi returns object)
    let location = '';
    if (typeof raw.location === 'string') {
        location = raw.location;
    } else if (raw.location?.linkedinText) {
        location = raw.location.linkedinText;
    } else if (raw.location?.parsed?.text) {
        location = raw.location.parsed.text;
    }

    // Map experience — harvestapi uses 'position' instead of 'title'
    const experience = (raw.experience || []).map((exp: any) => ({
        title: exp.title || exp.position || '',
        companyName: exp.companyName || exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate?.text || exp.startDate || '',
        endDate: exp.endDate?.text || exp.endDate || '',
        description: exp.description || ''
    }));

    // Map education
    const education = (raw.education || []).map((edu: any) => ({
        schoolName: edu.schoolName || edu.school || '',
        degreeName: edu.degree || edu.degreeName || '',
        fieldOfStudy: edu.fieldOfStudy || edu.field || '',
        startDate: edu.startDate?.text || edu.startDate || '',
        endDate: edu.endDate?.text || edu.endDate || '',
    }));

    // Map skills — harvestapi returns objects with 'name' property
    const skills = (raw.skills || []).map((skill: any) =>
        typeof skill === 'string' ? skill : (skill.name || '')
    ).filter(Boolean);

    // Map languages — harvestapi returns objects with 'name' property
    const languages = (raw.languages || []).map((lang: any) =>
        typeof lang === 'string' ? lang : (lang.name || '')
    ).filter(Boolean);

    // Map certifications — harvestapi uses 'title' and 'issuedBy'
    const certifications = (raw.certifications || []).map((cert: any) => ({
        name: cert.name || cert.title || '',
        authority: cert.authority || cert.issuedBy || '',
        date: cert.date || cert.issuedAt || ''
    }));

    return {
        fullName,
        headline: raw.headline || '',
        summary: raw.summary || raw.about || '',
        location,
        experience,
        education,
        skills,
        languages,
        certifications,
        profileUrl: raw.linkedinUrl || raw.url || profileUrl,
        profileImageUrl: raw.photo || raw.profileImageUrl || raw.imgUrl || ''
    };
}
