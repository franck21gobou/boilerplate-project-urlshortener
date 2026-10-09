require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL Shortener (in-memory storage)
const dns = require('dns');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const urls = [];

app.post('/api/shorturl', function(req, res) {
  const original = req.body.url;
  let parsed;
  try {
    parsed = new URL(original);
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return res.json({ error: 'invalid url' });
  }
  dns.lookup(parsed.hostname, function(err) {
    if (err) return res.json({ error: 'invalid url' });
    let idx = urls.indexOf(original);
    if (idx === -1) {
      urls.push(original);
      idx = urls.length - 1;
    }
    res.json({ original_url: original, short_url: idx + 1 });
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const n = parseInt(req.params.short_url, 10);
  const target = urls[n - 1];
  if (!target) return res.json({ error: 'No short URL found for the given input' });
  res.redirect(target);
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
