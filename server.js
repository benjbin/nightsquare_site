const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Spotify API
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '3ad1a942c32f44deb97737906025e2dd';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'a4c8870595c043adacfa35aa9d18635e';

// Middleware
app.use(cors());
app.use(express.json());

// Servir le site (HTML, CSS, JS, images) pour accès en local
app.use(express.static(__dirname));

// Cache pour le token d'accès
let accessToken = null;
let tokenExpiry = 0;

// Fonction pour obtenir un token d'accès Spotify
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
        }
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // -1 minute de marge
    return accessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error.response?.data || error.message);
    throw error;
  }
}

// Endpoint pour rechercher un artiste et récupérer une de ses musiques
app.get('/api/spotify/artist-track', async (req, res) => {
  try {
    const { artistName, trackName } = req.query;

    if (!artistName) {
      return res.status(400).json({ error: 'artistName parameter is required' });
    }

    const token = await getAccessToken();

    // Si un nom de track est spécifié, rechercher directement la chanson
    if (trackName) {
      // Essayer plusieurs variantes de recherche
      let searchQueries = [
        `artist:"${artistName}" track:"${trackName}"`,
        `artist:${artistName} track:${trackName}`,
        `${artistName} ${trackName}`,
        // Pour des cas spéciaux comme "Babar"
        artistName.toLowerCase().includes('babar') ? `artist:"Babar" ${trackName}` : null,
        artistName.toLowerCase().includes('babar') ? `Babar DJ ${trackName}` : null
      ].filter(q => q !== null);
      
      let track = null;
      for (const query of searchQueries) {
        try {
          const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            params: {
              q: query,
              type: 'track',
              limit: 5
            }
          });

          const tracks = searchResponse.data.tracks.items;
          if (tracks && tracks.length > 0) {
            // Chercher le track qui correspond le mieux
            const matchingTrack = tracks.find(t => 
              t.name.toLowerCase().includes(trackName.toLowerCase()) &&
              t.artists.some(a => a.name.toLowerCase().includes(artistName.toLowerCase()))
            ) || tracks[0];
            
            track = matchingTrack;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      res.json({
        artist: {
          name: track.artists[0].name,
          id: track.artists[0].id,
          image: track.album.images?.[0]?.url || null
        },
        track: {
          name: track.name,
          id: track.id,
          preview_url: track.preview_url,
          external_urls: track.external_urls,
          album: {
            name: track.album.name,
            images: track.album.images
          },
          embed_url: `https://open.spotify.com/embed/track/${track.id}?utm_source=generator`
        }
      });
      return;
    }

    // Rechercher l'artiste
    const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        q: artistName,
        type: 'artist',
        limit: 1
      }
    });

    const artist = searchResponse.data.artists.items[0];
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Récupérer les top tracks de l'artiste
    const tracksResponse = await axios.get(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        market: 'FR'
      }
    });

    const tracks = tracksResponse.data.tracks;
    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: 'No tracks found for this artist' });
    }

    // Retourner le premier track avec les infos nécessaires
    const track = tracks[0];
    res.json({
      artist: {
        name: artist.name,
        id: artist.id,
        image: artist.images?.[0]?.url || null
      },
      track: {
        name: track.name,
        id: track.id,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        album: {
          name: track.album.name,
          images: track.album.images
        },
        embed_url: `https://open.spotify.com/embed/track/${track.id}?utm_source=generator`
      }
    });
  } catch (error) {
    console.error('Error fetching Spotify data:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error fetching Spotify data',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// Endpoint de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`  → Site: http://localhost:${PORT}/`);
  console.log(`  → API Spotify: http://localhost:${PORT}/api/spotify/artist-track`);
});
