/* ============================================================
   BE YOUR HERO v2 – avatar.js (v2.1)
   Realistic proportioned SVG avatar with detailed face & kit
   ============================================================ */

const AvatarEngine = (() => {

  // ── Skin palette ──────────────────────────────────────────
  const SKIN_TONES = [
    { id:'s1', name:'Muy Claro',  base:'#FDDBB4', shadow:'#E8B98A', highlight:'#FFF0D0' },
    { id:'s2', name:'Claro',      base:'#F0C08A', shadow:'#D4965E', highlight:'#FFDAA0' },
    { id:'s3', name:'Medio',      base:'#C68642', shadow:'#A0662A', highlight:'#DCA060' },
    { id:'s4', name:'Oscuro',     base:'#8D5524', shadow:'#6B3A10', highlight:'#AA6B35' },
    { id:'s5', name:'Muy Oscuro', base:'#4A2912', shadow:'#321A08', highlight:'#5E3520' },
  ];

  // ── Hair colors ───────────────────────────────────────────
  const HAIR_COLORS = [
    { id:'h1', name:'Negro',    color:'#111111' },
    { id:'h2', name:'Marrón',   color:'#5C3317' },
    { id:'h3', name:'Castaño',  color:'#8B4513' },
    { id:'h4', name:'Rubio',    color:'#D4AA60' },
    { id:'h5', name:'Pelirrojo',color:'#A0522D' },
    { id:'h6', name:'Gris',     color:'#888888' },
    { id:'h7', name:'Blanco',   color:'#F0F0F0' },
    { id:'h8', name:'Azul',     color:'#1A4099' },
    { id:'h9', name:'Verde',    color:'#1A7A3A' },
  ];

  // ── Eye colors ────────────────────────────────────────────
  const EYE_COLORS = [
    { id:'e1', name:'Marrón',   iris:'#5C3317' },
    { id:'e2', name:'Café',     iris:'#8B6914' },
    { id:'e3', name:'Verde',    iris:'#2D6A2A' },
    { id:'e4', name:'Azul',     iris:'#1A4A8C' },
    { id:'e5', name:'Gris',     iris:'#5A6A7A' },
    { id:'e6', name:'Negro',    iris:'#1A1A1A' },
  ];

  // ── Hair styles ───────────────────────────────────────────
  const HAIR_STYLES = [
    { id:'hs1', name:'Rapado',    render: (c,x,y) => `<ellipse cx="${x}" cy="${y-18}" rx="20" ry="4" fill="${c}" opacity="0.8"/>` },
    { id:'hs2', name:'Corto',     render: (c,x,y) => `<ellipse cx="${x}" cy="${y-22}" rx="21" ry="8" fill="${c}"/><ellipse cx="${x-14}" cy="${y-16}" rx="8" ry="10" fill="${c}"/><ellipse cx="${x+14}" cy="${y-16}" rx="8" ry="10" fill="${c}"/>` },
    { id:'hs3', name:'Largo',     render: (c,x,y) => `<ellipse cx="${x}" cy="${y-22}" rx="22" ry="10" fill="${c}"/><rect x="${x-22}" y="${y-20}" width="10" height="38" rx="5" fill="${c}"/><rect x="${x+12}" y="${y-20}" width="10" height="38" rx="5" fill="${c}"/>` },
    { id:'hs4', name:'Afro',      render: (c,x,y) => `<ellipse cx="${x}" cy="${y-20}" rx="28" ry="26" fill="${c}"/>` },
    { id:'hs5', name:'Mohawk',    render: (c,x,y) => `<rect x="${x-5}" y="${y-42}" width="10" height="30" rx="5" fill="${c}"/>` },
    { id:'hs6', name:'Coleta',    render: (c,x,y) => `<ellipse cx="${x}" cy="${y-20}" rx="21" ry="9" fill="${c}"/><ellipse cx="${x}" cy="${y-10}" rx="8" ry="10" fill="${c}"/><ellipse cx="${x+1}" cy="${y+5}" rx="5" ry="9" fill="${c}"/>` },
    { id:'hs7', name:'Rulos',     render: (c,x,y) => `<ellipse cx="${x}" cy="${y-20}" rx="22" ry="12" fill="${c}"/><circle cx="${x-16}" cy="${y-18}" r="7" fill="${c}"/><circle cx="${x+16}" cy="${y-18}" r="7" fill="${c}"/><circle cx="${x-10}" cy="${y-8}" r="6" fill="${c}"/><circle cx="${x+10}" cy="${y-8}" r="6" fill="${c}"/>` },
    { id:'hs8', name:'Alisado',   render: (c,x,y) => `<path d="M${x-22} ${y-16} Q${x-22} ${y-40} ${x} ${y-44} Q${x+22} ${y-40} ${x+22} ${y-16} Q${x+10} ${y-8} ${x} ${y-8} Q${x-10} ${y-8} ${x-22} ${y-16}Z" fill="${c}"/>` },
  ];

  // ── Kit colors ────────────────────────────────────────────
  const KIT_COLORS = [
    { id:'k1', name:'Rojo',     primary:'#CC0000', secondary:'#880000', trim:'#FFD700' },
    { id:'k2', name:'Azul',     primary:'#0033AA', secondary:'#001166', trim:'#FFFFFF' },
    { id:'k3', name:'Verde',    primary:'#006633', secondary:'#004422', trim:'#FFD700' },
    { id:'k4', name:'Blanco',   primary:'#F5F5F5', secondary:'#DDDDDD', trim:'#222222' },
    { id:'k5', name:'Negro',    primary:'#222222', secondary:'#111111', trim:'#FFD700' },
    { id:'k6', name:'Naranja',  primary:'#E65C00', secondary:'#9D3E00', trim:'#FFFFFF' },
    { id:'k7', name:'Morado',   primary:'#5500AA', secondary:'#330066', trim:'#FFD700' },
    { id:'k8', name:'Celeste',  primary:'#40AAFF', secondary:'#1177CC', trim:'#FFFFFF' },
    { id:'k9', name:'Amarillo', primary:'#EEC900', secondary:'#AA8800', trim:'#222222' },
    { id:'k10',name:'Rosa',     primary:'#DD4488', secondary:'#992255', trim:'#FFFFFF' },
  ];

  // ── Body types ────────────────────────────────────────────
  const BODY_TYPES = [
    { id:'b1', name:'Delgado',  sw:18, leg:12 },
    { id:'b2', name:'Normal',   sw:22, leg:14 },
    { id:'b3', name:'Atlético', sw:26, leg:16 },
    { id:'b4', name:'Robusto',  sw:30, leg:19 },
  ];

  // ── State ─────────────────────────────────────────────────
  let current = {
    skinId: 's2', hairId: 'hs2', hairColorId: 'h1',
    eyeId: 'e1', kitId: 'k1', bodyId: 'b2',
    number: 10,
  };

  function get(arr, id)   { return arr.find(x => x.id === id) || arr[0]; }
  function getSkin()      { return get(SKIN_TONES, current.skinId); }
  function getHairStyle() { return get(HAIR_STYLES, current.hairId); }
  function getHairColor() { return get(HAIR_COLORS, current.hairColorId); }
  function getEyes()      { return get(EYE_COLORS, current.eyeId); }
  function getKit()       { return get(KIT_COLORS, current.kitId); }
  function getBody()      { return get(BODY_TYPES, current.bodyId); }

  // ── SVG Renderer ──────────────────────────────────────────
  function renderSVG(opts = {}) {
    const cfg  = { ...current, ...opts };
    const skin = get(SKIN_TONES,   cfg.skinId      || 's2');
    const hSt  = get(HAIR_STYLES,  cfg.hairId      || 'hs2');
    const hCol = get(HAIR_COLORS,  cfg.hairColorId || 'h1');
    const eye  = get(EYE_COLORS,   cfg.eyeId       || 'e1');
    const kit  = get(KIT_COLORS,   cfg.kitId       || 'k1');
    const body = get(BODY_TYPES,   cfg.bodyId      || 'b2');
    const num  = cfg.number || 10;

    const cx = 100; // center x
    const s  = body.sw; // shoulder half-width
    const lw = body.leg; // leg half-width

    // Positions
    const headY   = 28;
    const neckY   = 60;
    const shouldY = 74;
    const torsoB  = 136;
    const hipY    = 142;
    const kneeY   = 196;
    const footY   = 245;

    const uid = Math.random().toString(36).slice(2, 7);

    return `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <defs>
    <radialGradient id="skinGrad${uid}" cx="45%" cy="35%" r="60%">
      <stop offset="0%"   stop-color="${skin.highlight}"/>
      <stop offset="60%"  stop-color="${skin.base}"/>
      <stop offset="100%" stop-color="${skin.shadow}"/>
    </radialGradient>
    <radialGradient id="faceGrad${uid}" cx="45%" cy="30%" r="65%">
      <stop offset="0%"   stop-color="${skin.highlight}"/>
      <stop offset="55%"  stop-color="${skin.base}"/>
      <stop offset="100%" stop-color="${skin.shadow}"/>
    </radialGradient>
    <linearGradient id="kitGrad${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="${kit.primary}"/>
      <stop offset="100%" stop-color="${kit.secondary}"/>
    </linearGradient>
    <linearGradient id="shortGrad${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="${kit.secondary}"/>
      <stop offset="100%" stop-color="${kit.primary}"/>
    </linearGradient>
    <filter id="shadow${uid}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>

  <!-- BOOTS (left) -->
  <ellipse cx="${cx-lw-2}" cy="${footY+6}" rx="${lw+1}" ry="5" fill="#1a1a1a"/>
  <rect x="${cx-lw*2-4}" y="${footY-2}" width="${lw*2+4}" height="10" rx="5" fill="#222"/>
  <line x1="${cx-lw-2}" y1="${footY+2}" x2="${cx-lw-6}" y2="${footY+2}" stroke="#fff" stroke-width="1" opacity="0.3"/>

  <!-- BOOTS (right) -->
  <ellipse cx="${cx+lw+2}" cy="${footY+6}" rx="${lw+1}" ry="5" fill="#1a1a1a"/>
  <rect x="${cx+2}" y="${footY-2}" width="${lw*2+4}" height="10" rx="5" fill="#222"/>
  <line x1="${cx+lw+2}" y1="${footY+2}" x2="${cx+lw+6}" y2="${footY+2}" stroke="#fff" stroke-width="1" opacity="0.3"/>

  <!-- SOCKS (left) -->
  <rect x="${cx-lw*2-2}" y="${kneeY+20}" width="${lw*2+2}" height="${footY-kneeY-20}" rx="3" fill="#EEEEEE"/>
  <rect x="${cx-lw*2-2}" y="${kneeY+20}" width="${lw*2+2}" height="6" rx="2" fill="${kit.trim}"/>

  <!-- SOCKS (right) -->
  <rect x="${cx+2}" y="${kneeY+20}" width="${lw*2+2}" height="${footY-kneeY-20}" rx="3" fill="#EEEEEE"/>
  <rect x="${cx+2}" y="${kneeY+20}" width="${lw*2+2}" height="6" rx="2" fill="${kit.trim}"/>

  <!-- LEGS skin (left) -->
  <path d="M${cx-lw} ${hipY+4} Q${cx-lw-4} ${kneeY-4} ${cx-lw-2} ${kneeY+20}" 
        stroke="url(#skinGrad${uid})" stroke-width="${lw*1.8}" fill="none" stroke-linecap="round"/>
  <ellipse cx="${cx-lw-1}" cy="${kneeY}" rx="${lw+1}" ry="7" fill="${skin.shadow}" opacity="0.4"/>

  <!-- LEGS skin (right) -->
  <path d="M${cx+lw} ${hipY+4} Q${cx+lw+4} ${kneeY-4} ${cx+lw+2} ${kneeY+20}" 
        stroke="url(#skinGrad${uid})" stroke-width="${lw*1.8}" fill="none" stroke-linecap="round"/>
  <ellipse cx="${cx+lw+1}" cy="${kneeY}" rx="${lw+1}" ry="7" fill="${skin.shadow}" opacity="0.4"/>

  <!-- SHORTS -->
  <path d="M${cx-s+4} ${torsoB} L${cx-s-2} ${hipY+24} Q${cx-2} ${hipY+28} ${cx+2} ${hipY+28} Q${cx+s+2} ${hipY+24} ${cx+s-4} ${torsoB} Z" 
        fill="url(#shortGrad${uid})" filter="url(#shadow${uid})"/>
  <!-- Shorts waistband -->
  <rect x="${cx-s+4}" y="${torsoB-2}" width="${(s-4)*2}" height="7" rx="3" fill="${kit.trim}" opacity="0.7"/>
  <!-- Shorts inner line -->
  <line x1="${cx}" y1="${torsoB+5}" x2="${cx}" y2="${hipY+26}" stroke="${kit.secondary}" stroke-width="1.5" opacity="0.4"/>

  <!-- ARMS (left) -->
  <path d="M${cx-s+4} ${shouldY+8} Q${cx-s-12} ${shouldY+30} ${cx-s-8} ${shouldY+62}" 
        stroke="url(#skinGrad${uid})" stroke-width="${s*0.75}" fill="none" stroke-linecap="round"/>
  <!-- Sleeve (left) -->
  <path d="M${cx-s+4} ${shouldY+4} Q${cx-s-6} ${shouldY+14} ${cx-s-4} ${shouldY+22}"
        stroke="${kit.primary}" stroke-width="${s*0.82}" fill="none" stroke-linecap="round"/>
  <!-- Sleeve cuff (left) -->
  <ellipse cx="${cx-s-6}" cy="${shouldY+22}" rx="5" ry="3" fill="${kit.trim}" opacity="0.7"/>

  <!-- ARMS (right) -->
  <path d="M${cx+s-4} ${shouldY+8} Q${cx+s+12} ${shouldY+30} ${cx+s+8} ${shouldY+62}" 
        stroke="url(#skinGrad${uid})" stroke-width="${s*0.75}" fill="none" stroke-linecap="round"/>
  <!-- Sleeve (right) -->
  <path d="M${cx+s-4} ${shouldY+4} Q${cx+s+6} ${shouldY+14} ${cx+s+4} ${shouldY+22}"
        stroke="${kit.primary}" stroke-width="${s*0.82}" fill="none" stroke-linecap="round"/>
  <!-- Sleeve cuff (right) -->
  <ellipse cx="${cx+s+6}" cy="${shouldY+22}" rx="5" ry="3" fill="${kit.trim}" opacity="0.7"/>

  <!-- HANDS -->
  <ellipse cx="${cx-s-8}" cy="${shouldY+65}" rx="6" ry="5" fill="${skin.base}"/>
  <ellipse cx="${cx+s+8}" cy="${shouldY+65}" rx="6" ry="5" fill="${skin.base}"/>

  <!-- TORSO / JERSEY -->
  <path d="M${cx-s+4} ${shouldY+4} Q${cx-s-2} ${shouldY} ${cx-8} ${neckY+2} 
           L${cx-6} ${torsoB} L${cx+6} ${torsoB} 
           L${cx+8} ${neckY+2} Q${cx+s+2} ${shouldY} ${cx+s-4} ${shouldY+4} Z" 
        fill="url(#kitGrad${uid})" filter="url(#shadow${uid})"/>

  <!-- Jersey chest stripe / detail -->
  <path d="M${cx-6} ${neckY+4} L${cx-8} ${torsoB}" stroke="${kit.trim}" stroke-width="2" opacity="0.3" stroke-linecap="round"/>
  <path d="M${cx+6} ${neckY+4} L${cx+8} ${torsoB}" stroke="${kit.trim}" stroke-width="2" opacity="0.3" stroke-linecap="round"/>

  <!-- Jersey number -->
  <text x="${cx}" y="${torsoB-20}" text-anchor="middle" fill="${kit.trim}" 
        font-size="18" font-weight="900" font-family="Arial" opacity="0.9">${num}</text>

  <!-- Jersey collar -->
  <path d="M${cx-10} ${neckY+2} Q${cx-5} ${neckY-4} ${cx} ${neckY-2} Q${cx+5} ${neckY-4} ${cx+10} ${neckY+2}" 
        fill="none" stroke="${kit.trim}" stroke-width="2.5" stroke-linecap="round"/>

  <!-- NECK -->
  <rect x="${cx-7}" y="${neckY-2}" width="14" height="16" rx="7" fill="url(#skinGrad${uid})"/>

  <!-- HEAD base (oval) -->
  <ellipse cx="${cx}" cy="${headY}" rx="22" ry="26" fill="url(#faceGrad${uid})" filter="url(#shadow${uid})"/>

  <!-- EARS -->
  <ellipse cx="${cx-21}" cy="${headY+4}" rx="5" ry="7" fill="${skin.base}"/>
  <ellipse cx="${cx-21}" cy="${headY+4}" rx="3" ry="5" fill="${skin.shadow}" opacity="0.5"/>
  <ellipse cx="${cx+21}" cy="${headY+4}" rx="5" ry="7" fill="${skin.base}"/>
  <ellipse cx="${cx+21}" cy="${headY+4}" rx="3" ry="5" fill="${skin.shadow}" opacity="0.5"/>

  <!-- HAIR -->
  ${hSt.render(hCol.color, cx, headY)}

  <!-- EYEBROWS -->
  <path d="M${cx-15} ${headY-10} Q${cx-8} ${headY-14} ${cx-2} ${headY-11}" 
        stroke="${hCol.color}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M${cx+15} ${headY-10} Q${cx+8} ${headY-14} ${cx+2} ${headY-11}" 
        stroke="${hCol.color}" stroke-width="2.2" fill="none" stroke-linecap="round"/>

  <!-- EYES white -->
  <ellipse cx="${cx-8}" cy="${headY}" rx="6.5" ry="4.5" fill="white"/>
  <ellipse cx="${cx+8}" cy="${headY}" rx="6.5" ry="4.5" fill="white"/>
  <!-- Iris -->
  <circle cx="${cx-8}" cy="${headY}" r="3.2" fill="${eye.iris}"/>
  <circle cx="${cx+8}" cy="${headY}" r="3.2" fill="${eye.iris}"/>
  <!-- Pupil -->
  <circle cx="${cx-8}"   cy="${headY}"   r="1.6" fill="#080808"/>
  <circle cx="${cx+8}"   cy="${headY}"   r="1.6" fill="#080808"/>
  <!-- Eye shine -->
  <circle cx="${cx-6.5}" cy="${headY-1.5}" r="1" fill="white" opacity="0.8"/>
  <circle cx="${cx+9.5}" cy="${headY-1.5}" r="1" fill="white" opacity="0.8"/>
  <!-- Eyelid top line -->
  <path d="M${cx-14.5} ${headY-2} Q${cx-8} ${headY-6} ${cx-1.5} ${headY-2}" 
        stroke="${skin.shadow}" stroke-width="1" fill="none" opacity="0.5"/>
  <path d="M${cx+14.5} ${headY-2} Q${cx+8} ${headY-6} ${cx+1.5} ${headY-2}" 
        stroke="${skin.shadow}" stroke-width="1" fill="none" opacity="0.5"/>

  <!-- NOSE -->
  <path d="M${cx} ${headY+2} Q${cx-3} ${headY+10} ${cx-5} ${headY+13} Q${cx} ${headY+15} ${cx+5} ${headY+13} Q${cx+3} ${headY+10} ${cx} ${headY+2}" 
        fill="${skin.shadow}" opacity="0.3"/>

  <!-- MOUTH -->
  <path d="M${cx-7} ${headY+18} Q${cx} ${headY+23} ${cx+7} ${headY+18}" 
        stroke="${skin.shadow}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.7"/>
  <!-- Smile line -->
  <path d="M${cx-5} ${headY+18} Q${cx} ${headY+21} ${cx+5} ${headY+18}" 
        stroke="${skin.base}" stroke-width="0.8" fill="none" opacity="0.4"/>

  <!-- Chin shadow -->
  <ellipse cx="${cx}" cy="${headY+24}" rx="12" ry="4" fill="${skin.shadow}" opacity="0.18"/>
</svg>`;
  }

  // ── Mini avatar (for sidebar/profile) ────────────────────
  function getMiniSVG(cfg = {}) {
    const s    = get(SKIN_TONES,  cfg.skinId      || current.skinId     || 's2');
    const hSt  = get(HAIR_STYLES, cfg.hairId      || current.hairId     || 'hs2');
    const hCol = get(HAIR_COLORS, cfg.hairColorId || current.hairColorId|| 'h1');
    const kit  = get(KIT_COLORS,  cfg.kitId       || current.kitId      || 'k1');
    const uid  = Math.random().toString(36).slice(2,7);
    const cx = 50, cy = 38;

    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <defs>
    <radialGradient id="ms${uid}" cx="45%" cy="35%" r="60%">
      <stop offset="0%" stop-color="${s.highlight}"/>
      <stop offset="100%" stop-color="${s.shadow}"/>
    </radialGradient>
  </defs>
  <!-- Body -->
  <rect x="28" y="70" width="44" height="26" rx="10" fill="${kit.primary}"/>
  <!-- Neck -->
  <rect x="44" y="62" width="12" height="12" rx="5" fill="${s.base}"/>
  <!-- Head -->
  <ellipse cx="${cx}" cy="${cy}" rx="20" ry="22" fill="url(#ms${uid})"/>
  <!-- Hair -->
  ${hSt.render(hCol.color, cx, cy)}
  <!-- Eyes -->
  <ellipse cx="43" cy="37" rx="5" ry="3.5" fill="white"/>
  <ellipse cx="57" cy="37" rx="5" ry="3.5" fill="white"/>
  <circle  cx="43" cy="37" r="2.2" fill="${get(EYE_COLORS, cfg.eyeId||current.eyeId||'e1').iris}"/>
  <circle  cx="57" cy="37" r="2.2" fill="${get(EYE_COLORS, cfg.eyeId||current.eyeId||'e1').iris}"/>
  <circle  cx="43" cy="37" r="1.1" fill="#111"/>
  <circle  cx="57" cy="37" r="1.1" fill="#111"/>
  <!-- Number badge -->
  <text x="${cx}" y="87" text-anchor="middle" fill="${kit.trim}" font-size="10" font-weight="bold" font-family="Arial">${cfg.number||current.number||10}</text>
</svg>`;
  }

  // ── Creator UI Builder ────────────────────────────────────
  function buildCreatorUI(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="av-creator">
        <div class="av-preview" id="av-preview">
          ${renderSVG(current)}
        </div>
        <div class="av-controls">

          <div class="av-group">
            <label class="av-label">🎨 Tono de Piel</label>
            <div class="av-swatches">
              ${SKIN_TONES.map(s => `
                <button class="swatch skin-sw ${current.skinId===s.id?'active':''}" 
                  data-key="skinId" data-val="${s.id}" title="${s.name}"
                  style="background:${s.base};border:3px solid ${current.skinId===s.id?'#00e664':'transparent'}">
                </button>`).join('')}
            </div>
          </div>

          <div class="av-group">
            <label class="av-label">💇 Estilo de Cabello</label>
            <div class="av-swatches pills">
              ${HAIR_STYLES.map(h => `
                <button class="pill-btn ${current.hairId===h.id?'active':''}"
                  data-key="hairId" data-val="${h.id}">${h.name}</button>`).join('')}
            </div>
          </div>

          <div class="av-group">
            <label class="av-label">🎨 Color de Cabello</label>
            <div class="av-swatches">
              ${HAIR_COLORS.map(h => `
                <button class="swatch ${current.hairColorId===h.id?'active':''}"
                  data-key="hairColorId" data-val="${h.id}" title="${h.name}"
                  style="background:${h.color};border:3px solid ${current.hairColorId===h.id?'#00e664':'transparent'}">
                </button>`).join('')}
            </div>
          </div>

          <div class="av-group">
            <label class="av-label">👁 Color de Ojos</label>
            <div class="av-swatches">
              ${EYE_COLORS.map(e => `
                <button class="swatch ${current.eyeId===e.id?'active':''}"
                  data-key="eyeId" data-val="${e.id}" title="${e.name}"
                  style="background:${e.iris};border:3px solid ${current.eyeId===e.id?'#00e664':'transparent'}">
                </button>`).join('')}
            </div>
          </div>

          <div class="av-group">
            <label class="av-label">👕 Color de Camiseta</label>
            <div class="av-swatches">
              ${KIT_COLORS.map(k => `
                <button class="swatch ${current.kitId===k.id?'active':''}"
                  data-key="kitId" data-val="${k.id}" title="${k.name}"
                  style="background:${k.primary};border:3px solid ${current.kitId===k.id?'#00e664':'transparent'}">
                </button>`).join('')}
            </div>
          </div>

          <div class="av-group">
            <label class="av-label">💪 Complexión</label>
            <div class="av-swatches pills">
              ${BODY_TYPES.map(b => `
                <button class="pill-btn ${current.bodyId===b.id?'active':''}"
                  data-key="bodyId" data-val="${b.id}">${b.name}</button>`).join('')}
            </div>
          </div>

          <div class="av-group">
            <label class="av-label">🔢 Número de Camiseta</label>
            <input type="number" id="kit-number" min="1" max="99" value="${current.number}"
              class="av-number-input" placeholder="10">
          </div>

        </div>
      </div>`;

    // Events — swatches & pills
    el.querySelectorAll('[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key, val = btn.dataset.val;
        current[key] = val;
        // Update active state
        el.querySelectorAll(`[data-key="${key}"]`).forEach(b => {
          b.classList.toggle('active', b.dataset.val === val);
          if (b.classList.contains('swatch')) {
            b.style.borderColor = b.dataset.val === val ? '#00e664' : 'transparent';
          }
        });
        refreshPreview();
      });
    });

    // Number input
    const numInput = document.getElementById('kit-number');
    if (numInput) {
      numInput.addEventListener('input', () => {
        const n = parseInt(numInput.value);
        if (n >= 1 && n <= 99) { current.number = n; refreshPreview(); }
      });
    }
  }

  function refreshPreview() {
    const prev = document.getElementById('av-preview');
    if (prev) prev.innerHTML = renderSVG(current);
  }

  function getCurrent() { return { ...current }; }
  function setCurrent(cfg) { Object.assign(current, cfg); }

  return {
    buildCreatorUI, renderSVG, getMiniSVG, getCurrent, setCurrent,
    SKIN_TONES, HAIR_COLORS, EYE_COLORS, KIT_COLORS, HAIR_STYLES, BODY_TYPES
  };
})();
