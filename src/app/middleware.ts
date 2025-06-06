import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { httpRequestCounter } from '@/lib/server-metrics'; // Use server metrics

export function middleware(request: NextRequest) {
    // Get the URL and method
    const { pathname } = request.nextUrl;
    const method = request.method;

    // Skip monitoring requests and static files
    if (pathname.startsWith('/monitoring') ||
        pathname.startsWith('/_next/') ||
        pathname.includes('.')) {
        return NextResponse.next();
    }

    // Track the request
    httpRequestCounter.inc({
        method,
        path: pathname,
        status: 200 // We'll capture initial status as 200
    });

    return NextResponse.next();
}

// Apply to all routes except static files and monitoring
export const config = {
    matcher: [
        '/((?!monitoring/metrics|_next/static|favicon.ico|.*\\.).*)'
    ],
};
