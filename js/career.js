/* ============================================================
   BE YOUR HERO v2 – career.js
   Career dashboard with shields, tier badge, promotion panel
   ============================================================ */

const CareerUI = (() => {
  const ATTR_LABELS={
    pace:'💨 Velocidad',shooting:'🎯 Remate',passing:'📐 Pase',
    dribbling:'⚡ Regate',defending:'🛡️ Defensa',physical:'💪 Físico'
  };

  function boot(){
    const state=Game.getState();
    const {player,club,league}=state;
    if (!player||!club||!league) return;

    // Sidebar avatar
    const avatarEl=document.getElementById('sidebar-avatar-svg');
    if (avatarEl) avatarEl.innerHTML=AvatarEngine.getMiniSVG({...player.avatar, kitColor:club.color||'#1a6b38', number:player.dorsal||10});

    document.getElementById('sidebar-name').textContent=`${player.firstName} ${player.lastName}`;
    document.getElementById('sidebar-pos').textContent=`${player.country.flag} ${player.position}`;
    document.getElementById('sidebar-ovr').textContent=player.overall;

    const shieldEl=document.getElementById('sidebar-club-shield');
    if (shieldEl) shieldEl.innerHTML=Logos.getClubShield(club);
    document.getElementById('sidebar-club').textContent=club.name;
    document.getElementById('sidebar-league').textContent=league.name;
    const tierBadge=document.getElementById('sidebar-tier');
    if (tierBadge) {
      tierBadge.textContent=state.tier===2?'2ª División':'1ª División';
      tierBadge.className=`tier-badge ${state.tier===2?'tier2':'tier1'}`;
    }

    refreshDashboard();
  }

  function refreshDashboard(){
    const state=Game.getState();
    const {player,seasonStats,news,growthLog}=state;
    if (!player) return;

    document.getElementById('dash-season').textContent=state.season;
    document.getElementById('dash-round').textContent=`${state.round}/${state.totalRounds}`;
    const pos=state.standings.findIndex(s=>s.club.id===state.club.id);
    document.getElementById('dash-position').textContent=pos>=0?`#${pos+1}`:'—';
    const tierEl=document.getElementById('dash-tier');
    if(tierEl){ tierEl.textContent=state.tier===2?'2ª División':'1ª División'; tierEl.className=`s-value tier-colored ${state.tier===2?'tier2':'tier1'}`; }

    // Form
    const formContainer=document.getElementById('form-badges');
    const recent=(seasonStats.results||[]).slice(-5);
    formContainer.innerHTML=recent.length
      ?recent.map(r=>`<span class="form-badge ${r}">${r}</span>`).join('')
      :'<span style="color:var(--text-muted);font-size:12px">Sin partidos aún</span>';

    document.getElementById('dash-goals').textContent=seasonStats.goals;
    document.getElementById('dash-assists').textContent=seasonStats.assists;
    const avg=seasonStats.ratings.length?(seasonStats.ratings.reduce((a,b)=>a+b,0)/seasonStats.ratings.length).toFixed(1):'—';
    document.getElementById('dash-rating').textContent=avg;

    // Mini attrs
    const miniAttrs=document.getElementById('mini-attrs');
    miniAttrs.innerHTML='';
    Object.entries(player.attributes).forEach(([key,val])=>{
      const pct=((val-40)/60)*100;
      const label=ATTR_LABELS[key]||key;
      miniAttrs.innerHTML+=`<div class="mini-attr-row">
        <span class="attr-name">${label}</span>
        <div class="mini-bar"><div class="mini-fill" style="width:${pct}%"></div></div>
        <span class="mini-val">${val}</span></div>`;
    });

    // News -- rich card feed
    const newsEl = document.getElementById('news-list');
    if (newsEl) {
      const newsItems = (news || []).slice().reverse(); // newest first
      if (!newsItems.length) {
        newsEl.innerHTML = '<div class="empty-state"><span class="empty-icon">📰</span><p>Las noticias aparecen aqui despues de tus partidos</p></div>';
      } else {
        newsEl.innerHTML = newsItems.map(function(n, idx) {
          // Auto-detect category from emoji prefix
          let cat = 'general', catLabel = 'GENERAL', icon = '📋';
          if (n.startsWith('🎉') || n.startsWith('✅')) { cat = 'success'; catLabel = 'LOGRO'; icon = n.substring(0,2); }
          else if (n.startsWith('⚽')) { cat = 'goal'; catLabel = 'PARTIDO'; icon = '⚽'; }
          else if (n.startsWith('📈') || n.startsWith('💪')) { cat = 'growth'; catLabel = 'PROGRESO'; icon = '📈'; }
          else if (n.startsWith('🏟️') || n.startsWith('🏆')) { cat = 'club'; catLabel = 'CLUB'; icon = '🏟️'; }
          else if (n.startsWith('💰') || n.startsWith('🔄')) { cat = 'transfer'; catLabel = 'TRANSFERENCIA'; icon = '💰'; }
          else if (n.startsWith('⚡') || n.startsWith('🔥')) { cat = 'hot'; catLabel = 'DESTACADO'; icon = '⚡'; }
          else if (n.startsWith('📰')) { cat = 'press'; catLabel = 'PRENSA'; icon = '📰'; }
          // Strip leading emoji from text
          const cleanText = n.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27FF}]\s*/u, '');
          const ageLabel = idx === 0 ? 'Ahora' : idx === 1 ? 'Hace un momento' : 'Reciente';
          return '<div class="news-card news-cat-' + cat + '">'
            + '<div class="news-card-icon">' + icon + '</div>'
            + '<div class="news-card-body">'
            + '<span class="news-card-badge">' + catLabel + '</span>'
            + '<p class="news-card-text">' + cleanText + '</p>'
            + '<span class="news-card-time">' + ageLabel + '</span>'
            + '</div>'
            + '</div>';
        }).join('');
      }
    }

        // Career stats
    const cs=state.careerStats;
    document.getElementById('career-goals').textContent=cs.goals+seasonStats.goals;
    document.getElementById('career-assists').textContent=cs.assists+seasonStats.assists;
    document.getElementById('career-matches').textContent=cs.matches+seasonStats.matches;
    document.getElementById('career-seasons').textContent=cs.seasons;

    // Season history
    const sb=document.getElementById('season-breakdown');
    sb.innerHTML=cs.history.length
      ?cs.history.map(h=>`<div class="season-row">
        <span class="sr-season">T${h.season}</span>
        <div class="sr-shield">${h.league||'—'}</div>
        <span class="sr-goals">${h.goals}⚽</span>
        <span class="sr-assists">${h.assists}🎯</span>
        <span class="sr-matches">${h.matches}PJ</span>
        <span class="sr-rating">${h.avgRating}⭐</span>
        <span class="sr-tier ${h.tier===2?'tier2':'tier1'}">${h.tier===2?'2ª':'1ª'}</span>
      </div>`).join('')
      :'<p style="color:var(--text-muted);font-size:12px;padding:16px">Aún no hay historial.</p>';

    // Growth attrs
    const ga=document.getElementById('growth-attrs');
    ga.innerHTML='';
    Object.entries(player.attributes).forEach(([key,val])=>{
      const pct=((val-40)/60)*100;
      ga.innerHTML+=`<div class="growth-attr-row">
        <div class="growth-attr-header">
          <span class="growth-attr-name">${ATTR_LABELS[key]||key}</span>
          <span class="growth-attr-val">${val}</span>
        </div>
        <div class="growth-bar"><div class="growth-fill" style="width:${pct}%"></div></div>
      </div>`;
    });

    // Growth log
    const gl=document.getElementById('growth-log');
    gl.innerHTML=(growthLog||[]).length
      ?(growthLog).map(l=>`<div class="growth-log-item"><span class="growth-log-icon">📈</span><span class="growth-log-text">${l}</span></div>`).join('')
      :'<div class="empty-state"><span class="empty-icon">📈</span><p>Juega partidos para crecer</p></div>';

    // Transfers tab
    const marketStatus=document.getElementById('market-status');
    const marketInfo=document.getElementById('market-info');
    const offersEl=document.getElementById('transfer-offers');
    const promPanel=document.getElementById('promotion-panel');

    if (state.marketOpen){
      marketStatus.textContent='ABIERTO'; marketStatus.className='open-tag';
      marketInfo.textContent='Revisa las ofertas disponibles';
    } else {
      marketStatus.textContent='CERRADO'; marketStatus.className='closed-tag';
      marketInfo.textContent='Abre al final de cada temporada';
    }

    // Promotion offer
    if (promPanel){
      if (state.promotionOffer){
        const po=state.promotionOffer;
        promPanel.classList.remove('hidden');
        promPanel.innerHTML=`
          <div class="promo-card">
            <div class="promo-badge">⬆️ ASCENSO A PRIMERA DIVISIÓN</div>
            <div class="promo-body">
              <div class="promo-shield">${Logos.getClubShield(po.club)}</div>
              <div class="promo-info">
                <p class="promo-club">${po.club.name}</p>
                <p class="promo-league">${po.league.name} ${po.league.flag}</p>
                <div class="promo-logos">${Logos.getLeagueLogo(po.league.id)}</div>
              </div>
              <div class="promo-actions">
                <button class="btn-promo-accept" onclick="Game.acceptPromotion(); CareerUI.boot()">⚡ Aceptar</button>
                <button class="btn-promo-reject" onclick="document.getElementById('promotion-panel').classList.add('hidden')">Rechazar</button>
              </div>
            </div>
          </div>`;
      } else {
        promPanel.classList.add('hidden');
      }
    }

    // Transfer offers
    offersEl.innerHTML=(state.transferOffers||[]).length
      ?state.transferOffers.map(offer=>`
        <div class="transfer-offer-card">
          <div class="offer-shield">${Logos.getClubShield(offer.club)}</div>
          <div class="offer-club">
            <p class="offer-club-name">${offer.club.name}</p>
            <p class="offer-league">${offer.league.name} ${offer.league.flag}</p>
          </div>
          <div class="offer-logo">${Logos.getLeagueLogo(offer.league.id)}</div>
          <span class="offer-amount">💰 ${offer.amount}M€</span>
          <div class="offer-btns">
            <button class="btn-accept" onclick="Game.acceptTransfer(${offer.id}); CareerUI.boot()">Aceptar</button>
            <button class="btn-reject" onclick="Game.rejectTransfer(${offer.id}); CareerUI.boot()">Rechazar</button>
          </div>
        </div>`).join('')
      :(state.marketOpen?'<div class="empty-state"><span class="empty-icon">📭</span><p>No hay ofertas aún</p></div>':'');
  }

  function switchTab(btn){
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    document.querySelectorAll('.career-tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    const tab=btn.dataset.tab;
    document.getElementById(`tab-${tab}`).classList.add('active');
    if (tab==='matches') renderSchedule();
  }

  function showSchedule(){
    document.getElementById('schedule-view').style.display='';
    document.getElementById('table-view').style.display='none';
    document.getElementById('toggle-schedule').classList.add('active');
    document.getElementById('toggle-table').classList.remove('active');
    renderSchedule();
  }

  function showTable(){
    document.getElementById('schedule-view').style.display='none';
    document.getElementById('table-view').style.display='';
    document.getElementById('toggle-schedule').classList.remove('active');
    document.getElementById('toggle-table').classList.add('active');
    renderTable();
  }

  function renderSchedule(){
    const state=Game.getState();
    const list=document.getElementById('matches-list');
    list.innerHTML='';
    state.schedule.forEach(m=>{
      const isCurrent=!m.played&&m.round===state.round;
      const el=document.createElement('div');
      el.className=`match-item ${m.played?'played':''} ${isCurrent?'current':''}`;

      let outcome;
      if (m.played) outcome=`<span class="match-outcome ${m.result}">${m.result}</span>`;
      else if (isCurrent) outcome=`<button class="match-outcome NEXT">▶ Jugar</button>`;
      else outcome=`<span class="match-outcome" style="color:var(--text-muted)">—</span>`;

      const score=m.played?`<span class="sc">${m.homeScore}–${m.awayScore}</span>`:`<span class="vs">VS</span>`;

      el.innerHTML=`
        <div class="match-round-col">
          <span class="match-round">J${m.round}</span>
        </div>
        <div class="match-team-col">
          <div class="match-shield-sm">${Logos.getClubShield(m.homeTeam)}</div>
          <span class="match-team">${m.homeTeam.shortName}</span>
        </div>
        <div class="match-score-col">${score}</div>
        <div class="match-team-col right">
          <span class="match-team">${m.awayTeam.shortName}</span>
          <div class="match-shield-sm">${Logos.getClubShield(m.awayTeam)}</div>
        </div>
        <div class="match-outcome-col">${outcome}</div>`;

      if (isCurrent){
        const btn=el.querySelector('.match-outcome.NEXT');
        if (btn) btn.addEventListener('click',()=>MatchEngine.loadMatch(m));
      }
      list.appendChild(el);
    });
  }

  function renderTable(){
    const state=Game.getState();
    const standings=state.standings;
    let html=`<table class="league-table">
      <thead><tr><th>#</th><th>Club</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th class="pts">Pts</th></tr></thead>
      <tbody>`;
    standings.forEach((row,i)=>{
      const isPlayer=row.club.id===state.club.id;
      let posClass=''; if(i<3)posClass='champions'; else if(i<5)posClass='europa'; else if(i>=standings.length-3)posClass='relegated';
      html+=`<tr class="${isPlayer?'player-team':''}">
        <td class="pos-num ${posClass}">${i+1}</td>
        <td class="table-team-cell">
          <div style="width:24px;height:28px;display:inline-block">${Logos.getClubShield(row.club)}</div>
          <span>${row.club.name}${isPlayer?' 👤':''}</span>
        </td>
        <td>${row.played}</td><td>${row.won}</td><td>${row.drawn}</td><td>${row.lost}</td>
        <td>${row.gf}</td><td>${row.ga}</td>
        <td>${row.gd>=0?'+':''}${row.gd}</td>
        <td class="pts">${row.points}</td></tr>`;
    });
    html+='</tbody></table>';
    document.getElementById('league-table').innerHTML=html;
  }

  function goToNextMatch(){
    const state=Game.getState();
    if (state.round>state.totalRounds){
      GameUI.showToast('🏁 Temporada terminada. Revisa el mercado.');
      switchTab(document.querySelector('[data-tab="transfers"]'));
      return;
    }
    const next=state.schedule.find(m=>!m.played&&m.round===state.round);
    if (next) MatchEngine.loadMatch(next);
    else GameUI.showToast('⚠️ No hay partido pendiente.');
  }

  return { boot, refreshDashboard, switchTab, showSchedule, showTable, goToNextMatch };
})();

