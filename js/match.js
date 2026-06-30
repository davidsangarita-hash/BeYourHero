/* ============================================================
   BE YOUR HERO v2 – match.js
   Match simulation with interactive decisions engine
   ============================================================ */

const MatchEngine = (() => {
  let currentMatch = null;
  let playerGoals=0, playerAssists=0, playerRating=6.0;
  let homeScore=0, awayScore=0;
  let simRunning=false;
  let fatigue=0; // 0-100
  let decisionsOk=0, decisionsTotal=0;
  let pendingEvents=[];

  // ── Event text banks ─────────────────────────────────────
  const PLAYER_GOAL_MSGS=[
    p=>`⚽ ¡GOOOL! ${p} lo mete con una definición magistral.`,
    p=>`⚽ ¡GOLAZO de ${p}! El estadio enloquece.`,
    p=>`🎯 ${p} no perdonó al portero. ¡Gol de categoría!`,
    p=>`💥 Remate imparable de ${p}. ¡1 más!`,
    p=>`⚡ ${p} marcó desde fuera del área. ¡Impresionante!`
  ];
  const PLAYER_ASSIST_MSGS=[
    (p,g)=>`🎯 Asistencia de lujo de ${p} para el gol de ${g}.`,
    p=>`📐 ${p} habilita a su compañero con un pase perfecto.`,
    p=>`✨ Visión de juego de ${p}. La asistencia de la temporada.`
  ];
  const GENERIC_EVENTS=[
    t=>`⚽ Gol de ${t}.`,
    ()=>`🟡 Tarjeta amarilla.`,
    ()=>`🧤 Gran parada del portero.`,
    ()=>`⚡ Contraataque peligroso detenido en el último momento.`,
    ()=>`📐 Tiro libre al borde del área. Fuera.`,
    ()=>`🎯 Disparo al poste. ¡Casi!`,
    ()=>`🔄 Cambio táctico en el campo.`,
    ()=>`💪 Gran duelo físico en el centro del campo.`,
    t=>`⚽ ¡GOL! ${t} anota.`,
    ()=>`🟡 Falta táctica detenida.`
  ];
  const PLAYER_MISC=[
    p=>`💨 ${p} supera a dos rivales con agilidad.`,
    p=>`📐 ${p} genera peligro con su visión.`,
    p=>`⚡ ${p} acelera por banda dejando rival atrás.`,
    p=>`💪 ${p} gana el duelo físico.`,
    p=>`🟡 Falta sobre ${p}. El árbitro para el juego.`
  ];

  // ── Core match generation ─────────────────────────────────
  function generateEvents(match, player) {
    const state   = Game.getState();
    const pName   = `${player.firstName} ${player.lastName}`;
    const isHome  = match.isPlayerHome;
    const opp     = isHome ? match.awayTeam : match.homeTeam;
    const own     = isHome ? match.homeTeam : match.awayTeam;
    const ownPrestige = state.club.prestige;
    const oppPrestige = opp.prestige;

    // Score prediction
    const playerPow   = player.overall;
    const homeAdv     = isHome ? 1.12 : 0.9;
    const ownStr      = (playerPow*0.35 + ownPrestige*13)*homeAdv;
    const oppStr      = oppPrestige*14;
    const dom         = ownStr/(ownStr+oppStr);

    const goalsBag=[0,1,1,2,2,3,3,4,5];
    const ownGoals = weightedRand(goalsBag, dom);
    const oppGoals = weightedRand(goalsBag, 1-dom);
    homeScore = isHome ? ownGoals : oppGoals;
    awayScore = isHome ? oppGoals : ownGoals;
    playerGoals=0; playerAssists=0; decisionsOk=0; decisionsTotal=0;

    // Player contribution based on position
    const goalCh   = getGoalChance(player.position, player.attributes);
    const assistCh = getAssistChance(player.position, player.attributes);
    const pGoalsMax = Math.min(ownGoals, 3);
    for (let g=0; g<pGoalsMax; g++) if (Math.random()<goalCh) playerGoals++;
    const remainGoals = ownGoals - playerGoals;
    for (let g=0; g<Math.min(remainGoals,2); g++) if (Math.random()<assistCh) playerAssists++;

    // Rating
    let rating = 6.0;
    rating += playerGoals*1.2 + playerAssists*0.7;
    if ((isHome&&homeScore>awayScore)||(!isHome&&awayScore>homeScore)) rating+=0.3;
    rating = Math.max(4.0, Math.min(10.0, rating+(Math.random()-0.5)*0.8));
    playerRating = parseFloat(rating.toFixed(1));

    // Build event timeline
    const evList=[];
    const usedMins=new Set();
    const compNames=['Díaz','Chen','Marcus B.','Luca','Antonio','Pablo','Erik','James'];
    const comp=()=>compNames[Math.floor(Math.random()*compNames.length)];

    const pickMin=(lo,hi)=>{ let m,t=0; do{m=Math.floor(Math.random()*(hi-lo))+lo;t++;}while(usedMins.has(m)&&t<60); usedMins.add(m); return m; };

    // 5-6 decisions per match at varied minutes
    const decisionMins=[];
    const decSlots=[12,22,33,44,55,66,77,88];
    const decCount = 5 + Math.floor(Math.random()*2); // 5 or 6 decisions
    const shuffled = decSlots.sort(()=>Math.random()-0.5);
    for(let i=0;i<decCount;i++) {
        let m = shuffled[i];
        usedMins.add(m);
        decisionMins.push(m);
    }

    // Player goals
    for (let i=0;i<playerGoals;i++) evList.push({min:pickMin(10,90),type:'player-goal'});
    for (let i=0;i<playerAssists;i++) evList.push({min:pickMin(10,90),type:'player-assist'});
    // Opp goals
    for (let i=0;i<oppGoals;i++) evList.push({min:pickMin(5,90),type:'opp-goal'});
    // Own non-player goals
    const extraOwn=ownGoals-playerGoals-playerAssists;
    for (let i=0;i<extraOwn;i++) evList.push({min:pickMin(5,90),type:'own-goal'});
    // Player misc
    for (let i=0;i<3;i++) evList.push({min:pickMin(5,90),type:'player-misc'});
    // Generic
    while (evList.length<10) evList.push({min:pickMin(5,90),type:'generic'});
    // Decisions
    decisionMins.forEach(m=>evList.push({min:m,type:'decision',isDecision:true}));
    // Halftime
    evList.push({min:45,type:'halftime'});

    evList.sort((a,b)=>a.min-b.min);

    return evList.map(ev=>{
      switch(ev.type){
        case 'player-goal': {
          const fn=PLAYER_GOAL_MSGS[Math.floor(Math.random()*PLAYER_GOAL_MSGS.length)];
          return {min:ev.min,text:fn(pName),type:'player-goal',icon:'⚽',isGoal:true,isPlayerGoal:true};
        }
        case 'player-assist': {
          const fn=PLAYER_ASSIST_MSGS[Math.floor(Math.random()*PLAYER_ASSIST_MSGS.length)];
          return {min:ev.min,text:fn(pName,comp()),type:'player-assist',icon:'🎯'};
        }
        case 'opp-goal':
          return {min:ev.min,text:`⚽ Gol del ${opp.name}.`,type:'opp-goal',icon:'⚽',isGoal:true,isOppGoal:true};
        case 'own-goal':
          return {min:ev.min,text:`⚽ Gol del ${own.shortName}. ${comp()} marca.`,type:'own-goal',icon:'⚽',isGoal:true};
        case 'player-misc':{
          const fn=PLAYER_MISC[Math.floor(Math.random()*PLAYER_MISC.length)];
          return {min:ev.min,text:fn(pName),type:'misc',icon:'👟'};
        }
        case 'decision':
          return {min:ev.min,type:'decision',icon:'🎯',isDecision:true};
        case 'halftime':
          return {min:45,text:`⏸️ DESCANSO. Los equipos van al túnel.`,type:'meta',icon:'⏸️'};
        default:{
          const fns=GENERIC_EVENTS;
          const fn=fns[Math.floor(Math.random()*fns.length)];
          return {min:ev.min,text:fn(opp.name),type:'generic',icon:'📣'};
        }
      }
    });
  }

  function getGoalChance(pos,a){
    const c={ST:0.55,LW:0.45,CAM:0.32,CM:0.14,RB:0.07,LB:0.07,CB:0.04,GK:0.01};
    return Math.min(0.8,(c[pos]||0.14)*(a.shooting/70));
  }
  function getAssistChance(pos,a){
    const c={CAM:0.44,CM:0.34,LW:0.28,ST:0.18,LB:0.2,RB:0.2,CB:0.07,GK:0.01};
    return Math.min(0.7,(c[pos]||0.18)*(a.passing/70));
  }
  function weightedRand(arr,bias){
    const idx=Math.min(arr.length-1,Math.floor(Math.pow(Math.random(),1.5-bias)*arr.length));
    return arr[idx];
  }

  // ── Load match ────────────────────────────────────────────
  function loadMatch(matchData) {
    currentMatch=matchData;
    const state=Game.getState();
    const home=matchData.homeTeam, away=matchData.awayTeam;

    document.getElementById('match-home-name').textContent=home.name;
    document.getElementById('match-away-name').textContent=away.name;
    document.getElementById('match-home-shield').innerHTML=Logos.getClubShield(home);
    document.getElementById('match-away-shield').innerHTML=Logos.getClubShield(away);
    document.getElementById('match-score-home').textContent='0';
    document.getElementById('match-score-away').textContent='0';
    document.getElementById('match-minute').textContent=`Jornada ${matchData.round}`;
    document.getElementById('match-events').innerHTML='';
    document.getElementById('match-player-goals').textContent='0';
    document.getElementById('match-player-assists').textContent='0';
    document.getElementById('match-player-rating').textContent='—';
    document.getElementById('match-decisions-ok').textContent='0';
    document.getElementById('match-result-panel').classList.add('hidden');
    document.getElementById('btn-simulate').disabled=false;
    document.getElementById('btn-simulate').style.display='';
    document.getElementById('fatigue-fill').style.width='100%';
    fatigue=0;

    pendingEvents=generateEvents(matchData,state.player);
    GameUI.showScreen('screen-match');
  }

  // ── Main simulation loop ─────────────────────────────────
  async function simulate() {
    if (simRunning) return;
    simRunning=true;
    document.getElementById('btn-simulate').disabled=true;
    document.getElementById('btn-simulate').textContent='⏳ Simulando...';

    const state=Game.getState();
    const player=state.player;
    const eventsLog=document.getElementById('match-events');
    let dispHome=0, dispAway=0;

    for (let i=0;i<pendingEvents.length;i++){
      const ev=pendingEvents[i];

      // Decision event — pause and wait
      if (ev.isDecision) {
        await handleDecision(player);
        continue;
      }

      await sleep(350+Math.random()*300);

      // Update minute
      document.getElementById('match-minute').textContent=ev.min+"'";

      // Update fatigue
      fatigue = Math.min(100, fatigue + 2.5);
      const energyPct = Math.max(0, 100-fatigue);
      document.getElementById('fatigue-fill').style.width=energyPct+'%';
      document.getElementById('fatigue-fill').style.background=
        energyPct>60?'linear-gradient(90deg,#0e4a28,#00e664)':
        energyPct>30?'linear-gradient(90deg,#8a6800,#ffd700)':
                     'linear-gradient(90deg,#7a0000,#ff5050)';

      // Score updates
      if (ev.isPlayerGoal) {
        currentMatch.isPlayerHome ? dispHome++ : dispAway++;
        flashScore(currentMatch.isPlayerHome?'home':'away');
        triggerGoalCelebration();
      } else if (ev.isOppGoal) {
        currentMatch.isPlayerHome ? dispAway++ : dispHome++;
        flashScore(currentMatch.isPlayerHome?'away':'home');
      } else if (ev.type==='own-goal') {
        currentMatch.isPlayerHome ? dispHome++ : dispAway++;
        flashScore(currentMatch.isPlayerHome?'home':'away');
      }

      document.getElementById('match-score-home').textContent=dispHome;
      document.getElementById('match-score-away').textContent=dispAway;

      // Live player stats
      if (ev.type==='player-goal')   document.getElementById('match-player-goals').textContent=
        parseInt(document.getElementById('match-player-goals').textContent)+1;
      if (ev.type==='player-assist') document.getElementById('match-player-assists').textContent=
        parseInt(document.getElementById('match-player-assists').textContent)+1;

      // Event log entry
      const evEl=document.createElement('div');
      evEl.className=`match-event${ev.type==='player-goal'?' player-goal':ev.isOppGoal?' goal':''}`;
      evEl.innerHTML=`<span class="event-min">${ev.min}'</span>
        <span class="event-icon">${ev.icon}</span>
        <span class="event-text">${ev.text}</span>`;
      eventsLog.appendChild(evEl);
      eventsLog.scrollTop=eventsLog.scrollHeight;
    }

    // Adjust rating with decision bonus
    if (decisionsTotal>0) {
      const decisionBonus = ((decisionsOk/decisionsTotal)-0.5)*1.5;
      playerRating = Math.max(4.0,Math.min(10.0,parseFloat((playerRating+decisionBonus).toFixed(1))));
    }

    document.getElementById('match-player-rating').textContent=playerRating;
    await sleep(500);
    document.getElementById('match-minute').textContent="90'";
    showResult(dispHome, dispAway);
    simRunning=false;
  }

  // ── Decision handler (uses new DecisionEngine.prompt) ──
  async function handleDecision(player) {
    decisionsTotal++;
    const eventsLog = document.getElementById('match-events');

    // Build the player object as decisions engine expects
    const plObj = {
      attributes: player.attributes,
      fatigue: Math.max(0, 100 - fatigue),
    };

    // Pick a decision for this position
    const pos = player.position || 'CM';
    const decision = DecisionEngine.getForPosition(pos);

    // Announce in event log
    const annoEl = document.createElement('div');
    annoEl.className = 'match-event decision-announce';
    annoEl.innerHTML = `<span class="event-min">⏱</span>
      <span class="event-icon">${decision.icon}</span>
      <span class="event-text">¡${decision.badge}! Tomá una decisión...</span>`;
    eventsLog.appendChild(annoEl);
    eventsLog.scrollTop = eventsLog.scrollHeight;

    // Show decision overlay and await player choice
    const result = await DecisionEngine.prompt(decision, plObj, 9);

    if (result && result.success) {
      decisionsOk++;
      document.getElementById('match-decisions-ok').textContent = decisionsOk;

      // High-quality decision (pct > 55) has chance to generate a goal
      const isAttacking = ['ST','LW','RW','CAM'].includes(pos);
      const isShot = decision.subtype === 'goal_grid' || decision.subtype === 'penalty_grid';
      const goalChance = isShot ? 0.55 : isAttacking ? 0.25 : 0.08;

      if (Math.random() < goalChance) {
        playerGoals++;
        const pName = `${player.firstName} ${player.lastName}`;
        const gEl = document.createElement('div');
        gEl.className = 'match-event player-goal';
        gEl.innerHTML = `<span class="event-min">⚡</span>
          <span class="event-icon">⚽</span>
          <span class="event-text">¡La decisión perfecta se convierte en gol de ${pName}! 🔥</span>`;
        eventsLog.appendChild(gEl);
        // Update scoreboard
        const h = parseInt(document.getElementById('match-score-home').textContent);
        const a = parseInt(document.getElementById('match-score-away').textContent);
        if (currentMatch.isPlayerHome) document.getElementById('match-score-home').textContent = h+1;
        else                           document.getElementById('match-score-away').textContent = a+1;
        document.getElementById('match-player-goals').textContent =
          parseInt(document.getElementById('match-player-goals').textContent)+1;
        flashScore(currentMatch.isPlayerHome ? 'home' : 'away');
        triggerGoalCelebration();
      } else {
        const sEl = document.createElement('div');
        sEl.className = 'match-event player-assist';
        sEl.innerHTML = `<span class="event-min">✅</span>
          <span class="event-icon">⭐</span>
          <span class="event-text">¡Decisión acertada! Tu calidad marca la diferencia.</span>`;
        eventsLog.appendChild(sEl);
      }
    } else if (result) {
      const fEl = document.createElement('div');
      fEl.className = 'match-event';
      fEl.innerHTML = `<span class="event-min">❌</span>
        <span class="event-icon">😤</span>
        <span class="event-text">La jugada no salió como esperabas. Seguí intentando.</span>`;
      eventsLog.appendChild(fEl);
    }
    eventsLog.scrollTop = eventsLog.scrollHeight;
  }

  function flashScore(side){
    const el=document.getElementById(`match-score-${side}`);
    el.classList.remove('score-flash'); void el.offsetWidth; el.classList.add('score-flash');
  }

  function triggerGoalCelebration(){
    const field=document.querySelector('.match-field');
    if (field){ field.classList.add('goal-celebration'); setTimeout(()=>field.classList.remove('goal-celebration'),1500); }
  }

  function showResult(home,away){
    const state=Game.getState();
    const match=currentMatch;
    const isHome=match.isPlayerHome;
    const myScore=isHome?home:away, theirScore=isHome?away:home;
    let result; if(myScore>theirScore) result='W'; else if(myScore<theirScore) result='L'; else result='D';

    document.getElementById('match-player-rating').textContent=playerRating;
    const panel=document.getElementById('match-result-panel');
    panel.classList.remove('hidden');
    document.getElementById('result-title').textContent=
      result==='W'?'🏆 ¡VICTORIA!':result==='D'?'🤝 Empate':'😔 Derrota';
    document.getElementById('result-details').innerHTML=`
      ⚽ Goles: <strong>${playerGoals}</strong> &nbsp;
      🎯 Asistencias: <strong>${playerAssists}</strong> &nbsp;
      ⭐ Nota: <strong>${playerRating}</strong> &nbsp;
      ✅ Decisiones: <strong>${decisionsOk}/${decisionsTotal}</strong>`;
    document.getElementById('btn-simulate').style.display='none';

    match.played=true; match.homeScore=home; match.awayScore=away;
    match.playerGoals=playerGoals; match.playerAssists=playerAssists;
    match.playerRating=playerRating; match.result=result;
  }

  function finishMatch(){
    const state   = Game.getState();
    const player  = state.player;
    const match   = currentMatch;
    const ss      = state.seasonStats;

    ss.goals        += playerGoals;
    ss.assists      += playerAssists;
    ss.matches++;
    ss.ratings.push(playerRating);
    ss.results.push(match.result);
    ss.decisionsOk  += decisionsOk;

    Table.update(state.standings, match.homeTeam, match.awayTeam, match.homeScore, match.awayScore);

    const changes   = PlayerProgression.grow(player, playerRating, player.position);
    const attrNames = { pace:'Velocidad', shooting:'Remate', passing:'Pase', dribbling:'Regate', defending:'Defensa', physical:'Físico' };
    changes.forEach(c => {
      state.growthLog.unshift('📈 ' + (attrNames[c.attr]||c.attr) + ' mejoró a ' + c.newVal);
      Game.addNews('📈 ' + player.firstName + ' mejoró su ' + (attrNames[c.attr]||c.attr) + '.');
    });

    const resultTxt = match.result === 'W' ? 'Victoria' : match.result === 'D' ? 'Empate' : 'Derrota';
    Game.addNews('⚽ J' + match.round + ': ' + resultTxt + ' ' + match.homeScore + '-' + match.awayScore);

    document.getElementById('btn-simulate').style.display = '';

    // ── Decide which single post-match scenario to show ──────
    // Context flags
    const isWin      = match.result === 'W';
    const isMvp      = playerRating >= 8.0 || (playerGoals >= 2);
    const isCaptain  = player.isCaptain || false;
    const isNewClub  = ss.matches === 1;           // first match at this club
    const bigWin     = isWin && (match.homeScore - match.awayScore >= 3 || match.awayScore - match.homeScore >= 3);
    const isLast3    = state.round >= state.totalRounds - 3;

    // Press conference only in special moments
    const showPress  = isMvp || bigWin || isCaptain || isNewClub || isLast3;

    // Choose scenario type
    let scenarioType = 'training';  // default: always show training
    if (showPress && Math.random() < 0.65) {
      scenarioType = isWin ? 'press_win' : 'press_loss';
    }

    function applyBonus(bonus) {
      if (!bonus) return;
      if (bonus.attr && bonus.val) {
        const cap = { pace:92, shooting:92, passing:92, dribbling:92, defending:92, physical:92 };
        const cur = player.attributes[bonus.attr] || 60;
        player.attributes[bonus.attr] = Math.min(cap[bonus.attr]||92, cur + (bonus.val||1));
        GameUI.showToast('📈 ' + (attrNames[bonus.attr]||bonus.attr) + ' mejoró a ' + player.attributes[bonus.attr]);
      }
      if (bonus.fatigue) player.fatigue = Math.min(100, (player.fatigue||80) + bonus.fatigue);
      if (bonus.morale)  state.morale   = Math.max(0, Math.min(10, (state.morale||5) + bonus.morale));
      if (bonus.rep)     player.rep     = Math.max(0, Math.min(100, (player.rep||50) + bonus.rep));
    }

    function goCareer() {
      Game.advanceRound();
      CareerUI.boot();
      Game.autoSave();
      GameUI.showScreen('screen-career');
      const decStr = decisionsOk + '/' + decisionsTotal;
      GameUI.showToast('✅ J' + match.round + ' finalizada — Nota: ' + playerRating + ' | Decisiones: ' + decStr);
    }

    setTimeout(function() {
      DecisionEngine.promptBetween(scenarioType, function(bonus) {
        applyBonus(bonus);
        goCareer();
      });
    }, 420);
  } // end finishMatch

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
  return { loadMatch, simulate, finishMatch };
})();
