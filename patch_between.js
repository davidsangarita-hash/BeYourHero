// Fix bonus handling and promptBetween
const fs = require('fs');
let dec = fs.readFileSync('js/decisions.js', 'utf8');

// Fix the promptBetween opts renderer to handle bonus as string or object
const oldRenderer = `    const optsHTML = dec.opts.map(function(o) {
      return '<button class="decision-btn between-btn" data-bonus=\\'' + JSON.stringify(o.bonus || {}) + '\\'>'\n        + '<span class="dopt-icon">' + o.icon + '</span>'\n        + '<span class="dopt-label">' + o.label.replace(/\\n/g, '<br>') + '</span>'\n        + '<span class="between-desc">' + o.desc + '</span>'\n        + '</button>';\n    }).join('');`;

const newRenderer = `    const optsHTML = dec.opts.map(function(o) {
      var bonusStr = (typeof o.bonus === 'string') ? o.bonus : JSON.stringify(o.bonus || {});
      return '<button class="decision-btn between-btn" data-bonus=\\'' + bonusStr + '\\'>'\n        + '<span class="dopt-icon">' + o.icon + '</span>'\n        + '<span class="dopt-label">' + o.label.replace(/\\n/g, '<br>') + '</span>'\n        + '<span class="between-desc">' + o.desc + '</span>'\n        + '</button>';\n    }).join('');`;

if (dec.includes('JSON.stringify(o.bonus || {})')) {
  dec = dec.replace(/const optsHTML = dec\.opts\.map[\s\S]*?\.join\(''\);/, newRenderer);
  console.log('promptBetween renderer fixed');
} else {
  console.log('Renderer already fixed or not found');
}

// Also fix promptBetween fallback chain
dec = dec.replace(
  "const pool = BETWEEN[type] || BETWEEN.training || BETWEEN.pre;",
  "var pool = BETWEEN[type] || BETWEEN['training'] || BETWEEN['pre'] || [];"
);

// Fix promptBetween pool guard
dec = dec.replace(
  "var pool = BETWEEN[type] || BETWEEN['training'] || BETWEEN['pre'] || [];",
  "var pool = BETWEEN[type] || BETWEEN['training'] || BETWEEN['pre'] || BETWEEN['post'] || [];\n    if (!pool || !pool.length) { if (callback) callback({}); return; }"
);

fs.writeFileSync('js/decisions.js', dec, 'utf8');
console.log('decisions.js fixed, length=' + dec.length);
