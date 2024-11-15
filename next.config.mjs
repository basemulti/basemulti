import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['knex', 'sutando'],
  },
  transpilePackages: ['lucide-react'],
};

export default withNextIntl(nextConfig);
