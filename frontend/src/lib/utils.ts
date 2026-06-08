export function getBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.NEXT_PUBLIC_CF_PAGES_URL ? `https://${process.env.NEXT_PUBLIC_CF_PAGES_URL}` : '')
    || (process.env.CF_PAGES_URL ? `https://${process.env.CF_PAGES_URL}` : '')
    || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '')
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
    || 'http://localhost:3000';
  
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  // Strip trailing slashes to prevent double slashes in paths
  url = url.replace(/\/+$/, '');
  
  return url;
}
