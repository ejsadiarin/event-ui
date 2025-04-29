'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { organizationsAPI, eventsAPI } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface Organization {
    id: number;
    name: string;
    org_logo?: string;
    top_web_url?: string;
    background_pub_url?: string;
    created_at: string;
}

interface Event {
    id: number;
    title: string;
    description: string;
    venue: string;
    schedule: string;
    is_free: boolean;
    available_slots: number;
    max_capacity: number;
}

export default function OrganizationPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const resolvedParams = use(params);
    const orgId = parseInt(resolvedParams.id);

    const router = useRouter();
    const { user } = useAuth();

    const [organization, setOrganization] = useState<Organization | null>(null);
    const [orgEvents, setOrgEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchOrgData() {
            setIsLoading(true);
            try {
                // Fetch organization details
                const orgData = await organizationsAPI.getOrganizationById(orgId);
                setOrganization(orgData);

                // Fetch all events to find those associated with this organization
                const allEvents = await eventsAPI.getAllEvents();
                const filteredEvents = allEvents.filter((event: any) => event.org_id === orgId);
                setOrgEvents(filteredEvents);
            } catch (error) {
                console.error('Failed to fetch organization data:', error);
                toast.error('Error', {
                    description: 'Failed to load organization data',
                });
                router.push('/organizations');
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrgData();
    }, [orgId, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-center">
                    <h2 className="text-xl font-medium mb-2">Loading organization details...</h2>
                    <p className="text-muted-foreground">Please wait</p>
                </div>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-center">
                    <h2 className="text-xl font-medium mb-2">Organization not found</h2>
                    <p className="text-muted-foreground mb-4">The organization you're looking for doesn't exist</p>
                    <Button asChild>
                        <Link href="/organizations">View All Organizations</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Separate upcoming and past events
    const currentDate = new Date();
    const upcomingEvents = orgEvents.filter(
        event => new Date(event.schedule) >= currentDate
    ).sort((a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime());

    const pastEvents = orgEvents.filter(
        event => new Date(event.schedule) < currentDate
    ).sort((a, b) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime());

    return (
        <div className="max-w-5xl mx-auto">
            {/* Organization Header */}
            <div className="relative mb-8">
                {/* Background Image */}
                <div className="w-full h-40 md:h-60 rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-950">
                    {organization.background_pub_url && (
                        <img
                            src={organization.background_pub_url}
                            alt={`${organization.name} background`}
                            className="w-full h-full object-cover opacity-70"
                        />
                    )}
                </div>

                {/* Organization Info */}
                <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16 px-4 md:px-8">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-background shadow-lg flex items-center justify-center border-4 border-background overflow-hidden">
                        {organization.org_logo ? (
                            <img
                                src={organization.org_logo}
                                alt={organization.name}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="text-2xl md:text-4xl font-bold text-slate-400">
                                {organization.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left pb-2 flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold">{organization.name}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {organization.top_web_url && (
                                <a
                                    href={organization.top_web_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                >
                                    {organization.top_web_url.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </p>
                    </div>

                    {/* Admin Actions */}
                    {user && (
                        <div className="mt-4 md:mt-0 flex gap-2">
                            <Button variant="outline" asChild size="sm">
                                <Link href={`/organizations/${orgId}/edit`}>Edit</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/events/create">Create Event</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Events Section */}
            <section className="mt-10">
                <div className="flex items-baseline justify-between mb-6">
                    <h2 className="text-2xl font-bold">Upcoming Events</h2>
                    <Link href="/events" className="text-sm text-primary hover:underline">
                        View all events
                    </Link>
                </div>

                {upcomingEvents.length === 0 ? (
                    <div className="text-center py-10 bg-muted rounded-xl">
                        <p className="text-lg mb-4">No upcoming events</p>
                        {user && (
                            <Button asChild>
                                <Link href="/events/create">Create an Event</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.map(event => (
                            <Card key={event.id} className="flex flex-col h-full">
                                <CardContent className="pt-6 flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-semibold">{event.title}</h3>
                                        {event.is_free ? (
                                            <Badge variant="secondary">Free</Badge>
                                        ) : (
                                            <Badge>Paid</Badge>
                                        )}
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {event.description || 'No description available'}
                                    </p>

                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">Date:</span> {formatDate(event.schedule)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Venue:</span> {event.venue}
                                        </div>
                                        <div>
                                            <span className="font-medium">Available Slots:</span>{' '}
                                            {event.available_slots} / {event.max_capacity}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={`/events/${event.id}`}>View Details</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* Past Events Section */}
            {pastEvents.length > 0 && (
                <section className="mt-16">
                    <h2 className="text-2xl font-bold mb-6">Past Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastEvents.slice(0, 3).map(event => (
                            <Card key={event.id} className="flex flex-col h-full opacity-75 hover:opacity-100 transition-opacity">
                                <CardContent className="pt-6 flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-semibold">{event.title}</h3>
                                        {event.is_free ? (
                                            <Badge variant="outline">Free</Badge>
                                        ) : (
                                            <Badge variant="outline">Paid</Badge>
                                        )}
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {event.description || 'No description available'}
                                    </p>

                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">Date:</span> {formatDate(event.schedule)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Venue:</span> {event.venue}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button variant="ghost" className="w-full" asChild>
                                        <Link href={`/events/${event.id}`}>View Details</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {pastEvents.length > 3 && (
                        <div className="text-center mt-6">
                            <Button variant="outline" asChild>
                                <Link href={`/organizations/${orgId}/events`}>
                                    View All Past Events ({pastEvents.length})
                                </Link>
                            </Button>
                        </div>
                    )}
                </section>
            )}

            {/* Creation Date */}
            <div className="mt-16 mb-10 text-center text-sm text-muted-foreground">
                Organization created on {new Date(organization.created_at).toLocaleDateString()}
            </div>
        </div>
    );
}
