import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    /* config options here */
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `event-api.default.svc.cluster.local/:path*`,
            },
        ]
    },
};

export default nextConfig;
