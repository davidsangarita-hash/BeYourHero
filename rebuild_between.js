#!/usr/bin/env node
/* rebuild_between.js — Rewrites the BETWEEN block in decisions.js with proper
   emojis and the promptBetween function with fallback support for new types.
   Also verifies the match.js finishMatch logic is correct.
*/
const fs = require('fs');

// ── 1. Fix BETWEEN block in decisions.js ─────────────────
let dec = fs.readFileSync('js/decisions.js', 'utf8');

// Find bounds
const betweenTag = 'const BETWEEN = {';
const calcTag    = 'function calcPct';
const bi = dec.indexOf(betweenTag);
const ci = dec.indexOf(calcTag);
if (bi < 0 || ci < 0) { console.error('Tags not found'); process.exit(1); }

const before = dec.substring(0, bi);
const after  = dec.substring(ci - 2); // keep 2 spaces indent

const newBETWEEN = `const BETWEEN = {

    // ── Always shown after match ─────────────────────────
    training: [
      { icon:'\u{1F3CB}', badge:'POST-ENTRENAMIENTO', title:'Partido terminado. \u00BFC\u00F3mo us\u00E1s el tiempo del d\u00EDa?',
        opts:[
          { id:'shoot',   icon:'\u26BD', label:'Practicar\\ntiros extra',      desc:'+2 Remate',          bonus:{"attr":"shooting","val":2} },
          { id:'pool',    icon:'\u{1F3CA}', label:'Recuperaci\u00F3n\\nen piscina',  desc:'+Energ\u00EDa',           bonus:{"fatigue":22} },
          { id:'gym',     icon:'\u{1F4AA}', label:'Trabajo\\nde fuerza',          desc:'+2 F\u00EDsico',           bonus:{"attr":"physical","val":2} },
          { id:'film',    icon:'\u{1F4F9}', label:'Analizar\\nmi partido',         desc:'+2 Pase',             bonus:{"attr":"passing","val":2} },
        ]},
      { icon:'\u{1F9D8}', badge:'RECUPERACI\u00D3N', title:'El cuerpo lo dio todo. \u00BFC\u00F3mo te recuper\u00E1s?',
        opts:[
          { id:'ice',     icon:'\u{1F9CA}', label:'Ba\u00F1o de\\nhielo',               desc:'+Recuperaci\u00F3n',      bonus:{"fatigue":25} },
          { id:'stretch', icon:'\u{1F938}', label:'Estiramiento\\nprofundo',         desc:'+F\u00EDsico +Energ\u00EDa', bonus:{"attr":"physical","val":1,"fatigue":12} },
          { id:'sleep',   icon:'\u{1F634}', label:'Dormir\\nbien',                   desc:'+Energ\u00EDa ++',         bonus:{"fatigue":30} },
          { id:'drills',  icon:'\u26A1',    label:'Ejercicios\\neo t\u00E9cnicos',     desc:'+Velocidad',          bonus:{"attr":"pace","val":1} },
        ]},
      { icon:'\u{1F37D}', badge:'NUTRICI\u00D3N', title:'Tu nutricionista te espera. \u00BFQu\u00E9 dec\u00EDdis?',
        opts:[
          { id:'protein', icon:'\u{1F969}', label:'Dieta de\\nprote\u00EDnas',          desc:'+F\u00EDsico',             bonus:{"attr":"physical","val":1} },
          { id:'carbs',   icon:'\u{1F35D}', label:'Carbohidratos\\npara ma\u00F1ana',   desc:'+Energ\u00EDa',            bonus:{"fatigue":18} },
          { id:'full',    icon:'\u{1F957}', label:'Dieta\\ncompleta',                 desc:'+Energ\u00EDa +F\u00EDsico',  bonus:{"attr":"physical","val":1,"fatigue":10} },
          { id:'cheat',   icon:'\u{1F355}', label:'Comer\\nlo que quiero',             desc:'+Moral',               bonus:{"morale":2} },
        ]},
    ],

    // ── Press conference — only after MVP / big win / captain ──
    press_win: [
      { icon:'\u{1F3A4}', badge:'RUEDA DE PRENSA \u2014 VICTORIA', title:'El periodista te apunta el micr\u00F3fono. Ganaron. \u00BFQu\u00E9 dec\u00EDs?',
        opts:[
          { id:'team',   icon:'\u{1F91D}', label:'El m\u00E9rito\\nes del equipo',    desc:'+Moral del grupo',     bonus:{"morale":2} },
          { id:'honest', icon:'\u{1F60E}', label:'Fuimos\\nclaramente mejores',      desc:'+Reputaci\u00F3n',       bonus:{"rep":2} },
          { id:'praise', icon:'\u{1F44F}', label:'Reconocer\\nal rival',             desc:'+Deportividad',         bonus:{"rep":1,"morale":1} },
          { id:'fire',   icon:'\u{1F525}', label:'\u00A1Solo\\nestamos empezando!',   desc:'+Moral ++',             bonus:{"morale":3} },
        ]},
      { icon:'\u{1F4F8}', badge:'FOTO DE VICTORIA', title:'Te piden para la foto de campeones. \u00BFC\u00F3mo reaccion\u00E1s?',
        opts:[
          { id:'lead',   icon:'\u{1F3C6}', label:'Al frente\\ncon el trofeo',        desc:'+Reputaci\u00F3n ++',     bonus:{"rep":3} },
          { id:'team',   icon:'\u{1F91D}', label:'Con todo\\nel equipo',             desc:'+Moral',               bonus:{"morale":2} },
          { id:'humble', icon:'\u{1F60A}', label:'Con humildad\\nal fondo',          desc:'+Imagen positiva',      bonus:{"rep":1} },
          { id:'skip',   icon:'\u{1F3C3}', label:'Evit\u00E1s\\nlos flashes',        desc:'Ninguno',               bonus:{} },
        ]},
    ],

    // ── Press conference after defeat ──────────────────────
    press_loss: [
      { icon:'\u{1F3A4}', badge:'RUEDA DE PRENSA \u2014 DERROTA', title:'Perdieron. El periodista insiste. \u00BFQu\u00E9 dec\u00EDs?',
        opts:[
          { id:'own',    icon:'\u{1F64F}', label:'Asumir la\\nresponsabilidad',      desc:'+Respeto',             bonus:{"rep":2} },
          { id:'team',   icon:'\u{1F6E1}', label:'Defender\\nal equipo',             desc:'+Moral del grupo',     bonus:{"morale":2} },
          { id:'angry',  icon:'\u{1F621}', label:'El \u00E1rbitro fue\\nuna verguenza', desc:'Pol\u00E9mico \u{1F336}',  bonus:{"morale":1,"rep":-2} },
          { id:'silent', icon:'\u{1F910}', label:'Sin\\ncomentarios',                desc:'Neutral',              bonus:{} },
        ]},
    ],

    // ── Pre-match (shown before starting match) ────────────
    pre: [
      { icon:'\u{1F3AF}', badge:'PREPARACI\u00D3N PRE-PARTIDO', title:'\u00BFC\u00F3mo te prepar\u00E1s para el partido de hoy?',
        opts:[
          { id:'focus',  icon:'\u{1F9D8}', label:'Concentraci\u00F3n\\ntotal',        desc:'+2 Remate',            bonus:{"attr":"shooting","val":2} },
          { id:'video',  icon:'\u{1F4F9}', label:'Ver v\u00EDdeo\\ndel rival',         desc:'+2 Pase',              bonus:{"attr":"passing","val":2} },
          { id:'sprint', icon:'\u{1F3C3}', label:'Entrada en\\ncalor intensa',        desc:'+2 Velocidad',         bonus:{"attr":"pace","val":2} },
          { id:'rest',   icon:'\u{1F634}', label:'Descansar\\ny relajarse',           desc:'+Energ\u00EDa',         bonus:{"fatigue":15} },
        ]},
      { icon:'\u{1F5E3}', badge:'CHARLA T\u00C9CNICA', title:'El t\u00E9cnico pregunta: \u00BFC\u00F3mo te sent\u00EDs para el partido?',
        opts:[
          { id:'great',  icon:'\u{1F4AA}', label:'Al 100%,\\nlisto',                 desc:'+Moral',               bonus:{"morale":2} },
          { id:'ok',     icon:'\u{1F610}', label:'Bien,\\nnormal',                   desc:'Sin cambios',          bonus:{} },
          { id:'fired',  icon:'\u{1F525}', label:'\u00A1Quiero\\nreventar!',           desc:'+Moral ++',            bonus:{"morale":3} },
          { id:'sore',   icon:'\u{1FA79}', label:'Molestia\\npero juego',             desc:'-Moral',               bonus:{"morale":-1} },
        ]},
    ],
  };

`;

dec = before + newBETWEEN + after;
fs.writeFileSync('js/decisions.js', dec, 'utf8');
console.log('decisions.js BETWEEN block rewritten with emojis, length=' + dec.length);

// ── 2. Also fix promptBetween fallback chain ────────────
dec = fs.readFileSync('js/decisions.js', 'utf8');
// Ensure fallback supports training/press_win/press_loss
dec = dec.replace(
  'const pool = BETWEEN[type] || BETWEEN.pre;',
  'const pool = BETWEEN[type] || BETWEEN[\'training\'] || BETWEEN[\'pre\'] || [];\n    if (!pool || !pool.length) { if (callback) callback({}); return; }'
);
fs.writeFileSync('js/decisions.js', dec, 'utf8');
console.log('promptBetween fallback fixed');

// ── 3. Verify match.js has correct finishMatch ────────────
const match = fs.readFileSync('js/match.js', 'utf8');
const hasScenarioType = match.includes('scenarioType');
const hasGoCareer     = match.includes('function goCareer');
const hasPressWin     = match.includes("press_win");
const hasTraining     = match.includes("'training'");
console.log('match.js finishMatch check:',
  'scenarioType=' + hasScenarioType,
  'goCareer=' + hasGoCareer,
  'press_win=' + hasPressWin,
  'training=' + hasTraining
);
console.log('ALL DONE');
