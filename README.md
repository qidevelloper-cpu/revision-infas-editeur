# Révision INFAS — éditeur local (fichier maître découpé)

Dépôt **privé** de Daniel Noufe (INFAS). Il contient le **fichier maître de l'éditeur** (portail de révision +
Studio d'édition) découpé en morceaux, pour pouvoir être importé dans un assistant de code (Gemini) : le fichier
complet fait 105,8 Mo, au-delà des limites d'import.

Source : dépôt `qidevelloper-cpu/revision-infas-sources`, branche `lot-2b-editeur-central`, commit `360f30c`
(étape 1 du lot 2B : journal d'historique, numéros de version, contrôles de publication).

## Contenu

| Dossier | Rôle |
|---|---|
| `source/master/engine/app-js.js` | Moteur du portail étudiant (questions, progression, affichage) |
| `source/master/editor/ed-js.js` | Éditeur (Studio) : mode édition, inspecteur, journal, publication |
| `source/master/styles/` | Feuilles de style du portail et de l'éditeur |
| `source/master/data/` | Données pédagogiques : matières, questions, cartes, cours, configuration intégrée |
| `source/master/apps/` | Les 20 applications de révision intégrées (HTML) |
| `source/master/images/` | Les 1 118 images (JPEG) |
| `source/master/plus/` | Contenus rapatriés des applis d'origine (cours, prépa D.E, galeries, corrections…), dans des fichiers séparés |
| `source/master/manifest.json` | Plan d'assemblage : ordre des morceaux, tailles et empreintes SHA-256 |
| `tools/` | Outils : assemblage, découpage, mise à jour du manifeste, empreinte pédagogique |

## Reconstruire l'éditeur en un seul fichier

Python 3, sans dépendance, à la racine du dépôt :

```sh
python3 tools/assembler_maitre.py source/master RI-editeur.html
```

L'outil vérifie l'empreinte de chaque morceau puis celle du fichier complet ; il n'écrit rien en cas d'écart et
n'écrase jamais un fichier existant. Résultat attendu : **111 108 364 octets**, SHA-256
`5796e548d3366148da75f024e804c9f6200921a90c96d588a2a5f60cc6c395df`. Ouvrir `RI-editeur.html` dans le navigateur.

## À savoir

- La configuration intégrée (`source/master/data/app-edits.json`) est **antérieure** à celle publiée le 25/10 sur le
  site étudiants : l'éditeur reprend la configuration enregistrée dans le navigateur si elle est plus récente.
- Ce dépôt ne publie rien : le site étudiants est un autre dépôt et n'est mis à jour que par la publication du Studio.
- Absents d'ici : les tests automatisés, la documentation des lots et les prototypes de l'application unifiée
  (dépôt `revision-infas-sources` et travail local).
