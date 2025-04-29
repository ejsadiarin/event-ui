'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { organizationsAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CreateOrganizationPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        org_logo: '',
        top_web_url: '',
        background_pub_url: '',
    });

    // Check if user is authenticated
    if (!user) {
        // We do this check client-side to have a smoother UX
        // You could also handle this with middleware
        toast.error('Authentication Required', {
            description: 'You must be logged in to create an organization',
        });
        router.push('/login');
    }

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate name field (required)
            if (!formData.name.trim()) {
                toast.error('Organization name is required');
                setIsLoading(false);
                return;
            }

            // Validate name length
            if (formData.name.length > 80) {
                toast.error('Organization name must be 80 characters or less');
                setIsLoading(false);
                return;
            }

            // Validate URLs if provided
            if (formData.top_web_url && !isValidUrl(formData.top_web_url)) {
                toast.error('Please enter a valid website URL');
                setIsLoading(false);
                return;
            }

            if (formData.background_pub_url && !isValidUrl(formData.background_pub_url)) {
                toast.error('Please enter a valid background image URL');
                setIsLoading(false);
                return;
            }

            // Create organization
            const response = await organizationsAPI.createOrganization(formData);

            toast.success('Organization Created', {
                description: 'Your organization has been created successfully!',
            });

            // Navigate to the new organization's page
            router.push(`/organizations/${response.id}`);
        } catch (error) {
            console.error('Failed to create organization:', error);
            toast.error('Failed to create organization', {
                description: 'There was an error creating your organization. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to validate URLs
    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Organization</CardTitle>
                    <CardDescription>
                        Fill out the form below to create a new organization
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Organization Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Enter the organization name"
                                value={formData.name}
                                onChange={handleChange}
                                maxLength={80}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                {formData.name.length}/80 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="org_logo">Logo URL</Label>
                            <Input
                                id="org_logo"
                                name="org_logo"
                                placeholder="Enter the URL for the organization's logo"
                                value={formData.org_logo}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-muted-foreground">
                                A direct link to your organization's logo image
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="top_web_url">Website URL</Label>
                            <Input
                                id="top_web_url"
                                name="top_web_url"
                                type="url"
                                placeholder="https://example.com"
                                value={formData.top_web_url}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-muted-foreground">
                                Your organization's website (include https://)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="background_pub_url">Background Image URL</Label>
                            <Input
                                id="background_pub_url"
                                name="background_pub_url"
                                type="url"
                                placeholder="https://example.com/background.jpg"
                                value={formData.background_pub_url}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-muted-foreground">
                                A background image for your organization's profile (include https://)
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/organizations')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Organization'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
