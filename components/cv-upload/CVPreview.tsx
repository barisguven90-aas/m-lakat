
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Code, FileText } from 'lucide-react';

// Loosening the type here to avoid strict issues if data shape varies slightly between parsers/scrapers
// Ideally we should unify the type, but runtime safety is priority now.
export function CVPreview({ data }: { data: any }) {
    if (!data) return null;

    // Safety checks for arrays
    const experience = Array.isArray(data.experience) ? data.experience : [];
    const education = Array.isArray(data.education) ? data.education : [];

    // Skills might be array of strings OR object with technical/soft
    let allSkills: string[] = [];
    if (Array.isArray(data.skills)) {
        allSkills = data.skills;
    } else if (data.skills && typeof data.skills === 'object') {
        const tech = Array.isArray(data.skills.technical) ? data.skills.technical : [];
        const soft = Array.isArray(data.skills.soft) ? data.skills.soft : [];
        allSkills = [...tech, ...soft];
    }

    return (
        <div className="space-y-6">
            {/* Personal Info */}
            <Card>
                <CardHeader>
                    <CardTitle>{data.personal?.name || "Candidate"}</CardTitle>
                    <CardDescription>
                        {data.personal?.email || "No email"} • {data.personal?.location || "No location"}
                    </CardDescription>
                </CardHeader>
                {/* Fallback for raw text display if parsed sections are empty */}
                {data.rawText && experience.length === 0 && education.length === 0 && (
                    <CardContent className="pt-0">
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-40 overflow-hidden relative">
                            {data.rawText.slice(0, 300)}...
                            <div className="absolute bottom-0 w-full h-10 bg-gradient-to-t from-white to-transparent dark:from-slate-950" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                            *Previewing raw text content. Full text will be analyzed by AI.*
                        </p>
                    </CardContent>
                )}
            </Card>

            {/* Experience */}
            {experience.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Briefcase className="h-5 w-5" /> Experience
                    </h3>
                    {experience.map((exp: any, i: number) => (
                        <Card key={i}>
                            <CardHeader className="py-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{exp.title}</CardTitle>
                                        <CardDescription>{exp.company || exp.companyName}</CardDescription>
                                    </div>
                                    <Badge variant="outline">{exp.start_date || exp.date || exp.startDate} - {exp.end_date || exp.endDate || 'Present'}</Badge>
                                </div>
                            </CardHeader>
                            {exp.description && (
                                <CardContent className="pb-4 text-sm text-muted-foreground">
                                    <p>{exp.description}</p>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Skills */}
            {allSkills.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Code className="h-5 w-5" /> Skills
                    </h3>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-2">
                                {allSkills.map((skill, i) => (
                                    <Badge key={`${skill}-${i}`} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Education */}
            {education.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" /> Education
                    </h3>
                    {education.map((edu: any, i: number) => (
                        <Card key={i}>
                            <CardHeader className="py-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{edu.school || edu.schoolName}</CardTitle>
                                        <CardDescription>{edu.degree || edu.degreeName} {edu.field || edu.fieldOfStudy ? `in ${edu.field || edu.fieldOfStudy}` : ''}</CardDescription>
                                    </div>
                                    <Badge variant="outline">{edu.start_date || edu.startDate} - {edu.end_date || edu.endDate || 'Present'}</Badge>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}

            {/* If basically empty structure but raw text exists (Manual Entry case) */}
            {experience.length === 0 && education.length === 0 && allSkills.length === 0 && data.rawText && (
                <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground bg-muted/20">
                    <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>Resume content loaded manually.</p>
                </div>
            )}
        </div>
    );
}
