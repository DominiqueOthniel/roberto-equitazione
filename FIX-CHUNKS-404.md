# Fix: Erreurs 404 pour les chunks Next.js

## Problème
Les fichiers JavaScript chunks (ex: `page-652f5061b7de509d.js`) retournent une erreur 404, empêchant certaines pages de se charger.

## Causes possibles

1. **Build incomplet** : Les chunks ne sont pas générés correctement
2. **Cache navigateur** : Le navigateur essaie de charger d'anciens chunks
3. **Serveur ne sert pas les fichiers statiques** : Les fichiers `.next/static/` ne sont pas accessibles
4. **Build ID change** : Next.js génère un nouveau build ID à chaque build

## Solutions appliquées

### 1. Amélioration du serveur (`server.js`)
- Ajout de logs pour déboguer les requêtes de fichiers statiques
- Configuration explicite du `distDir`

### 2. Configuration Next.js (`next.config.mjs`)
- Désactivation des source maps en production (réduit la taille)
- Build ID basé sur la date pour éviter les problèmes de cache

### 3. Build Command (`render.yaml`)
- Ajout d'une commande pour vérifier que les chunks sont générés

## Actions à faire sur Render

1. **Vider le cache de build** :
   - Dans Render Dashboard → Service → Settings
   - Cliquer sur "Clear build cache"
   - Redéployer

2. **Vérifier les logs de build** :
   - Vérifier que `npm run build` se termine sans erreur
   - Vérifier que les fichiers sont générés dans `.next/static/chunks/`

3. **Vérifier les logs du serveur** :
   - Regarder les logs pour voir si les requêtes de chunks arrivent
   - Vérifier les erreurs 404 dans les logs

## Solution alternative : Mode Standalone

Si le problème persiste, on peut activer le mode `standalone` :

```javascript
// next.config.mjs
output: 'standalone',
```

Et modifier `server.js` pour utiliser le serveur standalone :

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '1000', 10);
const hostname = '0.0.0.0';

const app = next({
  dev: false,
  hostname,
  port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

## Vérification

1. Ouvrir la console du navigateur
2. Vérifier les erreurs 404
3. Essayer d'accéder directement à un chunk : `https://roberto-equitazione.onrender.com/_next/static/chunks/app/admin/products/page-*.js`
4. Vérifier les logs Render pour voir les requêtes

## Si le problème persiste

1. Vérifier que tous les fichiers sont bien commités
2. Faire un rebuild complet sur Render
3. Vider le cache du navigateur (Ctrl+Shift+Delete)
4. Essayer en navigation privée

