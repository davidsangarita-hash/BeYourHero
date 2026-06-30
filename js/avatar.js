/* ============================================================
   BE YOUR HERO v2 – avatar.js (v3.0)
   Dramatically improved: realistic proportions, muscular build,
   detailed face, dynamic shading, proper football kit
   ============================================================ */

const AvatarEngine = (() => {

  const SKIN = [
    { id:'s1', base:'#FDDBB4', shadow:'#D4956A', hi:'#FFF0D8', lip:'#C4826A' },
    { id:'s2', base:'#F0C090', shadow:'#C87A48', hi:'#FFD8A8', lip:'#B86050' },
    { id:'s3', base:'#C68642', shadow:'#9A5E24', hi:'#DCA060', lip:'#A05030' },
    { id:'s4', base:'#8D5524', shadow:'#6B3A10', hi:'#AA6B35', lip:'#7A3A20' },
    { id:'s5', base:'#4A2912', shadow:'#321A08', hi:'#5E3520', lip:'#3A1A0A' },
  ];

  const HAIR_COLORS = [
    { id:'h1', c:'#0A0A0A' }, { id:'h2', c:'#3D2010' },
    { id:'h3', c:'#6B3A1F' }, { id:'h4', c:'#C89040' },
    { id:'h5', c:'#8B4513' }, { id:'h6', c:'#777777' },
    { id:'h7', c:'#DEDEDE' }, { id:'h8', c:'#2244AA' },
    { id:'h9', c:'#226622' },
  ];

  const EYE_COLORS = [
    { id:'e1', iris:'#3D1F08' }, { id:'e2', iris:'#7A5020' },
    { id:'e3', iris:'#285020' }, { id:'e4', iris:'#1A3A8C' },
    { id:'e5', iris:'#4A5A6A' }, { id:'e6', iris:'#0A0A0A' },
  ];

  const KIT_COLORS = [
    { id:'k1', p:'#CC0000', s:'#880000', t:'#FFD700', name:'Rojo' },
    { id:'k2', p:'#0033BB', s:'#001188', t:'#FFFFFF', name:'Azul' },
    { id:'k3', p:'#006633', s:'#004422', t:'#FFD700', name:'Verde' },
    { id:'k4', p:'#F0F0F0', s:'#D0D0D0', t:'#111111', name:'Blanco' },
    { id:'k5', p:'#111111', s:'#050505', t:'#FFD700', name:'Negro' },
    { id:'k6', p:'#E65C00', s:'#9A3C00', t:'#FFFFFF', name:'Naranja' },
    { id:'k7', p:'#6600CC', s:'#440088', t:'#FFD700', name:'Morado' },
    { id:'k8', p:'#44AAFF', s:'#1166CC', t:'#FFFFFF', name:'Celeste' },
    { id:'k9', p:'#EEC900', s:'#AA8800', t:'#111111', name:'Amarillo' },
    { id:'k10',p:'#DD4488', s:'#992255', t:'#FFFFFF', name:'Rosa' },
  ];

  // Hair style renderers — each takes (color, cx, headTop) and returns SVG string
  const HAIR = {
    hs1: { name:'Rapado', r: (c,x,t) => '<ellipse cx="'+x+'" cy="'+(t-4)+'" rx="21" ry="5" fill="'+c+'" opacity="0.7"/>' },
    hs2: { name:'Corto',  r: (c,x,t) => '<path d="M'+(x-21)+' '+(t+2)+' Q'+(x-22)+' '+(t-16)+' '+x+' '+(t-19)+' Q'+(x+22)+' '+(t-16)+' '+(x+21)+' '+(t+2)+' Q'+(x+10)+' '+(t-4)+' '+x+' '+(t-3)+' Q'+(x-10)+' '+(t-4)+' '+(x-21)+' '+(t+2)+'Z" fill="'+c+'"/>' },
    hs3: { name:'Largo',  r: (c,x,t) => '<path d="M'+(x-21)+' '+(t+2)+' Q'+(x-24)+' '+(t-16)+' '+x+' '+(t-20)+' Q'+(x+24)+' '+(t-16)+' '+(x+21)+' '+(t+2)+'Z" fill="'+c+'"/><rect x="'+(x-25)+'" y="'+(t)+'" width="10" height="40" rx="5" fill="'+c+'"/><rect x="'+(x+15)+'" y="'+(t)+'" width="10" height="40" rx="5" fill="'+c+'"/>' },
    hs4: { name:'Afro',   r: (c,x,t) => '<ellipse cx="'+x+'" cy="'+(t-12)+'" rx="28" ry="24" fill="'+c+'"/>' },
    hs5: { name:'Mohawk', r: (c,x,t) => '<path d="M'+(x-22)+' '+(t+2)+' Q'+(x-22)+' '+(t-14)+' '+x+' '+(t-18)+' Q'+(x+22)+' '+(t-14)+' '+(x+22)+' '+(t+2)+' Q'+(x+14)+' '+(t-4)+' '+x+' '+(t-4)+' Q'+(x-14)+' '+(t-4)+' '+(x-22)+' '+(t+2)+'Z" fill="'+c+'"/><rect x="'+(x-5)+'" y="'+(t-44)+'" width="10" height="30" rx="5" fill="'+c+'"/>' },
    hs6: { name:'Coleta', r: (c,x,t) => '<path d="M'+(x-21)+' '+(t+2)+' Q'+(x-22)+' '+(t-15)+' '+x+' '+(t-19)+' Q'+(x+22)+' '+(t-15)+' '+(x+21)+' '+(t+2)+'Z" fill="'+c+'"/><ellipse cx="'+(x+1)+'" cy="'+(t+16)+'" rx="5" ry="10" fill="'+c+'"/>' },
    hs7: { name:'Rulos',  r: (c,x,t) => '<circle cx="'+(x-15)+'" cy="'+(t-14)+'" r="8" fill="'+c+'"/><circle cx="'+(x+15)+'" cy="'+(t-14)+'" r="8" fill="'+c+'"/><circle cx="'+(x-6)+'" cy="'+(t-20)+'" r="7" fill="'+c+'"/><circle cx="'+(x+6)+'" cy="'+(t-20)+'" r="7" fill="'+c+'"/><circle cx="'+x+'" cy="'+(t-10)+'" r="9" fill="'+c+'"/>' },
    hs8: { name:'Alisado',r: (c,x,t) => '<path d="M'+(x-22)+' '+(t+4)+' Q'+(x-26)+' '+(t-18)+' '+x+' '+(t-22)+' Q'+(x+26)+' '+(t-18)+' '+(x+22)+' '+(t+4)+' L'+(x+14)+' '+(t-2)+' Q'+x+' '+(t-6)+' '+(x-14)+' '+(t-2)+'Z" fill="'+c+'"/>' },
  };

  const BODY = [
    { id:'b1', name:'Delgado',  sw:19, lw:11 },
    { id:'b2', name:'Normal',   sw:23, lw:14 },
    { id:'b3', name:'Atletico', sw:27, lw:16 },
    { id:'b4', name:'Robusto',  sw:31, lw:19 },
  ];

  let cfg = { skinId:'s2', hairId:'hs2', hairColorId:'h1', eyeId:'e1', kitId:'k1', bodyId:'b2', number:10 };

  function g(arr, id) { return arr.find(x => x.id === id) || arr[0]; }
  function skin()      { return g(SKIN,        cfg.skinId); }
  function hairStyle() { return HAIR[cfg.hairId] || HAIR.hs2; }
  function hairColor() { return g(HAIR_COLORS, cfg.hairColorId); }
  function eyes()      { return g(EYE_COLORS,  cfg.eyeId); }
  function kit()       { return g(KIT_COLORS,  cfg.kitId); }
  function body()      { return g(BODY,        cfg.bodyId); }

  // ── Full SVG renderer ─────────────────────────────────────
  function renderSVG(c) {
    c = c || cfg;
    const sk = g(SKIN,        c.skinId      || 's2');
    const hS = HAIR[c.hairId] || HAIR.hs2;
    const hC = g(HAIR_COLORS, c.hairColorId || 'h1');
    const ey = g(EYE_COLORS,  c.eyeId       || 'e1');
    const kt = g(KIT_COLORS,  c.kitId       || 'k1');
    const bd = g(BODY,        c.bodyId      || 'b2');
    const num = c.number || 10;
    const s   = bd.sw;
    const lw  = bd.lw;

    const cx   = 100;
    // Key Y positions (more athletic proportions)
    const headCY = 30;    // head center
    const headRY = 22;    // head vert radius
    const headRX = 18;    // head horiz radius
    const neckY  = headCY + headRY;  // ~52
    const shlY   = neckY + 16;       // ~68 (shoulder top)
    const torsoB = shlY + 64;        // ~132 (waist)
    const hipY   = torsoB + 6;       // ~138
    const kneeY  = hipY + 52;        // ~190
    const ankleY = kneeY + 44;       // ~234
    const footY  = ankleY + 10;      // ~244

    const uid = Math.random().toString(36).slice(2,8);

    let svg = '<svg viewBox="0 0 200 265" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">';

    // ── DEFS ─────────────────────────────────────────────────
    svg += '<defs>';
    // Skin gradient (radial, light on top-left)
    svg += '<radialGradient id="sg'+uid+'" cx="40%" cy="30%" r="65%">'
      + '<stop offset="0%" stop-color="'+sk.hi+'"/>'
      + '<stop offset="55%" stop-color="'+sk.base+'"/>'
      + '<stop offset="100%" stop-color="'+sk.shadow+'"/>'
      + '</radialGradient>';
    // Kit gradient
    svg += '<linearGradient id="kg'+uid+'" x1="0%" y1="0%" x2="100%" y2="100%">'
      + '<stop offset="0%" stop-color="'+kt.p+'"/>'
      + '<stop offset="100%" stop-color="'+kt.s+'"/>'
      + '</linearGradient>';
    // Short gradient
    svg += '<linearGradient id="shg'+uid+'" x1="0%" y1="0%" x2="0%" y2="100%">'
      + '<stop offset="0%" stop-color="'+kt.s+'"/>'
      + '<stop offset="100%" stop-color="'+kt.p+'"/>'
      + '</linearGradient>';
    // Muscle highlight on torso
    svg += '<radialGradient id="mhl'+uid+'" cx="40%" cy="20%" r="70%">'
      + '<stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>'
      + '<stop offset="100%" stop-color="rgba(0,0,0,0)"/>'
      + '</radialGradient>';
    // Drop shadow filter
    svg += '<filter id="ds'+uid+'" x="-15%" y="-15%" width="130%" height="130%">'
      + '<feDropShadow dx="1" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/>'
      + '</filter>';
    svg += '</defs>';

    // ── BOOTS ─────────────────────────────────────────────────
    // Left boot
    svg += '<path d="M'+(cx-lw*2-4)+' '+footY+' L'+(cx-4)+' '+footY+' L'+(cx-4)+' '+(footY-10)+' L'+(cx-lw-2)+' '+(footY-10)+' Z" fill="#1a1a1a" rx="3"/>';
    svg += '<ellipse cx="'+(cx-lw-8)+'" cy="'+(footY+3)+'" rx="'+(lw+5)+'" ry="5" fill="#111"/>';
    svg += '<line x1="'+(cx-lw*2-2)+'" y1="'+(footY-4)+'" x2="'+(cx-5)+'" y2="'+(footY-4)+'" stroke="#333" stroke-width="1.5" opacity="0.5"/>';
    // Boot stripe
    svg += '<line x1="'+(cx-lw*2)+'" y1="'+(footY-7)+'" x2="'+(cx-6)+'" y2="'+(footY-7)+'" stroke="'+kt.t+'" stroke-width="1" opacity="0.6"/>';
    // Right boot
    svg += '<path d="M'+(cx+4)+' '+footY+' L'+(cx+lw*2+4)+' '+footY+' L'+(cx+lw*2+4)+' '+(footY-10)+' L'+(cx+lw+2)+' '+(footY-10)+' L'+(cx+4)+' '+(footY-10)+' Z" fill="#1a1a1a"/>';
    svg += '<ellipse cx="'+(cx+lw+8)+'" cy="'+(footY+3)+'" rx="'+(lw+5)+'" ry="5" fill="#111"/>';
    svg += '<line x1="'+(cx+5)+'" y1="'+(footY-4)+'" x2="'+(cx+lw*2+2)+'" y2="'+(footY-4)+'" stroke="#333" stroke-width="1.5" opacity="0.5"/>';
    svg += '<line x1="'+(cx+6)+'" y1="'+(footY-7)+'" x2="'+(cx+lw*2)+'" y2="'+(footY-7)+'" stroke="'+kt.t+'" stroke-width="1" opacity="0.6"/>';

    // ── SOCKS ─────────────────────────────────────────────────
    const sockTop = ankleY - 8;
    // Left sock (white base + kit color cuff)
    svg += '<rect x="'+(cx-lw*2-2)+'" y="'+sockTop+'" width="'+(lw*2+2)+'" height="'+(footY-sockTop)+'" rx="4" fill="#EEEEEE"/>';
    svg += '<rect x="'+(cx-lw*2-2)+'" y="'+sockTop+'" width="'+(lw*2+2)+'" height="7" rx="3" fill="'+kt.p+'"/>';
    svg += '<rect x="'+(cx-lw*2-2)+'" y="'+(sockTop+7)+'" width="'+(lw*2+2)+'" height="3" rx="1" fill="'+kt.t+'" opacity="0.7"/>';
    // Right sock
    svg += '<rect x="'+(cx+2)+'" y="'+sockTop+'" width="'+(lw*2+2)+'" height="'+(footY-sockTop)+'" rx="4" fill="#EEEEEE"/>';
    svg += '<rect x="'+(cx+2)+'" y="'+sockTop+'" width="'+(lw*2+2)+'" height="7" rx="3" fill="'+kt.p+'"/>';
    svg += '<rect x="'+(cx+2)+'" y="'+(sockTop+7)+'" width="'+(lw*2+2)+'" height="3" rx="1" fill="'+kt.t+'" opacity="0.7"/>';

    // ── SHIN PADS hint ────────────────────────────────────────
    svg += '<rect x="'+(cx-lw-9)+'" y="'+(sockTop-20)+'" width="'+(lw+4)+'" height="18" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" stroke-width="0.5"/>';
    svg += '<rect x="'+(cx+5)+'" y="'+(sockTop-20)+'" width="'+(lw+4)+'" height="18" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" stroke-width="0.5"/>';

    // ── THIGHS / CALVES (skin, muscular) ─────────────────────
    // Left leg — thigh tapering to knee, calf
    svg += '<path d="M'+(cx-lw-2)+' '+(hipY+4)+' Q'+(cx-lw-6)+' '+(kneeY-10)+' '+(cx-lw-3)+' '+kneeY+' Q'+(cx-lw+2)+' '+(kneeY+8)+' '+(cx-lw)+' '+(sockTop-22)+'Z" fill="url(#sg'+uid+')" stroke="none"/>';
    // Right leg — thigh
    svg += '<path d="M'+(cx+lw+2)+' '+(hipY+4)+' Q'+(cx+lw+6)+' '+(kneeY-10)+' '+(cx+lw+3)+' '+kneeY+' Q'+(cx+lw-2)+' '+(kneeY+8)+' '+(cx+lw)+' '+(sockTop-22)+'Z" fill="url(#sg'+uid+')" stroke="none"/>';
    // Kneecaps
    svg += '<ellipse cx="'+(cx-lw-2)+'" cy="'+kneeY+'" rx="'+(lw)+'" ry="7" fill="'+sk.shadow+'" opacity="0.45"/>';
    svg += '<ellipse cx="'+(cx+lw+2)+'" cy="'+kneeY+'" rx="'+(lw)+'" ry="7" fill="'+sk.shadow+'" opacity="0.45"/>';

    // ── SHORTS ────────────────────────────────────────────────
    svg += '<path d="M'+(cx-s+4)+' '+torsoB+' L'+(cx-s-4)+' '+(hipY+26)+' Q'+(cx-2)+' '+(hipY+32)+' '+(cx+2)+' '+(hipY+32)+' L'+(cx+s+4)+' '+(hipY+26)+' L'+(cx+s-4)+' '+torsoB+'Z" fill="url(#shg'+uid+')" filter="url(#ds'+uid+')" />';
    // Waistband
    svg += '<rect x="'+(cx-s+4)+'" y="'+(torsoB-4)+'" width="'+(s*2-8)+'" height="8" rx="4" fill="'+kt.t+'" opacity="0.55"/>';
    // Shorts seam
    svg += '<line x1="'+cx+'" y1="'+(torsoB)+'" x2="'+cx+'" y2="'+(hipY+30)+'" stroke="'+kt.s+'" stroke-width="1.2" opacity="0.35"/>';

    // ── LEFT ARM ──────────────────────────────────────────────
    // Upper arm (skin)
    svg += '<path d="M'+(cx-s+2)+' '+(shlY+6)+' Q'+(cx-s-16)+' '+(shlY+30)+' '+(cx-s-10)+' '+(shlY+56)+'" stroke="url(#sg'+uid+')" stroke-width="'+(s*0.78)+'" fill="none" stroke-linecap="round"/>';
    // Sleeve (kit color, covers upper arm)
    svg += '<path d="M'+(cx-s+4)+' '+(shlY+4)+' Q'+(cx-s-10)+' '+(shlY+18)+' '+(cx-s-7)+' '+(shlY+28)+'" stroke="'+kt.p+'" stroke-width="'+(s*0.85)+'" fill="none" stroke-linecap="round"/>';
    // Sleeve cuff ring
    svg += '<ellipse cx="'+(cx-s-8)+'" cy="'+(shlY+30)+'" rx="7" ry="3.5" fill="'+kt.t+'" opacity="0.6"/>';
    // Forearm skin
    svg += '<path d="M'+(cx-s-8)+' '+(shlY+30)+' Q'+(cx-s-14)+' '+(shlY+46)+' '+(cx-s-10)+' '+(shlY+58)+'" stroke="url(#sg'+uid+')" stroke-width="'+(s*0.6)+'" fill="none" stroke-linecap="round"/>';

    // ── RIGHT ARM ─────────────────────────────────────────────
    svg += '<path d="M'+(cx+s-2)+' '+(shlY+6)+' Q'+(cx+s+16)+' '+(shlY+30)+' '+(cx+s+10)+' '+(shlY+56)+'" stroke="url(#sg'+uid+')" stroke-width="'+(s*0.78)+'" fill="none" stroke-linecap="round"/>';
    svg += '<path d="M'+(cx+s-4)+' '+(shlY+4)+' Q'+(cx+s+10)+' '+(shlY+18)+' '+(cx+s+7)+' '+(shlY+28)+'" stroke="'+kt.p+'" stroke-width="'+(s*0.85)+'" fill="none" stroke-linecap="round"/>';
    svg += '<ellipse cx="'+(cx+s+8)+'" cy="'+(shlY+30)+'" rx="7" ry="3.5" fill="'+kt.t+'" opacity="0.6"/>';
    svg += '<path d="M'+(cx+s+8)+' '+(shlY+30)+' Q'+(cx+s+14)+' '+(shlY+46)+' '+(cx+s+10)+' '+(shlY+58)+'" stroke="url(#sg'+uid+')" stroke-width="'+(s*0.6)+'" fill="none" stroke-linecap="round"/>';

    // ── HANDS ─────────────────────────────────────────────────
    svg += '<ellipse cx="'+(cx-s-10)+'" cy="'+(shlY+62)+'" rx="7" ry="5.5" fill="'+sk.base+'"/>';
    svg += '<ellipse cx="'+(cx+s+10)+'" cy="'+(shlY+62)+'" rx="7" ry="5.5" fill="'+sk.base+'"/>';
    // Knuckle lines
    svg += '<line x1="'+(cx-s-14)+'" y1="'+(shlY+60)+'" x2="'+(cx-s-8)+'" y2="'+(shlY+60)+'" stroke="'+sk.shadow+'" stroke-width="0.7" opacity="0.5"/>';
    svg += '<line x1="'+(cx+s+6)+'" y1="'+(shlY+60)+'" x2="'+(cx+s+12)+'" y2="'+(shlY+60)+'" stroke="'+sk.shadow+'" stroke-width="0.7" opacity="0.5"/>';

    // ── TORSO / JERSEY ────────────────────────────────────────
    svg += '<path d="M'+(cx-s+4)+' '+(shlY+4)+' Q'+(cx-s-2)+' '+shlY+' '+(cx-8)+' '+(neckY+2)
      + ' L'+(cx-6)+' '+torsoB+' L'+(cx+6)+' '+torsoB
      + ' L'+(cx+8)+' '+(neckY+2)+' Q'+(cx+s+2)+' '+shlY+' '+(cx+s-4)+' '+(shlY+4)+'Z"'
      + ' fill="url(#kg'+uid+')" filter="url(#ds'+uid+')"/>';
    // Muscle highlight overlay
    svg += '<path d="M'+(cx-s+6)+' '+(shlY+6)+' Q'+(cx-s)+' '+shlY+' '+(cx-6)+' '+(neckY+4)+' L'+(cx-4)+' '+(torsoB-20)+' L'+(cx+4)+' '+(torsoB-20)+' L'+(cx+6)+' '+(neckY+4)+' Q'+(cx+s)+' '+shlY+' '+(cx+s-6)+' '+(shlY+6)+'Z" fill="url(#mhl'+uid+')"/>';
    // Jersey side panels (darker)
    svg += '<path d="M'+(cx-8)+' '+(neckY+2)+' L'+(cx-6)+' '+torsoB+' L'+(cx-s+4)+' '+torsoB+' L'+(cx-s+4)+' '+(shlY+4)+'Z" fill="'+kt.s+'" opacity="0.3"/>';
    svg += '<path d="M'+(cx+8)+' '+(neckY+2)+' L'+(cx+6)+' '+torsoB+' L'+(cx+s-4)+' '+torsoB+' L'+(cx+s-4)+' '+(shlY+4)+'Z" fill="'+kt.s+'" opacity="0.3"/>';
    // Jersey number
    svg += '<text x="'+cx+'" y="'+(torsoB-16)+'" text-anchor="middle" fill="'+kt.t+'" font-size="20" font-weight="900" font-family="Arial,sans-serif" opacity="0.92">'+num+'</text>';
    // Collar — V neck
    svg += '<path d="M'+(cx-10)+' '+(neckY+2)+' Q'+(cx-5)+' '+(neckY-2)+' '+cx+' '+neckY+' Q'+(cx+5)+' '+(neckY-2)+' '+(cx+10)+' '+(neckY+2)+'" fill="none" stroke="'+kt.t+'" stroke-width="3" stroke-linecap="round" opacity="0.8"/>';

    // ── NECK ──────────────────────────────────────────────────
    svg += '<rect x="'+(cx-7)+'" y="'+(neckY-4)+'" width="14" height="18" rx="7" fill="url(#sg'+uid+')"/>';
    // Neck shadow
    svg += '<rect x="'+(cx-4)+'" y="'+(neckY-2)+'" width="8" height="4" rx="2" fill="'+sk.shadow+'" opacity="0.3"/>';

    // ── HEAD ──────────────────────────────────────────────────
    // Head base (slightly non-circular: wider cheekbones)
    svg += '<ellipse cx="'+cx+'" cy="'+headCY+'" rx="'+headRX+'" ry="'+headRY+'" fill="url(#sg'+uid+')" filter="url(#ds'+uid+')"/>';

    // ── EARS ──────────────────────────────────────────────────
    svg += '<ellipse cx="'+(cx-headRX)+'" cy="'+(headCY+3)+'" rx="5" ry="7" fill="'+sk.base+'"/>';
    svg += '<ellipse cx="'+(cx-headRX)+'" cy="'+(headCY+3)+'" rx="3" ry="5" fill="'+sk.shadow+'" opacity="0.4"/>';
    svg += '<ellipse cx="'+(cx+headRX)+'" cy="'+(headCY+3)+'" rx="5" ry="7" fill="'+sk.base+'"/>';
    svg += '<ellipse cx="'+(cx+headRX)+'" cy="'+(headCY+3)+'" rx="3" ry="5" fill="'+sk.shadow+'" opacity="0.4"/>';

    // ── HAIR (drawn over head/ears) ───────────────────────────
    svg += hS.r(hC.c, cx, headCY - headRY + 2);

    // ── EYEBROWS ──────────────────────────────────────────────
    // Left brow (slightly arched)
    svg += '<path d="M'+(cx-16)+' '+(headCY-9)+' Q'+(cx-9)+' '+(headCY-13)+' '+(cx-2)+' '+(headCY-10)+'" stroke="'+hC.c+'" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    // Right brow
    svg += '<path d="M'+(cx+16)+' '+(headCY-9)+' Q'+(cx+9)+' '+(headCY-13)+' '+(cx+2)+' '+(headCY-10)+'" stroke="'+hC.c+'" stroke-width="2.5" fill="none" stroke-linecap="round"/>';

    // ── EYES ──────────────────────────────────────────────────
    // Eye whites (slightly almond-shaped)
    svg += '<path d="M'+(cx-14)+' '+headCY+' Q'+(cx-8)+' '+(headCY-5)+' '+(cx-2)+' '+headCY+' Q'+(cx-8)+' '+(headCY+4)+' '+(cx-14)+' '+headCY+'Z" fill="white"/>';
    svg += '<path d="M'+(cx+14)+' '+headCY+' Q'+(cx+8)+' '+(headCY-5)+' '+(cx+2)+' '+headCY+' Q'+(cx+8)+' '+(headCY+4)+' '+(cx+14)+' '+headCY+'Z" fill="white"/>';
    // Iris
    svg += '<circle cx="'+(cx-8)+'" cy="'+headCY+'" r="3.5" fill="'+ey.iris+'"/>';
    svg += '<circle cx="'+(cx+8)+'" cy="'+headCY+'" r="3.5" fill="'+ey.iris+'"/>';
    // Pupil
    svg += '<circle cx="'+(cx-8)+'" cy="'+headCY+'" r="1.8" fill="#050505"/>';
    svg += '<circle cx="'+(cx+8)+'" cy="'+headCY+'" r="1.8" fill="#050505"/>';
    // Eye shine
    svg += '<circle cx="'+(cx-6)+'" cy="'+(headCY-1.5)+'" r="1" fill="white" opacity="0.85"/>';
    svg += '<circle cx="'+(cx+10)+'" cy="'+(headCY-1.5)+'" r="1" fill="white" opacity="0.85"/>';
    // Upper eyelid crease
    svg += '<path d="M'+(cx-14)+' '+(headCY-1)+' Q'+(cx-8)+' '+(headCY-5)+' '+(cx-2)+' '+(headCY-1)+'" stroke="'+sk.shadow+'" stroke-width="1" fill="none" opacity="0.45"/>';
    svg += '<path d="M'+(cx+14)+' '+(headCY-1)+' Q'+(cx+8)+' '+(headCY-5)+' '+(cx+2)+' '+(headCY-1)+'" stroke="'+sk.shadow+'" stroke-width="1" fill="none" opacity="0.45"/>';
    // Eyelashes (top)
    svg += '<path d="M'+(cx-14)+' '+(headCY-1)+' Q'+(cx-8)+' '+(headCY-6)+' '+(cx-2)+' '+(headCY-1)+'" stroke="#111" stroke-width="0.8" fill="none" opacity="0.6"/>';
    svg += '<path d="M'+(cx+14)+' '+(headCY-1)+' Q'+(cx+8)+' '+(headCY-6)+' '+(cx+2)+' '+(headCY-1)+'" stroke="#111" stroke-width="0.8" fill="none" opacity="0.6"/>';

    // ── NOSE ──────────────────────────────────────────────────
    // Bridge + nostrils
    svg += '<path d="M'+(cx-1)+' '+(headCY+3)+' Q'+(cx-4)+' '+(headCY+9)+' '+(cx-5)+' '+(headCY+12)+'" stroke="'+sk.shadow+'" stroke-width="1.2" fill="none" opacity="0.4" stroke-linecap="round"/>';
    svg += '<path d="M'+(cx+1)+' '+(headCY+3)+' Q'+(cx+4)+' '+(headCY+9)+' '+(cx+5)+' '+(headCY+12)+'" stroke="'+sk.shadow+'" stroke-width="1.2" fill="none" opacity="0.4" stroke-linecap="round"/>';
    // Nostril hints
    svg += '<ellipse cx="'+(cx-5)+'" cy="'+(headCY+13)+'" rx="3" ry="2" fill="'+sk.shadow+'" opacity="0.25"/>';
    svg += '<ellipse cx="'+(cx+5)+'" cy="'+(headCY+13)+'" rx="3" ry="2" fill="'+sk.shadow+'" opacity="0.25"/>';

    // ── MOUTH ─────────────────────────────────────────────────
    // Upper lip curve
    svg += '<path d="M'+(cx-7)+' '+(headCY+17)+' Q'+(cx-3)+' '+(headCY+15)+' '+cx+' '+(headCY+16)+' Q'+(cx+3)+' '+(headCY+15)+' '+(cx+7)+' '+(headCY+17)+'" fill="'+sk.lip+'" stroke="none"/>';
    // Lower lip
    svg += '<path d="M'+(cx-7)+' '+(headCY+17)+' Q'+cx+' '+(headCY+22)+' '+(cx+7)+' '+(headCY+17)+'" fill="'+sk.base+'" stroke="none" opacity="0.7"/>';
    // Lip line
    svg += '<path d="M'+(cx-7)+' '+(headCY+17)+' Q'+cx+' '+(headCY+20)+' '+(cx+7)+' '+(headCY+17)+'" stroke="'+sk.shadow+'" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/>';

    // ── CHIN SHADOW ───────────────────────────────────────────
    svg += '<ellipse cx="'+cx+'" cy="'+(headCY+headRY-2)+'" rx="11" ry="3" fill="'+sk.shadow+'" opacity="0.15"/>';

    svg += '</svg>';
    return svg;
  }

  // ── Mini avatar (sidebar, 100px-ish) ─────────────────────
  function getMiniSVG(c) {
    c = c || cfg;
    const sk = g(SKIN,        c.skinId      || 's2');
    const hS = HAIR[c.hairId] || HAIR.hs2;
    const hC = g(HAIR_COLORS, c.hairColorId || 'h1');
    const ey = g(EYE_COLORS,  c.eyeId       || 'e1');
    const kt = g(KIT_COLORS,  c.kitId       || 'k1');
    const num = c.number || 10;
    const uid = Math.random().toString(36).slice(2, 7);

    return '<svg viewBox="0 0 100 105" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">'
      + '<defs>'
      + '<radialGradient id="msk'+uid+'" cx="42%" cy="32%" r="62%"><stop offset="0%" stop-color="'+sk.hi+'"/><stop offset="100%" stop-color="'+sk.shadow+'"/></radialGradient>'
      + '</defs>'
      // Body (jersey)
      + '<rect x="22" y="68" width="56" height="32" rx="12" fill="'+kt.p+'"/>'
      + '<text x="50" y="90" text-anchor="middle" fill="'+kt.t+'" font-size="10" font-weight="900" font-family="Arial">'+num+'</text>'
      // Collar
      + '<path d="M40 69 Q50 65 60 69" fill="none" stroke="'+kt.t+'" stroke-width="2" opacity="0.7"/>'
      // Arms
      + '<rect x="14" y="70" width="10" height="24" rx="5" fill="'+kt.p+'"/>'
      + '<rect x="76" y="70" width="10" height="24" rx="5" fill="'+kt.p+'"/>'
      // Neck
      + '<rect x="43" y="58" width="14" height="14" rx="7" fill="'+sk.base+'"/>'
      // Head
      + '<ellipse cx="50" cy="42" rx="20" ry="22" fill="url(#msk'+uid+')" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4))"/>'
      // Ears
      + '<ellipse cx="30" cy="44" rx="5" ry="7" fill="'+sk.base+'"/>'
      + '<ellipse cx="70" cy="44" rx="5" ry="7" fill="'+sk.base+'"/>'
      // Hair
      + hS.r(hC.c, 50, 22)
      // Brows
      + '<path d="M35 36 Q42 32 48 35" stroke="'+hC.c+'" stroke-width="2" fill="none" stroke-linecap="round"/>'
      + '<path d="M65 36 Q58 32 52 35" stroke="'+hC.c+'" stroke-width="2" fill="none" stroke-linecap="round"/>'
      // Eyes
      + '<path d="M37 42 Q42 38 48 42 Q42 46 37 42Z" fill="white"/>'
      + '<path d="M63 42 Q58 38 52 42 Q58 46 63 42Z" fill="white"/>'
      + '<circle cx="42" cy="42" r="3" fill="'+ey.iris+'"/>'
      + '<circle cx="58" cy="42" r="3" fill="'+ey.iris+'"/>'
      + '<circle cx="42" cy="42" r="1.5" fill="#111"/>'
      + '<circle cx="58" cy="42" r="1.5" fill="#111"/>'
      + '<circle cx="43.5" cy="40.5" r="0.8" fill="white" opacity="0.8"/>'
      + '<circle cx="59.5" cy="40.5" r="0.8" fill="white" opacity="0.8"/>'
      // Nose
      + '<path d="M48 47 Q46 52 44 53 Q50 55 56 53 Q54 52 52 47" fill="'+sk.shadow+'" opacity="0.2"/>'
      // Mouth
      + '<path d="M44 57 Q50 61 56 57" stroke="'+sk.shadow+'" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/>'
      + '</svg>';
  }

  // ── Creator UI ────────────────────────────────────────────
  function buildCreatorUI(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const swatchSection = (label, key, items, colorFn, nameFn) => {
      const activeVal = cfg[key];
      return '<div class="av-group"><label class="av-label">' + label + '</label>'
        + '<div class="av-swatches">'
        + items.map(it => '<button class="swatch' + (activeVal === it.id ? ' active' : '') + '" '
          + 'data-key="' + key + '" data-val="' + it.id + '" '
          + 'style="background:' + colorFn(it) + ';border-color:' + (activeVal === it.id ? '#00e664' : 'transparent') + '" '
          + 'title="' + nameFn(it) + '"></button>').join('')
        + '</div></div>';
    };

    const pillSection = (label, key, items, nameFn) => {
      const activeVal = cfg[key];
      return '<div class="av-group"><label class="av-label">' + label + '</label>'
        + '<div class="av-swatches pills">'
        + items.map(it => '<button class="pill-btn' + (activeVal === it.id ? ' active' : '') + '" '
          + 'data-key="' + key + '" data-val="' + it.id + '">' + nameFn(it) + '</button>').join('')
        + '</div></div>';
    };

    const bodyItems = BODY.map(b => b);
    const hairItems = Object.entries(HAIR).map(([id, h]) => ({ id, name: h.name }));

    el.innerHTML = '<div class="av-creator">'
      + '<div class="av-preview" id="av-preview">' + renderSVG(cfg) + '</div>'
      + '<div class="av-controls">'
      + swatchSection('🎨 Tono de Piel', 'skinId', SKIN, sk => sk.base, sk => sk.id)
      + pillSection('💇 Estilo de Cabello', 'hairId', hairItems, h => h.name)
      + swatchSection('🎨 Color de Cabello', 'hairColorId', HAIR_COLORS, h => h.c, h => h.id)
      + swatchSection('👁 Color de Ojos', 'eyeId', EYE_COLORS, e => e.iris, e => e.id)
      + swatchSection('👕 Camiseta', 'kitId', KIT_COLORS, k => k.p, k => k.name)
      + pillSection('💪 Complexión', 'bodyId', bodyItems, b => b.name)
      + '<div class="av-group"><label class="av-label">🔢 Número</label>'
      + '<input type="number" id="kit-number" min="1" max="99" value="' + cfg.number + '" class="av-number-input"></div>'
      + '</div></div>';

    // Events
    el.querySelectorAll('[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key, val = btn.dataset.val;
        cfg[key] = val;
        el.querySelectorAll('[data-key="' + key + '"]').forEach(b => {
          const active = b.dataset.val === val;
          b.classList.toggle('active', active);
          if (b.classList.contains('swatch')) b.style.borderColor = active ? '#00e664' : 'transparent';
        });
        document.getElementById('av-preview').innerHTML = renderSVG(cfg);
      });
    });

    const numInput = document.getElementById('kit-number');
    if (numInput) {
      numInput.addEventListener('input', () => {
        const n = parseInt(numInput.value);
        if (n >= 1 && n <= 99) { cfg.number = n; document.getElementById('av-preview').innerHTML = renderSVG(cfg); }
      });
    }
  }

  function getCurrent() { return Object.assign({}, cfg); }
  function setCurrent(c) { Object.assign(cfg, c); }

  return { buildCreatorUI, renderSVG, getMiniSVG, getCurrent, setCurrent, SKIN, HAIR_COLORS, EYE_COLORS, KIT_COLORS, HAIR, BODY };
})();
