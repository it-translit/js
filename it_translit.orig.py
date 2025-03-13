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

def trans(source, use_q = False):
    mappings = mappings_with_q if use_q else mappings_wo_q
    source_lower = source.lower()
    res = ''
    i = 0
    while i < len(source):
        if source[i] == '\\':
            res += '\\\\'
            i += 1
            continue
        elif ord(source_lower[i]) in range(ord('a'), ord('z') + 1) or source_lower[i] == "'":
            res += '\\'
            start = i
            i += 1
            while i < len(source):
                if ord(source_lower[i]) in range(ord('а'), ord('я') + 1) or source_lower[i] == "ё":
                    i -= 1
                    while not (ord(source_lower[i]) in range(ord('a'), ord('z') + 1) or source_lower[i] == "'"):
                        i -= 1
                    i += 1
                    break
                i += 1
            res += source[start:i].replace('\\', '\\\\') + '\\'
            continue

        for n in range(len(mappings), 0, -1):
            sl = source_lower[i:i+n]
            to = mappings[n-1].get(sl)
            if to is not None:
                if not use_q and to.startswith(("'", "e'")):
                    if (source[i:i+n].islower() and (i > 0 and source[i-1].islower())) or \
                       (source[i:i+n].isupper() and (i > 0 and source[i-1].isupper())):
                        pass
                    else:
                        to = to.replace("'", 'q')
                if sl == 'кс' and source_lower[i+n:i+n+1] in ('х', 'к'):
                    continue
                #if not source[i:i+n].islower() and source[i:i+n].isalpha():
                if source[i:i+n] != sl:
                    if len(to) == 1:
                        if sl == 'кс':
                            if source[i:i+n] == 'кС':
                                to = 'kS'
                            elif source[i:i+n] == 'КС' and not (source[i+2:i+3].isupper() or (i > 0 and source[i-1].isupper())):
                                to = 'KS'
                            elif source[i:i+n] == 'Кс' and (not source[i+2:i+3].islower() or source[i+2:i+3] in 'ъь' or (i > 0 and source[i-1].isalpha())):
                                to = 'Ks'
                            else:
                                to = to.upper()
                        else:
                            to = to.upper()
                    else:
                        if n == 1:
                            if source[i+1:i+2].isupper() or (i > 0 and source[i-1].isupper()):
                                to = to.upper()
                            else:
                                to = to.capitalize()
                        else:
                            if source[i:i+n].isupper():
                                to = to.upper()
                            else:
                                to = ''.join(to[j].upper() if source[i+j].isupper() else to[j] for j in range(n)) \
                                       + (to[n:].upper() if source[i+n-1].isupper() else to[n:])
                res += to
                i += n
                break
        else:
            res += source[i]
            i += 1
    return res

def reverse(source):
    source_lower = source.lower()
    res = ''
    i = 0
    while i < len(source):
        if source[i] == '\\':
            i += 1
            if source[i] == '\\':
                res += '\\'
                i += 1
                continue
            start = i
            i += 1
            while i < len(source):
                if source[i] == '\\':
                    if i+1 < len(source) and source[i+1] == '\\':
                        res += source[start:i]
                        start = i+1
                        i += 2
                        continue
                    res += source[start:i]
                    i += 1
                    break
                i += 1
            continue

        for n in range(len(mappings_reverse), 0, -1):
            sl = source_lower[i:i+n]
            to = mappings_reverse[n-1].get(sl)
            if to is not None:
                if source[i:i+n] != sl:
                    if len(to) == 1:
                        to = to.upper()
                    else:
                        if n == 1:
                            if source[i+1:i+2].isupper() or source[i+1:i+2] == "'" or (i > 0 and (source[i-1].isupper() or source[i-1] == "'")):
                                to = to.upper()
                            else:
                                to = to.capitalize()
                        else:
                            if source[i:i+n].isupper():
                                to = to.upper()
                            else:
                                to = ''.join(to[j].upper() if source[i+j].isupper() else to[j] for j in range(len(to)))
                elif source[i] == "'":
                    #if i > 0 and source[i-1].isupper():
                    if len(res) > 0 and res[-1].isupper():
                        to = to.upper()
                res += to
                i += n
                break
        else:
            res += source[i]
            i += 1
    return res
