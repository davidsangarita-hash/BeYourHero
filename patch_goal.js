// PATCH: visual goal grid replacement
// This script patches decisions.js renderGoalGrid with the visual SVG version
const fs = require('fs');
const path = 'js/decisions.js';

let content = fs.readFileSync(path, 'utf8');

// Find and replace the renderGoalGrid function body
const startMark = 'function renderGoalGrid(player, isPenalty) {';
const endMark   = '  // ── Render standard options ───────────────────────────────';

const startIdx = content.indexOf(startMark);
const endIdx   = content.indexOf(endMark);

if (startIdx < 0 || endIdx < 0) {
  console.error('Markers not found! startIdx='+startIdx+' endIdx='+endIdx);
  process.exit(1);
}

// The new function (pure ASCII-safe version using Unicode escapes for special chars)
const newFn = `function renderGoalGrid(player, isPenalty) {
    const gkHint   = GK_HINTS[Math.floor(Math.random() * GK_HINTS.length)];
    const penBonus = isPenalty ? 22 : 0;
    const attrVal  = player ? (player.attributes.shooting || 65) : 65;
    const fatigue  = player ? (player.fatigue || 80) : 80;
    const attrMod  = (attrVal - 60) * 0.4;
    const fatMod   = -(100 - fatigue) * 0.07;

    const zones = GOAL_ZONES.map(z => {
      const vulnBonus = gkHint.vuln.includes(z.id) ? +20 : -8;
      const pct = Math.min(94, Math.max(6, Math.round(z.base + attrMod + fatMod + vulnBonus + penBonus)));
      return Object.assign({}, z, { pct });
    });

    // GK position based on hint
    let gkX = 150;
    if (gkHint.vuln.includes('mr') && !gkHint.vuln.includes('ml')) gkX = 108;
    if (gkHint.vuln.includes('ml') && !gkHint.vuln.includes('mr')) gkX = 192;
    let gkY = 78;
    const vuln = gkHint.vuln;
    if (vuln.some(v=>['tl','tc','tr'].includes(v)) && !vuln.some(v=>['bl','bc','br'].includes(v))) gkY = 64;
    if (vuln.some(v=>['bl','bc','br'].includes(v)) && !vuln.some(v=>['tl','tc','tr'].includes(v))) gkY = 88;
    const armLY = gkHint.vuln.includes('ml') ? gkY     : gkY + 9;
    const armRY = gkHint.vuln.includes('mr') ? gkY     : gkY + 9;

    const pc = p => p >= 62 ? '#00e664' : p >= 40 ? '#ffa500' : '#ff5555';

    // Net lines (pre-built)
    let netLines = '';
    for (let i=0;i<=12;i++) netLines += '<line x1="'+(27+i*19)+'" y1="12" x2="'+(27+i*19)+'" y2="78" stroke="rgba(255,255,255,0.055)" stroke-width="0.5"/>';
    for (let i=0;i<=5;i++)  netLines += '<line x1="27" y1="'+(12+i*13)+'" x2="257" y2="'+(12+i*13)+'" stroke="rgba(255,255,255,0.055)" stroke-width="0.5"/>';

    // % labels on SVG
    const zLabels = zones.map(function(z) {
      const zx = 68 + z.col * 61;
      const zy = 24 + z.row * 22;
      return '<text x="'+zx+'" y="'+zy+'" text-anchor="middle" fill="'+pc(z.pct)+'" font-size="8.5" font-weight="900" font-family="Orbitron,Arial" style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.9))">'+z.pct+'%</text>';
    }).join('');

    const ball = isPenalty
      ? '<circle cx="150" cy="142" r="8" fill="#111"/><path d="M150 134 Q156 138 156 142 Q156 147 150 150 Q144 147 144 142 Q144 138 150 134Z" fill="#fff" opacity="0.5"/>'
      : '<circle cx="150" cy="146" r="5.5" fill="#111"/><path d="M150 141 Q154 143 154 146 Q154 149 150 151 Q146 149 146 146 Q146 143 150 141Z" fill="#fff" opacity="0.5"/>';

    const penBadge = isPenalty ? '<span class="penalty-badge">PENALTI</span>' : '';

    const zonesHTML = zones.map(function(z) {
      return '<button class="vgoal-zone-btn" data-choice="'+z.id+'" data-pct="'+z.pct+'"><span class="vgz-arrow">'+z.arrow+'</span><span class="vgz-pct" style="color:'+pc(z.pct)+'">'+z.pct+'%</span></button>';
    }).join('');

    return '<div class="goal-wrapper">'
      + '<div class="gk-hint"><span class="gk-icon">\\u{1F9E4}</span><span>'+gkHint.text+'</span>'+penBadge+'</div>'
      + '<div class="visual-goal-wrap">'
      + '<svg class="vgoal-svg" viewBox="0 0 300 155" xmlns="http://www.w3.org/2000/svg">'
      + '<defs>'
      + '<linearGradient id="vfG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1a5c2a"/><stop offset="100%" stop-color="#0e3a18"/></linearGradient>'
      + '<linearGradient id="vsG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#050d18"/><stop offset="100%" stop-color="#0e1e2e"/></linearGradient>'
      + '</defs>'
      // Sky + stars
      + '<rect width="300" height="80" fill="url(#vsG)"/>'
      + '<circle cx="30" cy="12" r="0.8" fill="white" opacity="0.35"/>'
      + '<circle cx="85" cy="7" r="0.6" fill="white" opacity="0.3"/>'
      + '<circle cx="195" cy="18" r="0.7" fill="white" opacity="0.35"/>'
      + '<circle cx="255" cy="8" r="0.6" fill="white" opacity="0.3"/>'
      + '<circle cx="272" cy="34" r="0.5" fill="white" opacity="0.25"/>'
      // Field
      + '<rect y="78" width="300" height="77" fill="url(#vfG)"/>'
      + '<rect y="78" width="300" height="15" fill="rgba(255,255,255,0.022)"/>'
      + '<rect y="109" width="300" height="15" fill="rgba(255,255,255,0.022)"/>'
      // Penalty arc + spot
      + '<path d="M 95 155 Q 150 112 205 155" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>'
      + '<circle cx="150" cy="147" r="2" fill="rgba(255,255,255,0.4)"/>'
      // Net
      + netLines
      // Posts + crossbar
      + '<rect x="23" y="10" width="6" height="70" fill="#efefef" rx="2"/>'
      + '<rect x="271" y="10" width="6" height="70" fill="#efefef" rx="2"/>'
      + '<rect x="23" y="7" width="254" height="6" fill="#fff" rx="2"/>'
      + '<rect x="23" y="78" width="254" height="2" fill="rgba(255,255,255,0.12)" rx="1"/>'
      // GK shadow
      + '<ellipse cx="'+gkX+'" cy="'+(gkY+31)+'" rx="18" ry="4.5" fill="rgba(0,0,0,0.28)"/>'
      // GK legs
      + '<line x1="'+(gkX-7)+'" y1="'+(gkY+16)+'" x2="'+(gkX-9)+'" y2="'+(gkY+31)+'" stroke="#FFD700" stroke-width="4.5" stroke-linecap="round"/>'
      + '<line x1="'+(gkX+7)+'" y1="'+(gkY+16)+'" x2="'+(gkX+9)+'" y2="'+(gkY+31)+'" stroke="#FFD700" stroke-width="4.5" stroke-linecap="round"/>'
      // Boots
      + '<ellipse cx="'+(gkX-9)+'" cy="'+(gkY+31)+'" rx="6" ry="3" fill="#222"/>'
      + '<ellipse cx="'+(gkX+9)+'" cy="'+(gkY+31)+'" rx="6" ry="3" fill="#222"/>'
      // Shorts
      + '<rect x="'+(gkX-10)+'" y="'+(gkY+13)+'" width="20" height="9" rx="3" fill="#1a1a4a"/>'
      // Jersey
      + '<rect x="'+(gkX-13)+'" y="'+(gkY-2)+'" width="26" height="17" rx="4" fill="#FFD700"/>'
      + '<line x1="'+(gkX-4)+'" y1="'+(gkY-2)+'" x2="'+(gkX-4)+'" y2="'+(gkY+15)+'" stroke="rgba(0,0,0,0.15)" stroke-width="2.5"/>'
      + '<line x1="'+(gkX+4)+'" y1="'+(gkY-2)+'" x2="'+(gkX+4)+'" y2="'+(gkY+15)+'" stroke="rgba(0,0,0,0.15)" stroke-width="2.5"/>'
      // Arms
      + '<line x1="'+(gkX-13)+'" y1="'+(gkY+5)+'" x2="'+(gkX-30)+'" y2="'+armLY+'" stroke="#FFD700" stroke-width="5.5" stroke-linecap="round"/>'
      + '<line x1="'+(gkX+13)+'" y1="'+(gkY+5)+'" x2="'+(gkX+30)+'" y2="'+armRY+'" stroke="#FFD700" stroke-width="5.5" stroke-linecap="round"/>'
      // Gloves
      + '<circle cx="'+(gkX-30)+'" cy="'+armLY+'" r="5.5" fill="#e06000"/>'
      + '<circle cx="'+(gkX+30)+'" cy="'+armRY+'" r="5.5" fill="#e06000"/>'
      // Head
      + '<circle cx="'+gkX+'" cy="'+(gkY-9)+'" r="9" fill="#C68642"/>'
      // Hair/cap
      + '<ellipse cx="'+gkX+'" cy="'+(gkY-16)+'" rx="9.5" ry="4.5" fill="#111"/>'
      + '<rect x="'+(gkX-10)+'" y="'+(gkY-19)+'" width="20" height="5" rx="2.5" fill="#FFD700"/>'
      + '<rect x="'+(gkX-13)+'" y="'+(gkY-15)+'" width="26" height="3" rx="1" fill="#FFD700"/>'
      // Eyes
      + '<circle cx="'+(gkX-3)+'" cy="'+(gkY-9)+'" r="1.5" fill="#111"/>'
      + '<circle cx="'+(gkX+3)+'" cy="'+(gkY-9)+'" r="1.5" fill="#111"/>'
      + '<circle cx="'+(gkX-2)+'" cy="'+(gkY-10)+'" r="0.7" fill="white"/>'
      + '<circle cx="'+(gkX+4)+'" cy="'+(gkY-10)+'" r="0.7" fill="white"/>'
      // Ball
      + ball
      // % labels
      + zLabels
      + '</svg>'
      + '<div class="vgoal-zones-overlay">' + zonesHTML + '</div>'
      + '</div>'
      + '</div>';
  }

`;

const before = content.substring(0, content.indexOf(startMark));
const after  = content.substring(endIdx);
fs.writeFileSync(path, before + newFn + '\n' + after, 'utf8');
console.log('SUCCESS: patched decisions.js');
