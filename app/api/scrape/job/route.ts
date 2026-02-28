
import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

// We put the logic here temporarily to debug directly if needed, 
// or keep it in lib. But let's use the lib function we just improved.
import { scrapeLinkedInJob } from '@/lib/apify/job-scraper';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        console.log("Scraping request received for:", url);

        if (!url || !url.includes('linkedin.com')) {
            return NextResponse.json(
                { error: 'Invalid LinkedIn URL. Please ensure it is a valid job post link.' },
                { status: 400 }
            );
        }

        // Call the scraper
        const jobData = await scrapeLinkedInJob(url);

        if (!jobData) {
            console.error("Scraper returned null.");
            return NextResponse.json(
                { error: 'Could not fetch job details. Please try manual entry.' },
                { status: 404 }
            );
        }

        console.log("Job data successfully retrieved:", jobData.title);

        return NextResponse.json({
            data: {
                title: jobData.title,
                companyName: jobData.company,
                description: jobData.description,
                location: jobData.location,
                url: url
            }
        });

    } catch (error: any) {
        console.error('API Error in /api/scrape/job:', error);
        return NextResponse.json(
            { error: 'Internal Server Error during scraping.' },
            { status: 500 }
        );
    }
}
