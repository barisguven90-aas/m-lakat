"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CVUploadZoneProps {
    onUploadComplete: (data: any) => void;
}

export function CVUploadZone({ onUploadComplete }: CVUploadZoneProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setIsUploading(true);
        setUploadStatus('idle');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/cv/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            setUploadStatus('success');

            // Show confidence-aware feedback
            const confidence = data.confidence || 0;
            const warnings = data.warnings || [];

            if (confidence >= 70) {
                toast.success(`CV parsed with high confidence (${confidence}%)!`);
            } else if (confidence >= 40) {
                toast.warning(`CV parsed with moderate confidence (${confidence}%). ${warnings[0] || 'Review the parsed data below.'}`, { duration: 6000 });
            } else {
                toast.error(`Low parsing confidence (${confidence}%). ${warnings.join('. ')}. Consider entering info manually.`, { duration: 8000 });
            }

            onUploadComplete({ ...data, confidence, warnings });
        } catch (error: any) {
            console.error(error);
            setUploadStatus('error');
            toast.error(error.message || 'Failed to upload and process CV');
        } finally {
            setIsUploading(false);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc']
        },
        maxFiles: 1,
        multiple: false
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-2 border-dashed rounded-xl p-10 transition-all duration-200 ease-in-out text-center cursor-pointer",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                isUploading ? "pointer-events-none opacity-50" : ""
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4">
                {isUploading ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">Reading & Analyzing CV...</p>
                        <p className="text-xs text-muted-foreground/75">This usually takes 10-20 seconds.</p>
                    </div>
                ) : uploadStatus === 'success' ? (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                        <p className="font-medium text-green-600">CV Uploaded Successfully!</p>
                        <p className="text-sm text-muted-foreground">Drag another file to replace</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 rounded-full bg-primary/10">
                            <UploadCloud className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-lg">
                                {isDragActive ? "Drop your CV here" : "Click to upload or drag & drop"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                PDF or DOCX (Max 10MB)
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
