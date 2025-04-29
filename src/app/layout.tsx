import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from 'sonner'; // Import Sonner instead of Shadcn Toast

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Event Registration',
    description: 'Register for workshops and events',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <Header />
                    <main className="container py-8">
                        {children}
                    </main>
                    <Toaster position="top-center" /> {/* Sonner Toaster */}
                </AuthProvider>
            </body>
        </html>
    );
}
