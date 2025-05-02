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
