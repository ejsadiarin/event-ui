import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/metrics';

export async function GET(req: NextRequest) {
    try {
        // Return metrics in Prometheus format
        const metrics = await register.metrics();
        return new NextResponse(metrics, {
            headers: {
                'Content-Type': register.contentType
            }
        });
    } catch (error) {
        console.error('Error generating metrics:', error);
        return new NextResponse('Error generating metrics', { status: 500 });
    }
}
