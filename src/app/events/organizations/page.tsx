'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { organizationsAPI } from '@/lib/api-client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Organization {
    id: number;
    name: string;
    org_logo?: string;
    top_web_url?: string;
    background_pub_url?: string;
    created_at: string;
}

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchOrganizations() {
            try {
                const data = await organizationsAPI.getAllOrganizations();
                setOrganizations(data);
            } catch (error) {
                console.error('Failed to fetch organizations:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrganizations();
    }, []);

    if (isLoading) {
        return <div className="text-center py-12">Loading organizations...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Organizations</h1>
                <Link href="/organizations/create">
                    <Button>Create Organization</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org) => (
                    <Card key={org.id}>
                        <CardHeader>
                            <CardTitle>{org.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                                {org.org_logo ? (
                                    <img
                                        src={org.org_logo}
                                        alt={org.name}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <span className="text-muted-foreground">No logo available</span>
                                )}
                            </div>
                            {org.top_web_url && (
                                <p className="text-sm">
                                    <span className="font-medium">Website:</span>{' '}
                                    <a href={org.top_web_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {org.top_web_url}
                                    </a>
                                </p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Link href={`/organizations/${org.id}`} className="w-full">
                                <Button variant="outline" className="w-full">View Details</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
