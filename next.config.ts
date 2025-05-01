import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    /* config options here */
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://event-api:3000/:path*',
            },
        ]
    }
};

export default nextConfig;
