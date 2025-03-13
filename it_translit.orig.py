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

sorted_mapping = sorted(mapping.items(), key = lambda tup: len(tup[0]), reverse = True)
sorted_mapping_with_q = [(fr, to.replace("'", 'q')) for fr, to in sorted_mapping]

sorted_mapping_reverse = []
for fr, to in mapping.items():
    sorted_mapping_reverse.append((to, fr))
    if "'" in to:
        sorted_mapping_reverse.append((to.replace("'", 'q'), fr))
sorted_mapping_reverse.sort(key = lambda tup: len(tup[0]), reverse = True)

def _trans(source, mapping):
    res = ''
    i = 0
    while i < len(source):
        for fr, to in mapping:
            if source[i:i+len(fr)] == fr:
                res += to
                i += len(fr)
                break
        else:
            res += source[i]
            i += 1
    return res

def trans(source, use_q = False):
    return _trans(source, sorted_mapping_with_q if use_q else sorted_mapping)

def reverse(source):
    return _trans(source, sorted_mapping_reverse)
