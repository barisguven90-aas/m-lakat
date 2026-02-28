import { LinkedInProfileData } from './types';
import { ParsedCVData } from '../cv-parser/parse-structure';

export function mapProfileToCVData(profile: LinkedInProfileData): ParsedCVData {
    return {
        personal: {
            name: profile.fullName,
            email: "", // LinkedIn public profiles usually don't have email visible
            phone: "",
            location: profile.location || "",
            linkedin_url: profile.profileUrl,
        },
        experience: profile.experience.map(exp => ({
            company: exp.companyName,
            title: exp.title,
            start_date: exp.startDate || "",
            end_date: exp.endDate || "Present",
            description: exp.description || "",
            achievements: [] // Scraper might not distinguish achievements
        })),
        education: profile.education.map(edu => ({
            school: edu.schoolName,
            degree: edu.degreeName || "",
            field: edu.fieldOfStudy || "",
            start_date: edu.startDate || "",
            end_date: edu.endDate || ""
        })),
        skills: {
            technical: profile.skills || [],
            soft: [], // Hard to distinguish from simple list
            languages: profile.languages || []
        },
        projects: [], // LinkedIn projects are separate, scraper might fetch them but basic mapper here
        certifications: (profile.certifications || []).map(cert => ({
            name: cert.name,
            issuer: cert.authority || "",
            date: cert.date || ""
        }))
    };
}
