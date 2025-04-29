import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
    return (
        <div className="flex flex-col items-center gap-8 py-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold">
                    Find and Register for Amazing Events
                </h1>
                <p className="text-xl text-muted-foreground max-w-[800px]">
                    Join workshops, seminars, and conferences to expand your knowledge and network with professionals.
                </p>
                <div className="flex gap-4 justify-center mt-8">
                    <Button size="lg" asChild>
                        <Link href="/events">Explore Events</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/register">Create Account</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12">
                <div className="p-6 bg-muted rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Browse Events</h3>
                    <p>Find events that match your interests and career goals</p>
                </div>
                <div className="p-6 bg-muted rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Register Easily</h3>
                    <p>Quick and seamless registration process for any event</p>
                </div>
                <div className="p-6 bg-muted rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Track Participation</h3>
                    <p>Keep track of all events you've registered for</p>
                </div>
            </div>
        </div>
    );
}
