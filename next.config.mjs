/** @type {import('next').NextConfig} */
const nextConfig = {
    // No rewrites needed, we will use Next.js API routes
    async redirects() {
        return [
            {
                source: "/accounting/invoices",
                destination: "/admin/accounting?tab=invoices",
                permanent: false,
            },
            {
                source: "/accounting/receipts",
                destination: "/admin/accounting?tab=overview",
                permanent: false,
            },
            {
                source: "/admin/accounting/payments",
                destination: "/admin/accounting?tab=overview",
                permanent: false,
            },
            {
                source: "/admin/accounting/payments/:path*",
                destination: "/admin/accounting?tab=overview",
                permanent: false,
            },
            {
                source: "/admin/amenities/bookings",
                destination: "/admin/amenities",
                permanent: false,
            },
            {
                source: "/admin/amenities/bookings/:path*",
                destination: "/admin/amenities",
                permanent: false,
            },
            {
                source: "/amenities/bookings",
                destination: "/admin/amenities",
                permanent: false,
            },
            {
                source: "/amenities/bookings/:path*",
                destination: "/admin/amenities",
                permanent: false,
            },
            {
                source: "/security/alerts",
                destination: "/admin/security/alerts",
                permanent: false,
            },
            {
                source: "/security/alerts/:path*",
                destination: "/admin/security/alerts",
                permanent: false,
            },
        ];
    },
};

export default nextConfig;
