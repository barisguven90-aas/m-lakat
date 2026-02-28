import { ApplicationWizard } from '@/components/application/ApplicationWizard';

export default function NewApplicationPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">New Interview Application</h1>
                <p className="text-muted-foreground">Start by linking the job you want to practice for.</p>
            </div>
            <ApplicationWizard />
        </div>
    );
}
