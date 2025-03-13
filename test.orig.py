import it_translit, itertools, time

def t(s):
    print(s, '->', it_translit.trans(s), '->', it_translit.reverse(it_translit.trans(s)))
t('яндекс')
t('хабр')

t_ = it_translit.trans('только')
tq = it_translit.trans('только', use_q = True)
print(t_, '->', it_translit.reverse(t_))
print(tq, '->', it_translit.reverse(tq))

s = time.perf_counter()
for rep in range(1, 5):
    for tup in itertools.product([chr(ord('а') + i) for i in range(32)] + ['ё'], repeat = rep):
        if it_translit.reverse(it_translit.trans(''.join(tup))) != ''.join(tup):
            print(''.join(tup), '->', it_translit.trans(''.join(tup)), '->', it_translit.reverse(it_translit.trans(''.join(tup))))
print(time.perf_counter() - s)
