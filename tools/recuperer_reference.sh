#!/bin/sh
# Télécharge le fichier maître de référence depuis la release privée et vérifie son empreinte.
# Usage : sh tools/recuperer_reference.sh DOSSIER_DE_DESTINATION
# Nécessite : gh (GitHub CLI) connecté avec un accès au dépôt privé, sha256sum.
set -e
DEST="${1:?dossier de destination}"
mkdir -p "$DEST"
gh release download reference-62caed85 -R qidevelloper-cpu/revision-infas-sources -p master-integre24.html -D "$DEST"
cd "$DEST"
test "$(wc -c < master-integre24.html | tr -d ' ')" = "105736491"
echo "62caed85e6bd8ac6aa3a342bc5782d1835e32c01388f43b895a24e78c14db066  master-integre24.html" | sha256sum -c -
