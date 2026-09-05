#!/usr/bin/env python3
"""Проставляє версію до style.css і main.js у всіх HTML.

Навіщо. GitHub Pages віддає ці файли з `cache-control: max-age=600`, тож
після пушу браузер ще десять хвилин тримає стару версію — правки наче не
доїхали. Версія в адресі (`main.js?v=8f2c1a90`) робить адресу новою, і
браузер тягне свіжий файл одразу.

Версія — перші 8 символів md5 самого файла. Змінився файл — змінилась
адреса. Не змінився — адреса та сама, кеш працює як має.

Запускати ПЕРЕД комітом, щойно чіпав css/style.css або js/main.js:

    /usr/bin/python3 tools/stamp-assets.py
"""

import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = {
    'css/style.css': 'href',
    'js/main.js': 'src',
}


def short_hash(path: pathlib.Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()[:8]


def main() -> int:
    versions = {}
    for rel in ASSETS:
        f = ROOT / rel
        if not f.exists():
            print('НЕМАЄ ФАЙЛА: %s' % rel)
            return 1
        versions[rel] = short_hash(f)

    pages = sorted(ROOT.glob('*.html'))
    if not pages:
        print('HTML-сторінок не знайдено')
        return 1

    touched = 0
    for page in pages:
        text = original = page.read_text(encoding='utf-8')
        for rel, attr in ASSETS.items():
            # ловимо і чисту адресу, і вже проставлену версію
            pattern = re.compile(r'%s="%s(?:\?v=[0-9a-f]+)?"' % (attr, re.escape(rel)))
            text = pattern.sub('%s="%s?v=%s"' % (attr, rel, versions[rel]), text)
        if text != original:
            page.write_text(text, encoding='utf-8')
            touched += 1

    for rel, v in versions.items():
        print('  %-16s v=%s' % (rel, v))
    print('оновлено сторінок: %d із %d' % (touched, len(pages)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
