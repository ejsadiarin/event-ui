import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from 'sonner';

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
        <html lang="en" className="h-full">
            <body className={`${inter.className} flex min-h-screen flex-col`}>
                <AuthProvider>
                    <Header />
                    <main className="flex-1">
                        {children}
                    </main>
                    <footer className="py-6 border-t">
                        <div className="container text-center text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Event Hub. All rights reserved.
                        </div>
                    </footer>
                    <Toaster position="top-center" />
                </AuthProvider>
            </body>
        </html>
    );
}
