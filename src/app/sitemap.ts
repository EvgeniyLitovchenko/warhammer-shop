import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${APP_URL}/catalog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/search`, lastModified: now, priority: 0.4 },
    { url: `${APP_URL}/en`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/en/catalog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.flatMap((product) => [
    {
      url: `${APP_URL}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${APP_URL}/en/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]);

  return [...staticRoutes, ...productRoutes];
}
