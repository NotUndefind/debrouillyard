#!/bin/bash
# Double-clique sur ce fichier pour préparer les photos du site.
cd "$(dirname "$0")"
python3 preparer_images.py
echo
read -n 1 -s -r -p "Appuie sur une touche pour fermer…"
