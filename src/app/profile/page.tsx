'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { authAPI, eventsAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        totalRegistrations: 0,
        upcomingEvents: 0,
        completedEvents: 0
    });

    const [formData, setFormData] = useState({
        email: '',
        display_picture: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            toast.error('Authentication required', {
                description: 'You must be logged in to view this page'
            });
            router.push('/login');
            return;
        }

        async function fetchUserData() {
            try {
                // Fetch user profile data
                const profile = await authAPI.getProfile();
                setUserProfile(profile);
                setFormData({
                    ...formData,
                    email: profile.email || '',
                    display_picture: profile.display_picture || ''
                });

                // Fetch user registrations for stats
                const registrations = await eventsAPI.getUserRegistrations();
                const now = new Date();

                // Calculate stats
                const upcoming = registrations.filter((reg: any) => new Date(reg.schedule) > now).length;
                const completed = registrations.filter((reg: any) => new Date(reg.schedule) <= now).length;

                setStats({
                    totalRegistrations: registrations.length,
                    upcomingEvents: upcoming,
                    completedEvents: completed
                });
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
                toast.error('Error', {
                    description: 'Failed to load your profile data'
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchUserData();
    }, [user, router, formData.currentPassword, formData.newPassword, formData.confirmPassword]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // This is a placeholder - you'll need to implement this API endpoint
            await authAPI.updateProfile({
                email: formData.email,
                display_picture: formData.display_picture
            });

            toast.success('Profile updated', {
                description: 'Your profile information has been updated'
            });
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Update failed', {
                description: 'There was a problem updating your profile'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match', {
                description: 'New password and confirmation must match'
            });
            return;
        }

        setIsSaving(true);
        try {
            // This is a placeholder - you'll need to implement this API endpoint
            await authAPI.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            // Reset password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            toast.success('Password updated', {
                description: 'Your password has been changed successfully'
            });
        } catch (error) {
            console.error('Failed to change password:', error);
            toast.error('Password change failed', {
                description: 'Please check your current password and try again'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = () => {
        // Show a confirmation dialog
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // This is a placeholder - you'll need to implement this API endpoint
            authAPI.deleteAccount()
                .then(() => {
                    logout();
                    toast.success('Account deleted', {
                        description: 'Your account has been permanently deleted'
                    });
                    router.push('/');
                })
                .catch(error => {
                    console.error('Failed to delete account:', error);
                    toast.error('Account deletion failed', {
                        description: 'There was a problem deleting your account'
                    });
                });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
                <div className="w-full md:w-64 flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-4">
                        {userProfile?.display_picture ? (
                            <AvatarImage src={userProfile.display_picture} alt={userProfile.username} />
                        ) : (
                            <AvatarFallback className="text-4xl">
                                {userProfile?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <h1 className="text-2xl font-bold text-center">{userProfile?.username}</h1>
                    <p className="text-muted-foreground text-center mt-1">{userProfile?.email}</p>

                    <div className="grid grid-cols-3 gap-2 w-full mt-6 text-center">
                        <div className="p-2">
                            <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                            <p className="text-xs text-muted-foreground">Events</p>
                        </div>
                        <div className="p-2">
                            <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                            <p className="text-xs text-muted-foreground">Upcoming</p>
                        </div>
                        <div className="p-2">
                            <p className="text-2xl font-bold">{stats.completedEvents}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                    </div>

                    <Separator className="my-6 w-full" />

                    <Button
                        variant="outline"
                        className="w-full"
                        asChild
                    >
                        <a href="/dashboard">Dashboard</a>
                    </Button>
                </div>

                <div className="flex-1">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>
                                        Update your profile details
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleProfileUpdate}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username</Label>
                                            <Input
                                                id="username"
                                                value={userProfile?.username || ''}
                                                disabled
                                                className="bg-muted"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Username cannot be changed
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="your@email.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="display_picture">Profile Picture URL</Label>
                                            <Input
                                                id="display_picture"
                                                name="display_picture"
                                                placeholder="https://example.com/your-image.jpg"
                                                value={formData.display_picture}
                                                onChange={handleChange}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Enter a URL to your profile picture
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button type="submit" disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Settings</CardTitle>
                                    <CardDescription>
                                        Update your password
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handlePasswordChange}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type="password"
                                                placeholder="Enter your current password"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                placeholder="Enter your new password"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                placeholder="Confirm your new password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button type="button" variant="destructive" onClick={handleDeleteAccount}>
                                            Delete Account
                                        </Button>
                                        <Button type="submit" disabled={isSaving}>
                                            {isSaving ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
