
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractTextFromCV } from '@/lib/cv-parser/extract-text';
import { parseCVStructure } from '@/lib/cv-parser/parse-structure';

export async function POST(request: Request) {
    try {
        console.log("Starting CV Upload process...");
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            console.error("No file found in form data.");
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        console.log(`File received: ${file.name} (${file.type})`);

        // 1. Validate file type and size
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!validTypes.includes(file.type)) {
            console.error(`Invalid file type: ${file.type}`);
            return NextResponse.json({ error: 'Invalid file type. Only PDF and DOCX are supported.' }, { status: 400 });
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            console.error(`File too large: ${file.size} bytes`);
            return NextResponse.json({ error: 'File size exceeds the 5MB limit.' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let filePath = '';

        // 2. Upload to Supabase Storage (Try-Catch to not block parsing)
        try {
            const supabase = await createClient();
            // Get current user (if auth fails, we skip storage but still parse)
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const timestamp = Date.now();
                const path = `${user.id}/${timestamp}_${file.name.replace(/\s+/g, '_')}`; // Sanitize filename

                const { error: uploadError } = await supabase.storage
                    .from('cv-uploads')
                    .upload(path, buffer, {
                        contentType: file.type,
                        upsert: false
                    });

                if (uploadError) {
                    console.warn('Storage upload error (non-fatal):', uploadError);
                } else {
                    filePath = path;
                    console.log(`File uploaded to Supabase: ${path}`);
                }
            } else {
                console.warn("User not authenticated for storage upload, skipping storage.");
            }
        } catch (storageError) {
            console.error('Unexpected storage error:', storageError);
            // Non-fatal, proceed to parsing
        }

        // 3. Extract Text
        console.log("Extracting text...");
        let text = '';
        try {
            text = await extractTextFromCV(buffer, file.type);
            console.log("Text extracted length:", text.length);
        } catch (extractError) {
            console.error("Text extraction failed:", extractError);
            return NextResponse.json({ error: 'Failed to read file content. Please try a different file.' }, { status: 500 });
        }

        // 4. Parse Structure
        console.log("Parsing structure...");
        let parsedData = {};
        try {
            parsedData = await parseCVStructure(text);
        } catch (parseError) {
            console.error("Structure parsing failed:", parseError);
            // Fallback to simple object
            parsedData = { rawText: text };
        }

        // 5. Calculate Parse Confidence Score
        const pd = parsedData as any;
        let confidence = 0;
        const warnings: string[] = [];

        // Score each section (total = 100)
        if (pd.personal?.name && pd.personal.name !== 'Unknown') confidence += 20;
        else warnings.push('Could not extract candidate name');

        if (pd.personal?.email) confidence += 10;
        else warnings.push('No email address found');

        if (pd.experience && pd.experience.length > 0) confidence += 25;
        else warnings.push('No work experience detected — consider adding manually');

        if (pd.education && pd.education.length > 0) confidence += 15;
        else warnings.push('No education details found');

        if (pd.skills && pd.skills.length >= 3) confidence += 15;
        else if (pd.skills && pd.skills.length > 0) { confidence += 8; warnings.push('Very few skills detected'); }
        else warnings.push('No skills detected — this may affect AI question quality');

        if (text.length > 500) confidence += 15;
        else if (text.length > 200) { confidence += 8; warnings.push('CV text is short — parsing may be incomplete'); }
        else warnings.push('Very little text extracted — check file quality');

        return NextResponse.json({
            success: true,
            filePath: filePath || 'local_processed',
            textPreview: text.slice(0, 200),
            parsedData,
            confidence: Math.min(confidence, 100),
            warnings,
        });

    } catch (error: any) {
        console.error('CV Processing System Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal processing error' },
            { status: 500 }
        );
    }
}
