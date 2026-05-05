"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CVUploadZone } from '@/components/cv-upload/CVUploadZone';
import { CVPreview } from '@/components/cv-upload/CVPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { mapProfileToCVData } from '@/lib/apify/mapper';

export function ApplicationWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Data State
    const [jobUrl, setJobUrl] = useState('');
    const [manualJobData, setManualJobData] = useState({ title: '', company: '', description: '' });
    const [useManualJob, setUseManualJob] = useState(false);

    const [profileUrl, setProfileUrl] = useState('');
    const [jobData, setJobData] = useState<any>(null);
    const [cvData, setCvData] = useState<any>(null);
    const [cvFilepath, setCvFilepath] = useState<string>('');
    const [manualCvText, setManualCvText] = useState('');

    const handleJobScrape = async () => {
        if (!jobUrl && !useManualJob) {
            toast.error("Please enter a LinkedIn Job URL");
            return;
        }

        if (useManualJob) {
            if (!manualJobData.description) {
                toast.error("Lütfen ilan bilgisini girin.");
                return;
            }
            setJobData({
                title: manualJobData.title,
                companyName: manualJobData.company || "Unknown Company",
                description: manualJobData.description,
                jobUrl: "manual_entry"
            });
            setStep(2);
            return;
        }

        setIsLoading(true);
        try {
            // Auto-prepend https if missing
            let formattedUrl = jobUrl;
            if (!formattedUrl.startsWith('http')) {
                formattedUrl = 'https://' + formattedUrl;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch('/api/scrape/job', {
                method: 'POST',
                body: JSON.stringify({ url: formattedUrl }),
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            }).catch(e => {
                throw new Error("Timeout or Network Error");
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                console.warn("API Scrape failed, requesting manual entry.");
                toast.error("Could not auto-fetch job details. Please enter manually.");
                setUseManualJob(true);
                setJobUrl(formattedUrl); // Keep the typed URL
                setJobData(null);
                return;
            }

            const data = await res.json();

            if (!data.data || !data.data.description) {
                toast.error("Scraped data incomplete. Please enter manually.");
                setUseManualJob(true);
                return;
            }

            setJobData(data.data);
            toast.success("Job found!");
            setStep(2);

        } catch (e) {
            console.error("Job Scrape Error:", e);
            toast.error("İlan okunamadı (Zaman aşımı veya hata).");
            setUseManualJob(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileScrape = async () => {
        if (!profileUrl) {
            toast.error("Please enter a LinkedIn Profile URL");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Auto-prepend https
            let formattedUrl = profileUrl.trim();
            if (!formattedUrl.startsWith('http')) {
                formattedUrl = 'https://' + formattedUrl;
            }

            // 2. Extract name from URL for potential fallback
            // e.g. linkedin.com/in/john-doe-123 -> "John Doe"
            let fallbackName = "Candidate";
            try {
                const parts = formattedUrl.split('/in/');
                if (parts.length > 1) {
                    const slug = parts[1].split('/')[0].split('?')[0]; // remote query params
                    fallbackName = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ').replace(/[0-9]/g, '').trim();
                }
            } catch (e) { }

            const res = await fetch('/api/scrape/profile', {
                method: 'POST',
                body: JSON.stringify({ url: formattedUrl }),
                headers: { 'Content-Type': 'application/json' }
            });

            let data;
            if (res.ok) {
                data = await res.json();
            }

            // 3. Fallback Logic: If scrape fails, use simulated data so user can proceed
            if (!res.ok || !data || !data.data) {
                console.warn("Profile scrape failed, falling back to simulated data.");

                // Create simulation data to unblock the user
                const simulatedData = {
                    personal: {
                        name: fallbackName,
                        linkedin_url: formattedUrl,
                        email: "Not provided",
                        phone: "Not provided",
                        summary: "Profile imported from LinkedIn URL."
                    },
                    experience: [],
                    education: [],
                    skills: ["Communication", "Leadership", "Problem Solving"],
                    rawText: `LinkedIn Profile: ${formattedUrl}`
                };

                setCvData(simulatedData);
                setCvFilepath(`linkedin_profile_fallback_${Date.now()}.json`);
                toast.warning("Could not fully scrape profile (privacy settings). Using basic info.");
                setStep(3);
                return;
            }

            const mappedData = mapProfileToCVData(data.data);
            setCvData(mappedData);
            setCvFilepath(`linkedin_profile_${Date.now()}.json`);
            toast.success("Profile imported successfully!");
            setStep(3);

        } catch (e) {
            console.error(e);
            toast.error("Error connecting to server. Please try Manual Entry.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleCVUpload = (result: any) => {
        setCvData(result.parsedData);
        setCvFilepath(result.filePath);
        setStep(3);
        toast.success("CV Uploaded & Parsed!");
    };

    const handleCreateApplication = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/applications/create', {
                method: 'POST',
                body: JSON.stringify({
                    jobData,
                    cvData,
                    cvFilepath,
                    jobUrl: useManualJob ? 'manual' : jobUrl
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to create application');
            }

            const { applicationId } = await res.json();
            toast.success("Application created! analyzing match...");
            router.push(`/dashboard/applications/${applicationId}`);
        } catch (e: any) {
            toast.error(e.message || "Error creating application.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500 pb-20">
            {/* Step Indicator */}
            <div className="flex items-center justify-between px-10">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2 relative z-10">
                        <div className={`
                            h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-300
                            ${step >= s ? "bg-primary text-primary-foreground border-primary scale-110 shadow-lg" : "bg-muted text-muted-foreground border-muted-foreground/30"}
                        `}>
                            {step > s ? <CheckCircle className="h-6 w-6" /> : s}
                        </div>
                        <span className={`text-sm font-medium ${step >= s ? "text-primary" : "text-muted-foreground"}`}>
                            {s === 1 ? "Job Details" : s === 2 ? "Candidate Info" : "Review"}
                        </span>
                    </div>
                ))}
                {/* Progress Bar Line */}
                <div className="absolute top-14 left-0 w-full h-0.5 bg-muted/30 -z-0 hidden md:block" />
            </div>

            <Card className="min-h-[400px] flex flex-col shadow-lg border-t-4 border-t-primary">
                {step === 1 && (
                    <>
                        <CardHeader>
                            <CardTitle>Target Job</CardTitle>
                            <CardDescription>
                                {useManualJob ? "Enter job details manually." : "Paste the LinkedIn URL for the job you are applying to."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!useManualJob ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>LinkedIn Job URL</Label>
                                        <Input
                                            placeholder="https://www.linkedin.com/jobs/view/..."
                                            value={jobUrl}
                                            onChange={(e) => setJobUrl(e.target.value)}
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <Button variant="link" size="sm" onClick={() => setUseManualJob(true)} className="text-muted-foreground px-0">
                                            Having trouble? Enter manually
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-sm flex gap-3 items-start">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-500" />
                                        <div className="text-amber-600 dark:text-amber-400">
                                            <p className="font-semibold">İlan otomatik okunamadı. Lütfen ilanın metnini aşağıya yapıştırın.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Job Description</Label>
                                        <Textarea
                                            placeholder="İş ilanı açıklamasını buraya yapıştırın..."
                                            className="min-h-[200px]"
                                            value={manualJobData.description}
                                            onChange={e => setManualJobData({ ...manualJobData, description: e.target.value })}
                                        />
                                    </div>
                                    <Button variant="link" size="sm" onClick={() => setUseManualJob(false)} className="text-muted-foreground px-0">
                                        Back to URL Import
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="mt-auto flex flex-col sm:flex-row justify-end p-4 sm:p-6 border-t border-border/50">
                            <Button onClick={handleJobScrape} disabled={isLoading || (useManualJob && !manualJobData.description.trim())} size="lg" className="w-full sm:w-auto">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Next Step <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </>
                )}

                {step === 2 && (
                    <Tabs defaultValue="upload" className="flex-1 flex flex-col">
                        <div className="px-6 pt-6">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="upload">Upload CV</TabsTrigger>
                                <TabsTrigger value="linkedin">LinkedIn Profile</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="upload" className="flex-1 flex flex-col pt-4">
                            <CardHeader>
                                <CardTitle>Upload Resume</CardTitle>
                                <CardDescription>Upload your PDF or DOCX resume to extract experience.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CVUploadZone onUploadComplete={handleCVUpload} />
                            </CardContent>
                            <CardFooter className="mt-auto p-4 sm:p-6 border-t border-border/50 flex justify-start">
                                <Button variant="ghost" onClick={() => setStep(1)} className="w-full sm:w-auto">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            </CardFooter>
                        </TabsContent>

                        <TabsContent value="linkedin" className="flex-1 flex flex-col pt-4">
                            <CardHeader>
                                <CardTitle>Import LinkedIn Profile</CardTitle>
                                <CardDescription>Enter your public LinkedIn profile URL to fetch details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>LinkedIn Profile URL</Label>
                                    <Input
                                        placeholder="https://www.linkedin.com/in/username/"
                                        value={profileUrl}
                                        onChange={(e) => setProfileUrl(e.target.value)}
                                        className="h-12"
                                    />
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-sm flex gap-3 items-start">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-500" />
                                    <div className="text-amber-600 dark:text-amber-400">
                                        <p className="font-semibold mb-2">Important — Read Before Using</p>
                                        <ul className="space-y-1.5 text-xs leading-relaxed list-disc ml-4 opacity-90">
                                            <li>This feature fetches <strong>publicly visible</strong> LinkedIn data. It may fail if your profile has privacy restrictions.</li>
                                            <li>Scraping LinkedIn profiles may conflict with LinkedIn&apos;s Terms of Service. Use at your own discretion.</li>
                                            <li><strong>Recommended:</strong> For more accurate results, use the <em>&quot;Upload CV&quot;</em> tab instead. It&apos;s more reliable and privacy-friendly.</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="mt-auto flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 border-t border-border/50">
                                <Button variant="ghost" onClick={() => setStep(1)} className="w-full sm:w-auto">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button onClick={handleProfileScrape} disabled={isLoading} size="default" className="w-full sm:w-auto">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Import Profile <ArrowRight className="ml-2 h-4 w-4 hidden sm:inline-block" />
                                </Button>
                            </CardFooter>
                        </TabsContent>
                        {/* Manual entry tab removed as per request */}
                    </Tabs>
                )}

                {step === 3 && (
                    <>
                        <CardHeader>
                            <CardTitle>Review & Analyze</CardTitle>
                            <CardDescription>We are ready to create your personalized interview plan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" /> Target Job
                                    </h3>
                                    <div className="p-4 rounded-xl border border-border/50 bg-muted/30 text-sm space-y-2">
                                        <p className="font-bold text-base text-card-foreground line-clamp-1">{jobData?.title || "Unknown Job"}</p>
                                        <p className="text-muted-foreground line-clamp-1">{typeof jobData?.companyName === 'object' ? jobData?.companyName?.name : jobData?.companyName || "Unknown Company"}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">{jobData?.description || "No description"}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                                        <div className="h-2 w-2 rounded-full bg-green-500" /> Candidate
                                    </h3>
                                    <div className="p-4 rounded-xl border border-border/50 bg-muted/30 text-sm space-y-2">
                                        <p className="font-bold text-base text-card-foreground line-clamp-1">{cvData?.personal?.name || "Candidate"}</p>
                                        <p className="text-muted-foreground line-clamp-1">{cvData?.personal?.email || (cvData?.rawText ? "Manual/LinkedIn Entry" : "No email provided")}</p>
                                        <p className="text-xs text-muted-foreground truncate opacity-70">{cvData?.personal?.linkedin_url || "CV Provided"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="mt-auto flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 border-t border-border/50">
                            <Button variant="ghost" onClick={() => setStep(2)} className="w-full sm:w-auto">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button onClick={handleCreateApplication} disabled={isLoading} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 text-white" size="default">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Analyze Fit <ArrowRight className="ml-2 h-4 w-4 hidden sm:inline-block" />
                            </Button>
                        </CardFooter>
                    </>
                )}
            </Card>

            {/* Preview Section */}
            {cvData && step === 3 && (
                <div className="border rounded-lg bg-background p-6 shadow-sm">
                    <h3 className="font-semibold mb-4">Parsed Data Preview</h3>
                    <Tabs defaultValue="cv" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="cv">CV Information</TabsTrigger>
                            <TabsTrigger value="job">Job Description</TabsTrigger>
                        </TabsList>
                        <TabsContent value="cv" className="mt-4">
                            <CVPreview data={cvData} />
                        </TabsContent>
                        <TabsContent value="job" className="mt-4">
                            <div className="p-4 rounded border bg-muted/20 text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                                {jobData?.description}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}
