import it_translit, sys, itertools

ok = True
def t(s, d, use_q = False):
    global ok
    if it_translit.trans(s, use_q = use_q) != d:
        sys.stderr.write(f"{s} -> {it_translit.trans(s, use_q = use_q)}\n")
        ok = False
        return
    if it_translit.reverse(d) != s:
        sys.stderr.write(f"{s} -> {d} -> {it_translit.reverse(d)}\n")
        ok = False

t('яндекс', 'yandex')
t('Яндекс', 'Yandex')
t('ЯНДЕКС', 'YANDEX')
t('МЯ', 'MYA')
t('Мя', 'Mya')
t('мя', 'mya')
t('хабр', 'habr')

t('только', "tol'ko")
t('только', 'tolqko', use_q = True)
t('Только', "Tol'ko")
t('Только', 'Tolqko', use_q = True)
t('ТОЛЬКО', "TOL'KO")
t('ТОЛЬКО', 'TOLQKO', use_q = True)
t('тольько', "tol'wko")
t('ТОЛЬЬКО', "TOL'WKO")

t('ксерокс', 'xerox')
t('Ксерокс', 'Xerox')
t('КСЕРОКС', 'XEROX')
t('кСЕРОКС', 'kSEROX')
t('ксЕРОКС', 'xEROX')
t('КСерокс', 'KSerox')
t('кСерокс', 'kSerox')
t('ксероКс', 'xeroKs')
t('ксерокС', 'xerokS')
t('ксероКС', 'xeroKS')
t('КС', 'KS')
t('Кс', 'Ks')

t('схема', 'skhema')
t('Схема', 'Skhema')
t('СХЕМА', 'SKHEMA')
t('сХЕМА', 'sKHEMA')

t('Скхема', 'Skhwema')
t('СКХЕМА', 'SKHWEMA')
t('сКХЕМА', 'sKHWEMA')
t('скХЕМА', 'skHWEMA')
t('скхЕМА', 'skhwEMA')

t('Ь', 'Q')
t('ЬМ', "QM")
t('МЬ', "M'")
t('ЬЬ', 'QW')
t('ьЬ', 'qW')
t('Ьь', 'Qw')
t('Ъ', 'Qq')
t('ЪМ', "QQM")
t('МЪ', "M''")

t('Сканер QR-кода', r'Skaner \QR\-koda')
t('Яхта\yacht', r'Yahta\\\yacht' + '\\')
t(r'C\D', '\\C\\\\D\\')
t("Git", '\\Git\\')
t("Git'а", r"\Git'\a")
t("Д'Артаньян", r"D\'\Artan'yan")

for rep in range(1, 5):
    for tup in itertools.product([chr(ord('а') + i) for i in range(32)] + ['ё'], repeat = rep):
        if it_translit.reverse(it_translit.trans(''.join(tup))) != ''.join(tup):
            t(''.join(tup), it_translit.trans(''.join(tup)))

test_chars = 'азксежхцчшщъыьэя'
for rep in range(1, 5):
    for tup in itertools.product(test_chars + test_chars.upper() + ' ', repeat = rep):
        tr = it_translit.trans(''.join(tup))
        if it_translit.reverse(tr) != ''.join(tup):
            t(''.join(tup), tr)
        if "'" in tr:
            if it_translit.reverse(it_translit.trans(''.join(tup), use_q = True)) != ''.join(tup):
                t(''.join(tup), it_translit.trans(''.join(tup), use_q = True), use_q = True)

if ok:
    print('ok')
else:
    sys.exit('!ok')
