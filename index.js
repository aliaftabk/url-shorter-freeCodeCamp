require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());  // Middleware to parse JSON bodies

// In-memory storage for URL mappings
const urlMap = new Map();
let shortUrlCounter = 1;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint to handle URL shortening
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  
  // Validate URL format
  try {
    new URL(url);
  } catch (_) {
    return res.json({ error: 'invalid url' });
  }

  // Check DNS to verify the URL
  dns.lookup(new URL(url).hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    
    // Generate short URL and store in the map
    const shortUrl = shortUrlCounter++;
    urlMap.set(shortUrl, url);

    res.json({ original_url: url, short_url: shortUrl });
  });
});

// API endpoint to handle redirection
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;
  const url = urlMap.get(parseInt(short_url, 10));

  if (url) {
    res.redirect(url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

