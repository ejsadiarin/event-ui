'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { eventsAPI, organizationsAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Organization {
    id: number;
    name: string;
}

export default function CreateEventPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        org_id: '',
        venue: '',
        schedule: '',
        is_free: true,
        code: '',
        max_capacity: '100',
    });

    // Fetch organizations when component mounts
    useEffect(() => {
        async function fetchOrganizations() {
            try {
                const orgs = await organizationsAPI.getAllOrganizations();
                setOrganizations(orgs);

                // Set default org_id if organizations exist
                if (orgs.length > 0) {
                    setEventData(prev => ({ ...prev, org_id: orgs[0].id.toString() }));
                }
            } catch (error) {
                console.error('Failed to fetch organizations:', error);
                toast.error('Failed to load organizations');
            }
        }

        // Check if user is logged in
        if (!user) {
            toast.error('Authentication Required', {
                description: 'You must be logged in to create an event',
            });
            router.push('/login');
            return;
        }

        fetchOrganizations();
    }, [user, router]);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEventData(prev => ({ ...prev, [name]: value }));
    };

    // Handle select changes
    const handleSelectChange = (name: string, value: string) => {
        setEventData(prev => ({ ...prev, [name]: value }));
    };

    // Handle switch toggle for is_free
    const handleSwitchChange = (checked: boolean) => {
        setEventData(prev => ({ ...prev, is_free: checked }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Convert string values to appropriate types
            const payload = {
                ...eventData,
                org_id: parseInt(eventData.org_id),
                max_capacity: parseInt(eventData.max_capacity),
            };

            // Validate required fields
            if (!payload.title || !payload.venue || !payload.schedule || !payload.org_id) {
                toast.error('Please fill in all required fields');
                setIsLoading(false);
                return;
            }

            const response = await eventsAPI.createEvent(payload);
            toast.success('Event Created', {
                description: 'Your event has been created successfully!',
            });

            // Navigate to the new event's page
            router.push(`/events/${response.id}`);
        } catch (error) {
            console.error('Failed to create event:', error);
            toast.error('Failed to create event', {
                description: 'There was an error creating your event. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Format the current datetime for the schedule input's min attribute
    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
    };

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Event</CardTitle>
                    <CardDescription>
                        Fill out the form below to create a new event
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Event Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Enter the event title"
                                value={eventData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Event Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe your event"
                                value={eventData.description}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="org_id">
                                Organization <span className="text-red-500">*</span>
                            </Label>
                            {organizations.length > 0 ? (
                                <Select
                                    value={eventData.org_id}
                                    onValueChange={(value) => handleSelectChange('org_id', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an organization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {organizations.map((org) => (
                                            <SelectItem key={org.id} value={org.id.toString()}>
                                                {org.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">No organizations found</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push('/organizations/create')}
                                    >
                                        Create Organization
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="venue">
                                Venue <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="venue"
                                name="venue"
                                placeholder="Enter the event venue"
                                value={eventData.venue}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="schedule">
                                Date & Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="schedule"
                                name="schedule"
                                type="datetime-local"
                                value={eventData.schedule}
                                onChange={handleChange}
                                min={getCurrentDateTime()}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_capacity">
                                Maximum Capacity <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="max_capacity"
                                name="max_capacity"
                                type="number"
                                min="1"
                                placeholder="Enter maximum number of attendees"
                                value={eventData.max_capacity}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Event Code</Label>
                            <Input
                                id="code"
                                name="code"
                                placeholder="Optional unique code for your event"
                                value={eventData.code}
                                onChange={handleChange}
                                maxLength={10}
                            />
                            <p className="text-xs text-muted-foreground">
                                A unique code that can be used to identify this event (optional)
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={eventData.is_free}
                                onCheckedChange={handleSwitchChange}
                                id="is_free"
                            />
                            <Label htmlFor="is_free">This is a free event</Label>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Event'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
