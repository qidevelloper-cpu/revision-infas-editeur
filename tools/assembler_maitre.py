#!/usr/bin/env python3
"""Réassemble le fichier maître de RI – Révision INFAS à partir de source/master.

Usage :
    python3 tools/assembler_maitre.py source/master SORTIE.html              (version courante)
    python3 tools/assembler_maitre.py --reference source/master SORTIE.html  (référence 62caed85)

La référence se reconstruit avec source/reference/manifest-62caed85.json et les fichiers
d'origine gardés dans source/reference/fichiers/ (seulement ceux qui ont changé depuis).

Lit manifest.json, recolle les segments dans l'ordre, vérifie l'empreinte de
chaque segment puis celle du fichier complet. Échoue (code 1) à la moindre
différence ; n'écrit le fichier de sortie que si tout est conforme, et refuse
d'écraser un fichier existant.
"""
import base64, hashlib, json, os, sys


class ErreurAssemblage(Exception):
    pass


def sha(b):
    return hashlib.sha256(b).hexdigest()


def assembler(dossier, manifeste=None, surcouche=None):
    """dossier : source/master. manifeste : autre manifeste à utiliser (par défaut dossier/manifest.json).
    surcouche : dossier dont les fichiers remplacent ceux de `dossier` quand ils existent
    (sert à reconstruire la référence : source/reference/fichiers)."""
    with open(manifeste or os.path.join(dossier, 'manifest.json'), encoding='utf-8') as f:
        man = json.load(f)
    if man.get('format') != 1:
        raise ErreurAssemblage('Format de manifeste inconnu : %r' % man.get('format'))
    parts = []
    for i, s in enumerate(man['segments']):
        if s['type'] == 'html':
            d = s['texte'].encode('utf-8')
        elif s['type'] == 'bloc':
            chemin = os.path.join(dossier, s['fichier'])
            if surcouche and os.path.exists(os.path.join(surcouche, s['fichier'])):
                chemin = os.path.join(surcouche, s['fichier'])
            with open(chemin, 'rb') as f:
                d = f.read()
            if s['codage'] == 'base64':
                d = s['prefixe'].encode('ascii') + base64.b64encode(d)
            elif s['codage'] != 'brut':
                raise ErreurAssemblage('Codage inconnu au segment %d' % i)
            if len(d) != s['octets']:
                raise ErreurAssemblage('Taille différente pour %s (%d au lieu de %d)' % (s['id'], len(d), s['octets']))
        else:
            raise ErreurAssemblage('Type de segment inconnu au segment %d' % i)
        if sha(d) != s['sha256']:
            raise ErreurAssemblage('Empreinte différente au segment %d (%s)' % (i, s.get('id', 'html')))
        parts.append(d)
    out = b''.join(parts)
    if len(out) != man['taille'] or sha(out) != man['sha256']:
        raise ErreurAssemblage('Fichier final différent : %d octets, sha256 %s' % (len(out), sha(out)))
    return out


def assembler_reference(dossier):
    racine = os.path.dirname(os.path.abspath(dossier.rstrip('/')))
    ref = os.path.join(racine, 'reference')
    return assembler(dossier, os.path.join(ref, 'manifest-62caed85.json'), os.path.join(ref, 'fichiers'))


def main():
    args = sys.argv[1:]
    ref = bool(args) and args[0] == '--reference'
    if ref:
        args = args[1:]
    if len(args) != 2:
        print(__doc__)
        sys.exit(2)
    dossier, sortie = args
    if os.path.exists(sortie):
        print('Refus : %s existe déjà' % sortie)
        sys.exit(1)
    try:
        out = assembler_reference(dossier) if ref else assembler(dossier)
    except ErreurAssemblage as e:
        print('ÉCHEC :', e)
        sys.exit(1)
    with open(sortie, 'xb') as f:
        f.write(out)
    print('Assemblé : %s · %d octets · sha256 %s' % (sortie, len(out), sha(out)))


if __name__ == '__main__':
    main()
