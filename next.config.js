/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites(){
        return [
            {
                source: '/api/:path*',
                destination: 'https://dmz.richmondprolab.net/:path*'
            },
        ];
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

module.exports = nextConfig
