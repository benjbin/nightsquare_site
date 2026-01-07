/**
 * Script pour générer dynamiquement le sitemap.xml avec les événements de l'API
 * À exécuter périodiquement (cron job) pour mettre à jour le sitemap
 * 
 * Usage: node generate-sitemap.js
 */

const https = require('https');
const fs = require('fs');

const API_URL = 'https://api.nightsquarepro.com/tevents/SelectAll.php';
const PROXY_URL = `https://corsproxy.io/?${encodeURIComponent(API_URL)}`;
const BASE_URL = 'https://nightsquare.com';
const TODAY = new Date().toISOString().split('T')[0];

// Pages statiques
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/how-it-works.html', priority: '0.8', changefreq: 'monthly' },
  { url: '/events.html', priority: '0.9', changefreq: 'weekly' },
  { url: '/organizers.html', priority: '0.7', changefreq: 'monthly' },
  { url: '/download.html', priority: '0.9', changefreq: 'monthly' }
];

function fetchEvents() {
  return new Promise((resolve, reject) => {
    https.get(PROXY_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          let jsonData = JSON.parse(data);
          
          // Handle proxy response structure
          if (jsonData.contents) {
            jsonData = JSON.parse(jsonData.contents);
          }
          
          // Extract events array
          if (jsonData && jsonData.tevents && Array.isArray(jsonData.tevents)) {
            resolve(jsonData.tevents);
          } else if (Array.isArray(jsonData)) {
            resolve(jsonData);
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error('Error parsing API response:', error);
          resolve([]);
        }
      });
    }).on('error', (error) => {
      console.error('Error fetching events:', error);
      resolve([]);
    });
  });
}

function generateSitemap(events) {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  // Add static pages
  staticPages.forEach(page => {
    sitemap += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  // Add event pages (limit to first 50 for sitemap size)
  const eventsToInclude = events.slice(0, 50);
  eventsToInclude.forEach(event => {
    const eventName = (event.event_name || 'event').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const eventUrl = `/events.html#${eventName}`;
    
    sitemap += `  <url>
    <loc>${BASE_URL}${eventUrl}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;
  
  return sitemap;
}

// Main execution
async function main() {
  console.log('Fetching events from API...');
  const events = await fetchEvents();
  console.log(`Found ${events.length} events`);
  
  console.log('Generating sitemap...');
  const sitemap = generateSitemap(events);
  
  console.log('Writing sitemap.xml...');
  fs.writeFileSync('sitemap.xml', sitemap, 'utf8');
  
  console.log(`✅ Sitemap generated successfully with ${staticPages.length} static pages and ${Math.min(events.length, 50)} events`);
}

main().catch(console.error);
