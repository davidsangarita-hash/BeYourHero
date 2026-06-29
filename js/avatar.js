/* ============================================================
   BE YOUR HERO – avatar.js
   SVG-based player avatar with full visual customization
   ============================================================ */

const AvatarEngine = (() => {

  const defaults = {
    skinTone:   '#F5C5A3',
    hairColor:  '#2C1A0E',
    hairStyle:  'short',
    eyeColor:   '#4A2C0A',
    kitColor:   '#1a6b38',
    number:     10,
    build:      'normal'
  };

  let current = { ...defaults };

  // ── Skin tones palette ────────────────────────
  const skinTones = [
    { label: 'Muy claro',  value: '#FDDBB4' },
    { label: 'Claro',      value: '#F5C5A3' },
    { label: 'Medio claro',value: '#E8A87C' },
    { label: 'Medio',      value: '#C68642' },
    { label: 'Oscuro',     value: '#8D5524' },
    { label: 'Muy oscuro', value: '#4A2E10' }
  ];

  const hairColors = [
    { label: 'Negro',     value: '#0A0A0A' },
    { label: 'Castaño',   value: '#4A2C0E' },
    { label: 'Rubio',     value: '#D4A017' },
    { label: 'Pelirrojo', value: '#8B2500' },
    { label: 'Castaño claro', value: '#7B4F2E' },
    { label: 'Gris',      value: '#888888' },
    { label: 'Blanco',    value: '#E8E8E8' },
    { label: 'Azabache',  value: '#1C1C1C' }
  ];

  const eyeColors = [
    { label: 'Marrón',    value: '#4A2C0A' },
    { label: 'Azul',      value: '#1E5FA4' },
    { label: 'Verde',     value: '#2D7D3A' },
    { label: 'Gris',      value: '#6B7280' },
    { label: 'Avellana',  value: '#8B6914' },
    { label: 'Negro',     value: '#1A1A1A' }
  ];

  const hairStyles = [
    { label: 'Corto',   value: 'short' },
    { label: 'Largo',   value: 'long' },
    { label: 'Calvo',   value: 'bald' },
    { label: 'Afro',    value: 'afro' },
    { label: 'Mohawk',  value: 'mohawk' }
  ];

  const builds = [
    { label: 'Delgado',   value: 'slim' },
    { label: 'Normal',    value: 'normal' },
    { label: 'Musculoso', value: 'athletic' }
  ];

  // ── SVG Generator ────────────────────────────
  function buildSVG(opts = {}) {
    const o = { ...current, ...opts };
    const bodyW = o.build === 'slim' ? 34 : o.build === 'athletic' ? 44 : 38;
    const bodyColor = o.kitColor;

    const hairPaths = {
      short: `<ellipse cx="50" cy="26" rx="17" ry="10" fill="${o.hairColor}"/>
              <rect x="33" y="26" width="34" height="6" rx="2" fill="${o.hairColor}"/>`,
      long:  `<ellipse cx="50" cy="26" rx="17" ry="10" fill="${o.hairColor}"/>
              <rect x="33" y="26" width="5" height="28" rx="3" fill="${o.hairColor}"/>
              <rect x="62" y="26" width="5" height="28" rx="3" fill="${o.hairColor}"/>`,
      bald:  ``,
      afro:  `<ellipse cx="50" cy="22" rx="22" ry="16" fill="${o.hairColor}"/>`,
      mohawk:`<ellipse cx="50" cy="26" rx="17" ry="10" fill="${o.hairColor}"/>
              <rect x="46" y="10" width="8" height="18" rx="4" fill="${o.hairColor}"/>`
    };

    const bodyX = 50 - bodyW / 2;

    return `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bodyColor};stop-opacity:1"/>
          <stop offset="100%" style="stop-color:${darken(bodyColor)};stop-opacity:1"/>
        </linearGradient>
        <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${lighten(o.skinTone)};stop-opacity:1"/>
          <stop offset="100%" style="stop-color:${darken(o.skinTone)};stop-opacity:1"/>
        </linearGradient>
      </defs>

      <!-- Shadow -->
      <ellipse cx="50" cy="155" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>

      <!-- Body / Kit -->
      <rect x="${bodyX}" y="75" width="${bodyW}" height="48" rx="6" fill="url(#bodyGrad)"/>
      <!-- Kit number -->
      <text x="50" y="104" text-anchor="middle" fill="rgba(255,255,255,0.9)"
            font-size="14" font-weight="bold" font-family="Arial">${o.number}</text>
      <!-- Kit stripes -->
      <rect x="${bodyX+2}" y="75" width="4" height="48" rx="2" fill="rgba(255,255,255,0.15)"/>

      <!-- Arms -->
      <rect x="${bodyX-8}" y="77" width="12" height="32" rx="6" fill="url(#bodyGrad)"/>
      <rect x="${bodyX+bodyW-4}" y="77" width="12" height="32" rx="6" fill="url(#bodyGrad)"/>
      <!-- Hands -->
      <ellipse cx="${bodyX-2}" cy="112" rx="7" ry="6" fill="${o.skinTone}"/>
      <ellipse cx="${bodyX+bodyW+6}" cy="112" rx="7" ry="6" fill="${o.skinTone}"/>

      <!-- Shorts -->
      <rect x="${bodyX}" y="121" width="${bodyW}" height="22" rx="4" fill="${darken(bodyColor)}"/>
      <!-- Shorts line -->
      <rect x="${bodyX+bodyW/2-1}" y="121" width="2" height="22" fill="rgba(0,0,0,0.2)"/>

      <!-- Legs -->
      <rect x="${bodyX+2}" y="141" width="${bodyW/2-3}" height="15" rx="5" fill="${o.skinTone}"/>
      <rect x="${bodyX+bodyW/2+1}" y="141" width="${bodyW/2-3}" height="15" rx="5" fill="${o.skinTone}"/>
      <!-- Socks -->
      <rect x="${bodyX+2}" y="149" width="${bodyW/2-3}" height="7" rx="3" fill="white"/>
      <rect x="${bodyX+bodyW/2+1}" y="149" width="${bodyW/2-3}" height="7" rx="3" fill="white"/>
      <!-- Boots -->
      <rect x="${bodyX}" y="154" width="${bodyW/2-2}" height="5" rx="3" fill="#111"/>
      <rect x="${bodyX+bodyW/2+2}" y="154" width="${bodyW/2-2}" height="5" rx="3" fill="#111"/>

      <!-- Neck -->
      <rect x="44" y="62" width="12" height="16" rx="5" fill="${o.skinTone}"/>

      <!-- Head -->
      <ellipse cx="50" cy="40" rx="18" ry="22" fill="url(#faceGrad)"/>

      <!-- Ear -->
      <ellipse cx="32" cy="42" rx="4" ry="6" fill="${o.skinTone}"/>
      <ellipse cx="68" cy="42" rx="4" ry="6" fill="${o.skinTone}"/>

      <!-- Hair -->
      ${hairPaths[o.hairStyle] || hairPaths.short}

      <!-- Eyebrows -->
      <path d="M38 33 Q43 30 48 33" stroke="${darken(o.hairColor)}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M52 33 Q57 30 62 33" stroke="${darken(o.hairColor)}" stroke-width="2" fill="none" stroke-linecap="round"/>

      <!-- Eyes -->
      <ellipse cx="42" cy="40" rx="5" ry="5.5" fill="white"/>
      <ellipse cx="58" cy="40" rx="5" ry="5.5" fill="white"/>
      <circle cx="43" cy="41" r="3" fill="${o.eyeColor}"/>
      <circle cx="59" cy="41" r="3" fill="${o.eyeColor}"/>
      <circle cx="44" cy="40" r="1.2" fill="#0a0a0a"/>
      <circle cx="60" cy="40" r="1.2" fill="#0a0a0a"/>
      <!-- Eye shine -->
      <circle cx="45" cy="39" r="0.8" fill="rgba(255,255,255,0.8)"/>
      <circle cx="61" cy="39" r="0.8" fill="rgba(255,255,255,0.8)"/>

      <!-- Nose -->
      <path d="M48 44 Q50 50 52 44" stroke="${darken(o.skinTone)}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="47" cy="47" rx="2" ry="1.5" fill="${darken(o.skinTone)}"/>
      <ellipse cx="53" cy="47" rx="2" ry="1.5" fill="${darken(o.skinTone)}"/>

      <!-- Mouth -->
      <path d="M44 54 Q50 58 56 54" stroke="${darken(o.skinTone)}" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  function darken(hex) {
    if (!hex || hex[0] !== '#') return '#111';
    try {
      const num = parseInt(hex.slice(1), 16);
      const r = Math.max(0, ((num >> 16) & 0xff) - 40);
      const g = Math.max(0, ((num >> 8)  & 0xff) - 40);
      const b = Math.max(0, ((num)        & 0xff) - 40);
      return `rgb(${r},${g},${b})`;
    } catch(e) { return '#111'; }
  }

  function lighten(hex) {
    if (!hex || hex[0] !== '#') return '#eee';
    try {
      const num = parseInt(hex.slice(1), 16);
      const r = Math.min(255, ((num >> 16) & 0xff) + 25);
      const g = Math.min(255, ((num >> 8)  & 0xff) + 25);
      const b = Math.min(255, ((num)        & 0xff) + 25);
      return `rgb(${r},${g},${b})`;
    } catch(e) { return '#eee'; }
  }

  // ── DOM Renderer ─────────────────────────────
  function renderTo(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = buildSVG();
  }

  function update(key, value) {
    current[key] = value;
  }

  function setKitColor(color) {
    current.kitColor = color;
    renderTo('avatar-preview');
  }

  function getCurrent() { return { ...current }; }

  // ── UI Builder ────────────────────────────────
  function buildCreatorUI(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="avatar-creator">
        <div class="avatar-preview-wrap">
          <div id="avatar-preview" class="avatar-preview-svg"></div>
          <div class="avatar-preview-label">Vista previa</div>
          <div class="dorsal-input-wrap">
            <label>Dorsal</label>
            <input type="number" id="dorsal-input" min="1" max="99" value="10" class="dorsal-input"/>
          </div>
        </div>
        <div class="avatar-options">
          <!-- Skin tone -->
          <div class="avo-section">
            <label class="avo-label">🎨 Tono de Piel</label>
            <div class="color-swatches" id="skin-swatches">
              ${skinTones.map(s => `
                <div class="swatch${s.value === current.skinTone ? ' selected' : ''}"
                     style="background:${s.value}"
                     data-key="skinTone" data-value="${s.value}"
                     title="${s.label}" onclick="AvatarEngine.pickColor(this)"></div>
              `).join('')}
            </div>
          </div>
          <!-- Hair color -->
          <div class="avo-section">
            <label class="avo-label">💇 Color de Cabello</label>
            <div class="color-swatches" id="hair-swatches">
              ${hairColors.map(h => `
                <div class="swatch${h.value === current.hairColor ? ' selected' : ''}"
                     style="background:${h.value}; border:2px solid rgba(255,255,255,0.3)"
                     data-key="hairColor" data-value="${h.value}"
                     title="${h.label}" onclick="AvatarEngine.pickColor(this)"></div>
              `).join('')}
            </div>
          </div>
          <!-- Hair style -->
          <div class="avo-section">
            <label class="avo-label">✂️ Estilo de Cabello</label>
            <div class="style-pills" id="hair-style-pills">
              ${hairStyles.map(h => `
                <button class="style-pill${h.value === current.hairStyle ? ' selected' : ''}"
                        data-key="hairStyle" data-value="${h.value}"
                        onclick="AvatarEngine.pickStyle(this)">${h.label}</button>
              `).join('')}
            </div>
          </div>
          <!-- Eye color -->
          <div class="avo-section">
            <label class="avo-label">👁️ Color de Ojos</label>
            <div class="color-swatches" id="eye-swatches">
              ${eyeColors.map(e => `
                <div class="swatch${e.value === current.eyeColor ? ' selected' : ''}"
                     style="background:${e.value}; border:2px solid rgba(255,255,255,0.3)"
                     data-key="eyeColor" data-value="${e.value}"
                     title="${e.label}" onclick="AvatarEngine.pickColor(this)"></div>
              `).join('')}
            </div>
          </div>
          <!-- Build -->
          <div class="avo-section">
            <label class="avo-label">💪 Complexión</label>
            <div class="style-pills" id="build-pills">
              ${builds.map(b => `
                <button class="style-pill${b.value === current.build ? ' selected' : ''}"
                        data-key="build" data-value="${b.value}"
                        onclick="AvatarEngine.pickStyle(this)">${b.label}</button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Dorsal input handler
    const dorsalInput = document.getElementById('dorsal-input');
    if (dorsalInput) {
      dorsalInput.addEventListener('input', () => {
        const val = Math.min(99, Math.max(1, parseInt(dorsalInput.value) || 10));
        current.number = val;
        renderTo('avatar-preview');
      });
    }

    renderTo('avatar-preview');
  }

  function pickColor(el) {
    const key   = el.dataset.key;
    const value = el.dataset.value;
    // Deselect siblings
    el.closest('.color-swatches').querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    update(key, value);
    renderTo('avatar-preview');
  }

  function pickStyle(el) {
    const key   = el.dataset.key;
    const value = el.dataset.value;
    el.closest('.style-pills').querySelectorAll('.style-pill').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    update(key, value);
    renderTo('avatar-preview');
  }

  // Build a mini version of the avatar for sidebar
  function getMiniSVG(opts = {}) {
    return buildSVG({ ...current, ...opts });
  }

  return {
    buildCreatorUI, renderTo, update, setKitColor,
    getCurrent, getMiniSVG, buildSVG,
    pickColor, pickStyle, defaults
  };
})();
