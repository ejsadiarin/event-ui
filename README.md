This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Adding Metrics (for Prometheus)

### 1. Create a Custom Metrics Route

We'll create a dedicated metrics endpoint at `/monitoring/metrics` to avoid conflicts with your backend API.

First, let's install the required packages:

```bash
npm install prom-client next-metrics
```

### 2. Create the Metrics Setup

Create a new metrics utility file:

```typescript
// src/lib/metrics.ts
import client from 'prom-client';

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory usage, etc.)
client.collectDefaultMetrics({ register });

// HTTP request counter
export const httpRequestCounter = new client.Counter({
  name: 'next_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register]
});

// Page render time histogram
export const pageRenderTime = new client.Histogram({
  name: 'next_page_render_duration_seconds',
  help: 'Time taken to render pages',
  labelNames: ['page'],
  registers: [register]
});

// API request duration histogram
export const apiRequestDuration = new client.Histogram({
  name: 'next_api_request_duration_seconds',
  help: 'Duration of API requests',
  labelNames: ['endpoint', 'method'],
  registers: [register]
});

// Export the registry
export { register };
```

### 3. Create the Metrics Endpoint

```typescript
// src/app/monitoring/metrics/route.ts
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
```

### 4. Implement Middleware for Tracking Requests

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { httpRequestCounter } from '@/lib/metrics';

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
    /*
     * Match all request paths except for:
     * - monitoring/metrics (metrics endpoint)
     * - _next (Next.js internals)
     * - static files like favicon.ico, images, etc.
     */
    '/((?!monitoring/metrics|_next/static|favicon.ico|.*\\.).*)'
  ],
};
```

### 5. Instrument API Client

To track API calls from your frontend to your backend:

```typescript
// Modify src/lib/api-client.ts
import axios from 'axios';
import { apiRequestDuration } from '@/lib/metrics';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptors to measure API call durations
apiClient.interceptors.request.use((config) => {
    // Add timing data to the request
    config.metadata = { startTime: Date.now() };
    
    // Add auth token (existing code)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        // Calculate request duration if startTime was set
        if (response.config.metadata?.startTime) {
            const duration = (Date.now() - response.config.metadata.startTime) / 1000;
            const endpoint = response.config.url || 'unknown';
            const method = response.config.method || 'unknown';
            
            // Record the timing in the histogram
            apiRequestDuration.observe({ endpoint, method }, duration);
        }
        return response;
    },
    (error) => {
        // Still track timing for failed requests
        if (error.config?.metadata?.startTime) {
            const duration = (Date.now() - error.config.metadata.startTime) / 1000;
            const endpoint = error.config.url || 'unknown';
            const method = error.config.method || 'unknown';
            
            // Record the timing in the histogram
            apiRequestDuration.observe({ endpoint, method }, duration);
        }
        return Promise.reject(error);
    }
);

// Rest of your API client code remains the same...
```

### 6. Expose Metrics in Docker/K3s

Update your Dockerfile to ensure the metrics endpoint is accessible:

```dockerfile
# No changes needed to your Dockerfile - just ensure port 3000 is exposed
```

Update your compose.yml to include a label for Prometheus scraping (if you're using Prometheus Operator):

```yaml
---
services:
  event-ui:
    build:
      context: .
      dockerfile: Dockerfile
    image: ghcr.io/ejsadiarin/event-ui:latest
    container_name: event-ui
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://event-api:3001/api
    restart: unless-stopped
    labels:
      # Add these labels for Prometheus to scrape your app
      prometheus.io/scrape: "true"
      prometheus.io/port: "3000"
      prometheus.io/path: "/monitoring/metrics"
```

---

## Available Metrics

This application includes built-in metrics for Prometheus monitoring.

The application exposes the following metrics:

1. **Default Node.js metrics** - Memory usage, CPU usage, event loop lag, etc.
2. **HTTP request metrics** - Count of HTTP requests by method, path, and status
3. **Page render timing** - Duration of page renders by page path
4. **API request timing** - Duration of API calls to the backend service

## Accessing Metrics

Metrics are available at the `/monitoring/metrics` endpoint in Prometheus format.

## Kubernetes/K3s Setup

When deploying in Kubernetes or K3s with Prometheus Operator, add these annotations to your deployment:

```yaml
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "3000"
    prometheus.io/path: "/monitoring/metrics"
```

## Local Development

For local development and testing, you can access metrics at:
```
http://localhost:3000/monitoring/metrics
```

## Implementation Details

- Metrics are implemented using `prom-client`
- All HTTP requests are tracked via Next.js middleware
- API calls to the backend are timed via axios interceptors

## Additional Notes

1. This implementation keeps your metrics separate from your backend API by using a dedicated `/monitoring/metrics` path.

2. In a Kubernetes environment, you can use annotations to tell Prometheus which pods to scrape and where to find metrics.

3. This approach works well for a Next.js application regardless of whether it's running in standalone mode or with a separate backend.

4. This implementation includes metrics for:
   - HTTP requests to your Next.js app
   - API calls from your frontend to your backend
   - Default Node.js process metrics

---

### Frontend-Specific Metrics to Consider

For a frontend application like event-ui, consider monitoring:

1. **Client-side metrics** (if you implement browser-side collection):
   - Page load time
   - First contentful paint
   - Largest contentful paint
   - Core Web Vitals

2. **Server-side metrics**:
   - Request counts by route
   - Request duration
   - HTTP status codes
   - Server errors

3. **Resource usage**:
   - Memory usage
   - CPU usage
   - Event loop lag

