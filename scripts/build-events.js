/**
 * Generates one static HTML page per event from the Night Square API.
 * Output: events/<slug>.html
 * Run: node scripts/build-events.js
 *
 * Each page includes:
 *  - Full EN/FR meta (title, description, canonical, hreflang, OG/Twitter)
 *  - MusicEvent + Place + Performer JSON-LD schema
 *  - BreadcrumbList schema
 *  - Human-readable event detail: name, venue, city, date, music genres, description
 *  - CTA to book in the Night Square app
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'events');
const API_URL = 'https://api.nightsquarepro.com/tevents/SelectAll.php';
const BASE_URL = 'https://nightsquare.org';
const TODAY = new Date().toISOString().split('T')[0];

// ── helpers ─────────────────────────────────────────────────────────────────

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function fetchEvents() {
  return new Promise((resolve, reject) => {
    https.get(API_URL, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(Array.isArray(json) ? json : (json.tevents || []));
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function formatDate(dateStr, locale = 'fr-FR') {
  try {
    const d = new Date(dateStr);
    if (isNaN(d) || d.getFullYear() < 2020) return '';
    return d.toLocaleDateString(locale, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return ''; }
}

function formatTime(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function isoDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d) || d.getFullYear() < 2020) return '';
    return d.toISOString();
  } catch { return ''; }
}

function cleanDescription(desc) {
  if (!desc) return '';
  return desc
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '') // strip emoji
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 600);
}

function metaDescription(event) {
  const venue = event.event_lieux || event.event_club_name || '';
  const city = event.event_city || '';
  const date = formatDate(event.event_date);
  const genres = (event.tcatevent || []).map(c => c.cat_name).filter((v, i, a) => a.indexOf(v) === i).join(', ');
  const parts = [];
  if (venue) parts.push(venue);
  if (city) parts.push(city);
  if (date) parts.push(date);
  if (genres) parts.push(genres);
  const base = `${event.event_name} — ${parts.join(' · ')}. Réservez votre table VIP ou votre billet sur Night Square.`;
  return base.slice(0, 160);
}

function performerJsonLd(event) {
  // Try to extract performer names from event name
  // Pattern: "ARTIST at VENUE" or "ARTIST - VENUE" or "ARTIST X VENUE"
  const name = event.event_name || '';
  const venueName = event.event_lieux || event.event_club_name || '';

  // Extract performer part: everything before common separators with venue
  let performerName = name;
  if (venueName) {
    const escaped = venueName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    performerName = name
      .replace(new RegExp(`\\s*[-|@]\\s*${escaped}.*`, 'i'), '')
      .replace(new RegExp(`\\s*at\\s+${escaped}.*`, 'i'), '')
      .trim();
  }
  if (!performerName || performerName === name) performerName = name.split(/\s*[-|@]\s*/)[0].trim();

  return performerName && performerName !== venueName
    ? `{ "@type": "MusicGroup", "name": ${JSON.stringify(performerName)} }`
    : null;
}

// ── page template ────────────────────────────────────────────────────────────

function buildPage(event, slug) {
  const name = event.event_name || 'Événement';
  const venue = event.event_lieux || event.event_club_name || '';
  const city = event.event_city || '';
  const address = event.event_address || '';
  const dateISO = isoDate(event.event_date);
  const endISO = isoDate(event.event_endDate);
  const dateFr = formatDate(event.event_date, 'fr-FR');
  const dateEn = formatDate(event.event_date, 'en-GB');
  const time = formatTime(event.event_date);
  const imgUrl = event.event_logo_url || `${BASE_URL}/src/IMG_9247.PNG`;
  const description = cleanDescription(event.event_description);
  const genres = (event.tcatevent || []).map(c => c.cat_name).filter((v, i, a) => a.indexOf(v) === i);
  const metaDesc = metaDescription(event);
  // Vercel serves .html files without extension — canonical matches that
  const canonicalUrl = `${BASE_URL}/events/${slug}`;
  const performer = performerJsonLd(event);
  const isUpcoming = dateISO && new Date(event.event_date) > new Date();
  const eventStatus = isUpcoming
    ? 'https://schema.org/EventScheduled'
    : 'https://schema.org/EventPostponed';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${metaDesc.replace(/"/g, '&quot;')}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <title>${name}${venue ? ' — ' + venue : ''}${city ? ' · ' + city : ''} | Night Square</title>

    <link rel="canonical" href="${canonicalUrl}">
    <link rel="alternate" hreflang="fr" href="${canonicalUrl}">
    <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">

    <meta property="og:type" content="event">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${name}${venue ? ' — ' + venue : ''} | Night Square">
    <meta property="og:description" content="${metaDesc.replace(/"/g, '&quot;')}">
    <meta property="og:image" content="${imgUrl}">
    <meta property="og:site_name" content="Night Square">
    <meta property="og:locale" content="fr_FR">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${name}${venue ? ' — ' + venue : ''} | Night Square">
    <meta name="twitter:description" content="${metaDesc.replace(/"/g, '&quot;')}">
    <meta name="twitter:image" content="${imgUrl}">
    <meta name="twitter:site" content="@nightsquare">

    <link rel="icon" type="image/png" href="../src/img/logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/event-page.css">

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "${BASE_URL}/" },
        { "@type": "ListItem", "position": 2, "name": "Événements", "item": "${BASE_URL}/events.html" },
        { "@type": "ListItem", "position": 3, "name": "${name.replace(/"/g, '\\"')}", "item": "${canonicalUrl}" }
      ]
    }
    </script>

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      "name": ${JSON.stringify(name)},
      "url": "${canonicalUrl}",
      "image": "${imgUrl}",
      "description": ${JSON.stringify(description || metaDesc)},
      "eventStatus": "${eventStatus}",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"${dateISO ? `,
      "startDate": "${dateISO}"` : ''}${endISO ? `,
      "endDate": "${endISO}"` : ''}${genres.length ? `,
      "genre": ${JSON.stringify(genres)}` : ''}${performer ? `,
      "performer": ${performer}` : ''}${venue || address ? `,
      "location": {
        "@type": "MusicVenue",
        "name": ${JSON.stringify(venue || city)},
        "address": {
          "@type": "PostalAddress",
          "streetAddress": ${JSON.stringify(address)},
          "addressLocality": ${JSON.stringify(city)},
          "addressCountry": "FR"
        }${event.event_loc_lat && event.event_loc_long ? `,
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": ${parseFloat(event.event_loc_lat)},
          "longitude": ${parseFloat(event.event_loc_long)}
        }` : ''}
      }` : ''},
      "organizer": {
        "@type": "Organization",
        "name": "Night Square",
        "url": "${BASE_URL}"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://apps.apple.com/fr/app/night-square/id6480206771",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "${event.event_Devise || 'EUR'}"
      }
    }
    </script>
</head>
<body class="event-page">
    <header>
        <nav>
            <a href="../index.html" class="logo">
                <img src="../src/img/logo.png" alt="Night Square" class="logo-img">
            </a>
            <ul class="nav-links">
                <li><a href="../index.html">Accueil</a></li>
                <li><a href="../events.html" class="active">Événements</a></li>
                <li><a href="../artists.html">Artistes</a></li>
                <li><a href="../organizers.html">Organisateurs</a></li>
                <li><a href="../download.html">Télécharger</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <article class="event-detail" itemscope itemtype="https://schema.org/MusicEvent">

            <div class="event-hero" style="background-image: url('${imgUrl}')">
                <div class="event-hero-overlay"></div>
                <div class="event-hero-content">
                    ${isUpcoming ? '<span class="event-badge">Prochain événement</span>' : ''}
                    <h1 itemprop="name">${name}</h1>
                    ${venue ? `<p class="event-venue" itemprop="location" itemscope itemtype="https://schema.org/MusicVenue"><span itemprop="name">${venue}</span>${city ? ` · <span itemprop="addressLocality">${city}</span>` : ''}</p>` : ''}
                </div>
            </div>

            <div class="event-body">
                <div class="event-info-grid">
                    ${dateFr ? `
                    <div class="event-info-block">
                        <span class="info-label">Date</span>
                        <span class="info-value" itemprop="startDate" content="${dateISO}">${dateFr}${time ? ' · ' + time : ''}</span>
                    </div>` : ''}
                    ${venue ? `
                    <div class="event-info-block">
                        <span class="info-label">Lieu</span>
                        <span class="info-value">${venue}${city ? ', ' + city : ''}</span>
                    </div>` : ''}
                    ${genres.length ? `
                    <div class="event-info-block">
                        <span class="info-label">Musique</span>
                        <span class="info-value">${genres.join(' · ')}</span>
                    </div>` : ''}
                    ${event.event_min_spend_vip && parseFloat(event.event_min_spend_vip) > 0 ? `
                    <div class="event-info-block">
                        <span class="info-label">Table VIP dès</span>
                        <span class="info-value">${parseFloat(event.event_min_spend_vip).toLocaleString('fr-FR')} ${event.event_Devise || 'EUR'}</span>
                    </div>` : ''}
                </div>

                ${description ? `
                <div class="event-description" itemprop="description">
                    ${description.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n')}
                </div>` : ''}

                <div class="event-cta-block">
                    <a href="https://apps.apple.com/fr/app/night-square/id6480206771"
                       class="app-button event-cta-primary"
                       rel="noopener noreferrer" target="_blank">
                        Réserver sur Night Square
                    </a>
                    <a href="../events.html" class="app-button app-button-secondary">
                        Voir tous les événements
                    </a>
                </div>
            </div>

        </article>
    </main>

    <footer>
        <div class="footer-content">
            <p>&copy; 2026 Night Square. Tous droits réservés.</p>
        </div>
    </footer>
</body>
</html>`;
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching events from API...');
  const events = await fetchEvents();
  console.log(`Got ${events.length} events`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const sitemapEntries = [];
  const slugCount = {};
  let generated = 0;

  for (const event of events) {
    // Skip test/dev events
    if (event.event_Dev === 1) continue;
    if (/^test$/i.test((event.event_name || '').trim())) continue;

    // Match existing URL format: {event_id}-{slugify(event_name)}
    const nameSlug = slugify(event.event_name) || 'event';
    const slug = `${event.event_id}-${nameSlug}`;

    const html = buildPage(event, slug);
    const outPath = path.join(OUT_DIR, `${slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');

    const dateISO = isoDate(event.event_date);
    sitemapEntries.push({
      url: `${BASE_URL}/events/${slug}`,
      lastmod: dateISO ? dateISO.split('T')[0] : TODAY,
      priority: event.event_topEvent ? '0.9' : '0.7',
    });
    generated++;
  }

  console.log(`Generated ${generated} event pages in events/`);

  // Write a partial sitemap for events (to be included by generate-sitemap.js)
  const sitemapPath = path.join(ROOT, 'sitemap-events.xml');
  let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
  for (const e of sitemapEntries) {
    sm += `  <url>\n    <loc>${e.url}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${e.priority}</priority>\n  </url>\n`;
  }
  sm += `</urlset>`;
  fs.writeFileSync(sitemapPath, sm, 'utf8');
  console.log(`Written sitemap-events.xml with ${sitemapEntries.length} URLs`);

  // Also append to main sitemap reference
  const sitemapIndexPath = path.join(ROOT, 'sitemap-index.xml');
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-events.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>`;
  fs.writeFileSync(sitemapIndexPath, sitemapIndex, 'utf8');
  console.log(`Written sitemap-index.xml`);
}

main().catch(err => { console.error(err); process.exit(1); });
