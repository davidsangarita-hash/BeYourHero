#!/usr/bin/env node
const fs = require('fs');
let dec = fs.readFileSync('js/decisions.js', 'utf8');

// Find flashResult function and replace it
const startTag = '  // ── Flash result';
const endTag   = '  // ── Main prompt';
const si = dec.indexOf(startTag);
const ei = dec.indexOf(endTag);
if (si < 0 || ei < 0) { console.error('Tags not found si='+si+' ei='+ei); process.exit(1); }

const before = dec.substring(0, si);
const after  = dec.substring(ei);

const newFlashResult = `  // ── Flash result (SVG zones + regular buttons) ───────────
  function flashResult(btn, success) {
    var isSVGZone = btn && btn.tagName && btn.tagName.toLowerCase() === 'g';
    if (isSVGZone) {
      // Overlay on the SVG wrap
      var svgWrap = document.querySelector('.vgoal-svg-wrap');
      if (svgWrap) {
        svgWrap.style.position = 'relative';
        var res = document.createElement('div');
        res.className = 'goal-shot-result ' + (success ? 'shot-goal' : 'shot-miss');
        var sp = document.createElement('span');
        sp.textContent = success ? '\u26BD \u00A1GOOOL!' : '\u2717 Atajado';
        res.appendChild(sp);
        svgWrap.appendChild(res);
      }
    } else {
      btn.classList.add(success ? 'dec-success' : 'dec-fail');
      var lbl = document.createElement('div');
      lbl.className = 'dec-result-lbl';
      lbl.style.color = success ? '#22dd88' : '#ff5555';
      lbl.textContent = success ? '\u2713 \u00A1\u00C9xito!' : '\u2717 Fallido';
      btn.appendChild(lbl);
    }
  }

`;

dec = before + newFlashResult + after;
fs.writeFileSync('js/decisions.js', dec, 'utf8');
console.log('flashResult rewritten, length=' + dec.length);

// Verify
var hasGoal = dec.includes('GOOOL');
var hasSvgWrap = dec.includes('vgoal-svg-wrap');
console.log('Verify: GOOOL='+hasGoal+' svgWrap='+hasSvgWrap);
