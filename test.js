"use strict";

// Required dependencies and imports
const { performance } = require('perf_hooks');

const it_translit = require('./it_translit');

// Function t(s) that prints the transformation process
function t(s) {
    console.log(s, '->', it_translit.trans(s), '->', it_translit.reverse(it_translit.trans(s)));
}
t('яндекс');
t('хабр');

let t_ = it_translit.trans('только');
let tq = it_translit.trans('только', { use_q: true });
console.log(t_, '->', it_translit.reverse(t_));
console.log(tq, '->', it_translit.reverse(tq));

// Helper generator function to produce the Cartesian product (mimicking itertools.product)
function* product(arr, repeat) {
    if (repeat === 0) {
        yield [];
        return;
    }
    for (const prev of product(arr, repeat - 1)) {
        for (const item of arr) {
            yield [...prev, item];
        }
    }
}

// Create an array of Cyrillic characters from 'а' with 32 successive characters and add 'ё'
let base_chars = [];
for (let i = 0; i < 32; i++) {
    base_chars.push(String.fromCharCode('а'.charCodeAt(0) + i));
}
base_chars.push('ё');

let s = performance.now();
for (let rep = 1; rep < 5; rep++) {
    for (let tup of product(base_chars, rep)) {
        let joined = tup.join('');
        if (it_translit.reverse(it_translit.trans(joined)) !== joined) {
            console.log(joined, '->', it_translit.trans(joined), '->', it_translit.reverse(it_translit.trans(joined)));
        }
    }
}
console.log((performance.now() - s) / 1000);
