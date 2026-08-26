// Script de démarrage pour Render avec support du PORT
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const port = parseInt(process.env.PORT || '1000', 10);
const hostname = '0.0.0.0';

const app = next({
  dev: false,
  hostname,
  port,
  // S'assurer que tous les fichiers statiques sont servis
  conf: {
    distDir: '.next',
  },
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // Log pour déboguer les requêtes de chunks
      if (parsedUrl.pathname?.includes('_next/static')) {
        console.log('📦 Requête fichier statique:', parsedUrl.pathname);
      }
      
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`✅ Ready on http://${hostname}:${port}`);
    console.log(`📦 Serving static files from .next/static`);
  });
});

