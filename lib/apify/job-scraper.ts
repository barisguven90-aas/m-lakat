
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

// Using 'bebity/linkedin-jobs-scraper' — the most popular active Apify actor (2.8M+ runs)
// Input: Either search params (title, location) or a direct jobUrl
// This actor expects: title, location, rows (limit)
// For single URL scraping we use 'curious_coder/linkedin-jobs-scraper' as fallback

export async function scrapeLinkedInJob(jobUrl: string): Promise<any | null> {
    try {
        console.log(`[Apify Job Scraper] Starting for: ${jobUrl}`);

        // Strategy 1: Ultra-fast native fetch for public LinkedIn Job pages.
        // This bypassed Apify entirely, saving time and credit, and perfectly extracting the metadata.
        try {
            console.log("[Job Scraper] Attempting native fetch...");
            const res = await fetch(jobUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            const html = await res.text();

            // Extract Title & Company from <title> tag
            const titleMatch = html.match(/<title>(.*?)<\/title>/);
            let pageTitle = titleMatch ? titleMatch[1] : '';
            pageTitle = pageTitle.replace(' | LinkedIn', '');

            // Typical format: "Company hiring Title in Location"
            const matchCompanyTitle = pageTitle.match(/(.*?) hiring (.*?) in (.*)/);

            let title = pageTitle;
            let company = "Unknown Company";
            let location = "Remote/Unknown";

            if (matchCompanyTitle) {
                company = matchCompanyTitle[1].trim();
                title = matchCompanyTitle[2].trim();
                location = matchCompanyTitle[3].trim();
            } else {
                // If not "hiring", let's extract generic info
                title = pageTitle;
            }

            // Extract description from the markup div
            const descMatch = html.match(/<div class=\"show-more-less-html__markup[\s\S]*?>([\s\S]*?)<\/div>/);

            if (descMatch && descMatch[1].length > 50) {
                // Return success immediately!
                console.log("[Job Scraper] Native fetch succeeded!");
                return {
                    title,
                    company,
                    description: descMatch[1].replace(/<[^>]+>/g, ' ').trim(), // Clean basic HTML tags
                    url: jobUrl,
                    location
                };
            }
            console.log("[Job Scraper] Native fetch missed description. Falling back to Apify.");
        } catch (e) {
            console.warn("[Job Scraper] Native fetch failed:", (e as Error).message);
        }

        // Strategy 2: Try 'curious_coder/linkedin-jobs-scraper' with direct URL
        try {
            const run1 = await client.actor("curious_coder/linkedin-jobs-scraper").call(
                { urls: [jobUrl] },
                { timeout: 60 } // 60 second timeout
            );

            const { items: items1 } = await client.dataset(run1.defaultDatasetId).listItems();

            if (items1 && items1.length > 0) {
                const raw = items1[0] as any;
                console.log("[Apify Job Scraper] Strategy 1 success:", raw.title || raw.jobTitle);
                return normalizeJobData(raw, jobUrl);
            }
        } catch (e1) {
            console.warn("[Apify Job Scraper] Strategy 1 failed:", (e1 as Error).message);
        }

        // Strategy 2: Removed entirely. 
        // Searching LinkedIn by Job ID as a "title" keyword returns random promoted jobs globally (e.g. Japanese postings).
        // Only URL-based scraping should be used for single jobs.

        // Strategy 3: Try 'harvestapi/linkedin-job-search' (no cookies needed)
        try {
            const run3 = await client.actor("harvestapi/linkedin-job-search").call(
                { urls: [jobUrl] },
                { timeout: 60 }
            );

            const { items: items3 } = await client.dataset(run3.defaultDatasetId).listItems();

            if (items3 && items3.length > 0) {
                const raw = items3[0] as any;
                console.log("[Apify Job Scraper] Strategy 3 success:", raw.title || raw.jobTitle);
                return normalizeJobData(raw, jobUrl);
            }
        } catch (e3) {
            console.warn("[Apify Job Scraper] Strategy 3 failed:", (e3 as Error).message);
        }

        console.error("[Apify Job Scraper] All strategies failed.");
        return null;

    } catch (error) {
        console.error("[Apify Job Scraper] Fatal error:", error);
        return null;
    }
}

/** Normalize raw Apify output from any actor into consistent format */
function normalizeJobData(raw: any, jobUrl: string) {
    const rawCompany = raw.companyName || raw.company || raw.organizationName;
    const company = typeof rawCompany === 'object' && rawCompany !== null
        ? (rawCompany.name || rawCompany.universalName || "Unknown Company")
        : (rawCompany || "Unknown Company");

    return {
        title: raw.title || raw.jobTitle || raw.position || "Unknown Job Title",
        company: company,
        description: raw.description || raw.text || raw.jobDescription || raw.descriptionText || "No description found.",
        url: raw.url || raw.jobUrl || raw.link || jobUrl,
        location: raw.location || raw.formattedLocation || "Remote/Unknown"
    };
}
