'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { eventsAPI } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const data = await eventsAPI.getUserRegistrations();
                setRegistrations(data);
            } catch (error) {
                console.error('Failed to fetch user registrations:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUserData();
    }, []);

    if (!user) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">You need to be logged in</h1>
                <p className="mb-6">Please login to view your dashboard</p>
                <Button asChild>
                    <Link href="/login">Go to Login</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="m-10 space-y-8">
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold">Welcome, {user.username}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                    <TabsTrigger value="past">Past Events</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Your Upcoming Events</h2>
                    {isLoading ? (
                        <p>Loading your events...</p>
                    ) : registrations.length === 0 ? (
                        <div className="text-center py-8 border rounded-lg bg-muted">
                            <p className="text-muted-foreground mb-4">You haven't registered for any events yet</p>
                            <Button asChild>
                                <Link href="/events">Browse Events</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {registrations
                                .filter(reg => new Date(reg.schedule) >= new Date())
                                .map(registration => (
                                    <Card key={registration.id}>
                                        <CardHeader className="flex flex-row items-start justify-between">
                                            <div>
                                                <CardTitle>{registration.title}</CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(registration.schedule)}
                                                </p>
                                            </div>
                                            {registration.is_free ? (
                                                <Badge variant="secondary">Free</Badge>
                                            ) : (
                                                <Badge>Paid</Badge>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="font-medium">Organization:</span> {registration.org_name}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Venue:</span> {registration.venue}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Registered on:</span> {formatDate(registration.registration_date)}
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <Button variant="outline" asChild size="sm">
                                                    <Link href={`/events/${registration.id}`}>View Event Details</Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="past" className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Your Past Events</h2>
                    {isLoading ? (
                        <p>Loading your events...</p>
                    ) : registrations.filter(reg => new Date(reg.schedule) < new Date()).length === 0 ? (
                        <div className="text-center py-8 border rounded-lg bg-muted">
                            <p className="text-muted-foreground">No past events found</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {registrations
                                .filter(reg => new Date(reg.schedule) < new Date())
                                .map(registration => (
                                    <Card key={registration.id}>
                                        <CardHeader className="flex flex-row items-start justify-between">
                                            <div>
                                                <CardTitle>{registration.title}</CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(registration.schedule)}
                                                </p>
                                            </div>
                                            {registration.is_free ? (
                                                <Badge variant="secondary">Free</Badge>
                                            ) : (
                                                <Badge>Paid</Badge>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="font-medium">Organization:</span> {registration.org_name}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Venue:</span> {registration.venue}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Registered on:</span> {formatDate(registration.registration_date)}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
