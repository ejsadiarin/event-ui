'use client';

// Client-side safe placeholder for metrics when running in browser
class ClientSafeMetrics {
    inc(labels?: Record<string, any>) { } // Placeholder for counter.inc()
    observe(labels?: Record<string, any>, value?: number) { } // Placeholder for histogram.observe()
}

export const httpRequestCounter = new ClientSafeMetrics();
export const pageRenderTime = new ClientSafeMetrics();
export const apiRequestDuration = new ClientSafeMetrics();

// Export empty registry for client-side
export const register = {
    metrics: async () => '',
    contentType: 'text/plain',
};
