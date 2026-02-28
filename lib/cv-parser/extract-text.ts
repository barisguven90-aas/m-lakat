import mammoth from 'mammoth';

export async function extractTextFromCV(fileBuffer: Buffer, fileType: string): Promise<string> {
    try {
        if (fileType === 'application/pdf') {
            // Lazy load to avoid build time DOM issues
            // @ts-ignore
            const pdf = require('pdf-parse');
            const data = await pdf(fileBuffer);
            return data.text;
        }

        if (
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileType === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            return result.value;
        }

        throw new Error(`Unsupported file type: ${fileType}`);
    } catch (error) {
        console.error('Error extracting text from CV:', error);
        throw new Error('Failed to extract text from file');
    }
}
