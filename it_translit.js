"use strict";

// Required helper functions for character checks
function isLower(ch) {
    return ch === ch.toLowerCase() && ch !== ch.toUpperCase();
}

function isUpper(ch) {
    return ch === ch.toUpperCase() && ch !== ch.toLowerCase();
}

function isAlpha(ch) {
    return /^[A-Za-zА-ЯЁа-яё]$/.test(ch);
}

function capitalize(str) {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// The mapping object as provided in the Python code
const mapping = {
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
    'еь': 'eqw',
    'ьь': 'qw',
    'ьъ': 'qww',
    'ъь': 'qqw',
    'ъъ': 'qqqw',
    'еъ': 'eww',
    'зх': 'zkh',
    'зкх':'zkhw',
    'скх':'skhw',
    'шкх':'shkhw',
};

// Function get_mappings(items):
function get_mappings(items) {
    // Compute the maximum key length among all items
    let maxLen = Math.max(...items.map(function(item) { return item[0].length; }));
    let mappings = [];
    // Create an array of empty objects for each length up to maxLen
    for (let i = 0; i < maxLen; i++) {
        mappings.push({});
    }
    // Populate each mapping dictionary based on key length
    for (const [fr, to] of items) {
        mappings[fr.length - 1][fr] = to;
    }
    return mappings;
}

const mappings_wo_q = get_mappings(Object.entries(mapping));
const mappings_with_q = get_mappings(Object.entries(mapping).map(function(item) {
    return [item[0], item[1].replaceAll("'", "q")];
}));

let mappings_reverse_items = [];
Object.entries(mapping).forEach(function(item) {
    let fr = item[0], to = item[1];
    mappings_reverse_items.push([to, fr]);
    if (to.includes("'")) {
        mappings_reverse_items.push([to.replaceAll("'", "q"), fr]);
    }
});
const mappings_reverse = get_mappings(mappings_reverse_items);

function trans(source, {use_q = false} = {}) {
    let mappings = use_q ? mappings_with_q : mappings_wo_q;
    let source_lower = source.toLowerCase();
    let res = '';
    let i = 0;
    while (i < source.length) {
        if (source[i] === '\\') {
            res += '\\\\';
            i++;
            continue;
        } else if ((source_lower[i] >= 'a' && source_lower[i] <= 'z') || source_lower[i] === "'") {
            res += '\\';
            let start = i;
            i++;
            while (i < source.length) {
                if ((source_lower[i] >= 'а' && source_lower[i] <= 'я') || source_lower[i] === "ё") {
                    i -= 1;
                    while (i >= 0 && !(((source_lower[i] >= 'a' && source_lower[i] <= 'z') || source_lower[i] === "'"))) {
                        i -= 1;
                    }
                    i++;
                    break;
                }
                i++;
            }
            // Using split/join to replace all '\' with '\\'
            res += source.substring(start, i).replaceAll('\\', '\\\\') + '\\';
            continue;
        }

        let matched = false;
        for (let n = mappings.length; n > 0; n--) {
            let sl = source_lower.substr(i, n);
            let to = mappings[n - 1][sl];
            if (to !== undefined) {
                if (!use_q && to.startsWith("'")) {
                    let s = source.substr(i, n);
                    if (isAlpha(source.substr(i + n, 1)) ?
                        (s === s.toLowerCase()) == (source[i + n] === source[i + n].toLowerCase()) :
                        (s === s.toLowerCase() && (i == 0 || isLower(source[i - 1]))) ||
                        (s === s.toUpperCase() &&  i  > 0 && isUpper(source[i - 1]))) {
                        // pass
                    } else {
                        to = to.replaceAll("'", "q");
                    }
                }
                if (sl === 'кс' && ['х', 'к'].includes(source_lower.substr(i + n, 1))) {
                    // Skip this mapping if conditions match
                    // continue to next iteration of the for-loop
                    continue;
                }
                if (source.substr(i, n) !== sl) {
                    if (to.length === 1) {
                        if (sl === 'кс') {
                            if (source.substr(i, n) === 'кС') {
                                to = 'kS';
                            } else if (source.substr(i, n) === 'КС' && !((source.substr(i + 2, 1) !== "" && isUpper(source.substr(i + 2, 1))) || (i > 0 && isUpper(source[i - 1])))) {
                                to = 'KS';
                            } else if (source.substr(i, n) === 'Кс' && ((source.substr(i + 2, 1) !== "" && !isLower(source.substr(i + 2, 1))) || "ъь".includes(source.substr(i + 2, 1)) || (i > 0 && isAlpha(source[i - 1])))) {
                                to = 'Ks';
                            } else {
                                to = to.toUpperCase();
                            }
                        } else {
                            to = to.toUpperCase();
                        }
                    } else {
                        if (n === 1) {
                            if ((source.substr(i + 1, 1) !== "" && isUpper(source.substr(i + 1, 1))) || (i > 0 && isUpper(source[i - 1]))) {
                                to = to.toUpperCase();
                            } else {
                                to = capitalize(to);
                            }
                        } else {
                            if (source.substr(i, n) === source.substr(i, n).toUpperCase()) {
                                to = to.toUpperCase();
                            } else {
                                let newStr = '';
                                for (let j = 0; j < n; j++) {
                                    if (i + j < source.length && isUpper(source[i + j])) {
                                        newStr += to.charAt(j).toUpperCase();
                                    } else {
                                        newStr += to.charAt(j);
                                    }
                                }
                                let extra = "";
                                if (i + n - 1 < source.length && isUpper(source[i + n - 1])) {
                                    extra = to.substr(n).toUpperCase();
                                } else {
                                    extra = to.substr(n);
                                }
                                to = newStr + extra;
                            }
                        }
                    }
                }
                res += to;
                i += n;
                matched = true;
                break;
            }
        }
        if (!matched) {
            res += source[i];
            i++;
        }
    }
    return res;
}

function reverse(source) {
    let source_lower = source.toLowerCase();
    let res = '';
    let i = 0;
    while (i < source.length) {
        if (source[i] === '\\') {
            i++;
            if (i < source.length && source[i] === '\\') {
                res += '\\';
                i++;
                continue;
            }
            let start = i;
            i++;
            while (i < source.length) {
                if (source[i] === '\\') {
                    if (i + 1 < source.length && source[i + 1] === '\\') {
                        res += source.substring(start, i);
                        start = i + 1;
                        i += 2;
                        continue;
                    }
                    res += source.substring(start, i);
                    i++;
                    break;
                }
                i++;
            }
            continue;
        }

        let matched = false;
        for (let n = mappings_reverse.length; n > 0; n--) {
            let sl = source_lower.substr(i, n);
            let to = mappings_reverse[n - 1][sl];
            if (to !== undefined) {
                if (source.substr(i, n) !== sl) {
                    if (to.length === 1) {
                        to = to.toUpperCase();
                    } else {
                        if (n === 1) {
                            if ((source.substr(i + 1, 1) !== "" && isUpper(source.substr(i + 1, 1))) || source.substr(i + 1, 1) === "'" || (i > 0 && (isUpper(source[i - 1]) || source[i - 1] === "'"))) {
                                to = to.toUpperCase();
                            } else {
                                to = capitalize(to);
                            }
                        } else {
                            if (source.substr(i, n) === source.substr(i, n).toUpperCase()) {
                                to = to.toUpperCase();
                            } else {
                                let newStr = '';
                                for (let j = 0; j < to.length; j++) {
                                    if (i + j < source.length && isUpper(source[i + j])) {
                                        newStr += to.charAt(j).toUpperCase();
                                    } else {
                                        newStr += to.charAt(j);
                                    }
                                }
                                to = newStr;
                            }
                        }
                    }
                } else if (source[i] === "'") {
                    //if i > 0 and source[i-1].isupper():
                    if (isAlpha(source.substr(i + n, 1)) ? isUpper(source[i + n]) : res.length > 0 && isUpper(res[res.length - 1])) {
                        to = to.toUpperCase();
                    }
                }
                res += to;
                i += n;
                matched = true;
                break;
            }
        }
        if (!matched) {
            res += source[i];
            i++;
        }
    }
    return res;
}

module.exports = { trans, reverse };
