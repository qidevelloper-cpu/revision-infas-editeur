#!/usr/bin/env python3
"""Documents de révision ajoutés à un cours existant (ex. « Révision de gynécologie » dans Gynéco-Obstétrique).

  source/master/revisions/<cours>.json  →  <script type="text/plain" id="app-xdata-revisions-<cours>">
  {cours, titre, origine:{fichier, sha256}, sujets:[{t, q:[questions natives {q, t, o, a, am, v, x, s, r, acc}]}]}

Le moteur ajoute ces questions APRÈS celles du cours (identifiants <cours>.<n> stables, n à partir du nombre de questions
d'origine), chaque sujet devenant un chapitre et un sujet entier de « Faire les quiz » / « 📝 Sujets » ; les sujets
d'origine du cours ne changent pas. data/, apps/ et images/ ne sont pas touchés.
L'original est gardé dans source/origines/revisions-<cours>/ (SHA256SUMS) ; son empreinte est vérifiée.
Relancer sans changement ne modifie rien.

Usage : python3 tools/revisions.py
"""
import hashlib, json, os, subprocess, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RACINE, 'source', 'master')
ORI = os.path.join(RACINE, 'source', 'origines')
PRE = 'app-xdata-revisions-'


def sha(b):
    return hashlib.sha256(b).hexdigest()


def main():
    mp = os.path.join(SRC, 'manifest.json')
    man = json.load(open(mp, encoding='utf-8'))
    propre = []
    for s in man['segments']:
        if s['type'] == 'bloc' and s['id'].startswith(PRE):
            propre.pop()                       # le segment HTML qui ouvre ce bloc
            continue
        propre.append(s)
    fin = propre.pop()
    if fin['type'] != 'html' or '</body>' not in fin['texte']:
        sys.exit('ARRÊT : fin du fichier maître inattendue')
    ids = {s['id'] for s in propre if s['type'] == 'bloc'}
    dos = os.path.join(SRC, 'revisions')
    fichiers = sorted(f for f in os.listdir(dos) if f.endswith('.json')) if os.path.isdir(dos) else []
    bilan = []
    for f in fichiers:
        cours = f[:-5]
        raw = open(os.path.join(dos, f), 'rb').read()
        R = json.loads(raw)
        if R.get('cours') != cours:
            sys.exit('ARRÊT : %s — champ « cours » différent du nom du fichier' % f)
        o = R.get('origine') or {}
        chemin = os.path.join(ORI, 'revisions-' + cours, o.get('fichier', ''))
        if not o.get('fichier') or not os.path.isfile(chemin) or sha(open(chemin, 'rb').read()) != o.get('sha256'):
            sys.exit('ARRÊT : original absent ou modifié : ' + chemin)
        n = sum(len(s['q']) for s in R['sujets'])
        if not n or any(not s.get('t') or not s['q'] for s in R['sujets']):
            sys.exit('ARRÊT : %s — sujet sans titre ou sans question' % f)
        if b'</script' in raw.lower() or b'<!--' in raw:
            sys.exit('ARRÊT : %s contient « </script » ou « <!-- »' % f)
        bid = PRE + cours
        if bid in ids:
            sys.exit('ARRÊT : %s existe déjà' % bid)
        ouv = '</script>\n<script type="text/plain" id="%s">' % bid
        propre.append({'type': 'html', 'texte': ouv, 'sha256': sha(ouv.encode('utf-8'))})
        propre.append({'type': 'bloc', 'id': bid, 'octets': len(raw), 'sha256': sha(raw), 'fichier': 'revisions/' + f, 'codage': 'brut'})
        bilan.append('%s : %d sujets, %d questions' % (cours, len(R['sujets']), n))
    propre.append(fin)
    man['segments'] = propre
    with open(mp, 'w', encoding='utf-8') as fo:
        json.dump(man, fo, ensure_ascii=False, indent=1); fo.write('\n')
    subprocess.run([sys.executable, os.path.join(RACINE, 'tools', 'mettre_a_jour_manifeste.py'), SRC], check=True)
    print('documents de révision :', ' · '.join(bilan) or 'aucun')


if __name__ == '__main__':
    main()
