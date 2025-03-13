"use strict";

// Define the mapping object exactly as given in the Python code
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
    'сх': 'skh',
    'кс': 'x',
    'ц': 'cz',
    'ч': 'ch',
    'ш': 'sh',
    'щ': 'shh',
    'шх': 'shkh',
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
    'зкх': 'zkhw',
    'скх': 'skhw',
    'шкх': 'shkhw'
};

// Sort the mapping items in descending order by the length of the key (first element)
const sorted_mapping = Object.entries(mapping).sort((a, b) => b[0].length - a[0].length);

// Create sorted_mapping_with_q by replacing any apostrophe (') in the value with 'q'
const sorted_mapping_with_q = sorted_mapping.map(([fr, to]) => [fr, to.replace(/'/g, 'q')]);

// Create the reverse mapping list
const sorted_mapping_reverse = [];
Object.entries(mapping).forEach(([fr, to]) => {
    sorted_mapping_reverse.push([to, fr]);
    if (to.includes("'")) {
        sorted_mapping_reverse.push([to.replace(/'/g, 'q'), fr]);
    }
});
// Sort the reverse mapping list in descending order by the length of the key (first element)
sorted_mapping_reverse.sort((a, b) => b[0].length - a[0].length);

// Internal translation function that applies the mapping to the source string
function _trans(source, mapping) {
    let res = '';
    let i = 0;
    while (i < source.length) {
        let matched = false;
        for (let j = 0; j < mapping.length; j++) {
            const fr = mapping[j][0];
            const to = mapping[j][1];
            if (source.substring(i, i + fr.length) === fr) {
                res += to;
                i += fr.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            res += source[i];
            i += 1;
        }
    }
    return res;
}

// Translates the source string using the sorted mapping.
// If use_q is true, uses sorted_mapping_with_q; otherwise, uses sorted_mapping.
function trans(source, use_q = false) {
    return _trans(source, use_q ? sorted_mapping_with_q : sorted_mapping);
}

// Reverses the translation of the source string using the reverse mapping.
function reverse(source) {
    return _trans(source, sorted_mapping_reverse);
}

module.exports = { mapping, sorted_mapping, sorted_mapping_with_q, sorted_mapping_reverse, _trans, trans, reverse };
