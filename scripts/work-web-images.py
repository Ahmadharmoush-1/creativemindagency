"""Make web-sized copies of every Selected Work image.

public/images/work/<folder>/<name>.<ext>  ->  public/images/work/web/<folder>/<name>-720.webp and -1400.webp
Work.tsx shows the 720 px copy in the fanned cards, picks 720/1400 for the project grid, and keeps
the original for the full project viewer. Existing copies are skipped unless the original is newer.

Run from the project root after adding images:  python scripts/work-web-images.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / 'public' / 'images' / 'work'
WEB = ROOT / 'web'
made = skipped = 0
for src in sorted(ROOT.rglob('*')):
    if not src.is_file() or WEB in src.parents or src.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp'}:
        continue
    rel = src.relative_to(ROOT)
    with Image.open(src) as im:
        im.load()
        has_alpha = im.mode in ('RGBA', 'LA') or 'transparency' in im.info
        im = im.convert('RGBA' if has_alpha else 'RGB')
        for width in (720, 1400):
            out = WEB / rel.parent / f'{src.stem}-{width}.webp'
            if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
                skipped += 1
                continue
            out.parent.mkdir(parents=True, exist_ok=True)
            w = min(width, im.width)
            copy = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if w < im.width else im
            copy.save(out, 'WEBP', quality=82, method=6)
            made += 1
print(f'{made} web copies written, {skipped} up to date')
