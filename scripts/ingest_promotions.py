#!/usr/bin/env python3
"""Build public/data/promotions.csv from official retail price-disclosure CSVs in cvs/.

Source files are daily nationwide price snapshots (one row per product per branch),
published by each chain. This script extracts active promos (Цена в промоция set and
below Цена на дребно), dedupes per product per chain (keeping the variant with the most
branch coverage — see `collect_promos`), classifies products into the app's category
taxonomy by keyword matching on the product name (the source's numeric category codes
are retailer-internal and don't align across chains), and writes the top N promos per
chain ranked by branch coverage and discount size.

To refresh: drop a newer cvs/ snapshot (same filenames) and rerun this script, then
`npm run build`. public/data/promotions.csv is fully regenerated — no app code changes
needed.

Usage: python3 scripts/ingest_promotions.py
"""
import csv
import re
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CVS_DIR = ROOT / 'cvs'
OUT_PATH = ROOT / 'public' / 'data' / 'promotions.csv'

TOP_N_PER_STORE = 200

# Minimum number of promos to keep per category per store (before filling the remaining
# slots by overall rank) — without this, high-volume categories like "Основни хранителни
# продукти" and "Напитки" crowd out thinner ones like "Хляб и тестени" or "Консерви" in
# the global top-N ranking, sometimes down to zero.
MIN_PER_CATEGORY = 8

SOURCES = [
    ('Billa', ['Билла (Билла България ЕООД)_130007884.csv']),
    ('Lidl', ['Лидл България_131071587.csv']),
    ('Kaufland', ['Кауфланд България_131129282.csv']),
    ('Fantastiko', [
        'ФАНТАСТИКО (ФАНТАСТИКО ГРУП ООД)_206255903.csv',
        'ФАНТАСТИКО (ДАР Г.Н.)_831556063.csv',
    ]),
    ('T Market', ['T Market (Максима България ЕООД)_131324923.csv']),
    ('Metro', ['Метро България_121644736.csv']),
    ('CBA', [
        'Бурлекс (ЦБА ЕАД)_202420609.csv',
        'Бурлекс (ЦБА Еко Маркет ООД)_203735391.csv',
    ]),
]

CATEGORY_KEYWORDS = [
    # Hygiene/household keywords go first: products like "Сапун ... с мляко и мед"
    # would otherwise be misclassified by the more general food keywords below.
    ('Домакински стоки', ['препарат', 'тоалетна хартия', ' тх ', 'тх pufina',
                          'тх ', 'миещ', 'перилен', 'салфетк', 'торбички',
                          'почистващ', 'гъба за', 'кухненск', 'омекотител',
                          'сапун', 'шампоан', 'душ гел', 'паста за зъби',
                          'четка за зъби', 'дезодорант']),
    ('Млечни продукти', ['мляко', 'сирене', 'кашкавал', 'извара', 'масло', 'йогурт',
                         'сметана', 'крема сирене', 'моцарела']),
    ('Месо и риба', ['пиле', 'пилеш', 'свинск', 'телешк', 'кренвирш', 'салам',
                     'надениц', 'риба', 'скумрия', 'кайма', 'бекон', 'шунка',
                     'колбас', 'хамбургер', 'кюфте', 'агнешк', 'шпек']),
    ('Хляб и тестени', ['хляб', 'багет', 'кифл', 'кори за', 'тесто', 'питк',
                        'симит', 'фокача', 'гевре']),
    ('Напитки', ['сок', ' вода', 'минерал', 'бира', 'вино', 'кафе', 'чай',
                 'напитк', 'газирана', 'цигари', 'енергийна']),
    ('Сладки', ['шоколад', 'бисквит', 'вафла', 'торта', 'сладолед', 'бонбон',
                'десерт', 'локум', 'крем ', 'козунак', 'еклер']),
    ('Плодове и зеленчуци', ['ябълк', 'банан', 'домат', 'краставиц', ' лук',
                             'картоф', 'портокал', 'зеленчук', 'плод', 'чушк',
                             'моркови', 'грозде', 'лимон', 'диня', 'праскови',
                             'спанак', 'зеле']),
    ('Консерви', ['консерв', 'компот', 'туршия', 'буркан', 'паста доматена',
                  'зелен фасул конс']),
]
DEFAULT_CATEGORY = 'Основни хранителни продукти'

NAME_JUNK_PREFIX_RE = re.compile(r'^[\*\-\s"\'.,]+')
NAME_CODE_PREFIX_RE = re.compile(r'^(?:\d{2,4}[А-Яа-яA-Za-z]{0,3}\.?\s+|(?:SOC|MAP|ДОБ|ЕЛ|МИО|БИО|КЛВ)\.?\s+)+', re.IGNORECASE)
NAME_STRAY_JUNK_RE = re.compile(r'\s*[\*]+\s*')
WHITESPACE_RE = re.compile(r'\s+')


# Words that would otherwise trip a broader category's keyword (e.g. "Оцет ябълков"
# matching the "ябълк" fruit keyword) — checked first and pinned to the pantry default.
PANTRY_OVERRIDE_KEYWORDS = ['оцет', 'подправ', 'бульон']


def classify(product_name: str) -> str:
    lname = product_name.lower()
    if any(kw in lname for kw in PANTRY_OVERRIDE_KEYWORDS):
        return DEFAULT_CATEGORY
    for category, keywords in CATEGORY_KEYWORDS:
        if any(kw in lname for kw in keywords):
            return category
    return DEFAULT_CATEGORY


def clean_name(raw: str) -> str:
    name = NAME_JUNK_PREFIX_RE.sub('', raw.strip())
    name = NAME_CODE_PREFIX_RE.sub('', name)
    name = NAME_JUNK_PREFIX_RE.sub('', name)
    name = NAME_STRAY_JUNK_RE.sub(' ', name)
    name = WHITESPACE_RE.sub(' ', name).strip()
    return name.title() if name.isupper() else name


def parse_price(value: str) -> float:
    value = value.strip().replace(',', '.')
    if not value:
        return 0.0
    try:
        return float(value)
    except ValueError:
        return 0.0


def collect_promos(filenames):
    """Groups promo rows by cleaned product name, tracking how many distinct branches
    carry the promo (a deal seen at 80 branches is a "real" chain-wide promo; one seen
    at a single branch is more likely a regional one-off or data quirk) plus the most
    common (regular, promo) price pair for that product.

    Returns {name: (regularPrice, promoPrice, discountPct, branchCount)}.
    """
    # name -> branch -> (regular, promo) — collapse multiple rows per branch (e.g. weight
    # variants) by keeping the steepest discount seen at that branch.
    per_branch = defaultdict(dict)
    for filename in filenames:
        path = CVS_DIR / filename
        if not path.exists():
            print(f'  (skipping missing source file: {filename})')
            continue
        with path.open(encoding='utf-8') as fh:
            reader = csv.reader(fh)
            next(reader, None)
            for row in reader:
                if len(row) < 7:
                    continue
                raw_name = row[2].strip()
                branch = row[1].strip()
                regular = parse_price(row[5])
                promo = parse_price(row[6])
                if promo <= 0 or regular <= 0 or promo >= regular:
                    continue
                name = clean_name(raw_name)
                if not name:
                    continue
                branches = per_branch[name]
                existing = branches.get(branch)
                if existing is None or promo < existing[1]:
                    branches[branch] = (regular, promo)

    result = {}
    for name, branches in per_branch.items():
        branch_count = len(branches)
        # Most common (regular, promo) pair across branches represents the "typical" deal.
        price_counts = defaultdict(int)
        for pair in branches.values():
            price_counts[pair] += 1
        (regular, promo), _count = max(price_counts.items(), key=lambda kv: kv[1])
        discount = (regular - promo) / regular
        result[name] = (regular, promo, discount, branch_count)
    return result


def select_promos(promos, top_n, min_per_category):
    """Picks up to `top_n` promos, first reserving up to `min_per_category` of the
    best-ranked promos for each category (so thin categories aren't squeezed out),
    then filling any remaining slots by overall rank (branch coverage, then discount).
    """
    def rank_key(item):
        return (item[1][3], item[1][2])

    by_category = defaultdict(list)
    for name, data in promos.items():
        by_category[classify(name)].append((name, data))

    selected = {}
    for items in by_category.values():
        for name, data in sorted(items, key=rank_key, reverse=True)[:min_per_category]:
            selected[name] = data

    remaining = sorted(
        (item for item in promos.items() if item[0] not in selected),
        key=rank_key,
        reverse=True,
    )
    for name, data in remaining[:max(0, top_n - len(selected))]:
        selected[name] = data

    return sorted(selected.items(), key=rank_key, reverse=True)[:top_n]


def main():
    today = date.today()
    valid_from = today.isoformat()
    valid_to = (today + timedelta(days=6)).isoformat()

    rows = []
    for store, filenames in SOURCES:
        promos = collect_promos(filenames)
        # Rank by branch coverage first (genuinely widespread deals over one-off regional
        # quirks), then by discount size as a tiebreaker — with a per-category floor so
        # thin categories aren't crowded out entirely.
        ranked = select_promos(promos, TOP_N_PER_STORE, MIN_PER_CATEGORY)
        for product, (regular, promo, _discount, _branch_count) in ranked:
            rows.append({
                'store': store,
                'product': product,
                'category': classify(product),
                'regularPrice': f'{regular:.2f}',
                'promoPrice': f'{promo:.2f}',
                'validFrom': valid_from,
                'validTo': valid_to,
            })
        print(f'{store}: {len(promos)} unique active promos found, kept top {len(ranked)}')

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUT_PATH.open('w', encoding='utf-8', newline='') as fh:
        writer = csv.DictWriter(fh, fieldnames=[
            'store', 'product', 'category', 'regularPrice', 'promoPrice', 'validFrom', 'validTo',
        ])
        writer.writeheader()
        writer.writerows(rows)

    print(f'\nWrote {len(rows)} promotions to {OUT_PATH.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
