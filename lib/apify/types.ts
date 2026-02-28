export interface LinkedInJobData {
    title: string;
    companyName: string;
    location: string;
    description: string;
    descriptionHTML?: string;
    postedAt?: string;
    jobUrl: string;
    employmentType?: string;
    seniorityLevel?: string;
    industries?: string[];
    functions?: string[];
}

export interface LinkedInProfileData {
    fullName: string;
    headline: string;
    summary?: string;
    location?: string; // Changed from location object to string to match likely scraped data or need simpler type
    experience: {
        title: string;
        companyName: string;
        location?: string;
        startDate?: string;
        endDate?: string; // "Present" or date
        description?: string;
    }[];
    education: {
        schoolName: string;
        degreeName?: string;
        fieldOfStudy?: string;
        startDate?: string;
        endDate?: string;
    }[];
    skills: string[];
    languages?: string[];
    certifications?: {
        name: string;
        authority?: string;
        date?: string;
    }[];
    profileUrl: string;
    profileImageUrl?: string;
}
