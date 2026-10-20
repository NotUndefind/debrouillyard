#!/usr/bin/env python3
"""
Prépare les images du site à partir du dossier « Logo & photos participants ».

- Photos participants : recadrées en 4:5, 800x1000, JPEG compressé,
  TOUTES les métadonnées supprimées (GPS, modèle du téléphone, date…).
  Le fichier doit être nommé avec l'id du participant (voir site/assets/js/data.js),
  ex. « lucas.jpg » ou « Téo.HEIC ». Les photos iPhone (HEIC) sont converties automatiquement.

Les fichiers originaux ne sont jamais modifiés ni publiés.
"""
import re
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow manquant. Installe-le avec :  python3 -m pip install --user Pillow")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "Logo & photos participants"
SITE = ROOT / "site"
OUT_PEOPLE = SITE / "assets" / "img" / "participants"
OUT_IMG = SITE / "assets" / "img"
DATA_JS = SITE / "assets" / "js" / "data.js"
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}
MAX_INPUT_PIXELS = 60_000_000  # refuse les images démesurées (bombe de décompression)
Image.MAX_IMAGE_PIXELS = MAX_INPUT_PIXELS


def slug(name: str) -> str:
    s = unicodedata.normalize("NFD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def participant_ids() -> set:
    return set(re.findall(r'id:\s*"([a-z0-9-]+)"', DATA_JS.read_text(encoding="utf-8")))


def open_any(path: Path) -> Image.Image:
    """Ouvre une image ; les HEIC (iPhone) sont d'abord convertis via l'outil macOS « sips »."""
    if path.suffix.lower() in {".heic", ".heif"}:
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "conv.jpg"
            subprocess.run(["sips", "-s", "format", "jpeg", str(path), "--out", str(out)],
                           check=True, capture_output=True)
            with Image.open(out) as im:
                im.load()
                return im.copy()
    with Image.open(path) as im:
        im.load()
        return im.copy()


def clean_copy(img: Image.Image) -> Image.Image:
    """Applique l'orientation EXIF puis reconstruit une image vierge (sans aucune métadonnée)."""
    img = ImageOps.exif_transpose(img).convert("RGB")
    fresh = Image.new("RGB", img.size)
    fresh.paste(img)
    return fresh


def trim_white(img: Image.Image, pad: int = 24) -> Image.Image:
    """Retire les grandes marges blanches autour d'un plan."""
    gray = img.convert("L").point(lambda v: 255 if v < 245 else 0)
    box = gray.getbbox()
    if not box:
        return img
    l, t, r, b = box
    return img.crop((max(l - pad, 0), max(t - pad, 0), min(r + pad, img.width), min(b + pad, img.height)))


def save_jpeg(img: Image.Image, dest: Path) -> None:
    img.save(dest, "JPEG", quality=82, optimize=True, progressive=True)


def main() -> None:
    ids = participant_ids()
    OUT_PEOPLE.mkdir(parents=True, exist_ok=True)
    done, skipped = [], []

    for f in sorted(SRC.iterdir()):
        if f.suffix.lower() not in EXTS or f.name.startswith("."):
            continue
        key = slug(f.stem)
        try:
            img = clean_copy(open_any(f))
        except Exception as e:  # fichier corrompu ou format non reconnu
            skipped.append(f"{f.name} (illisible : {e})")
            continue

        if key in ids:
            img = ImageOps.fit(img, (800, 1000), Image.LANCZOS, centering=(0.5, 0.4))
            save_jpeg(img, OUT_PEOPLE / f"{key}.jpg")
            done.append(f"{f.name} → participants/{key}.jpg")
        elif key not in {"logo", "img-0951", "plan-de-la-salle"}:
            skipped.append(f"{f.name} (aucun participant avec l'id « {key} »)")

    print("\n✅ Images prêtes :" if done else "\nAucune image traitée.")
    for d in done:
        print("   ", d)
    if skipped:
        print("\n⚠️  Ignorées :")
        for s in skipped:
            print("   ", s)
        print("\nIds valides :", ", ".join(sorted(ids)))


if __name__ == "__main__":
    main()
