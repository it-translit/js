"use strict";

// Required dependencies and imports
const process = require("process");

const it_translit = require('./it_translit');

// Global variable to track overall test success.
let ok = true;

// Test function, exactly as in the Python code.
function t(s, d, use_q = false) {
    // Compare the transliteration of s with expected d.
    let transResult = it_translit.trans(s, use_q);
    if (transResult !== d) {
        process.stderr.write(`${s} -> ${transResult}\n`);
        ok = false;
        return;
    }
    // Compare the reverse of d with original s.
    let revResult = it_translit.reverse(d);
    if (revResult !== s) {
        process.stderr.write(`${s} -> ${d} -> ${it_translit.reverse(d)}\n`);
        ok = false;
    }
}

// Direct test calls matching the Python code.
t('яндекс', 'yandex');
t('Яндекс', 'Yandex');
t('ЯНДЕКС', 'YANDEX');
t('МЯ', 'MYA');
t('Мя', 'Mya');
t('мя', 'mya');
t('хабр', 'habr');

t('только', "tol'ko");
t('только', 'tolqko', true);
t('Только', "Tol'ko");
t('Только', 'Tolqko', true);
t('ТОЛЬКО', "TOL'KO");
t('ТОЛЬКО', 'TOLQKO', true);
t('тольько', "tol'wko");
t('ТОЛЬЬКО', "TOL'WKO");

t('ксерокс', 'xerox');
t('Ксерокс', 'Xerox');
t('КСЕРОКС', 'XEROX');
t('кСЕРОКС', 'kSEROX');
t('ксЕРОКС', 'xEROX');
t('КСерокс', 'KSerox');
t('кСерокс', 'kSerox');
t('ксероКс', 'xeroKs');
t('ксерокС', 'xerokS');
t('ксероКС', 'xeroKS');
t('КС', 'KS');
t('Кс', 'Ks');

t('схема', 'skhema');
t('Схема', 'Skhema');
t('СХЕМА', 'SKHEMA');
t('сХЕМА', 'sKHEMA');

t('Скхема', 'Skhwema');
t('СКХЕМА', 'SKHWEMA');
t('сКХЕМА', 'sKHWEMA');
t('скХЕМА', 'skHWEMA');
t('скхЕМА', 'skhwEMA');

t('Ь', 'Q');
t('ЬМ', "QM");
t('МЬ', "M'");
t('ЬЬ', 'QW');
t('ьЬ', 'qW');
t('Ьь', 'Qw');
t('Ъ', 'Qq');
t('ЪМ', "QQM");
t('МЪ', "M''");

t('Сканер QR-кода', "Skaner \\QR\\-koda");
t('Яхта\\yacht', "Yahta\\\\\\yacht\\");
t('C\\D', '\\C\\\\D\\');
t("Git", '\\Git\\');
t("Git'а", "\\Git'\\a");
t("Д'Артаньян", "D\\'\\Artan'yan");

// Helper: cartesian product function (similar to itertools.product)
function cartesianProduct(arr, repeat) {
    // Base: repeat 1 -> return each element in its own array.
    let prod = [[]];
    for (let r = 0; r < repeat; r++) {
        let newProd = [];
        for (let seq of prod) {
            for (let el of arr) {
                newProd.push(seq.concat(el));
            }
        }
        prod = newProd;
    }
    return prod;
}

let letters = [];
// Build list of Cyrillic letters: from 'а'(1072) for 32 letters plus 'ё'
for (let i = 0; i < 32; i++) {
    letters.push(String.fromCharCode("а".charCodeAt(0) + i));
}
letters.push('ё');

// Loop for rep in range(1, 5) (i.e. 1 to 4)
for (let rep = 1; rep <= 4; rep++) {
    let products = cartesianProduct(letters, rep);
    for (let tup of products) {
        let s = tup.join('');
        let tRes = it_translit.trans(s);
        if (it_translit.reverse(tRes) !== s) {
            t(s, tRes);
        }
    }
}

let test_chars = 'азксежхцчшщъыьэя';
for (let rep = 1; rep <= 4; rep++) {
    let charsArr = [];
    // Build array of allowed characters (test_chars, its uppercase and space)
    for (let ch of test_chars) {
        charsArr.push(ch);
    }
    for (let ch of test_chars.toUpperCase()) {
        charsArr.push(ch);
    }
    charsArr.push(' ');
    let products = cartesianProduct(charsArr, rep);
    for (let tup of products) {
        let s = tup.join('');
        let tr = it_translit.trans(s);
        if (it_translit.reverse(tr) !== s) {
            t(s, tr);
        }
        if (tr.includes("'")) {
            if (it_translit.reverse(it_translit.trans(s, true)) !== s) {
                t(s, it_translit.trans(s, true), true);
            }
        }
    }
}

if (ok) {
    console.log('ok');
} else {
    process.stderr.write("!ok\n");
    process.exit(1);
}
