# La Débrouill'Yard — site des participants

## Organisation du dossier

```
LA DÉBROUILL'YARD/
├── Logo & photos participants/   ← tes fichiers bruts (JAMAIS mis en ligne)
├── outils/
│   └── Préparer les photos.command   ← double-clic pour préparer les photos
└── site/                         ← LE SEUL dossier à mettre en ligne
```

Pour voir le site en local : double-clic sur `site/index.html`.

## Mettre en ligne / mettre à jour

Le site est publié par GitHub Pages : https://lucasdubois0851-design.github.io/debrouillyard/

Pour publier une modification, ouvre le Terminal et tape :

    cd ~/Desktop/"LA DÉBROUILL'YARD"
    git add -A && git commit -m "Mise à jour" && git push

Le site se met à jour tout seul en 1 à 2 minutes. Le dossier « Logo & photos participants »
n'est jamais envoyé (il est exclu par le fichier `.gitignore`).

## Ajouter les photos des participants

1. Dépose la photo dans `Logo & photos participants/`, nommée avec l'id du participant
   (voir `site/assets/js/data.js`) : `lucas.jpg`, `teo.png`, `jeje.jpg`…
   Formats : JPG, PNG, WEBP. (Photos iPhone en HEIC : les exporter en JPG.)
2. Double-clique sur `outils/Préparer les photos.command`.
   La photo est recadrée, compressée, **nettoyée de ses métadonnées (position GPS, modèle
   de téléphone, date)** puis copiée dans `site/assets/img/participants/`.
3. Publie la modification (voir ci-dessus).

Le plan de la salle se met à jour de la même façon (fichier « Plan de la salle.jpg »).

## Modifier le contenu

- **Participants** : `site/assets/js/data.js`
- **Textes** : les fichiers `.html` dans `site/`
- **Couleurs** : en haut de `site/assets/css/style.css`

## Sécurité et vie privée (déjà en place)

- Politique de sécurité (CSP) dans chaque page : stricte (aucun script externe ni
  injecté ne peut s'exécuter). HTTPS forcé par GitHub Pages. (`site/_headers` ajoute
  d'autres protections si le site est un jour hébergé sur Netlify.)
- Aucune ressource tierce chargée : polices hébergées sur le site, carte Google Maps
  chargée uniquement si le visiteur clique.
- Site non indexé par Google (`robots.txt` + `noindex`) : il reste accessible à qui a
  le lien, mais n'apparaît pas dans les recherches.
- Aucun formulaire, aucune base de données, aucune donnée collectée. La checklist
  matériel est stockée uniquement sur le téléphone de chaque visiteur.
