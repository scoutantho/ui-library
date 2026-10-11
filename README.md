# UI Library

Bibliothèque personnelle d'éléments d'interface repérés (Uiverse.io et autres), avec leur source.
À consulter au démarrage d'un projet ou pour refaire l'UI d'une app existante.

## Consulter

Ouvrir `index.html` dans un navigateur (double-clic, pas de serveur nécessaire) : aperçu de chaque
élément, filtre par type, recherche, bascule fond clair/sombre, copie du code.

## Ajouter un élément Uiverse

```bash
node scripts/add-uiverse.mjs https://uiverse.io/<auteur>/<element> [autres URLs…]
```

Le script télécharge le code (curl requis), crée `components/<type>/<auteur>-<element>/` avec :

- `component.html` — code d'origine (HTML + `<style>`), en-tête avec source et auteur ;
- `README.md` — fiche : source, auteur, licence, **où il est utilisé**, notes d'intégration (à compléter à la main, jamais écrasée) ;
- `meta.json` — métadonnées pour la galerie ;

puis régénère `catalog.js` (relancer le script sans argument suffit à le reconstruire).

## Ajouter un élément d'une autre source

Créer le dossier à la main sur le même modèle (`component.html`, `README.md`, `meta.json` avec
`id`, `kind`, `category`, `author`, `slug`, `url`, `isTailwind`, `addedAt`), puis
`node scripts/add-uiverse.mjs` pour reconstruire le catalogue.

## Licences

Tout le contenu de Uiverse.io est publié sous **licence MIT** : réutilisation libre, y compris
commerciale. Garder la mention de l'auteur et de la source (déjà présente dans chaque fiche) et
l'indiquer en commentaire dans le code du projet qui l'intègre. Pour toute autre source, vérifier
la licence avant d'ajouter l'élément et la noter dans sa fiche.

## Conventions

- Le code d'origine reste **intact** dans `component.html` ; les adaptations vivent dans le projet qui l'utilise.
- Renseigner « Utilisé dans » dans la fiche quand un élément est intégré quelque part.

## Galerie en ligne (GitHub Pages)

`index.html` est servi tel quel par GitHub Pages (branche `main`, dossier racine). Pour publier un
nouvel élément : `node scripts/add-uiverse.mjs <URL>`, puis commit + push — la page se met à jour
toute seule en une minute environ.
