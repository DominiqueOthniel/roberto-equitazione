export default function sitemap() {
  const baseUrl = 'https://robertoequitazione.com';
  
  // Date de dernière modification (aujourd'hui)
  const lastModified = new Date().toISOString();
  
  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/product-catalog`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shopping-cart`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
}

