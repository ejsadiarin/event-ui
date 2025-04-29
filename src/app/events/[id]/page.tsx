'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { eventsAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const eventId = parseInt(resolvedParams.id);

    const { user } = useAuth();
    const router = useRouter();

    const [event, setEvent] = useState<any>(null);
    const [availableSlots, setAvailableSlots] = useState<number>(0);
    const [isRegistered, setIsRegistered] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRegistering, setIsRegistering] = useState<boolean>(false);

    useEffect(() => {
        async function fetchEventData() {
            try {
                // Fetch event details
                const events = await eventsAPI.getAllEvents();
                const currentEvent = events.find((e: any) => e.id === eventId);

                if (!currentEvent) {
                    toast.error("Error", {
                        description: "Event not found",
                    });
                    router.push('/events');
                    return;
                }

                setEvent(currentEvent);
                setAvailableSlots(currentEvent.available_slots);

                // Check if user is registered
                if (user) {
                    const { isRegistered } = await eventsAPI.checkRegistrationStatus(eventId);
                    setIsRegistered(isRegistered);
                }
            } catch (error) {
                console.error('Failed to fetch event details:', error);
                toast.error("Error", {
                    description: "Failed to fetch event details",
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchEventData();
    }, [eventId, user, router]);

    const handleRegister = async () => {
        if (!user) {
            toast.error("Authentication Required", {
                description: "Please login to register for this event",
            });
            router.push('/login');
            return;
        }

        setIsRegistering(true);
        try {
            const { availableSlots: newSlots } = await eventsAPI.registerForEvent(eventId);
            setAvailableSlots(newSlots);
            setIsRegistered(true);
            toast.success("Success!", {
                description: "You have successfully registered for this event",
            });
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error("Registration Failed", {
                description: "Failed to register for this event. Please try again.",
            });
        } finally {
            setIsRegistering(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-12">Loading event details...</div>;
    }

    if (!event) {
        return <div className="text-center py-12">Event not found</div>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                {event.is_free ? (
                    <Badge variant="secondary" className="text-lg px-3 py-1">Free</Badge>
                ) : (
                    <Badge className="text-lg px-3 py-1">Paid</Badge>
                )}
            </div>

            <div className="bg-muted p-6 rounded-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2">Date & Time</h3>
                        <p>{formatDate(event.schedule)}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Venue</h3>
                        <p>{event.venue}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Organization</h3>
                        <p>{event.org_name}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Available Slots</h3>
                        <p>{availableSlots} of {event.max_capacity}</p>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <p className="whitespace-pre-line">{event.description}</p>
            </div>

            <div className="flex justify-center mb-8">
                {isRegistered ? (
                    <div className="text-center">
                        <Badge variant="outline" className="text-lg px-6 py-2 mb-2">
                            You are registered for this event
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                            Check your dashboard for more details
                        </p>
                    </div>
                ) : (
                    <Button
                        size="lg"
                        disabled={availableSlots <= 0 || isRegistering}
                        onClick={handleRegister}
                    >
                        {isRegistering ? 'Registering...' : 'Register for Event'}
                    </Button>
                )}
            </div>
        </div>
    );
}
