import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://intervioai.com',
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://intervioai.com/pricing',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://intervioai.com/login',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://intervioai.com/signup',
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
