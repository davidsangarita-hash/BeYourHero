// patch_postmatch.js — Fixes:
// 1. finishMatch: smart single post-match decision (training always, press only when special)
// 2. decisions.js: context-aware promptBetween with proper scenario pools
// 3. Removes duplicate post-match decisions

const fs = require('fs');

// ── PATCH 1: match.js finishMatch ─────────────────────────
let match = fs.readFileSync('js/match.js', 'utf8');

const oldFinish = `  function finishMatch(){
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
      state.growthLog.unshift(\`📈 \${attrNames[c.attr]||c.attr} mejoró a \${c.newVal}\`);
      Game.addNews(\`📈 \${player.firstName} mejoró su \${attrNames[c.attr]||c.attr}.\`);
    });

    const resultTxt=match.result==='W'?'Victoria':match.result==='D'?'Empate':'Derrota';
    Game.addNews(\`⚽ J\${match.round}: \${resultTxt} \${match.homeScore}-\${match.awayScore}\`);

    document.getElementById('btn-simulate').style.display='';

    // Post-match between-match decision (50% chance)
    if (Math.random() < 0.75) {
      setTimeout(() => {
        DecisionEngine.promptBetween('post', (bonus) => {
          if (bonus) {
            if (bonus.attr && bonus.val) {
              const cap = { pace:90, shooting:90, passing:90, dribbling:90, defending:90, physical:90 };
              const cur = player.attributes[bonus.attr] || 60;
              player.attributes[bonus.attr] = Math.min(cap[bonus.attr]||90, cur + (bonus.val||1));
              GameUI.showToast(\`📈 \${bonus.attr} mejoró a \${player.attributes[bonus.attr]}\`);
            }
            if (bonus.fatigue) player.fatigue = Math.min(100, (player.fatigue||80) + bonus.fatigue);
            if (bonus.morale)  state.morale = Math.max(0, Math.min(10, (state.morale||5) + bonus.morale));
          }
          Game.advanceRound();
          CareerUI.boot();
          Game.autoSave();
          GameUI.showScreen('screen-career');
          GameUI.showToast(\`✅ Partido finalizado — Nota: \${playerRating} | Decisiones: \${decisionsOk}/\${decisionsTotal}\`);
        });
      }, 400);
    } else {
      Game.advanceRound();
      CareerUI.boot();
      GameUI.showScreen('screen-career');
      GameUI.showToast(\`✅ Partido finalizado — Nota: \${playerRating} | Decisiones: \${decisionsOk}/\${decisionsTotal}\`);
    }
  } // end finishMatch`;

const newFinish = `  function finishMatch(){
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
  } // end finishMatch`;

if (match.includes('function finishMatch()')) {
  // Replace the function
  const start = match.indexOf('  function finishMatch()');
  const end   = match.indexOf('  function sleep(ms)');
  if (start >= 0 && end > start) {
    match = match.substring(0, start) + newFinish + '\n\n' + match.substring(end);
    fs.writeFileSync('js/match.js', match, 'utf8');
    console.log('match.js finishMatch replaced, length=' + match.length);
  } else {
    console.error('Could not find finishMatch boundaries start='+start+' end='+end);
  }
} else {
  console.error('finishMatch not found in match.js');
}

// ── PATCH 2: decisions.js BETWEEN scenarios + promptBetween ─
let dec = fs.readFileSync('js/decisions.js', 'utf8');

// Replace the BETWEEN object with extended version
const oldBetween = "  // -- Between-match scenarios";
const betweenStart = dec.indexOf(oldBetween);
const betweenEnd   = dec.indexOf('  // -- Calculate success %');

if (betweenStart < 0 || betweenEnd < 0) {
  console.error('BETWEEN markers not found betweenStart='+betweenStart+' betweenEnd='+betweenEnd);
  process.exit(1);
}

const newBetween = `  // -- Between-match scenarios (context-aware) ----------
  const BETWEEN = {

    // Always shown after a match — training/recovery choice
    training: [
      { icon:'🏋️', badge:'POST-ENTRENAMIENTO', title:'Partido terminado. ¿Cómo usas el tiempo restante del día?',
        opts:[
          { id:'shoot',  icon:'⚽', label:'Practicar\\ntiros extra',     desc:'+2 Remate',      bonus:{ attr:'shooting', val:2 } },
          { id:'pool',   icon:'🏊', label:'Recuperación\\nen piscina',   desc:'+Energía',        bonus:{ fatigue:22 } },
          { id:'gym',    icon:'💪', label:'Trabajo\\nde fuerza',         desc:'+2 Físico',       bonus:{ attr:'physical', val:2 } },
          { id:'film',   icon:'📹', label:'Analizar\\nmi partido',       desc:'+2 Pase',         bonus:{ attr:'passing',  val:2 } },
        ]},
      { icon:'🧘', badge:'RECUPERACIÓN', title:'El cuerpo lo dio todo. ¿Cómo te recuperás?',
        opts:[
          { id:'ice',    icon:'🧊', label:'Baño de\\nhielo',             desc:'+Recuperación',   bonus:{ fatigue:25 } },
          { id:'stretch',icon:'🤸', label:'Estiramiento\\nprofundo',     desc:'+Físico +Energía',bonus:{ attr:'physical', val:1, fatigue:12 } },
          { id:'sleep',  icon:'😴', label:'Dormir\\nmucho',              desc:'+Energía ++',     bonus:{ fatigue:30 } },
          { id:'gym',    icon:'💪', label:'Gym\\nliviano',               desc:'+Velocidad',      bonus:{ attr:'pace', val:1 } },
        ]},
      { icon:'🍽️', badge:'NUTRICIÓN', title:'Tu nutricionista te espera. ¿Qué decidís?',
        opts:[
          { id:'protein',icon:'🥩', label:'Dieta\\nde proteínas',       desc:'+Físico',         bonus:{ attr:'physical', val:1 } },
          { id:'carbs',  icon:'🍝', label:'Carbohidratos\\npara mañana', desc:'+Energía',        bonus:{ fatigue:18 } },
          { id:'full',   icon:'🥗', label:'Dieta\\ncompleta',            desc:'+Energía ++Físico',bonus:{ fatigue:10, attr:'physical', val:1 } },
          { id:'cheat',  icon:'🍕', label:'Comer\\nlo que quiero',       desc:'+Moral',          bonus:{ morale:2 } },
        ]},
    ],

    // Press conference — shown after MVP, big win, special moments
    press_win: [
      { icon:'🎙️', badge:'RUEDA DE PRENSA — VICTORIA', title:'El periodista te apunta el micrófono. Ganaron. ¿Qué decís?',
        opts:[
          { id:'team',   icon:'🤝', label:'El mérito\\nes del equipo',  desc:'+Moral del grupo', bonus:{ morale:2 } },
          { id:'honest', icon:'😎', label:'Fuimos\\nclaramente mejores', desc:'+Reputación',      bonus:{ rep:2 } },
          { id:'praise', icon:'👏', label:'Reconocer\\nal rival',        desc:'+Deportividad',    bonus:{ rep:1, morale:1 } },
          { id:'fire',   icon:'🔥', label:'¡Solo\\nestamos empezando!',  desc:'+Moral ++',        bonus:{ morale:3 } },
        ]},
      { icon:'📸', badge:'FOTO POSTPARTIDO', title:'Te piden para la foto de campeón. ¿Cómo posás?',
        opts:[
          { id:'lead',   icon:'🏆', label:'Al frente\\ncon el trofeo',   desc:'+Reputación ++',   bonus:{ rep:3 } },
          { id:'team',   icon:'🤝', label:'Con todo\\nel equipo',         desc:'+Moral',           bonus:{ morale:2 } },
          { id:'humble', icon:'😊', label:'Con humildad\\nal fondo',      desc:'+Imagen positiva', bonus:{ rep:1 } },
          { id:'skip',   icon:'🏃', label:'Evitás\\nlos flashes',         desc:'Ninguno',          bonus:{} },
        ]},
    ],

    press_loss: [
      { icon:'🎙️', badge:'RUEDA DE PRENSA — DERROTA', title:'Perdieron. El periodista insiste. ¿Qué decís?',
        opts:[
          { id:'own',    icon:'🙏', label:'Asumir\\nla responsabilidad', desc:'+Respeto',          bonus:{ rep:2 } },
          { id:'team',   icon:'🛡', label:'Defender\\nal equipo',         desc:'+Moral del grupo',  bonus:{ morale:2 } },
          { id:'angry',  icon:'😠', label:'El árbitro\\nes una vergüenza', desc:'Polémico 🌶',      bonus:{ morale:1, rep:-2 } },
          { id:'silent', icon:'🤐', label:'Sin\\ncomentarios',             desc:'Neutral',           bonus:{} },
        ]},
    ],

    // Pre-match — shown before loading match
    pre: [
      { icon:'🎯', badge:'PREPARACIÓN PRE-PARTIDO', title:'¿Cómo te preparás para el partido de hoy?',
        opts:[
          { id:'focus',  icon:'🧘', label:'Concentración\\ntotal',       desc:'+2 Remate',       bonus:{ attr:'shooting', val:2 } },
          { id:'video',  icon:'📹', label:'Ver vídeo\\ndel rival',        desc:'+2 Pase',         bonus:{ attr:'passing',  val:2 } },
          { id:'sprint', icon:'🏃', label:'Entrada en\\ncalor intensa',   desc:'+2 Velocidad',    bonus:{ attr:'pace',     val:2 } },
          { id:'rest',   icon:'😴', label:'Descansar\\ny relajarse',      desc:'+Energía',        bonus:{ fatigue:15 } },
        ]},
      { icon:'🗣️', badge:'CHARLA TÉCNICA', title:'El técnico pregunta: ¿Cómo te sentís para el partido?',
        opts:[
          { id:'great',  icon:'💪', label:'Al 100%,\\nlisto',            desc:'+Moral',          bonus:{ morale:2 } },
          { id:'ok',     icon:'😐', label:'Bien,\\nnormal',              desc:'Sin cambios',      bonus:{} },
          { id:'fired',  icon:'🔥', label:'¡Quiero\\nreventar!',         desc:'+Moral ++',        bonus:{ morale:3 } },
          { id:'sore',   icon:'🩹', label:'Molestia\\npero juego',       desc:'-Moral',           bonus:{ morale:-1 } },
        ]},
    ],
  };

`;

dec = dec.substring(0, betweenStart) + newBetween + dec.substring(betweenEnd);

// Also update promptBetween to handle the new types
const oldPromptBetween = `  // -- Between-match prompt (uses modal) --------------------
  function promptBetween(type, callback) {
    const pool = BETWEEN[type] || BETWEEN.pre;
    const dec  = pool[Math.floor(Math.random() * pool.length)];`;

const newPromptBetween = `  // -- Between-match prompt (context-aware, uses modal) ------
  function promptBetween(type, callback) {
    // Resolve the pool: try exact type, then fallback
    const pool = BETWEEN[type] || BETWEEN['training'] || BETWEEN.pre;
    const dec  = pool[Math.floor(Math.random() * pool.length)];`;

dec = dec.replace(oldPromptBetween, newPromptBetween);

fs.writeFileSync('js/decisions.js', dec, 'utf8');
console.log('decisions.js BETWEEN + promptBetween updated, length=' + dec.length);
console.log('All patches done!');
