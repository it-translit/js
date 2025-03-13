"use strict";

// Define the mapping object exactly as in the Python code
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
    'шкх': 'shkhw',
};

// Function get_mappings(items)
// Translates the Python get_mappings function line by line.
// It takes an array of [fr, to] pairs and returns an array of mapping objects,
// one for each key length from 1 up to the maximum length found.
function get_mappings(items) {
    // Compute the maximum length of source strings in items
    let maxLen = Math.max(...items.map(pair => pair[0].length));
    // Initialize an array of empty objects for each possible length
    let mappings = Array.from({ length: maxLen }, () => ({}));
    // Populate the mappings for each [fr, to] pair
    for (let i = 0; i < items.length; i++) {
        let fr = items[i][0];
        let to = items[i][1];
        mappings[fr.length - 1][fr] = to;
    }
    return mappings;
}

// Create mappings_wo_q using the items of mapping
const mappings_wo_q = get_mappings(Object.entries(mapping));

// Create mappings_with_q by replacing apostrophes with 'q' in the 'to' strings
const mappings_with_q = get_mappings(Object.entries(mapping).map(pair => {
    let fr = pair[0];
    let to = pair[1].split("'").join("q");
    return [fr, to];
}));

// Build the reverse mapping items array
const mappings_reverse_items = [];
Object.entries(mapping).forEach(pair => {
    let fr = pair[0];
    let to = pair[1];
    // Append the normal reverse mapping
    mappings_reverse_items.push([to, fr]);
    // If the 'to' string contains an apostrophe, also add a variant with apostrophes replaced by 'q'
    if (to.includes("'")) {
        mappings_reverse_items.push([to.split("'").join("q"), fr]);
    }
});

// Create the reverse mappings using the get_mappings function
const mappings_reverse = get_mappings(mappings_reverse_items);

// Function _trans which performs the translation based on given mappings
function _trans(source, mappings) {
    let res = '';
    let i = 0;
    while (i < source.length) {
        // Iterate over possible substring lengths, from longest to shortest
        let found = false;
        for (let n = mappings.length; n > 0; n--) {
            let substr = source.substring(i, i + n);
            // Check if the substring exists in the mapping for this length
            if (mappings[n - 1].hasOwnProperty(substr)) {
                res += mappings[n - 1][substr];
                i += n;
                found = true;
                break;
            }
        }
        // If no mapping was found, append the current character as is
        if (!found) {
            res += source[i];
            i += 1;
        }
    }
    return res;
}

// Function trans which translates the source using either mappings_with_q or mappings_wo_q based on the use_q flag
function trans(source, use_q = false) {
    return _trans(source, use_q ? mappings_with_q : mappings_wo_q);
}

// Function reverse which translates the source using the reverse mappings
function reverse(source) {
    return _trans(source, mappings_reverse);
}

// (Optional) Exporting the functions if using in a module system
// module.exports = { mapping, get_mappings, trans, reverse };
