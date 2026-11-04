#!/usr/bin/env python3
"""Met à jour source/master/manifest.json après une modification VOLONTAIRE du moteur, de l'éditeur ou des styles.

Usage :
    python3 tools/mettre_a_jour_manifeste.py source/master

- Recalcule la taille et l'empreinte des blocs dont le fichier a changé, puis celles du fichier complet.
- Refuse de toucher aux blocs protégés (data/, apps/, images/) : les données pédagogiques,
  les 20 applications et les images ne se modifient pas par ce chemin.
- Refuse si un bloc modifié n'a pas sa copie d'origine dans source/reference/fichiers/
  (sinon la référence 62caed85 ne serait plus reconstructible).
- La référence n'est jamais modifiée : source/reference/manifest-62caed85.json reste tel quel.
Affiche la liste des blocs modifiés et la nouvelle empreinte.
"""
import hashlib, json, os, sys

PROTEGES = ('data/', 'apps/', 'images/')


def sha(b):
    return hashlib.sha256(b).hexdigest()


def main():
    if len(sys.argv) != 2:
        print(__doc__); sys.exit(2)
    src = sys.argv[1].rstrip('/')
    ref_fichiers = os.path.join(os.path.dirname(os.path.abspath(src)), 'reference', 'fichiers')
    mp = os.path.join(src, 'manifest.json')
    man = json.load(open(mp, encoding='utf-8'))
    changes, parts = [], []
    for s in man['segments']:
        if s['type'] == 'html':
            parts.append(s['texte'].encode('utf-8')); continue
        d = open(os.path.join(src, s['fichier']), 'rb').read()
        if s['codage'] == 'base64':
            import base64
            d = s['prefixe'].encode('ascii') + base64.b64encode(d)
        h = sha(d)
        if h != s['sha256']:
            if s['fichier'].startswith(PROTEGES):
                raise SystemExit('Refus : bloc protégé modifié : %s (%s)' % (s['id'], s['fichier']))
            if not os.path.exists(os.path.join(ref_fichiers, s['fichier'])):
                raise SystemExit('Refus : pas de copie d\'origine de %s dans source/reference/fichiers/' % s['fichier'])
            changes.append((s['id'], s['octets'], len(d)))
            s['sha256'], s['octets'] = h, len(d)
        parts.append(d)
    out = b''.join(parts)
    ancien = man['sha256']
    man['taille'], man['sha256'] = len(out), sha(out)
    man['source'] = 'version de travail (dérivée de la référence 62caed85)'
    with open(mp, 'w', encoding='utf-8') as f:
        json.dump(man, f, ensure_ascii=False, indent=1); f.write('\n')
    for i, a, b in changes:
        print('bloc modifié : %-8s %d → %d octets' % (i, a, b))
    print('Fichier complet : %d octets · sha256 %s (avant : %s)' % (len(out), man['sha256'], ancien))


if __name__ == '__main__':
    main()
