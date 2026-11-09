#!/usr/bin/env python3
"""Contenus ajoutés (skill « ajouter-contenu-revision-infas ») : place dans le fichier maître, à la fin et dans des blocs SÉPARÉS,
  - source/master/ajouts/<id>.json → <script type="text/plain" id="app-xdata-ajout-<id>"> (fiche, emplacement, corrigés) ;
  - source/master/ajouts/<id>.html → <script type="text/plain" id="app-src-<id>"> (l'appli complète, si elle existe).
Le fichier .html est produit ici à partir de la copie exacte gardée dans source/origines/<id>/ (champ origine.fichier de la fiche) :
seules les balises « </script » et « <!-- » sont protégées (« <%/script », « <%!-- »), comme pour les 20 applis d'origine.
Rien d'autre n'est modifié : data/, apps/, images/ et plus/ restent intacts. Relancer sans changement ne modifie rien.

Usage : python3 tools/ajouts.py
"""
import hashlib, json, os, re, subprocess, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RACINE, 'source', 'master')
AJ = os.path.join(SRC, 'ajouts')
ORI = os.path.join(RACINE, 'source', 'origines')


def sha(b):
    return hashlib.sha256(b).hexdigest()


def proteger(t):
    return re.sub(r'</(script)', r'<%/\1', t, flags=re.I).replace('<!--', '<%!--')


def main():
    mp = os.path.join(SRC, 'manifest.json')
    man = json.load(open(mp, encoding='utf-8'))
    segs = man['segments']
    # retrait des blocs déjà ajoutés par cet outil (fichier dans ajouts/), avec le HTML qui les ouvre
    propre = []
    for s in segs:
        if s['type'] == 'bloc' and str(s.get('fichier', '')).startswith('ajouts/'):
            propre.pop()
            continue
        propre.append(s)
    fin = propre.pop()
    if fin['type'] != 'html' or '</body>' not in fin['texte']:
        sys.exit('ARRÊT : fin du fichier maître inattendue')
    ids_existants = {s['id'] for s in propre if s['type'] == 'bloc'}
    fiches = sorted(f for f in os.listdir(AJ) if f.endswith('.json') and not f.endswith('-questions.json')) if os.path.isdir(AJ) else []
    n = 0
    for f in fiches:
        aid = f[:-5]
        fiche = json.load(open(os.path.join(AJ, f), encoding='utf-8'))
        if fiche.get('mat', {}).get('id') != aid:
            sys.exit('ARRÊT : %s — mat.id doit valoir « %s »' % (f, aid))
        blocs = []
        o = fiche.get('origine') or {}
        if fiche['mat'].get('src'):
            orig = os.path.join(ORI, aid, o.get('fichier', ''))
            if not os.path.isfile(orig):
                sys.exit('ARRÊT : original introuvable : ' + orig)
            b = open(orig, 'rb').read()
            if o.get('sha256') and sha(b) != o['sha256']:
                sys.exit('ARRÊT : l’original %s ne correspond plus à son empreinte' % orig)
            src_id = 'app-src-' + fiche['mat']['src']
            if src_id in ids_existants:
                sys.exit('ARRÊT : %s existe déjà dans le fichier maître (identifiant déjà pris)' % src_id)
            h = proteger(b.decode('utf-8')).encode('utf-8')
            hp = os.path.join(AJ, aid + '.html')
            if not os.path.exists(hp) or open(hp, 'rb').read() != h:
                open(hp, 'wb').write(h)
            blocs.append((src_id, 'ajouts/' + aid + '.html', h))
        d = open(os.path.join(AJ, f), 'rb').read()
        blocs.insert(0, ('app-xdata-ajout-' + aid, 'ajouts/' + f, d))
        # questions natives (questionnaire comme les autres cours) : ajouts/<id>-questions.json → bloc app-xdata-<id>
        qf = os.path.join(AJ, aid + '-questions.json')
        if os.path.isfile(qf):
            if 'app-xdata-' + aid in ids_existants:
                sys.exit('ARRÊT : app-xdata-%s existe déjà dans le fichier maître' % aid)
            blocs.insert(1, ('app-xdata-' + aid, 'ajouts/' + aid + '-questions.json', open(qf, 'rb').read()))
        for bid, fic, data in blocs:
            ouv = '</script>\n<script type="text/plain" id="%s">' % bid
            propre.append({'type': 'html', 'texte': ouv, 'sha256': sha(ouv.encode('utf-8'))})
            propre.append({'type': 'bloc', 'id': bid, 'octets': len(data), 'sha256': sha(data), 'fichier': fic, 'codage': 'brut'})
        n += 1
    propre.append(fin)
    man['segments'] = propre
    with open(mp, 'w', encoding='utf-8') as fo:
        json.dump(man, fo, ensure_ascii=False, indent=1); fo.write('\n')
    subprocess.run([sys.executable, os.path.join(RACINE, 'tools', 'mettre_a_jour_manifeste.py'), SRC], check=True)
    print('%d contenu(s) ajouté(s) dans le fichier maître' % n)


if __name__ == '__main__':
    main()
