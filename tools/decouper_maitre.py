#!/usr/bin/env python3
"""Découpe le fichier maître de RI – Révision INFAS en sources lisibles, de façon réversible.

Usage :
    python3 tools/decouper_maitre.py CHEMIN/master-integre24.html source/master

Principe
--------
Le fichier maître est une page HTML dont presque tout le contenu se trouve dans
1 160 blocs <script> / <style> de premier niveau, chacun avec un id unique
(moteur, éditeur, CSS, données, applications intégrées, images).

- Chaque bloc est écrit dans son propre fichier, octet pour octet.
- Le HTML situé entre les blocs (balises d'ouverture et de fermeture comprises)
  est gardé tel quel dans manifest.json (environ 64 Ko au total).
- Les images sont des « data URI » base64. Une image n'est écrite en fichier
  binaire (.jpg, .webp, .png, .svg) que si le réencodage base64 redonne
  exactement le même texte ; sinon elle est gardée en texte, telle quelle.
- manifest.json garde l'ordre exact, l'empreinte SHA-256 de chaque segment
  et l'empreinte du fichier complet.

Le script refuse de travailler si le fichier d'entrée n'a pas l'empreinte
attendue (option --empreinte pour une autre référence), et il vérifie à la fin
que l'assemblage redonne exactement le fichier d'origine.
Il refuse d'écrire dans un dossier de sortie non vide.
"""
import argparse, base64, hashlib, json, os, re, sys

REF_SHA = '62caed85e6bd8ac6aa3a342bc5782d1835e32c01388f43b895a24e78c14db066'
REF_SIZE = 105736491
FORMAT = 1


def sha(b):
    return hashlib.sha256(b).hexdigest()


def blocs_premier_niveau(b):
    """Liste des blocs <script>/<style> de premier niveau : (attrs, debut_contenu, fin_contenu, balise).
    Le contenu des applications intégrées a ses balises fermantes protégées (<%/script),
    donc la première balise fermante trouvée termine toujours le bloc."""
    rx = re.compile(rb'<(script|style)\b([^>]*)>')
    pos, out = 0, []
    while True:
        m = rx.search(b, pos)
        if not m:
            return out
        tag = m.group(1)
        a = m.end()
        e = b.find(b'</' + tag + b'>', a)
        if e < 0:
            raise SystemExit('Bloc non fermé à la position %d' % m.start())
        out.append((m.group(2), a, e, tag))
        pos = e + len(tag) + 3


def extension(raw):
    if raw[:4] == b'RIFF' and raw[8:12] == b'WEBP':
        return 'webp'
    if raw[:3] == b'\xff\xd8\xff':
        return 'jpg'
    if raw[:8] == b'\x89PNG\r\n\x1a\n':
        return 'png'
    if raw[:4] == b'GIF8':
        return 'gif'
    if raw.lstrip()[:4] in (b'<svg', b'<?xm'):
        return 'svg'
    return 'bin'


def chemin_bloc(bid, tag):
    if bid == 'app-js':
        return 'engine/app-js.js'
    if bid == 'ed-js':
        return 'editor/ed-js.js'
    if bid in ('app-css', 'ed-css'):
        return 'styles/%s.css' % bid
    if bid in ('app-data', 'app-edits'):
        return 'data/%s.json' % bid
    if bid.startswith('app-xdata-revisions-'):     # documents de révision ajoutés à un cours (tools/revisions.py)
        return 'revisions/%s.json' % bid[len('app-xdata-revisions-'):]
    if bid.startswith('app-xdata-plus-'):          # contenus rapatriés des applis d'origine (tools/contenus_plus.py)
        return 'plus/%s.json' % bid[len('app-xdata-plus-'):]
    if bid.startswith('app-xdata-'):
        return 'data/xdata/%s.json' % bid[len('app-xdata-'):]
    if bid.startswith('app-src-'):
        return 'apps/%s.html' % bid[len('app-src-'):]
    return 'autres/%s.%s' % (bid, 'css' if tag == b'style' else 'txt')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('maitre')
    ap.add_argument('sortie')
    ap.add_argument('--empreinte', default=REF_SHA, help='SHA-256 attendu du fichier maître')
    ap.add_argument('--taille', type=int, default=REF_SIZE, help='taille attendue en octets')
    a = ap.parse_args()

    b = open(a.maitre, 'rb').read()
    h = sha(b)
    if len(b) != a.taille or h != a.empreinte:
        raise SystemExit('Refus : le fichier maître ne correspond pas à la référence\n  taille %d (attendu %d)\n  sha256 %s\n  attendu %s'
                         % (len(b), a.taille, h, a.empreinte))
    if os.path.exists(a.sortie) and os.listdir(a.sortie):
        raise SystemExit('Refus : le dossier de sortie %s n\'est pas vide' % a.sortie)

    segments, chemins, pos = [], set(), 0
    stats = {'blocs': 0, 'images_binaires': 0, 'images_texte': 0, 'html_octets': 0}
    for attrs, deb, fin, tag in blocs_premier_niveau(b):
        brut = b[pos:deb]
        segments.append({'type': 'html', 'texte': brut.decode('utf-8'), 'sha256': sha(brut)})
        stats['html_octets'] += len(brut)
        m = re.search(rb'id="([^"]*)"', attrs)
        if not m:
            raise SystemExit('Bloc sans id à la position %d : arrêt' % deb)
        bid = m.group(1).decode('utf-8')
        contenu = b[deb:fin]
        seg = {'type': 'bloc', 'id': bid, 'octets': len(contenu), 'sha256': sha(contenu)}
        dm = re.match(rb'data:([\w/+.-]+);base64,', contenu) if bid.startswith('img-') else None
        if dm:
            corps = contenu[dm.end():]
            raw = base64.b64decode(corps, validate=True)
            if base64.b64encode(raw) == corps:
                rel = 'images/%s.%s' % (bid[4:], extension(raw))
                seg.update({'fichier': rel, 'codage': 'base64', 'prefixe': dm.group(0).decode('ascii')})
                donnees = raw
                stats['images_binaires'] += 1
            else:
                rel = 'images/%s.datauri.txt' % bid[4:]
                seg.update({'fichier': rel, 'codage': 'brut'})
                donnees = contenu
                stats['images_texte'] += 1
        else:
            rel = chemin_bloc(bid, tag)
            seg.update({'fichier': rel, 'codage': 'brut'})
            donnees = contenu
        if rel in chemins:
            raise SystemExit('Deux blocs donnent le même fichier : ' + rel)
        chemins.add(rel)
        p = os.path.join(a.sortie, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'xb') as f:
            f.write(donnees)
        segments.append(seg)
        stats['blocs'] += 1
        pos = fin
    fin_html = b[pos:]
    segments.append({'type': 'html', 'texte': fin_html.decode('utf-8'), 'sha256': sha(fin_html)})
    stats['html_octets'] += len(fin_html)

    manifeste = {'format': FORMAT, 'source': os.path.basename(a.maitre), 'taille': len(b), 'sha256': h,
                 'statistiques': stats, 'segments': segments}
    with open(os.path.join(a.sortie, 'manifest.json'), 'x', encoding='utf-8') as f:
        json.dump(manifeste, f, ensure_ascii=False, indent=1)
        f.write('\n')

    # contrôle immédiat : l'assemblage doit redonner exactement l'original
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from assembler_maitre import assembler
    out = assembler(a.sortie)
    if out != b:
        raise SystemExit('ÉCHEC : l\'assemblage ne redonne pas le fichier d\'origine')
    print('Découpage terminé : %(blocs)d blocs, %(images_binaires)d images binaires, %(images_texte)d images en texte, %(html_octets)d octets de HTML' % stats)
    print('Contrôle d\'assemblage : %d octets, sha256 %s, identique à l\'original' % (len(out), sha(out)))


if __name__ == '__main__':
    main()
