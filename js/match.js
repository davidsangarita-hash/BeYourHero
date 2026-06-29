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

    // Schedule decisions (2-3 per match)
    const numDecisions = 2 + Math.floor(Math.random()*2);
    const decisionMins = [];
    for (let i=0;i<numDecisions;i++) decisionMins.push(pickMin(10,85));

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

  // ── Decision handler ─────────────────────────────────────
  function handleDecision(player) {
    return new Promise(resolve => {
      decisionsTotal++;
      const eventsLog=document.getElementById('match-events');

      // Announce decision in log
      const annoEl=document.createElement('div');
      annoEl.className='match-event decision-announce';
      annoEl.innerHTML=`<span class="event-min">⏱</span>
        <span class="event-icon">🎯</span>
        <span class="event-text">¡Momento clave! Toma una decisión...</span>`;
      eventsLog.appendChild(annoEl);
      eventsLog.scrollTop=eventsLog.scrollHeight;

      DecisionEngine.show(player.position, player.attributes, fatigue, (result) => {
        if (result && result.success) {
          decisionsOk++;
          document.getElementById('match-decisions-ok').textContent=decisionsOk;
          // Bonus: successful decision may add goal/assist
          if (result.pct>60 && Math.random()<0.3) {
            playerGoals++;
            const pName=`${player.firstName} ${player.lastName}`;
            const evEl=document.createElement('div');
            evEl.className='match-event player-goal';
            evEl.innerHTML=`<span class="event-min">⚡</span>
              <span class="event-icon">⚽</span>
              <span class="event-text">¡Decisión brillante convierte en gol de ${pName}!</span>`;
            eventsLog.appendChild(evEl);
            // Update scores
            const curHome=parseInt(document.getElementById('match-score-home').textContent);
            const curAway=parseInt(document.getElementById('match-score-away').textContent);
            if (currentMatch.isPlayerHome) {
              document.getElementById('match-score-home').textContent=curHome+1;
            } else {
              document.getElementById('match-score-away').textContent=curAway+1;
            }
            document.getElementById('match-player-goals').textContent=
              parseInt(document.getElementById('match-player-goals').textContent)+1;
            flashScore(currentMatch.isPlayerHome?'home':'away');
            triggerGoalCelebration();
          }
          const succEl=document.createElement('div');
          succEl.className='match-event player-assist';
          succEl.innerHTML=`<span class="event-min">✅</span>
            <span class="event-icon">⭐</span>
            <span class="event-text">¡Decisión acertada! Tu calidad marca la diferencia.</span>`;
          eventsLog.appendChild(succEl);
        } else if (result) {
          const failEl=document.createElement('div');
          failEl.className='match-event';
          failEl.innerHTML=`<span class="event-min">❌</span>
            <span class="event-icon">😤</span>
            <span class="event-text">La jugada no salió como esperabas. Hay que mejorar.</span>`;
          eventsLog.appendChild(failEl);
        }
        eventsLog.scrollTop=eventsLog.scrollHeight;
        resolve();
      });
    });
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
    const state=Game.getState();
    const player=state.player;
    const match=currentMatch;

    state.seasonStats.goals   +=playerGoals;
    state.seasonStats.assists +=playerAssists;
    state.seasonStats.matches++;
    state.seasonStats.ratings.push(playerRating);
    state.seasonStats.results.push(match.result);
    state.seasonStats.decisionsOk+=decisionsOk;

    Table.update(state.standings, match.homeTeam, match.awayTeam, match.homeScore, match.awayScore);

    const changes=PlayerProgression.grow(player, playerRating, player.position);
    const attrNames={pace:'Velocidad',shooting:'Remate',passing:'Pase',dribbling:'Regate',defending:'Defensa',physical:'Físico'};
    changes.forEach(c=>{
      state.growthLog.unshift(`📈 ${attrNames[c.attr]||c.attr} mejoró a ${c.newVal}`);
      Game.addNews(`📈 ${player.firstName} mejoró su ${attrNames[c.attr]||c.attr}.`);
    });

    const resultTxt=match.result==='W'?'Victoria':match.result==='D'?'Empate':'Derrota';
    Game.addNews(`⚽ J${match.round}: ${resultTxt} ${match.homeScore}-${match.awayScore}`);

    document.getElementById('btn-simulate').style.display='';
    Game.advanceRound();
    CareerUI.boot();
    GameUI.showScreen('screen-career');
    GameUI.showToast(`✅ Partido finalizado — Nota: ${playerRating} | Decisiones: ${decisionsOk}/${decisionsTotal}`);
  }

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
  return { loadMatch, simulate, finishMatch };
})();
