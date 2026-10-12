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
- Molette (ou glissé tactile) : la caméra avance (bas) ou recule (haut) dans le tunnel avec inertie,
  la jauge à droite défile. La molette est capturée tant que le pointeur est sur le hero : mettre
  `data-wheel="off"` si une page défile en dessous et qu'on veut garder le défilement normal.
- Clic sur une carte : elle revient au premier plan et s'agrandit (~70 % de l'écran), le tunnel ralentit
  et le texte s'efface. Re-clic, clic ailleurs, molette ou Échap pour refermer.
- Options sur `<section class="vortex">` : `data-count` (nb de cartes, 28 par défaut), `data-speed`
  (px/s, 70 par défaut), `data-images` (URLs séparées par des virgules), `data-wheel="off"`. Sans
  `data-images`, les images viennent de picsum.photos : à remplacer par les visuels du projet (captures,
  œuvres, produits…), en assez haute définition pour le zoom (≥ 800 px de large).
- Couleurs : `--bg` sur `.vortex` ; couleurs des arcs dans les `stroke` du SVG.
- Perf : une seule boucle `requestAnimationFrame`, en pause hors écran et onglet caché ;
  `prefers-reduced-motion` → plus de défilement automatique (molette et clic restent actifs). Au-delà de ~40 cartes, surveiller le mobile.
- Pour un projet React/Vue : garder le CSS tel quel, mettre le script dans un `useEffect`/`onMounted`
  (sur une `ref` au lieu de `querySelector`) avec nettoyage du `requestAnimationFrame` et des écouteurs.
