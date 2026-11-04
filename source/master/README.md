# source/master — le fichier maître découpé

Ce dossier contient le fichier maître de RI – Révision INFAS (`master-integre24.html`,
105 736 491 octets, SHA-256 `62caed85…066`) découpé en fichiers lisibles. Il permet de
retrouver **exactement** le fichier d'origine, octet pour octet.

## Organisation

| Chemin | Contenu | Bloc d'origine |
| --- | --- | --- |
| `manifest.json` | Ordre exact des 2 321 segments, HTML situé entre les blocs, taille et SHA-256 de chaque segment et du fichier complet | — |
| `engine/app-js.js` | Moteur de l'application (écrans, quiz, flashcards, statistiques, module ajouté) | `app-js` |
| `editor/ed-js.js` | Éditeur de l'auteur (absent de la version publiée) | `ed-js` |
| `styles/app-css.css`, `styles/ed-css.css` | Styles de l'application et de l'éditeur | `app-css`, `ed-css` |
| `data/app-data.json` | Données de base : 8 matières d'origine, questions, flashcards, résumés, cours | `app-data` |
| `data/app-edits.json` | Personnalisations de l'auteur (objet E) : 14 matières ajoutées, groupes, réglages | `app-edits` |
| `data/xdata/<id>.json` | Données des matières ajoutées, glossaire (`__gloss`), index de recherche (`__appsx`) | `app-xdata-<id>` |
| `apps/<id>.html` | Les 20 applications complètes, telles que stockées dans le fichier maître (balises fermantes protégées en `<%/script`, images remplacées par des repères `@@IMG…@@`) | `app-src-<id>` |
| `images/<id>.<ext>` | Les 1 118 images, en fichiers binaires | `img-<id>` |

## Décisions prises

- **Découpage par bloc de premier niveau.** Le fichier maître contient 1 160 blocs `<script>` / `<style>`, chacun avec un id unique. Chaque bloc devient un fichier ; rien n'est réécrit à l'intérieur.
- **HTML entre les blocs dans le manifeste.** Il ne pèse que 64 042 octets ; le garder dans `manifest.json` évite 1 161 petits fichiers.
- **Images en binaire seulement si c'est exact.** Les images sont des « data URI » base64. Pour chacune, le script a vérifié que le réencodage base64 redonne exactement le texte d'origine : c'est le cas pour les 1 118. Le préfixe d'origine (`data:image/jpeg;base64,` ou `data:image/svg+xml;base64,`) est conservé dans le manifeste, même quand le contenu réel est du WebP.
- **Aucune conversion de texte.** `.gitattributes` (`* -text`) interdit à Git de modifier les fins de ligne.
- **Pas de fichier de 105 Mo dans Git.** L'original est la pièce jointe de la release `reference-62caed85` ; ce dossier permet de le reconstruire.

## Données personnelles présentes

`apps/chir.html` contient, dans le texte du cours de Chirurgie, les coordonnées (e-mail, téléphone) de deux enseignants. Elles font partie de la référence et sont déjà visibles sur le site publié ; elles sont gardées telles quelles pour que la reconstruction reste exacte. Les retirer du cours est une décision de Daniel, à traiter dans une étape distincte.

## Reconstruire

```
python3 tools/assembler_maitre.py source/master /tmp/master-reconstruit.html
sha256sum /tmp/master-reconstruit.html
# attendu : 62caed85e6bd8ac6aa3a342bc5782d1835e32c01388f43b895a24e78c14db066
```

Le script refuse d'écrire si un seul segment diffère.

## Règle

Ne pas modifier ces fichiers à la main pour l'instant : ils représentent la référence.
Toute évolution se fera dans une étape distincte, avec un nouveau manifeste et une nouvelle empreinte.
