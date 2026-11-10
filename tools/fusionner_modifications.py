#!/usr/bin/env python3
"""Fusionne un export PARTIEL de l'éditeur (réponses, textes, images ou questions ajoutées) dans une configuration complète.

    python3 tools/fusionner_modifications.py config.json export-partiel.json sortie.json

Même règle que l'import dans l'éditeur : seuls les champs présents dans l'export changent ; les questions ajoutées
(qAdd) sont remplacées ou ajoutées par identifiant ; le reste de la configuration ne bouge pas.
N'écrase jamais un fichier existant ; un export complet (sans « partiel ») est refusé : il remplace tout, pas besoin de fusion.
"""
import copy, json, os, sys

CATS = {'reponses', 'textes', 'images', 'ajouts'}


def fusion(cible, src):
    for k, v in src.items():
        if k == 'qAdd' and isinstance(v, list):
            L = list(cible.get('qAdd') or [])
            for q in v:
                i = next((j for j, x in enumerate(L) if isinstance(x, dict) and x.get('id') == q.get('id')), None)
                if i is None:
                    L.append(copy.deepcopy(q))
                else:
                    L[i] = copy.deepcopy(q)
            cible['qAdd'] = L
        elif isinstance(v, dict) and isinstance(cible.get(k), dict):
            fusion(cible[k], v)
        else:
            cible[k] = copy.deepcopy(v)
    return cible


def main(a):
    if len(a) != 3:
        sys.exit(__doc__)
    conf, part, out = a
    if os.path.exists(out):
        sys.exit('ARRÊT : %s existe déjà (rien n’est écrasé)' % out)
    C = json.load(open(conf, encoding='utf-8'))
    P = json.load(open(part, encoding='utf-8'))
    if P.get('partiel') not in CATS:
        sys.exit('ARRÊT : ce fichier n’est pas un export partiel de l’éditeur')
    src = {k: v for k, v in P.items() if k not in ('partiel', 'titre', 'date', 'studio')}
    R = fusion(copy.deepcopy(C), src)
    nq = len(((P.get('content') or {}).get('q') or {})) + len(((P.get('content') or {}).get('qAdd') or []))
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(R, f, ensure_ascii=False)
    print('Fusion « %s » : %d question(s) concernée(s) → %s' % (P.get('titre') or P['partiel'], nq, out))


if __name__ == '__main__':
    main(sys.argv[1:])
