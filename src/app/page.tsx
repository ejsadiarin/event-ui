import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)]">
            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        Find and Register for Amazing Events
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                        Join workshops, seminars, and conferences to expand your knowledge and network with professionals.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                        <Button size="lg" asChild>
                            <Link href="/events">Explore Events</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/register">Create Account</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="w-full px-4 md:px-8 py-16 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Why Choose Event Hub?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-card rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold mb-3">Browse Events</h3>
                            <p className="text-muted-foreground">Find events that match your interests and career goals. Filter by date, category, or organization.</p>
                        </div>
                        <div className="p-6 bg-card rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold mb-3">Register Easily</h3>
                            <p className="text-muted-foreground">Quick and seamless registration process for any event. No paperwork, just a few clicks.</p>
                        </div>
                        <div className="p-6 bg-card rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold mb-3">Track Participation</h3>
                            <p className="text-muted-foreground">Keep track of all events you've registered for and manage your upcoming schedule.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
