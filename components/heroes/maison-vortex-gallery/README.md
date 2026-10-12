# Hero — vortex-gallery

| | |
|---|---|
| Source | Recréation maison, inspirée du hero de https://getartcraft.com/ (aucun code repris) |
| Auteur | maison |
| Licence | Libre (code écrit pour cette bibliothèque) |
| Type | Hero (CSS + JS vanilla, sans dépendance) |
| Ajouté le | 2026-10-12 |
| Utilisé dans | — |

## Notes d'intégration

- Effet : des cartes réparties sur un anneau avancent vers la caméra (tunnel 3D en `perspective` CSS),
  tournent lentement, sont assombries au loin, avec des franges rouge/bleu (aberration chromatique),
  des arcs colorés en rotation au fond et une parallaxe à la souris.
- Options sur `<section class="vortex">` : `data-count` (nb de cartes, 28 par défaut), `data-speed`
  (px/s, 70 par défaut), `data-images` (URLs séparées par des virgules). Sans `data-images`, les images
  viennent de picsum.photos : à remplacer par les visuels du projet (captures, œuvres, produits…).
- Couleurs : `--bg` sur `.vortex` ; couleurs des arcs dans les `stroke` du SVG.
- Perf : une seule boucle `requestAnimationFrame`, en pause hors écran et onglet caché ;
  `prefers-reduced-motion` → rendu figé. Au-delà de ~40 cartes, surveiller le mobile.
- Pour un projet React/Vue : garder le CSS tel quel, mettre le script dans un `useEffect`/`onMounted`
  (sur une `ref` au lieu de `querySelector`) avec nettoyage du `requestAnimationFrame` et des écouteurs.
