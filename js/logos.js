/* ============================================================
   BE YOUR HERO v2 – logos.js
   Real logos via API-Football CDN + SVG fallback shields
   ============================================================ */

const Logos = (() => {

  // ── Real League Logo URLs (API-Football CDN) ─────────────
  const LEAGUE_URLS = {
    premier_league:    'https://media.api-sports.io/football/leagues/39.png',
    la_liga:           'https://media.api-sports.io/football/leagues/140.png',
    bundesliga:        'https://media.api-sports.io/football/leagues/78.png',
    serie_a:           'https://media.api-sports.io/football/leagues/135.png',
    ligue1:            'https://media.api-sports.io/football/leagues/61.png',
    liga_mx:           'https://media.api-sports.io/football/leagues/262.png',
    eredivisie:        'https://media.api-sports.io/football/leagues/88.png',
    mls:               'https://media.api-sports.io/football/leagues/253.png',
    championship:      'https://media.api-sports.io/football/leagues/40.png',
    segunda_division:  'https://media.api-sports.io/football/leagues/141.png',
    bundesliga2:       'https://media.api-sports.io/football/leagues/79.png',
    serie_b:           'https://media.api-sports.io/football/leagues/136.png',
    ligue2:            'https://media.api-sports.io/football/leagues/62.png',
    liga_expansion:    'https://media.api-sports.io/football/leagues/268.png'
  };

  // ── SVG Fallback League Logos ─────────────────────────────
  const LEAGUE_SVG_FALLBACK = {
    premier_league: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#3d195b" stroke="#00ff87" stroke-width="3"/><text x="50" y="38" text-anchor="middle" fill="#00ff87" font-size="10" font-weight="bold" font-family="Arial">PREMIER</text><text x="50" y="52" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial">LEAGUE</text><circle cx="50" cy="65" r="6" fill="#00ff87"/></svg>`,
    la_liga:        `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="96" height="96" rx="12" fill="#FF6B35" stroke="#FFD700" stroke-width="3"/><text x="50" y="42" text-anchor="middle" fill="#FFD700" font-size="18" font-weight="bold" font-family="Arial">LA</text><text x="50" y="62" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="Arial">LIGA</text></svg>`,
    bundesliga:     `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="96" height="96" rx="8" fill="#D00027"/><polygon points="50,15 88,72 12,72" fill="none" stroke="#FFD700" stroke-width="4"/><text x="50" y="67" text-anchor="middle" fill="#FFD700" font-size="9" font-weight="bold" font-family="Arial">BUNDESLIGA</text></svg>`,
    serie_a:        `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#0066CC" stroke="#009246" stroke-width="3"/><text x="50" y="58" text-anchor="middle" fill="#fff" font-size="28" font-weight="bold" font-family="Arial" font-style="italic">A</text></svg>`,
    ligue1:         `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="96" height="96" rx="10" fill="#1B2A4A" stroke="#EF3340" stroke-width="3"/><text x="50" y="60" text-anchor="middle" fill="#EF3340" font-size="36" font-weight="bold" font-family="Arial">1</text></svg>`,
    liga_mx:        `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 95,28 95,72 50,95 5,72 5,28" fill="#006847" stroke="#CE1126" stroke-width="3"/><text x="50" y="56" text-anchor="middle" fill="#FFD700" font-size="18" font-weight="bold" font-family="Arial">LIGA MX</text></svg>`,
    eredivisie:     `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#FF6600" stroke="#003087" stroke-width="3"/><text x="50" y="45" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold" font-family="Arial">EREDIVISIE</text></svg>`,
    mls:            `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="96" height="96" rx="8" fill="#1A1A2E" stroke="#E8003D" stroke-width="3"/><text x="50" y="60" text-anchor="middle" fill="#fff" font-size="26" font-weight="bold" font-family="Arial">MLS</text></svg>`,
    championship:   `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="96" height="96" rx="10" fill="#2c1654" stroke="#a0e6ff" stroke-width="2"/><text x="50" y="40" text-anchor="middle" fill="#a0e6ff" font-size="7" font-weight="bold" font-family="Arial">CHAMPIONSHIP</text><circle cx="50" cy="62" r="14" fill="none" stroke="#a0e6ff" stroke-width="2"/></svg>`,
    segunda_division:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="96" height="96" rx="10" fill="#c0392b" stroke="#FFD700" stroke-width="2"/><text x="50" y="45" text-anchor="middle" fill="#FFD700" font-size="24" font-weight="bold" font-family="Arial">2ª</text><text x="50" y="72" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial">SEGUNDA DIV.</text></svg>`,
    bundesliga2:    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="96" height="96" rx="8" fill="#b20020"/><text x="50" y="55" text-anchor="middle" fill="#FFD700" font-size="28" font-weight="bold" font-family="Arial">2.</text></svg>`,
    serie_b:        `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#003e99" stroke="#009246" stroke-width="3"/><text x="50" y="62" text-anchor="middle" fill="#fff" font-size="32" font-weight="bold" font-family="Arial" font-style="italic">B</text></svg>`,
    ligue2:         `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="96" height="96" rx="10" fill="#0f1e3a" stroke="#EF3340" stroke-width="2"/><text x="50" y="62" text-anchor="middle" fill="#EF3340" font-size="36" font-weight="bold" font-family="Arial">2</text></svg>`,
    liga_expansion: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 95,28 95,72 50,95 5,72 5,28" fill="#004a2a" stroke="#CE1126" stroke-width="2"/><text x="50" y="56" text-anchor="middle" fill="#FFD700" font-size="12" font-weight="bold" font-family="Arial">EXP. MX</text></svg>`
  };

  // ── Country flag SVGs ─────────────────────────────────────
  const FLAG_SVG = {
    GB: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#012169"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="white" stroke-width="8"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="5"/><path d="M30,0 V40 M0,20 H60" stroke="white" stroke-width="12"/><path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="7"/></svg>`,
    ES: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#AA151B"/><rect y="10" width="60" height="20" fill="#F1BF00"/></svg>`,
    DE: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="13" fill="#000"/><rect y="13" width="60" height="14" fill="#DD0000"/><rect y="27" width="60" height="13" fill="#FFCE00"/></svg>`,
    IT: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="40" fill="#009246"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#CE2B37"/></svg>`,
    FR: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="40" fill="#002395"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#ED2939"/></svg>`,
    MX: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="40" fill="#006847"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#CE1126"/></svg>`,
    NL: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="13" fill="#AE1C28"/><rect y="13" width="60" height="14" fill="#fff"/><rect y="27" width="60" height="13" fill="#21468B"/></svg>`,
    US: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#B22234"/><rect y="4" width="60" height="3" fill="#fff"/><rect y="10" width="60" height="3" fill="#fff"/><rect y="16" width="60" height="3" fill="#fff"/><rect y="22" width="60" height="3" fill="#fff"/><rect y="28" width="60" height="3" fill="#fff"/><rect y="34" width="60" height="3" fill="#fff"/><rect width="24" height="22" fill="#3C3B6E"/></svg>`,
    AR: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#74ACDF"/><rect y="13" width="60" height="14" fill="#fff"/><circle cx="30" cy="20" r="5" fill="#F6B40E"/></svg>`,
    BR: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#009C3B"/><polygon points="30,5 55,20 30,35 5,20" fill="#FEDF00"/><circle cx="30" cy="20" r="8" fill="#002776"/></svg>`,
    PT: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="22" height="40" fill="#006600"/><rect x="22" width="38" height="40" fill="#FF0000"/><circle cx="22" cy="20" r="8" fill="none" stroke="#FFD700" stroke-width="2"/></svg>`,
    CO: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="17" fill="#FCD116"/><rect y="17" width="60" height="12" fill="#003087"/><rect y="29" width="60" height="11" fill="#CE1126"/></svg>`,
    NG: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="40" fill="#008751"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#008751"/></svg>`,
    JP: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#fff"/><circle cx="30" cy="20" r="12" fill="#BC002D"/></svg>`,
    MA: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#C1272D"/><text x="30" y="26" text-anchor="middle" fill="#006233" font-size="18">★</text></svg>`,
    KR: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#fff"/><circle cx="30" cy="20" r="9" fill="#C60C30"/><path d="M30 11 Q40 20 30 29 Q20 20 30 11" fill="#003478"/></svg>`,
    UY: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#fff"/><rect y="0" width="60" height="5" fill="#3A75C4"/><rect y="10" width="60" height="5" fill="#3A75C4"/><rect y="20" width="60" height="5" fill="#3A75C4"/><rect y="30" width="60" height="5" fill="#3A75C4"/></svg>`,
    CL: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="20" fill="#fff"/><rect y="20" width="60" height="20" fill="#D52B1E"/><rect width="22" height="20" fill="#002D62"/><text x="11" y="15" text-anchor="middle" fill="#fff" font-size="12">★</text></svg>`,
    PE: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="40" fill="#D91023"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#D91023"/></svg>`,
    VE: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="14" fill="#CF142B"/><rect y="14" width="60" height="12" fill="#FFD700"/><rect y="26" width="60" height="14" fill="#003893"/></svg>`,
    EC: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="17" fill="#FFD100"/><rect y="17" width="60" height="12" fill="#003893"/><rect y="29" width="60" height="11" fill="#CC0001"/></svg>`,
    PY: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="14" fill="#D52B1E"/><rect y="14" width="60" height="12" fill="#fff"/><rect y="26" width="60" height="14" fill="#0038A8"/></svg>`,
    BO: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="14" fill="#D52B1E"/><rect y="14" width="60" height="12" fill="#F4E400"/><rect y="26" width="60" height="14" fill="#007A3D"/></svg>`,
    BE: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="40" fill="#000"/><rect x="20" width="20" height="40" fill="#FFD90C"/><rect x="40" width="20" height="40" fill="#F31830"/></svg>`,
    HR: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="13" fill="#FF0000"/><rect y="13" width="60" height="14" fill="#fff"/><rect y="27" width="60" height="13" fill="#0000CC"/><rect x="22" y="12" width="16" height="16" fill="#fff" stroke="#CC0000" stroke-width="0.5"/></svg>`,
    RS: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="13" fill="#C6363C"/><rect y="13" width="60" height="14" fill="#0C4077"/><rect y="27" width="60" height="13" fill="#fff"/></svg>`,
    SN: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="40" fill="#00853F"/><rect x="20" width="20" height="40" fill="#FDEF42"/><rect x="40" width="20" height="40" fill="#E31B23"/><text x="30" y="26" text-anchor="middle" fill="#00853F" font-size="14">★</text></svg>`,
    GH: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="14" fill="#006B3F"/><rect y="14" width="60" height="12" fill="#FCD116"/><rect y="26" width="60" height="14" fill="#EF3340"/><circle cx="30" cy="20" r="5" fill="#000"/></svg>`,
    CI: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="40" fill="#F77F00"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#009A44"/></svg>`,
    CM: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="40" fill="#007A5E"/><rect x="20" width="20" height="40" fill="#CE1126"/><rect x="40" width="20" height="40" fill="#FCD116"/><text x="30" y="26" text-anchor="middle" fill="#FCD116" font-size="12">★</text></svg>`,
    CA: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="15" height="40" fill="#FF0000"/><rect x="15" width="30" height="40" fill="#fff"/><rect x="45" width="15" height="40" fill="#FF0000"/><text x="30" y="26" text-anchor="middle" fill="#FF0000" font-size="16">🍁</text></svg>`
  };

  // ── Public: League logo (img with SVG fallback) ───────────
  function getLeagueLogo(leagueId) {
    const url = LEAGUE_URLS[leagueId];
    const svgFallback = LEAGUE_SVG_FALLBACK[leagueId] || LEAGUE_SVG_FALLBACK['premier_league'];

    if (url) {
      return `<img
        src="${url}"
        alt="${leagueId}"
        style="width:100%;height:100%;object-fit:contain;border-radius:4px;"
        onerror="this.style.display='none';this.parentElement.innerHTML+='<div style=\\'width:100%;height:100%\\'>${svgFallback.replace(/'/g, "&#39;")}</div>'"
      />`;
    }
    return svgFallback;
  }

  // ── Public: Club shield (img with SVG fallback) ───────────
  function getClubShield(club) {
    if (club && club.apiId) {
      const url = `https://media.api-sports.io/football/teams/${club.apiId}.png`;
      const svgFB = generateSVGShield(club).replace(/'/g, "&#39;").replace(/"/g, '\\"');
      return `<img
        src="${url}"
        alt="${club.shortName || club.name}"
        style="width:100%;height:100%;object-fit:contain;"
        onerror="this.outerHTML='${svgFB}'"
      />`;
    }
    return generateSVGShield(club);
  }

  // ── SVG Shield Generator (fallback) ──────────────────────
  function generateSVGShield(club) {
    const color1 = club.color || '#1a1a2e';
    const color2 = adjustColor(color1, 45);
    const short  = ((club.shortName || (club.name || '???').slice(0,3))).toUpperCase();

    return `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sg_${club.id || Math.random().toString(36).slice(2)}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1}"/>
          <stop offset="100%" style="stop-color:${color2}"/>
        </linearGradient>
      </defs>
      <path d="M50 5 L95 20 L95 70 Q95 105 50 118 Q5 105 5 70 L5 20 Z"
            fill="url(#sg_${club.id || 'x'})"
            stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
      <path d="M50 14 L86 27 L86 68 Q86 98 50 108 Q14 98 14 68 L14 27 Z"
            fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <text x="50" y="72" text-anchor="middle" fill="#ffffff"
            font-size="${short.length > 3 ? '13' : '17'}"
            font-weight="bold" font-family="Arial, sans-serif">${short}</text>
      <line x1="20" y1="80" x2="80" y2="80" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    </svg>`;
  }

  function adjustColor(hex, amount) {
    try {
      const num = parseInt((hex || '#333').replace('#',''), 16);
      const r = Math.min(255, ((num >> 16) & 0xff) + amount);
      const g = Math.min(255, ((num >> 8)  & 0xff) + amount);
      const b = Math.min(255, ((num)        & 0xff) + amount);
      return `rgb(${r},${g},${b})`;
    } catch(e) { return '#333'; }
  }

  // ── Public: Country flag ──────────────────────────────────
  function getFlagSVG(countryCode) {
    return FLAG_SVG[countryCode] ||
      `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="40" fill="#1a1a2e" rx="2"/>
        <text x="30" y="26" text-anchor="middle" fill="#666" font-size="12">?</text>
      </svg>`;
  }

  return { getLeagueLogo, getClubShield, getFlagSVG, generateSVGShield };
})();
