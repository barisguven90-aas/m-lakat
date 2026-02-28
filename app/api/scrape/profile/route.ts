import { NextResponse } from 'next/server';
import { scrapeLinkedInProfile } from '@/lib/apify/profile-scraper';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        if (!url.includes('linkedin.com/in/')) {
            return NextResponse.json({ error: 'Invalid LinkedIn Profile URL' }, { status: 400 });
        }

        const profileData = await scrapeLinkedInProfile(url);

        if (!profileData) {
            return NextResponse.json({ error: 'Failed to retrieve profile data' }, { status: 404 });
        }

        return NextResponse.json({ data: profileData });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
