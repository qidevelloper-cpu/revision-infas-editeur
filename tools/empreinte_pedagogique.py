#!/usr/bin/env python3
"""Calcule l'empreinte pédagogique d'un fichier maître de RI – Révision INFAS.

Usage :
    python3 tools/empreinte_pedagogique.py FICHIER.html SORTIE.json

L'empreinte décrit, sans rien modifier :
- l'identifiant de l'application et les clés de stockage du moteur ;
- chaque matière (id, titre, niveau, filières, clé de l'application intégrée, nombre de chapitres) ;
- pour chaque matière, ses questions et flashcards DANS L'ORDRE : l'identifiant que le moteur
  leur donne (<matière>.<position>, <matière>.f<position>) et une empreinte courte de leur
  contenu (énoncé, propositions, bonne réponse, explication) ;
- les couches de corrections de l'auteur (questions modifiées, ajoutées, retirées) ;
- la liste des applications intégrées et des images.

Deux fichiers qui ont la même empreinte pédagogique ont les mêmes identifiants de questions,
dans le même ordre, avec les mêmes corrigés : la progression des étudiants reste valable.
"""
import hashlib, json, re, sys


def sha(b):
    return hashlib.sha256(b).hexdigest()


def court(o):
    return sha(json.dumps(o, ensure_ascii=False, sort_keys=True).encode('utf-8'))[:16]


def blocs(b):
    rx = re.compile(rb'<(script|style)\b([^>]*)>')
    pos, out = 0, {}
    while True:
        m = rx.search(b, pos)
        if not m:
            return out
        a = m.end(); e = b.find(b'</' + m.group(1) + b'>', a)
        i = re.search(rb'id="([^"]*)"', m.group(2))
        out[i.group(1).decode()] = b[a:e]
        pos = e + len(m.group(1)) + 3


CHAMPS_Q = ('c', 't', 'q', 'o', 'a', 'am', 'v', 'r', 'acc', 'x', 's', 'img', 'qi')
CHAMPS_F = ('c', 'f', 'b')


def liste(prefixe, items, champs):
    return [[prefixe + str(i), court({k: it.get(k) for k in champs})] for i, it in enumerate(items)]


def empreinte(b):
    B = blocs(b)
    js = B['app-js'].decode('utf-8')
    D = json.loads(B['app-data'])
    E = json.loads(B['app-edits'])
    C = E.get('content') or {}
    X = {k[len('app-xdata-'):]: json.loads(v) for k, v in B.items() if k.startswith('app-xdata-')}
    AJ = {(json.loads(v).get('mat') or {}).get('src') for k, v in B.items() if k.startswith('app-xdata-ajout-')}
    cle = re.search(r"SKEY=APPID\+'([^']+)'", js)
    res = {
        'appId': D['meta']['appId'],
        'cle_progression': D['meta']['appId'] + (cle.group(1) if cle else '?'),
        'cles_moteur': sorted(set(re.findall(r"APPID\+'(_[\w]+)'", js))),
        'matieres': [], 'questions': {}, 'flashcards': {},
        'corrections_auteur': {k: court(C.get(k)) for k in ('q', 'qAdd', 'qDel', 'cardEd', 'cardAdd', 'cardDel', 'mat', 'groups', 'newMat')},
        # les paquets de sujets ajoutés (app-src-<appli>--<paquet>, source/master/plus-applis) ne sont pas des applis
        # les applis des contenus ajoutés (blocs app-xdata-ajout-<id>, skill « ajouter-contenu ») sont suivies à part, dans source/master/ajouts
        'applications': sorted(k[len('app-src-'):] for k in B if k.startswith('app-src-') and k[len('app-src-'):] not in AJ and '--' not in k),
        'images': sorted(k[len('img-'):] for k in B if k.startswith('img-')),
    }
    mats = [dict(m, origine='base') for m in D['mat']] + [dict(m, origine='ajout') for m in (C.get('newMat') or [])]
    for m in mats:
        mid = m['id']
        res['matieres'].append({k: m.get(k) for k in ('id', 'title', 'short', 'niv', 'fil', 'key', 'src', 'de', 'origine')} | {'chapitres': len(m.get('ch') or [])})
        if m['origine'] == 'base':
            q, cards = D['q'].get(mid, []), D['cards'].get(mid, [])
        else:
            x = X.get(mid) or {}
            q, cards = x.get('q', []), x.get('cards', [])
        res['questions'][mid] = liste(mid + '.', q, CHAMPS_Q)
        res['flashcards'][mid] = liste(mid + '.f', cards, CHAMPS_F)
    res['totaux'] = {'matieres': len(mats), 'questions': sum(len(v) for v in res['questions'].values()),
                     'flashcards': sum(len(v) for v in res['flashcards'].values()),
                     'applications': len(res['applications']), 'images': len(res['images'])}
    return res


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(__doc__); sys.exit(2)
    r = empreinte(open(sys.argv[1], 'rb').read())
    with open(sys.argv[2], 'x', encoding='utf-8') as f:
        json.dump(r, f, ensure_ascii=False, indent=1); f.write('\n')
    print('Empreinte écrite :', sys.argv[2], r['totaux'])
