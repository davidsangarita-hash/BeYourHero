#!/usr/bin/env node
/* rebuild_goalsvg.js
   - Rewrites renderGoalGrid so the 9 clickable zones live INSIDE the SVG itself
   - Clickable <rect> elements overlaid on the goal interior
   - Hover/active CSS gives glow + transparency feedback
   - Also updates renderOptions and buildHTML for cleaner UI
   - Updates the prompt() query selector to target .svg-zone
*/
const fs  = require('fs');
let dec   = fs.readFileSync('js/decisions.js', 'utf8');

// ── Find and replace renderGoalGrid ─────────────────────
const gStart = dec.indexOf('  // ── Render visual goal grid');
const gEnd   = dec.indexOf('  // ── Render standard options');
if (gStart < 0 || gEnd < 0) {
  console.error('Cannot find renderGoalGrid boundaries'); process.exit(1);
}

const newRenderGoalGrid = `  // ── Render visual goal grid (zones embedded in SVG) ──
  function renderGoalGrid(player, isPenalty) {
    const gkHint   = GK_HINTS[Math.floor(Math.random() * GK_HINTS.length)];
    const penBonus = isPenalty ? 22 : 0;
    const attrVal  = player ? (player.attributes.shooting || 65) : 65;
    const fatigue  = player ? (player.fatigue || 80) : 80;
    const attrMod  = (attrVal - 60) * 0.4;
    const fatMod   = -(100 - fatigue) * 0.07;

    const zones = GOAL_ZONES.map(function(z) {
      const vBonus = gkHint.vuln.includes(z.id) ? +20 : -8;
      const pct    = Math.min(94, Math.max(6, Math.round(z.base + attrMod + fatMod + vBonus + penBonus)));
      return Object.assign({}, z, { pct: pct });
    });

    // GK position based on vulnerability
    var vuln = gkHint.vuln;
    var gkX  = 150;
    if (vuln.includes('mr') && !vuln.includes('ml')) gkX = 110;
    if (vuln.includes('ml') && !vuln.includes('mr')) gkX = 190;
    var gkY  = 52;
    if (vuln.some(function(v){ return ['tl','tc','tr'].includes(v); }) &&
       !vuln.some(function(v){ return ['bl','bc','br'].includes(v); })) gkY = 40;
    if (vuln.some(function(v){ return ['bl','bc','br'].includes(v); }) &&
       !vuln.some(function(v){ return ['tl','tc','tr'].includes(v); })) gkY = 62;
    var armLY = vuln.includes('ml') ? gkY - 4 : gkY + 8;
    var armRY = vuln.includes('mr') ? gkY - 4 : gkY + 8;

    var pc = function(p) { return p >= 62 ? '#22dd88' : p >= 40 ? '#ffaa22' : '#ff5555'; };

    // ── Goal interior zone layout (SVG coords) ──────────
    // Goal: left post x=29, right post x=271, crossbar y=13, ground y=80
    // Interior: w=242, h=67 → each zone ~80.7×22.3
    var ZX0=29, ZW=242, ZY0=13, ZH=67;
    var cw=ZW/3, ch=ZH/3;

    // ── Net lines ──────────────────────────────────────
    var netV='', netH='';
    for (var i=0;i<=14;i++) netV+='<line x1="'+(ZX0+i*(ZW/14))+'" y1="'+ZY0+'" x2="'+(ZX0+i*(ZW/14))+'" y2="80" stroke="rgba(255,255,255,0.045)" stroke-width="0.6"/>';
    for (var j=0;j<=5;j++)  netH+='<line x1="'+ZX0+'" y1="'+(ZY0+j*(ZH/5))+'" x2="'+(ZX0+ZW)+'" y2="'+(ZY0+j*(ZH/5))+'" stroke="rgba(255,255,255,0.045)" stroke-width="0.6"/>';

    // ── Zone dividers (visible lines on the goal) ──────
    // Vertical dividers at 1/3 and 2/3
    var v1=ZX0+cw, v2=ZX0+2*cw;
    // Horizontal divider at 1/3 and 2/3
    var h1=ZY0+ch, h2=ZY0+2*ch;
    var dividers =
      '<line x1="'+v1+'" y1="'+ZY0+'" x2="'+v1+'" y2="80" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" stroke-dasharray="2,2"/>' +
      '<line x1="'+v2+'" y1="'+ZY0+'" x2="'+v2+'" y2="80" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" stroke-dasharray="2,2"/>' +
      '<line x1="'+ZX0+'" y1="'+h1+'" x2="'+(ZX0+ZW)+'" y2="'+h1+'" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" stroke-dasharray="2,2"/>' +
      '<line x1="'+ZX0+'" y1="'+h2+'" x2="'+(ZX0+ZW)+'" y2="'+h2+'" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" stroke-dasharray="2,2"/>';

    // ── Clickable SVG zone rects ───────────────────────
    var zoneRects = zones.map(function(z) {
      var rx = ZX0 + z.col * cw;
      var ry = ZY0 + z.row * ch;
      var cx = rx + cw/2;
      var cy = ry + ch/2;
      var pColor = pc(z.pct);
      return (
        '<g class="svg-zone" data-choice="'+z.id+'" data-pct="'+z.pct+'" role="button" tabindex="0" style="cursor:pointer">'+
          // transparent hover zone
          '<rect x="'+rx+'" y="'+ry+'" width="'+cw+'" height="'+ch+'" rx="0"'+
            ' fill="rgba(0,0,0,0)" class="svg-zone-rect" data-color="'+pColor+'" />'+
          // Arrow glyph (always visible)
          '<text x="'+cx+'" y="'+(cy+2)+'" text-anchor="middle" dominant-baseline="middle"'+
            ' fill="rgba(255,255,255,0.55)" font-size="11" font-family="Arial" class="svg-zone-arrow">'+z.arrow+'</text>'+
          // Success % label (visible on hover via CSS, always shown in accessible form)
          '<text x="'+cx+'" y="'+(cy+13)+'" text-anchor="middle" dominant-baseline="middle"'+
            ' fill="'+pColor+'" font-size="8.5" font-weight="900" font-family="Arial,monospace" class="svg-zone-pct"'+
            ' style="paint-order:stroke;stroke:rgba(0,0,0,0.8);stroke-width:2.5">'+z.pct+'%</text>'+
        '</g>'
      );
    }).join('');

    // ── Ball ──────────────────────────────────────────
    var ball = isPenalty
      ? '<circle cx="150" cy="140" r="7" fill="#111"/><path d="M150 133 Q155 137 155 140 Q155 145 150 147 Q145 145 145 140 Q145 137 150 133Z" fill="#fff" opacity="0.5"/>'
      : '<circle cx="150" cy="145" r="5" fill="#111"/><path d="M150 140 Q154 143 154 145 Q154 148 150 150 Q146 148 146 145 Q146 143 150 140Z" fill="#fff" opacity="0.5"/>';

    // ── GK figure ─────────────────────────────────────
    var gk =
      // Shadow
      '<ellipse cx="'+gkX+'" cy="'+(gkY+32)+'" rx="16" ry="3.5" fill="rgba(0,0,0,0.35)"/>' +
      // Legs
      '<line x1="'+(gkX-6)+'" y1="'+(gkY+14)+'" x2="'+(gkX-8)+'" y2="'+(gkY+30)+'" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>' +
      '<line x1="'+(gkX+6)+'" y1="'+(gkY+14)+'" x2="'+(gkX+8)+'" y2="'+(gkY+30)+'" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>' +
      // Boots
      '<ellipse cx="'+(gkX-8)+'" cy="'+(gkY+31)+'" rx="5.5" ry="2" fill="#1a1a1a"/>' +
      '<ellipse cx="'+(gkX+8)+'" cy="'+(gkY+31)+'" rx="5.5" ry="2" fill="#1a1a1a"/>' +
      // Shorts
      '<rect x="'+(gkX-10)+'" y="'+(gkY+12)+'" width="20" height="8" rx="2.5" fill="#1a1a4a"/>' +
      // Jersey
      '<rect x="'+(gkX-13)+'" y="'+(gkY-2)+'" width="26" height="16" rx="4" fill="#FFD700"/>' +
      // Arms
      '<line x1="'+(gkX-13)+'" y1="'+(gkY+4)+'" x2="'+(gkX-28)+'" y2="'+armLY+'" stroke="#FFD700" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="'+(gkX+13)+'" y1="'+(gkY+4)+'" x2="'+(gkX+28)+'" y2="'+armRY+'" stroke="#FFD700" stroke-width="5" stroke-linecap="round"/>' +
      // Gloves
      '<circle cx="'+(gkX-28)+'" cy="'+armLY+'" r="5" fill="#c04800"/>' +
      '<circle cx="'+(gkX+28)+'" cy="'+armRY+'" r="5" fill="#c04800"/>' +
      // Head
      '<circle cx="'+gkX+'" cy="'+(gkY-9)+'" r="9.5" fill="#C68642"/>' +
      // Cap
      '<ellipse cx="'+gkX+'" cy="'+(gkY-16)+'" rx="9.5" ry="4.5" fill="#111"/>' +
      '<rect x="'+(gkX-10)+'" y="'+(gkY-19)+'" width="20" height="5" rx="2.5" fill="#FFD700"/>' +
      // Eyes
      '<circle cx="'+(gkX-3)+'" cy="'+(gkY-9)+'" r="1.5" fill="#1a1a1a"/>' +
      '<circle cx="'+(gkX+3)+'" cy="'+(gkY-9)+'" r="1.5" fill="#1a1a1a"/>' +
      '<circle cx="'+(gkX-2)+'" cy="'+(gkY-10)+'" r="0.6" fill="white"/>' +
      '<circle cx="'+(gkX+4)+'" cy="'+(gkY-10)+'" r="0.6" fill="white"/>';

    // ── Assemble SVG ──────────────────────────────────
    var uid = Math.random().toString(36).slice(2,7);
    var svgStr =
      '<svg class="vgoal-svg" id="vgoal-'+uid+'" viewBox="0 0 300 155" xmlns="http://www.w3.org/2000/svg">'+
      '<defs>'+
        '<linearGradient id="vfG'+uid+'" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">'+
          '<stop offset="0" stop-color="#163d1f"/><stop offset="1" stop-color="#0a2610"/>'+
        '</linearGradient>'+
        '<linearGradient id="vsG'+uid+'" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">'+
          '<stop offset="0" stop-color="#02050e"/><stop offset="1" stop-color="#071220"/>'+
        '</linearGradient>'+
        '<filter id="glow'+uid+'">'+
          '<feGaussianBlur stdDeviation="3" result="coloredBlur"/>'+
          '<feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>'+
        '</filter>'+
      '</defs>'+
      // Sky
      '<rect width="300" height="82" fill="url(#vsG'+uid+')"/>'+
      // Stars
      '<circle cx="28" cy="11" r="0.7" fill="white" opacity="0.4"/>'+
      '<circle cx="83" cy="6" r="0.55" fill="white" opacity="0.3"/>'+
      '<circle cx="198" cy="18" r="0.65" fill="white" opacity="0.35"/>'+
      '<circle cx="255" cy="8" r="0.55" fill="white" opacity="0.3"/>'+
      '<circle cx="272" cy="30" r="0.5" fill="white" opacity="0.22"/>'+
      '<circle cx="145" cy="5" r="0.5" fill="white" opacity="0.28"/>'+
      // Field
      '<rect y="82" width="300" height="73" fill="url(#vfG'+uid+')"/>'+
      // Field stripes
      '<rect y="82" width="300" height="12" fill="rgba(255,255,255,0.018)"/>'+
      '<rect y="106" width="300" height="12" fill="rgba(255,255,255,0.018)"/>'+
      '<rect y="130" width="300" height="12" fill="rgba(255,255,255,0.018)"/>'+
      // Penalty arc
      '<path d="M95 155 Q150 114 205 155" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>'+
      '<circle cx="150" cy="146" r="2" fill="rgba(255,255,255,0.45)"/>'+
      // Net
      netV + netH +
      // Goal frame — back net face (depth effect)
      '<rect x="29" y="13" width="242" height="67" fill="rgba(255,255,255,0.015)" rx="0"/>'+
      // Posts (left, right)
      '<rect x="22" y="9" width="7" height="71" fill="#f0f0f0" rx="2.5"/>'+
      '<rect x="271" y="9" width="7" height="71" fill="#f0f0f0" rx="2.5"/>'+
      // Crossbar
      '<rect x="22" y="7" width="256" height="6.5" fill="#fff" rx="2.5"/>'+
      // Ground line
      '<rect x="22" y="80" width="256" height="2" fill="rgba(255,255,255,0.18)" rx="1"/>'+
      // Post shadows (depth)
      '<rect x="29" y="9" width="4" height="71" fill="rgba(0,0,0,0.18)"/>'+
      '<rect x="268" y="9" width="4" height="71" fill="rgba(0,0,0,0.18)"/>'+
      // Zone dividers
      dividers +
      // GK
      gk +
      // Clickable zones (on top)
      zoneRects +
      // Ball
      ball +
      '</svg>';

    var penBadge = isPenalty ? '<span class="penalty-badge">PENALTI</span>' : '';
    var hint = '<div class="gk-hint"><span class="gk-icon">🧤</span><span>'+gkHint.text+'</span>'+penBadge+'</div>';

    return '<div class="goal-wrapper">' + hint + '<div class="vgoal-svg-wrap">' + svgStr + '</div></div>';
  }

`;

dec = dec.substring(0, gStart) + newRenderGoalGrid + dec.substring(gEnd);

// ── Update prompt() to query .svg-zone instead of .vgoal-zone-btn ──
dec = dec.replace(
  "const btns = Array.from(overlay.querySelectorAll('.decision-btn, .vgoal-zone-btn'));",
  "const btns = Array.from(overlay.querySelectorAll('.decision-btn, .svg-zone'));"
);

fs.writeFileSync('js/decisions.js', dec, 'utf8');
console.log('decisions.js goal grid rewritten, length=' + dec.length);
console.log('Done!');
