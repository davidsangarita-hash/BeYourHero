#!/usr/bin/env node
/* patch_svg_choose.js
   Updates the choose() function inside prompt() to handle SVG <g> zones:
   - .svg-zone elements use classList instead of disabled/opacity
   - flashResult for svg zones shows a result overlay on the SVG wrap
   - also removes old .vgoal-zones-overlay / .vgoal-zone-btn references
*/
const fs = require('fs');
let dec = fs.readFileSync('js/decisions.js', 'utf8');

// ── Replace the choose() function and flashResult ────────
const oldChoose = `      function choose(btn) {
        if (chosen) return;
        chosen = true;
        clearInterval(_timer);
        btns.forEach(function(b) {
          b.disabled = true;
          b.style.opacity = (b === btn) ? '1' : '0.3';
        });
        const choice  = btn.dataset.choice;
        const pct     = parseInt(btn.dataset.pct) || 50;
        const success = (Math.random() * 100) < pct;
        flashResult(btn, success);
        setTimeout(function() {
          overlay.classList.add('hidden');
          resolve({ choice: choice, success: success, pct: pct });
        }, 1000);
      }

      btns.forEach(function(btn) {
        btn.addEventListener('click', function() { choose(btn); });
      });`;

const newChoose = `      function choose(btn) {
        if (chosen) return;
        chosen = true;
        clearInterval(_timer);

        // Disable all zones/btns
        btns.forEach(function(b) {
          if (b.tagName && b.tagName.toLowerCase() === 'g') {
            // SVG zone
            b.classList.add('zone-disabled');
            if (b === btn) b.classList.add('zone-chosen');
            else           b.classList.add('zone-dim');
          } else {
            b.disabled = true;
            b.style.opacity = (b === btn) ? '1' : '0.28';
          }
        });

        const choice  = btn.dataset.choice;
        const pct     = parseInt(btn.dataset.pct) || 50;
        const success = (Math.random() * 100) < pct;

        flashResult(btn, success);

        setTimeout(function() {
          overlay.classList.add('hidden');
          resolve({ choice: choice, success: success, pct: pct });
        }, 1100);
      }

      btns.forEach(function(btn) {
        btn.addEventListener('click', function() { choose(btn); });
      });`;

if (!dec.includes('zone-disabled')) {
  dec = dec.replace(oldChoose, newChoose);
  console.log('choose() updated for SVG zones');
} else {
  console.log('choose() already patched');
}

// ── Replace flashResult to handle both SVG <g> and <button> ──
const oldFlash = `  // ── Flash result on chosen button ────────────────────────
  function flashResult(btn, success) {
    btn.classList.add(success ? 'dec-success' : 'dec-fail');
    const lbl = document.createElement('div');
    lbl.className = 'dec-result-lbl';
    lbl.style.color = success ? '#00e664' : '#ff4444';
    lbl.textContent = success ? '\\u2713 \\u00A1GOOOOL!' : '\\u2717 FALLIDO';
    btn.appendChild(lbl);
  }`;

const newFlash = `  // ── Flash result (works for both SVG zones and buttons) ────
  function flashResult(btn, success) {
    var isSVGZone = btn.tagName && btn.tagName.toLowerCase() === 'g';

    if (isSVGZone) {
      // Show overlay on the SVG wrap element
      var svgWrap = document.querySelector('.vgoal-svg-wrap');
      if (svgWrap) {
        var res = document.createElement('div');
        res.className = 'goal-shot-result ' + (success ? 'shot-goal' : 'shot-miss');
        var sp = document.createElement('span');
        sp.textContent = success ? '⚽ ¡GOOOL!' : '✗ Atajado';
        res.appendChild(sp);
        svgWrap.style.position = 'relative';
        svgWrap.appendChild(res);
      }
    } else {
      btn.classList.add(success ? 'dec-success' : 'dec-fail');
      var lbl = document.createElement('div');
      lbl.className = 'dec-result-lbl';
      lbl.style.color = success ? '#22dd88' : '#ff5555';
      lbl.textContent = success ? '✓ ¡Éxito!' : '✗ Fallido';
      btn.appendChild(lbl);
    }
  }`;

if (!dec.includes('isSVGZone')) {
  dec = dec.replace(oldFlash, newFlash);
  if (dec.includes('isSVGZone')) console.log('flashResult() updated for SVG zones');
  else { console.log('flashResult pattern not matched exactly, trying regex...'); }
} else {
  console.log('flashResult already patched');
}

fs.writeFileSync('js/decisions.js', dec, 'utf8');
console.log('decisions.js saved, length=' + dec.length);
