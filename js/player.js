/* ============================================================
   BE YOUR HERO v2 – player.js
   Player creation (with avatar), attributes, progression
   ============================================================ */

const PlayerCreator = (() => {
  let selectedPosition = null;
  let selectedLeague   = null;
  let selectedClub     = null;

  const ATTR_DEFAULTS = { pace:60, shooting:60, passing:60, dribbling:60, defending:60, physical:60 };
  const POSITION_BOOSTS = {
    GK:  { defending:10, physical:5 },
    CB:  { defending:10, physical:5, pace:2 },
    LB:  { pace:8, defending:5, passing:3 },
    RB:  { pace:8, defending:5, passing:3 },
    CM:  { passing:8, physical:5, dribbling:3 },
    CAM: { passing:6, dribbling:8, shooting:4 },
    LW:  { pace:8, dribbling:8, shooting:2 },
    ST:  { shooting:10, pace:5, physical:3 }
  };

  let attrs = { ...ATTR_DEFAULTS };
  let pointsLeft = 20;
  const MAX_ATTR=80, MIN_ATTR=50;

  function adjustAttr(key, delta) {
    const nv = attrs[key]+delta;
    if (nv<MIN_ATTR||nv>MAX_ATTR) return;
    if (delta>0&&pointsLeft<=0) return;
    attrs[key]+=delta; pointsLeft-=delta;
    document.getElementById('points-remaining').textContent=pointsLeft;
    document.getElementById(`val-${key}`).textContent=attrs[key];
    const pct=((attrs[key]-40)/60)*100;
    document.getElementById(`bar-${key}`).style.width=pct+'%';
  }

  function nextStep(step) {
    if (step===2&&!validateStep1()) return;
    if (step===3&&!validateStep2()) return; // avatar -> pos
    if (step===4&&!validateStep3()) return;

    document.querySelectorAll('.create-step').forEach(s=>s.classList.remove('active'));
    document.querySelectorAll('.step').forEach((s,i)=>{
      if (i+1<step) { s.classList.add('done'); s.classList.remove('active'); }
      else if (i+1===step) { s.classList.add('active'); s.classList.remove('done'); }
      else { s.classList.remove('active','done'); }
    });
    document.getElementById(`create-step-${step}`).classList.add('active');

    if (step===2) {
      // Boot avatar creator
      const dorsal = parseInt(document.getElementById('player-dorsal').value)||10;
      AvatarEngine.update('number', dorsal);
      AvatarEngine.buildCreatorUI('avatar-creator-mount');
    }
    if (step===4) renderTier2Leagues();
  }

  function validateStep1() {
    const name = document.getElementById('player-name').value.trim();
    const country = document.getElementById('player-country').value;
    if (!name) { GameUI.showToast('⚠️ Ingresa tu nombre'); return false; }
    if (!country) { GameUI.showToast('⚠️ Selecciona tu país'); return false; }
    return true;
  }
  function validateStep2() { return true; } // avatar always valid
  function validateStep3() {
    if (!selectedPosition) { GameUI.showToast('⚠️ Selecciona una posición'); return false; }
    return true;
  }

  // ── Tier 2 League selector ──────────────────
  function renderTier2Leagues() {
    const leagues = Game.getLeaguesTier2();
    const list = document.getElementById('leagues-list');
    list.innerHTML = '';
    leagues.forEach(league => {
      const el = document.createElement('div');
      el.className = 'league-item';
      el.innerHTML = `
        <div class="league-logo-sm">${Logos.getLeagueLogo(league.id)}</div>
        <div class="league-info">
          <p class="league-item-name">${league.name}</p>
          <div class="league-country-row">
            <div class="flag-svg-mini">${Logos.getFlagSVG(getCountryCode(league.country))}</div>
            <span class="league-item-country">${league.country}</span>
          </div>
        </div>
        <div class="league-prestige">${'⭐'.repeat(league.prestige)}</div>`;
      el.addEventListener('click', () => selectLeague(league, el));
      list.appendChild(el);
    });
  }

  function selectLeague(league, el) {
    document.querySelectorAll('.league-item').forEach(i=>i.classList.remove('selected'));
    el.classList.add('selected');
    selectedLeague = league;
    selectedClub   = null;
    renderClubs(league);
    document.getElementById('clubs-placeholder').style.display='none';
  }

  function renderClubs(league) {
    const panel = document.getElementById('clubs-list');
    panel.innerHTML='';
    league.clubs.forEach(club => {
      const el = document.createElement('div');
      el.className='club-card';
      el.innerHTML=`
        <div class="club-shield-card">${Logos.getClubShield(club)}</div>
        <span class="club-short">${club.shortName}</span>
        <span class="club-full-name">${club.name}</span>
        <div class="club-prestige-row">${'⭐'.repeat(club.prestige)}</div>
        <span class="club-budget">💰 ${club.budget}M€</span>
        <span class="club-stadium" title="${club.stadium}">🏟 ${club.capacity.toLocaleString()}</span>`;
      el.addEventListener('click', () => {
        document.querySelectorAll('.club-card').forEach(c=>c.classList.remove('selected'));
        el.classList.add('selected'); selectedClub=club;
        // Update kit color on avatar
        AvatarEngine.setKitColor(club.color || '#1a6b38');
      });
      panel.appendChild(el);
    });
  }

  function confirmCareer() {
    if (!selectedLeague) { GameUI.showToast('⚠️ Selecciona una liga'); return; }
    if (!selectedClub)   { GameUI.showToast('⚠️ Selecciona un club'); return; }

    const firstName   = document.getElementById('player-name').value.trim();
    const lastName    = document.getElementById('player-lastname').value.trim()||'';
    const countryCode = document.getElementById('player-country').value;
    const age         = parseInt(document.getElementById('player-age').value)||17;
    const dorsal      = parseInt(document.getElementById('player-dorsal').value)||10;
    const countries   = Game.getCountries();
    const country     = countries.find(c=>c.code===countryCode)||{ name:countryCode, flag:'🌐', code: countryCode };

    const finalAttrs = { ...attrs };
    const boosts = POSITION_BOOSTS[selectedPosition]||{};
    Object.entries(boosts).forEach(([k,v])=>{ finalAttrs[k]=Math.min(99,finalAttrs[k]+v); });

    const avatarData = AvatarEngine.getCurrent();

    const player = {
      firstName, lastName, country, age, dorsal,
      position: selectedPosition,
      avatar: avatarData,
      attributes: finalAttrs,
      overall: calcOverall(finalAttrs, selectedPosition),
      xp:0, level:1
    };

    Game.initCareer(player, selectedClub, selectedLeague);
    Game.saveGame();
    CareerUI.boot();
    GameUI.showScreen('screen-career');
    GameUI.showToast(`⚡ ¡Carrera iniciada! Bienvenido a ${selectedClub.name}`);
  }

  function calcOverall(a, pos) {
    const weights=getWeights(pos); let total=0,wSum=0;
    Object.entries(weights).forEach(([k,w])=>{ total+=(a[k]||60)*w; wSum+=w; });
    return Math.round(total/wSum);
  }

  function getWeights(pos) {
    const w={
      GK:  {defending:4,physical:3,pace:1,passing:1,shooting:0.5,dribbling:0.5},
      CB:  {defending:4,physical:3,pace:2,passing:1,shooting:0.5,dribbling:0.5},
      LB:  {defending:3,pace:3,physical:2,passing:2,shooting:0.5,dribbling:1},
      RB:  {defending:3,pace:3,physical:2,passing:2,shooting:0.5,dribbling:1},
      CM:  {passing:4,physical:3,dribbling:2,defending:2,shooting:1,pace:1},
      CAM: {passing:3,dribbling:4,shooting:3,pace:2,physical:1,defending:0.5},
      LW:  {pace:4,dribbling:4,shooting:3,passing:2,physical:1,defending:0.5},
      ST:  {shooting:5,pace:3,physical:3,dribbling:2,passing:1,defending:0.5}
    };
    return w[pos]||w['CM'];
  }

  function getCountryCode(countryName) {
    const map={England:'GB',Spain:'ES',Germany:'DE',Italy:'IT',France:'FR',Mexico:'MX',Netherlands:'NL',USA:'US'};
    return map[countryName]||'';
  }

  function setPosition(pos)  { selectedPosition=pos; }

  return { nextStep, confirmCareer, adjustAttr, setPosition, calcOverall, getWeights };
})();

/* Player Progression */
const PlayerProgression = (() => {
  function grow(player, matchRating, position) {
    if (!player||!matchRating) return [];
    const changes=[]; const attrs=player.attributes;
    const weights=PlayerCreator.getWeights(position);
    Object.keys(attrs).forEach(key=>{
      const w=weights[key]||1;
      const chance=0.07*w*(matchRating/10);
      if (Math.random()<chance&&attrs[key]<99){ attrs[key]++; changes.push({attr:key,newVal:attrs[key]}); }
    });
    if (changes.length>0) player.overall=PlayerCreator.calcOverall(attrs,position);
    return changes;
  }
  return { grow };
})();

// ── Global helpers ──────────────────────────────
function selectPosition(el) {
  document.querySelectorAll('.pos-card').forEach(p=>p.classList.remove('selected'));
  el.classList.add('selected');
  PlayerCreator.setPosition(el.dataset.pos);
}
function adjustAttr(key,delta) { PlayerCreator.adjustAttr(key,delta); }
function getCountryCode(name) {
  const map={England:'GB',Spain:'ES',Germany:'DE',Italy:'IT',France:'FR',Mexico:'MX',Netherlands:'NL',USA:'US'};
  return map[name]||'';
}
