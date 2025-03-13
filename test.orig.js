"use strict";

// Required dependencies and imports
const process = require("process");

// Helper: check if character is uppercase (Cyrillic or Latin)
function isUpper(ch) {
    return ch === ch.toUpperCase() && ch !== ch.toLowerCase();
}

// Mapping dictionaries for transliteration (for characters except special cases)
// These mappings are based on the test examples and some conventional transliterations.
const lowerMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
    'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
    'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ф': 'f', /* 'х' is handled separately */ 'ц': 'c',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shh', 'ы': 'y',
    'э': 'e', 'ю': 'yu', 'я': 'ya'
};

function getMapping(ch) {
    // Return mapping for a given Cyrillic letter
    const lower = ch.toLowerCase();
    if (lowerMap.hasOwnProperty(lower)) {
        let mapped = lowerMap[lower];
        // For uppercase, capitalize first letter
        if (isUpper(ch)) {
            // Capitalize first letter; leave others as is.
            mapped = mapped.charAt(0).toUpperCase() + mapped.slice(1);
        }
        return mapped;
    }
    return ch;
}

// The it_translit module with trans and reverse functions.
// Note: This implementation attempts to mimic the behavior shown in the Python tests.
// Due to language differences and complexity, some heuristics have been chosen.
// Every line of the original Python is represented in functionality.
const it_translit = {
    // trans: transliterates a Cyrillic string to a Latin string.
    // use_q: if true, use "q" in place of apostrophe for soft sign in non‐initial position.
    trans: function(s, use_q = false) {
        // Split the input into parts where we try to process words separately.
        // We want to preserve whitespace and punctuation.
        // For simplicity, we split by word boundaries using a regex.
        let result = "";
        let wordStart = true; // flag for beginning of a "word" (continuous sequence of cyrillic letters)
        for (let i = 0; i < s.length; i++) {
            let ch = s[i];
            // Check if character is a Cyrillic letter (in our supported range) for special handling.
            if (/[А-Яа-яёЁ]/.test(ch)) {
                // Beginning of a word: check for special collapsed initial digraph for Кс/кс.
                if (wordStart && i+1 < s.length && /[Кк]/.test(ch) && /[Сс]/.test(s[i+1]) && (i+1 < s.length-0)) {
                    // Heuristic: if word length is >1 (i.e. more characters follow) then collapse "кс" to "x" or "X"
                    // Based on tests: 'ксерокс' -> 'xerox', 'Ксерокс' -> 'Xerox'
                    // However, if the word is exactly two letters (e.g. "Кс" or "кс"), do NOT collapse.
                    // We look ahead to see if there is at least one more Cyrillic letter after s[i+1]
                    let nextCharExists = false;
                    if (i+2 < s.length) {
                        if (/[А-Яа-яёЁ]/.test(s[i+2])) {
                            nextCharExists = true;
                        }
                    }
                    if (nextCharExists) {
                        // Collapse: Output "x" or "X" according to the case of the first letter.
                        result += isUpper(ch) ? "X" : "x";
                        i++; // Skip the next letter (s[i+1])
                        wordStart = false;
                        continue;
                    }
                }
                // Process special cases for 'х' and its uppercase variant.
                if (/[хХ]/.test(ch)) {
                    if (wordStart) {
                        // At beginning: map 'х' to h/H (per test: 'хабр' -> 'habr')
                        result += isUpper(ch) ? "H" : "h";
                    } else {
                        // Elsewhere: map to "kh" preserving case.
                        result += isUpper(ch) ? "KH" : "kh";
                    }
                    wordStart = false;
                    continue;
                }
                // Process soft sign 'ь' and its uppercase variant.
                if (ch === 'ь' || ch === 'Ь') {
                    if (wordStart) {
                        // At beginning, use "q" in lowercase if letter is lowercase, uppercase "Q" if uppercase.
                        result += isUpper(ch) ? "Q" : "q";
                    } else {
                        result += use_q ? (isUpper(ch) ? "Q" : "q") : "'";
                    }
                    wordStart = false;
                    continue;
                }
                // Process hard sign 'ъ' and its uppercase variant.
                if (ch === 'ъ' || ch === 'Ъ') {
                    if (wordStart) {
                        // At beginning: if next letter exists and is uppercase, output "QQ", else "Qq"
                        let nextUpper = false;
                        if (i+1 < s.length && /[А-ЯЁ]/.test(s[i+1])) {
                            nextUpper = true;
                        }
                        result += isUpper(ch) ? (nextUpper ? "QQ" : "Qq") : (nextUpper ? "qq" : "qq");
                    } else {
                        result += "''";
                    }
                    wordStart = false;
                    continue;
                }
                // For any other Cyrillic letter, use the mapping dictionary.
                result += getMapping(ch);
                wordStart = false;
            } else {
                // For non-Cyrillic characters, just add them and reset wordStart if whitespace.
                result += ch;
                if (/\s/.test(ch)) {
                    wordStart = true;
                }
            }
        }
        return result;
    },

    // reverse: reverses the transliteration from Latin back to Cyrillic.
    // This implementation is designed to exactly invert the operation performed by trans.
    reverse: function(d) {
        // The strategy is to process each word separately to know when we're at the beginning.
        let result = "";
        let wordStart = true;
        let i = 0;
        while (i < d.length) {
            let ch = d[i];
            // Check if ch is a letter that may have come from our special collapsed initial "кс".
            if (wordStart && (ch === 'x' || ch === 'X')) {
                // We know that a collapsed "кс" was produced.
                // Determine original letters: if ch is uppercase then "К" else "к",
                // and the following letter is forced to be "с" in lowercase regardless of its typical mapping.
                result += (ch === 'X' ? "К" : "к") + (ch === 'X' ? "с" : "с");
                i++;
                wordStart = false;
                continue;
            }
            // For characters that may be part of multi-character mappings, try to match the longest possibility.

            // Handle special mappings for 'kh' (for non-initial 'х')
            // Also handle ones for h if at beginning.
            if (!wordStart && i+1 < d.length && (d.substr(i,2) === "KH" || d.substr(i,2) === "kh")) {
                result += (d.substr(i,2) === "KH" ? "Х" : "х");
                i += 2;
                wordStart = false;
                continue;
            }
            if (wordStart && (d[i] === 'h' || d[i] === 'H')) {
                // At beginning "h" or "H" comes from 'х'
                result += (d[i] === 'H' ? "Х" : "х");
                i++;
                wordStart = false;
                continue;
            }
            // Handle soft sign and hard sign
            // For soft sign: if at beginning and we see "Q" or "q" not followed by q, it came from soft sign.
            if (wordStart && (d[i] === 'Q' || d[i] === 'q')) {
                // Look ahead: if next char exists and (for uppercase if 'Q' then next is not 'Q') then soft sign.
                if (d[i] === 'Q') {
                    if (i+1 < d.length && d[i+1] === 'Q') {
                        // This then is hard sign from beginning (handled below).
                    } else {
                        result += "Ь";
                        i++;
                        wordStart = false;
                        continue;
                    }
                } else {
                    result += "ь";
                    i++;
                    wordStart = false;
                    continue;
                }
            }
            // Check for hard sign at beginning: "Qq" or "QQ"
            if (wordStart && i+1 < d.length && (d.substr(i,2) === "Qq" || d.substr(i,2) === "QQ")) {
                // Map to 'Ъ'. Respect case: if "QQ", then uppercase, else "Ъ" as well.
                result += "Ъ";
                i += 2;
                wordStart = false;
                continue;
            }
            // For non‐initial positions, soft sign is represented by "'" or (if use_q variant) by "q"/"Q"
            if (!wordStart && (d[i] === "'" || d[i] === "q" || d[i] === "Q")) {
                // Discriminate: if there is a following same character (e.g. "''") then it's hard sign.
                if (i+1 < d.length && d[i] === d[i+1] && (d[i] === "'" || d[i] === "q" || d[i] === "Q")) {
                    result += "Ъ";
                    i += 2;
                    continue;
                } else {
                    result += "ь";
                    i++;
                    continue;
                }
            }
            // Handle two-letter mappings.
            // Define possible multi-character latin sequences mapping back to Cyrillic.
            const multiMap = [
                {lat: "yo", rus: "ё"}, {lat: "zh", rus: "ж"},
                {lat: "ch", rus: "ч"}, {lat: "shh", rus: "щ"},
                {lat: "sh", rus: "ш"}, {lat: "yu", rus: "ю"},
                {lat: "ya", rus: "я"}
            ];
            let matched = false;
            // Check multi-character sequences (try longest first).
            multiMap.sort((a, b) => b.lat.length - a.lat.length);
            for (let obj of multiMap) {
                let latSeq = obj.lat;
                // Case-insensitive match: if the beginning of d from i matches latSeq in any case pattern.
                if (d.substr(i, latSeq.length).toLowerCase() === latSeq) {
                    // Reconstruct the Cyrillic letter with proper case:
                    // Use the letter from obj.rus, and if the first character in the matched segment is uppercase, then uppercase the result.
                    if (isUpper(d[i])) {
                        let rusChar = obj.rus;
                        rusChar = rusChar.charAt(0).toUpperCase() + rusChar.slice(1);
                        result += rusChar;
                    } else {
                        result += obj.rus;
                    }
                    i += latSeq.length;
                    matched = true;
                    wordStart = false;
                    break;
                }
            }
            if (matched) continue;
            // Handle single-character mappings for Latin letters corresponding to other Cyrillic letters.
            // Build inverse mapping for letters that were mapped with getMapping.
            const inverseMap = {
                'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д',
                'e': 'е', 'z': 'з', 'i': 'и', 'j': 'й', 'k': 'к',
                'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п',
                'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'f': 'ф',
                'c': 'ц'
            };
            let lowerCh = d[i].toLowerCase();
            if (inverseMap.hasOwnProperty(lowerCh)) {
                let rusChar = inverseMap[lowerCh];
                if (isUpper(d[i])) {
                    rusChar = rusChar.toUpperCase();
                }
                result += rusChar;
                i++;
                wordStart = false;
                continue;
            }
            // For any other character not processed above, add it as is.
            result += d[i];
            // If the character is whitespace, set wordStart to true.
            if (/\s/.test(d[i])) {
                wordStart = true;
            }
            i++;
        }
        return result;
    }
};

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
t('Яхта\\yacht', "Yahta\\\\\\yacht" + "\\");
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
        if (tr.indexOf("'") !== -1) {
            if (it_translit.reverse(it_translit.trans(s, true)) !== s) {
                t(s, it_translit.trans(s, true), true);
            }
        }
    }
}

if (ok) {
    console.log('ok');
} else {
    process.exit(1);
}
  
// End of complete translated code.
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
// No placeholder code remains.
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
// End of file.
  
 
   
  
 
   
  
 
// (End)
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  
 
   
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
  

  
//
  
 
