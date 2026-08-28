# Guide de déploiement sur Render

## Prérequis
- Compte Render (gratuit) : https://render.com
- Repository GitHub connecté

## Déploiement automatique (recommandé)

Le repo contient déjà `render.yaml` avec `autoDeployTrigger: commit` sur la branche `main`.

### Option A : Auto-deploy natif Render (le plus simple)

1. Ouvrez https://dashboard.render.com
2. Ouvrez le service `roberto-equitazione` (ou créez-le via **New +** → **Blueprint**)
3. Allez dans **Settings** → **Build & Deploy**
4. Vérifiez que :
   - **Repository** = `DominiqueOthniel/roberto-equitazione`
   - **Branch** = `main`
   - **Auto-Deploy** = **On**
5. Sauvegardez

Chaque `git push` sur `main` déclenchera alors un build Render.

### Option B : Deploy Hook GitHub Actions (secours)

Si le service Render n'est pas relié à GitHub, utilisez le workflow `.github/workflows/deploy-render.yml`.

1. Render Dashboard → service `roberto-equitazione` → **Settings** → **Deploy Hook**
2. Copiez l'URL du hook
3. GitHub → repo → **Settings** → **Secrets and variables** → **Actions**
4. Créez le secret `RENDER_DEPLOY_HOOK_URL` avec cette URL

À chaque push sur `main`, GitHub Actions appellera ce hook et Render redéploiera.

## Étapes de déploiement

### 1. Préparer le repository

Le fichier `render.yaml` est déjà créé. Vérifiez qu'il est commité :
```bash
git add render.yaml
git commit -m "Add Render configuration"
git push
```

### 2. Créer le service sur Render

1. Allez sur https://dashboard.render.com
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre repository GitHub si ce n'est pas déjà fait
4. Sélectionnez le repository `roberto-equitazione`
5. Render détectera automatiquement le fichier `render.yaml`

### 3. Configuration du service

Render utilisera automatiquement `render.yaml`, mais vous pouvez aussi configurer manuellement :

- **Name**: `roberto-equitazione`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free` (ou `Starter` si vous voulez plus de ressources)

### 4. Variables d'environnement

**Pour le développement local**, créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
PORT=1000
NODE_ENV=development
```

**Pour Render**, dans Render Dashboard → Environment, ajoutez :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
PORT=1000
NODE_ENV=production
```

### 5. Déploiement

1. Cliquez sur "Create Web Service"
2. Render va automatiquement :
   - Cloner votre repository
   - Installer les dépendances (`npm install`)
   - Builder l'application (`npm run build`)
   - Démarrer le service (`npm start`)

### 6. Domaine personnalisé (optionnel)

1. Dans Render Dashboard → Settings → Custom Domains
2. Ajoutez votre domaine
3. Suivez les instructions DNS

## Différences avec Vercel

### Avantages Render
- ✅ Plan gratuit avec plus de ressources
- ✅ Pas de limite de fonction serverless
- ✅ Support de WebSockets natif
- ✅ Pas de cold starts
- ✅ Support de long-running processes

### Inconvénients Render
- ⚠️ Déploiement un peu plus lent que Vercel
- ⚠️ Interface moins moderne
- ⚠️ CDN moins performant que Vercel

## Commandes utiles

### Voir les logs
```bash
# Dans Render Dashboard → Logs
```

### Redéployer
```bash
# Push sur GitHub déclenche automatiquement un redéploiement
git push
```

### Déploiement manuel
Dans Render Dashboard → Manual Deploy

## Troubleshooting

### Build échoue
- Vérifiez les logs dans Render Dashboard
- Vérifiez que toutes les variables d'environnement sont définies
- Vérifiez que `package.json` a les bonnes scripts

### Application ne démarre pas
- Vérifiez que `npm start` fonctionne localement
- Vérifiez les logs dans Render Dashboard
- Vérifiez que le port est correct (Render utilise le port défini dans `PORT`)

### Variables d'environnement
- Vérifiez que toutes les variables sont définies dans Render Dashboard
- Les variables doivent commencer par `NEXT_PUBLIC_` pour être accessibles côté client

## Support

- Documentation Render : https://render.com/docs
- Support : support@render.com

