mapping = {
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'g',
    'д': 'd',
    'з': 'z',
    'и': 'i',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ф': 'f',

    'е': 'e',
    'ё': 'yo',
    'ж': 'zh',
    'й': 'j',
    'х': 'h',
    'сх':'skh',
    'кс':'x',
    'ц': 'cz',
    'ч': 'ch',
    'ш': 'sh',
    'щ': 'shh',
    'шх':'shkh',
    'ъ': "''",
    'ы': 'y',
    'ь': "'",
    'э': "e'",
    'ю': 'yu',
    'я': 'ya',

    'ыа': 'yaw',
    'ыу': 'yuw',
    'ыо': 'yow',
    'еь': "e'w",
    'ьь': "'w",
    'ьъ': "'ww",
    'еъ': 'eww',
    'зх': 'zkh',
    'зкх':'zkhw',
    'скх':'skhw',
    'шкх':'shkhw',
}

def get_mappings(items):
    mappings = [{} for _ in range(max(len(fr) for fr, to in items))]
    for fr, to in items:
        mappings[len(fr) - 1][fr] = to
    return mappings

mappings_wo_q = get_mappings(mapping.items())
mappings_with_q = get_mappings([(fr, to.replace("'", 'q')) for fr, to in mapping.items()])

mappings_reverse_items = []
for fr, to in mapping.items():
    mappings_reverse_items.append((to, fr))
    if "'" in to:
        mappings_reverse_items.append((to.replace("'", 'q'), fr))
mappings_reverse = get_mappings(mappings_reverse_items)

def _trans(source, mappings):
    res = ''
    i = 0
    while i < len(source):
        for n in range(len(mappings), 0, -1):
            to = mappings[n-1].get(source[i:i+n])
            if to is not None:
                res += to
                i += n
                break
        else:
            res += source[i]
            i += 1
    return res

def trans(source, use_q = False):
    return _trans(source, mappings_with_q if use_q else mappings_wo_q)

def reverse(source):
    return _trans(source, mappings_reverse)
