#!/usr/bin/env python3
"""Sujets ajoutés à une appli complète (skill « integrer-sujets-corriges-infas »).

  source/master/plus-applis/<appli>/<paquet>.json  →  <script type="text/plain" id="app-src-<appli>--<paquet>">
      (chargé seulement à l'ouverture de l'appli : apps/<appli>--<paquet>.js dans la version élèves)
  + un petit index  →  <script type="text/plain" id="app-xdata-plusapp">
      {appli: [{id, titre, session, annee, nq, nsuj, antennes:[{slug, name, sujets:[[slug, nom, nq]]}]}]}

Le moteur fusionne les paquets dans QUIZ_DATA de l'appli au moment de l'ouvrir : apps/ reste intact.
Les originaux sont gardés dans source/origines/<appli>-plus/ (SHA256SUMS) ; leur empreinte est vérifiée.
Rien d'autre n'est modifié. Relancer sans changement ne modifie rien.

Usage : python3 tools/plus_applis.py
"""
import hashlib, json, os, subprocess, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RACINE, 'source', 'master')
PA = os.path.join(SRC, 'plus-applis')
ORI = os.path.join(RACINE, 'source', 'origines')


def sha(b):
    return hashlib.sha256(b).hexdigest()


def main():
    mp = os.path.join(SRC, 'manifest.json')
    man = json.load(open(mp, encoding='utf-8'))
    propre = []
    for s in man['segments']:
        if s['type'] == 'bloc' and (str(s.get('fichier', '')).startswith('plus-applis/') or s.get('id') == 'app-xdata-plusapp'):
            propre.pop()          # retire aussi la balise HTML qui ouvre le bloc
            continue
        propre.append(s)
    fin = propre.pop()
    if fin['type'] != 'html' or '</body>' not in fin['texte']:
        sys.exit('ARRÊT : fin du fichier maître inattendue')
    ids = {s['id'] for s in propre if s['type'] == 'bloc'}
    index, blocs = {}, []
    for app in sorted(x for x in os.listdir(PA) if os.path.isdir(os.path.join(PA, x))) if os.path.isdir(PA) else []:
        if 'app-src-' + app not in ids:
            sys.exit('ARRÊT : appli « %s » introuvable dans le fichier maître' % app)
        for f in sorted(x for x in os.listdir(os.path.join(PA, app)) if x.endswith('.json')):
            pid = f[:-5]
            raw = open(os.path.join(PA, app, f), 'rb').read()
            P = json.loads(raw)
            if P.get('app') != app or P.get('id') != pid:
                sys.exit('ARRÊT : %s/%s — app/id incohérents' % (app, f))
            for o in P.get('origines', []):
                chemin = os.path.join(ORI, app + '-plus', o['fichier'])
                if not os.path.isfile(chemin) or sha(open(chemin, 'rb').read()) != o['sha256']:
                    sys.exit('ARRÊT : original absent ou modifié : ' + chemin)
            vus = set()
            for a in P['antennes']:
                for s in a['sujets']:
                    for q in s['questions']:
                        if q['id'] in vus: sys.exit('ARRÊT : identifiant de question en double : ' + q['id'])
                        vus.add(q['id'])
            bid = 'app-src-%s--%s' % (app, pid)
            if bid in ids:
                sys.exit('ARRÊT : %s existe déjà' % bid)
            data = raw.replace(b'</script', b'<%/script').replace(b'<!--', b'<%!--')
            blocs.append((bid, 'plus-applis/%s/%s' % (app, f), data))
            index.setdefault(app, []).append({k: P.get(k) for k in ('id', 'titre', 'session', 'annee', 'nq', 'nsuj')} | {
                'antennes': [{'slug': a['slug'], 'name': a['name'], 'existe': a.get('existe', False),
                              'sujets': [[s['slug'], s['name'], len(s['questions'])] for s in a['sujets']]} for a in P['antennes']]})
    if index:
        blocs.insert(0, ('app-xdata-plusapp', 'plus-applis/index.json', json.dumps(index, ensure_ascii=False, separators=(',', ':')).encode('utf-8')))
    for bid, fic, data in blocs:
        ouv = '</script>\n<script type="text/plain" id="%s">' % bid
        propre.append({'type': 'html', 'texte': ouv, 'sha256': sha(ouv.encode('utf-8'))})
        propre.append({'type': 'bloc', 'id': bid, 'octets': len(data), 'sha256': sha(data), 'fichier': fic, 'codage': 'brut'})
        if fic == 'plus-applis/index.json':
            open(os.path.join(PA, 'index.json'), 'wb').write(data)
        elif data != open(os.path.join(SRC, fic), 'rb').read():
            open(os.path.join(SRC, fic), 'wb').write(data)
    propre.append(fin)
    man['segments'] = propre
    with open(mp, 'w', encoding='utf-8') as fo:
        json.dump(man, fo, ensure_ascii=False, indent=1); fo.write('\n')
    subprocess.run([sys.executable, os.path.join(RACINE, 'tools', 'mettre_a_jour_manifeste.py'), SRC], check=True)
    print('%d paquet(s) de sujets ajouté(s)' % (len(blocs) - (1 if index else 0)))


if __name__ == '__main__':
    main()
