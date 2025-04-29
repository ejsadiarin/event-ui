'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { eventsAPI } from '@/lib/api-client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface Event {
    id: number;
    title: string;
    description: string;
    venue: string;
    schedule: string;
    is_free: boolean;
    org_name: string;
    org_logo?: string;
    available_slots: number;
    max_capacity: number;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await eventsAPI.getAllEvents();
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchEvents();
    }, []);

    if (isLoading) {
        return <div className="text-center py-12">Loading events...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Upcoming Events</h1>
                <Link href="/events/create">
                    <Button>Create Event</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <Card key={event.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl">{event.title}</CardTitle>
                                {event.is_free ? (
                                    <Badge variant="secondary">Free</Badge>
                                ) : (
                                    <Badge>Paid</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-medium">Organization:</span> {event.org_name}
                                </div>
                                <div>
                                    <span className="font-medium">Venue:</span> {event.venue}
                                </div>
                                <div>
                                    <span className="font-medium">Date:</span> {formatDate(event.schedule)}
                                </div>
                                <div>
                                    <span className="font-medium">Available Slots:</span>{' '}
                                    {event.available_slots} / {event.max_capacity}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href={`/events/${event.id}`} className="w-full">
                                <Button variant="outline" className="w-full">View Details</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
