/* ============================================================
   BE YOUR HERO v2 – decisions.js (v2.1)
   Visual goal grid + 30+ match decisions + between-match
   ============================================================ */

const DecisionEngine = (() => {
  let _resolve  = null;
  let _timer    = null;
  let _seconds  = 0;
  const CIRCUM  = 2 * Math.PI * 16; // timer ring circumference

  // ── Goal Zones (3×3 grid) ─────────────────────────────────
  const GOAL_ZONES = [
    { id:'tl', row:0, col:0, label:'Alto Izq',    arrow:'↖', base:32 },
    { id:'tc', row:0, col:1, label:'Alto Centro',  arrow:'↑', base:36 },
    { id:'tr', row:0, col:2, label:'Alto Der',     arrow:'↗', base:32 },
    { id:'ml', row:1, col:0, label:'Medio Izq',    arrow:'←', base:44 },
    { id:'mc', row:1, col:1, label:'Centro',        arrow:'⊕', base:20 },
    { id:'mr', row:1, col:2, label:'Medio Der',    arrow:'→', base:44 },
    { id:'bl', row:2, col:0, label:'Bajo Izq',     arrow:'↙', base:52 },
    { id:'bc', row:2, col:1, label:'Bajo Centro',  arrow:'↓', base:36 },
    { id:'br', row:2, col:2, label:'Bajo Der',     arrow:'↘', base:52 },
  ];

  // ── GK Tendencies (shown as hint before shot) ─────────────
  const GK_HINTS = [
    { text:'El portero está centrado',          vuln:['tl','tr','bl','br'] },
    { text:'Cubre su derecha (tu izquierda)',    vuln:['mr','br','tr'] },
    { text:'Cubre su izquierda (tu derecha)',    vuln:['ml','bl','tl'] },
    { text:'Anticipa pelota baja',              vuln:['tl','tc','tr'] },
    { text:'Se adelanta — espera el suelo',     vuln:['tl','tc','tr','mc'] },
    { text:'Cubre los palos',                   vuln:['mc','ml','mr'] },
  ];

  // ── Match Decisions by Position ───────────────────────────
  const MATCH = {
    ST: [
      { type:'shot',     icon:'🎯', badge:'DISPARO AL ARCO',    scenario:'Recibes el balón dentro del área. ¡Tienes un segundo para disparar!',          attr:'shooting',   subtype:'goal_grid' },
      { type:'header',   icon:'🏹', badge:'CABEZAZO',           scenario:'Centro al área. Vas de frente. ¿Cuándo y cómo cabeceás?',                       attr:'physical',   options:[
          { id:'early',   icon:'⬆', label:'Anticipar\nel salto',    basePct:46 },
          { id:'timed',   icon:'✅', label:'Saltar\na tiempo',       basePct:70 },
          { id:'power',   icon:'💪', label:'Empujar\ncon fuerza',    basePct:54 },
          { id:'flick',   icon:'↩', label:'Desviar\nde cabeza',     basePct:38 },
      ]},
      { type:'duel',     icon:'⚡', badge:'DUELO EN ÁREA',      scenario:'Cara a cara con el central. Tienes la pelota, él te viene encima.',             attr:'dribbling',  options:[
          { id:'left',    icon:'◀', label:'Encarar\nizquierda',     basePct:55 },
          { id:'right',   icon:'▶', label:'Encarar\nderecha',       basePct:55 },
          { id:'nutmeg',  icon:'🌀', label:'Caño',                  basePct:28 },
          { id:'layoff',  icon:'↙', label:'Dar y\ncontinuar',       basePct:72 },
      ]},
      { type:'first',    icon:'🦶', badge:'PRIMER TOQUE',       scenario:'Pase largo. El defensa llega. ¿Primer toque?',                                  attr:'dribbling',  options:[
          { id:'control', icon:'🔄', label:'Controlar\ny girar',    basePct:62 },
          { id:'flick',   icon:'👟', label:'Dar de\ntalón',         basePct:40 },
          { id:'volley',  icon:'💥', label:'Volear\ndirecto',       basePct:28 },
          { id:'layoff',  icon:'↩', label:'Tocar atrás',            basePct:76 },
      ]},
      { type:'penalty',  icon:'⚽', badge:'¡PENALTI!',          scenario:'El árbitro señala el punto. Todos esperan. El portero espera tu decisión.',     attr:'shooting',   subtype:'penalty_grid' },
      { type:'run',      icon:'🏃', badge:'TIMING DE CARRERA',  scenario:'El mediocampista tiene la pelota. ¿Cuándo arrancás la carrera en profundidad?', attr:'pace',       options:[
          { id:'early',   icon:'💨', label:'Arrancar\nantes',        basePct:48 },
          { id:'perfect', icon:'⚡', label:'Timing\nperfecto',       basePct:72 },
          { id:'late',    icon:'⏰', label:'Esperarlo\nparado',      basePct:40 },
          { id:'dummy',   icon:'🎭', label:'Amago y\nrecibir corto', basePct:60 },
      ]},
    ],

    LW: [
      { type:'cross',    icon:'📐', badge:'EXTREMO IZQUIERDO',  scenario:'Llegas al fondo por la banda izquierda. El 9 ya está en el área.',              attr:'passing',    options:[
          { id:'early',   icon:'⚡', label:'Centro\ntemprano',       basePct:55 },
          { id:'driven',  icon:'→',  label:'Centro\nraso y fuerte',  basePct:60 },
          { id:'cutback', icon:'↩', label:'Recorte al\nsegundo palo', basePct:65 },
          { id:'cut',     icon:'↗', label:'Cortar a\npierna natural', basePct:45 },
      ]},
      { type:'dribble',  icon:'💨', badge:'VELOCIDAD EN BANDA', scenario:'El lateral te viene encima. Tenés ventaja de velocidad.',                       attr:'pace',       options:[
          { id:'sprint',  icon:'💨', label:'Sprint\nen línea',        basePct:65 },
          { id:'feint',   icon:'🌀', label:'Amague\ny corte',         basePct:56 },
          { id:'inside',  icon:'↗', label:'Cortar\nhacia adentro',   basePct:50 },
          { id:'pass',    icon:'↩', label:'Dar al\ninterior',        basePct:74 },
      ]},
      { type:'shot',     icon:'🎯', badge:'DISPARO DEL EXTREMO', scenario:'Cortaste hacia adentro. ¡El arco está libre para tu pierna buena!',           attr:'shooting',   subtype:'goal_grid' },
    ],

    RW: [
      { type:'cross',    icon:'📐', badge:'EXTREMO DERECHO',    scenario:'Tienes la banda derecha. El delantero hace el movimiento en el área.',          attr:'passing',    options:[
          { id:'early',   icon:'⚡', label:'Centro\ntemprano',       basePct:55 },
          { id:'low',     icon:'←',  label:'Centro\nraso',           basePct:60 },
          { id:'cutback', icon:'↩', label:'Recorte',                 basePct:64 },
          { id:'chip',    icon:'🌙', label:'Centro\nlobado',         basePct:42 },
      ]},
      { type:'dribble',  icon:'💨', badge:'ENCARAR AL LATERAL', scenario:'Cara a cara con el lateral. Decidís rápido.',                                  attr:'pace',       options:[
          { id:'speed',   icon:'💨', label:'Acelerar\nen banda',      basePct:64 },
          { id:'feint',   icon:'🌀', label:'Amague',                  basePct:55 },
          { id:'inside',  icon:'↖', label:'Cortar\nadentro',         basePct:48 },
          { id:'pass',    icon:'↩', label:'Tocar atrás',              basePct:75 },
      ]},
      { type:'shot',     icon:'🎯', badge:'DISPARO DEL EXTREMO', scenario:'Cortaste a tu pierna buena. Hay espacio para el tiro.',                       attr:'shooting',   subtype:'goal_grid' },
    ],

    CAM: [
      { type:'through',  icon:'🎯', badge:'PASE DECISIVO',      scenario:'El 9 hace el run. Tenés 2 segundos para filtrar el pase.',                     attr:'passing',    options:[
          { id:'thread',  icon:'⬆', label:'Pase en\nprofundidad',    basePct:50 },
          { id:'lofted',  icon:'🌙', label:'Pase\nlobado',            basePct:46 },
          { id:'ground',  icon:'→',  label:'Pase\nraso fuerte',       basePct:62 },
          { id:'hold',    icon:'⏸', label:'Retener y\nbuscar otro',   basePct:80 },
      ]},
      { type:'longshot', icon:'🚀', badge:'TIRO DE LARGA',       scenario:'El defensa retrocede. ¡Hay espacio para disparar desde afuera!',               attr:'shooting',   subtype:'goal_grid' },
      { type:'dribble',  icon:'🌀', badge:'GAMBETA',             scenario:'Uno contra uno con el mediocampista rival.',                                   attr:'dribbling',  options:[
          { id:'stepover',icon:'🌀', label:'Amague\nde pierna',       basePct:58 },
          { id:'roulette',icon:'🔄', label:'Ruleta',                  basePct:44 },
          { id:'oneTwo',  icon:'↔', label:'Dar y\nrecibir (1-2)',     basePct:68 },
          { id:'shoot',   icon:'💥', label:'Disparar\nde primera',    basePct:36 },
      ]},
      { type:'free_kick',icon:'🆓', badge:'TIRO LIBRE',          scenario:'Falta a 22 metros. El muro se arma. ¿Cómo ejecutás?',                        attr:'shooting',   options:[
          { id:'power',   icon:'💥', label:'Remate\nfuerte',          basePct:42 },
          { id:'curve',   icon:'🌙', label:'Tiro\ncurvo',             basePct:48 },
          { id:'low',     icon:'↘', label:'Raso\npor abajo del muro', basePct:38 },
          { id:'pass',    icon:'↗', label:'Pase\ncorto a compañero',  basePct:70 },
      ]},
    ],

    CM: [
      { type:'press',    icon:'⚽', badge:'RECUPERAR BALÓN',    scenario:'El rival avanza por tu zona. Tenés que actuar ya.',                             attr:'defending',  options:[
          { id:'press',   icon:'▶', label:'Presionar\nde inmediato',  basePct:54 },
          { id:'jockey',  icon:'⏸', label:'Temporizar',              basePct:70 },
          { id:'intercept',icon:'✂',label:'Interceptar\nel pase',     basePct:44 },
          { id:'foul',    icon:'⚠', label:'Falta\ntáctica',           basePct:62 },
      ]},
      { type:'dist',     icon:'📐', badge:'DISTRIBUCIÓN',       scenario:'Recuperás en el centro. El equipo espera tu decisión.',                        attr:'passing',    options:[
          { id:'switch',  icon:'↔', label:'Cambio de\norientación',   basePct:68 },
          { id:'vertical',icon:'⬆', label:'Pase en\nvertical',        basePct:52 },
          { id:'maintain',icon:'⊙', label:'Mantener\nposesión',       basePct:84 },
          { id:'longball',icon:'🚀', label:'Pelotazo\nlargo',          basePct:40 },
      ]},
      { type:'longshot', icon:'🚀', badge:'TIRO SORPRESA',       scenario:'Defienden bajo. ¡El área del medio está despejada para un disparo!',           attr:'shooting',   subtype:'goal_grid' },
    ],

    CDM: [
      { type:'tackle',   icon:'🛡', badge:'ENTRADA DEFENSIVA',  scenario:'El mediapunta rival entra en tu zona. ¿Cómo lo parás?',                       attr:'defending',  options:[
          { id:'slide',   icon:'🦵', label:'Entrada\ndeslizante',     basePct:48 },
          { id:'stand',   icon:'🧍', label:'Entrada\nfrontal',        basePct:66 },
          { id:'cover',   icon:'🛡', label:'Cubrir\nla salida',       basePct:74 },
          { id:'press',   icon:'▶', label:'Presionar\nen salida',     basePct:54 },
      ]},
      { type:'buildup',  icon:'📐', badge:'SALIDA DE BALÓN',    scenario:'Tenés el balón en tu campo. Presionan alto.',                                  attr:'passing',    options:[
          { id:'short',   icon:'↗', label:'Pase corto\nseguro',       basePct:84 },
          { id:'long',    icon:'🚀', label:'Largo al\nadelantado',     basePct:44 },
          { id:'carry',   icon:'→', label:'Conducir\ny avanzar',      basePct:58 },
          { id:'back',    icon:'↙', label:'Dar atrás\nal portero',    basePct:90 },
      ]},
    ],

    LB: [
      { type:'overlap',  icon:'🏃', badge:'LATERAL IZQUIERDO',  scenario:'El extremo pide el overlap. ¿Subís o cubrís?',                                attr:'pace',       options:[
          { id:'overlap', icon:'⬆', label:'Subir al\noverlap',        basePct:60 },
          { id:'stay',    icon:'🛡', label:'Quedarme\nde cobertura',   basePct:86 },
          { id:'under',   icon:'↗', label:'Underlap\npor dentro',     basePct:50 },
          { id:'cross',   icon:'📐', label:'Centro\nde primera',      basePct:44 },
      ]},
      { type:'defend',   icon:'🛡', badge:'DUELO EN BANDA',     scenario:'El extremo te encaró. Tenés que frenarlo.',                                    attr:'defending',  options:[
          { id:'jockey',  icon:'↩', label:'Temporizar\nhacia adentro',basePct:68 },
          { id:'tackle',  icon:'🦵', label:'Entrada\nfrontal',        basePct:52 },
          { id:'push',    icon:'→', label:'Empujar\na la línea',      basePct:58 },
          { id:'foul',    icon:'⚠', label:'Falta\ntáctica',           basePct:64 },
      ]},
    ],

    RB: [
      { type:'overlap',  icon:'🏃', badge:'LATERAL DERECHO',    scenario:'Tenés espacio en la banda. ¿Te proyectás o cubrís?',                          attr:'pace',       options:[
          { id:'overlap', icon:'⬆', label:'Subir al\noverlap',        basePct:60 },
          { id:'stay',    icon:'🛡', label:'Mantener\nposición',       basePct:86 },
          { id:'cross',   icon:'📐', label:'Centro\nen profundidad',   basePct:48 },
          { id:'chip',    icon:'🌙', label:'Centro\nlobado',           basePct:42 },
      ]},
      { type:'defend',   icon:'🛡', badge:'DUELO EN BANDA',     scenario:'El extremo te encaró. Decidís rápido.',                                        attr:'defending',  options:[
          { id:'jockey',  icon:'↩', label:'Temporizar',              basePct:68 },
          { id:'tackle',  icon:'🦵', label:'Entrada\ndeslizante',     basePct:50 },
          { id:'pressure',icon:'▶', label:'Presión\nalta',           basePct:54 },
          { id:'foul',    icon:'⚠', label:'Falta\ntáctica',          basePct:64 },
      ]},
    ],

    CB: [
      { type:'aerial',   icon:'🏹', badge:'DUELO AÉREO',        scenario:'Balón largo al delantero rival. ¿Cómo defendés el cabezazo?',                 attr:'physical',   options:[
          { id:'early',   icon:'⬆', label:'Anticipar\nel salto',      basePct:56 },
          { id:'body',    icon:'🧱', label:'Bloquear\ncon cuerpo',     basePct:66 },
          { id:'clear',   icon:'💨', label:'Despejar\nlargo',          basePct:72 },
          { id:'intercept',icon:'✂',label:'Interceptar\ntrayectoria', basePct:46 },
      ]},
      { type:'oneone',   icon:'⚔', badge:'UNO A UNO',           scenario:'¡El delantero quedó solo frente a vos! Tenés que pararlo.',                   attr:'defending',  options:[
          { id:'slide',   icon:'🦵', label:'Entrada\nbaja',            basePct:50 },
          { id:'stand',   icon:'🛡', label:'Esperar\nsu movimiento',   basePct:68 },
          { id:'push',    icon:'→', label:'Empujar\nfuera del área',   basePct:54 },
          { id:'sprint',  icon:'💨', label:'Sprint\na despejar',       basePct:46 },
      ]},
      { type:'buildup',  icon:'📐', badge:'SALIDA DESDE ATRÁS', scenario:'El portero te da el balón. Presionan alto. ¿Qué hacés?',                      attr:'passing',    options:[
          { id:'short',   icon:'→', label:'Pase corto\nal lateral',    basePct:78 },
          { id:'long',    icon:'🚀', label:'Pelotazo\npreciso',        basePct:48 },
          { id:'carry',   icon:'⬆', label:'Conducir\ny avanzar',      basePct:54 },
          { id:'back',    icon:'↙', label:'Devolver\nal portero',      basePct:90 },
      ]},
    ],

    GK: [
      { type:'save',     icon:'🧤', badge:'¡ATAJADA!',          scenario:'¡El rival dispara! Tenés milésimas de segundo para reaccionar.',               attr:'physical',   options:[
          { id:'left',    icon:'⬅', label:'Lanzarse\nizquierda',       basePct:50 },
          { id:'right',   icon:'➡', label:'Lanzarse\nderecha',         basePct:50 },
          { id:'center',  icon:'⊙', label:'Quedarse\nal centro',       basePct:36 },
          { id:'tip',     icon:'⬆', label:'Desviar\nal córner',        basePct:44 },
      ]},
      { type:'dist',     icon:'⚽', badge:'DISTRIBUCIÓN',       scenario:'Tenés el balón. El rival presiona. ¿Cómo iniciás?',                            attr:'passing',    options:[
          { id:'throw',   icon:'→', label:'Lanzar corto\nal lateral',  basePct:82 },
          { id:'kick',    icon:'🚀', label:'Saque largo\nal 9',        basePct:48 },
          { id:'roll',    icon:'↙', label:'Rodar al\ndefensa',         basePct:84 },
          { id:'goal',    icon:'💨', label:'Saque de\npuerta largo',   basePct:54 },
      ]},
      { type:'command',  icon:'📢', badge:'COMANDAR EL ÁREA',   scenario:'Centro al área. Tus defensas esperan tu orden.',                               attr:'physical',   options:[
          { id:'claim',   icon:'🙌', label:'Salir y\natrapar',         basePct:60 },
          { id:'punch',   icon:'👊', label:'Salir y\ndespejar',        basePct:70 },
          { id:'line',    icon:'🛡', label:'Quedarse en\nla línea',    basePct:64 },
          { id:'command', icon:'📢', label:'Pedir que\ndespejen',      basePct:72 },
      ]},
    ],
  };

  // ── Between-match decisions ───────────────────────────────
  const BETWEEN = {
    pre: [
      { icon:'🎯', badge:'PREPARACIÓN', title:'¿Cómo te preparás para el partido de hoy?',
        opts:[
          { id:'focus',   icon:'🧘', label:'Concentración\ntotal',     desc:'+2 definición',   bonus:{ attr:'shooting', val:2 } },
          { id:'video',   icon:'📹', label:'Ver al\nrival',            desc:'+2 visión',       bonus:{ attr:'passing',  val:2 } },
          { id:'sprint',  icon:'🏃', label:'Trabajo\nfísico',          desc:'+2 velocidad',    bonus:{ attr:'pace',     val:2 } },
          { id:'rest',    icon:'😴', label:'Descansar\ny relajarse',   desc:'Recuperar energía',bonus:{ fatigue:15 } },
        ]},
      { icon:'🗣️', badge:'CHARLA TÉCNICA', title:'El técnico pregunta: ¿Cómo te sentís hoy?',
        opts:[
          { id:'great',   icon:'💪', label:'Al 100%\nlisto para todo', desc:'+moral',    bonus:{ morale:2 } },
          { id:'ok',      icon:'😐', label:'Bien,\nnormal',            desc:'Normal',    bonus:{} },
          { id:'fired',   icon:'🔥', label:'Quiero\nreventar',         desc:'+moral ++', bonus:{ morale:3 } },
          { id:'sore',    icon:'🩹', label:'Molestia\npero juego',     desc:'-moral',    bonus:{ morale:-1 } },
        ]},
      { icon:'🔍', badge:'ESPIONAJE TÁCTICO', title:'Hay 1 hora antes del partido. ¿Qué hacés?',
        opts:[
          { id:'scout',   icon:'📊', label:'Analizar\nal rival',       desc:'+pase',     bonus:{ attr:'passing', val:3 } },
          { id:'warm',    icon:'🏃', label:'Calentamiento\nextra',      desc:'+fisico',   bonus:{ attr:'pace',    val:2 } },
          { id:'mental',  icon:'🧠', label:'Visualización\nmental',    desc:'+remate',   bonus:{ attr:'shooting',val:2 } },
          { id:'music',   icon:'🎵', label:'Música y\nrelajación',     desc:'+energía',  bonus:{ fatigue:10 } },
        ]},
    ],
    post: [
      { icon:'📰', badge:'RUEDA DE PRENSA', title:'El periodista pregunta: ¿Qué opinás del partido?',
        opts:[
          { id:'praise',  icon:'👏', label:'Elogiar\nal rival',        desc:'+deportividad', bonus:{ rep:1 } },
          { id:'honest',  icon:'😎', label:'Fuimos\nsuperiores',       desc:'+confianza',    bonus:{ rep:2 } },
          { id:'team',    icon:'🤝', label:'El mérito\nes del equipo', desc:'+moral',        bonus:{ morale:2 } },
          { id:'spicy',   icon:'😤', label:'Ellos\ntuvieron suerte',   desc:'Polémico',      bonus:{ morale:3, rep:-1 } },
        ]},
      { icon:'🏋️', badge:'POST-ENTRENAMIENTO', title:'¿Qué hacés después del partido?',
        opts:[
          { id:'shoot',   icon:'⚽', label:'Practicar\ntiros',         desc:'+remate',    bonus:{ attr:'shooting', val:2 } },
          { id:'pool',    icon:'🏊', label:'Recuperación\nen piscina', desc:'+energía',   bonus:{ fatigue:20 } },
          { id:'gym',     icon:'💪', label:'Trabajo\nde fuerza',       desc:'+físico',    bonus:{ attr:'physical', val:2 } },
          { id:'film',    icon:'📹', label:'Analizar\ntu partido',     desc:'+visión',    bonus:{ attr:'passing',  val:2 } },
        ]},
    ],
  };

  // ── Calculate pct for option ──────────────────────────────
  function calcPct(base, player, attrKey) {
    const attrVal = player && attrKey ? (player.attributes[attrKey] || 65) : 65;
    const fatigue  = player ? (player.fatigue  || 80) : 80;
    const attrMod  = (attrVal - 60) * 0.45;
    const fatMod   = -(100 - fatigue) * 0.07;
    return Math.min(94, Math.max(6, Math.round(base + attrMod + fatMod)));
  }

  function pctClass(p) { return p >= 62 ? 'pct-high' : p >= 40 ? 'pct-mid' : 'pct-low'; }

  // ── Render goal grid ──────────────────────────────────────
  function renderGoalGrid(player, isPenalty) {
    const gkHint = GK_HINTS[Math.floor(Math.random() * GK_HINTS.length)];
    const penBonus = isPenalty ? 22 : 0;
    const attrVal = player ? (player.attributes.shooting || 65) : 65;
    const fatigue  = player ? (player.fatigue || 80) : 80;
    const attrMod  = (attrVal - 60) * 0.4;
    const fatMod   = -(100 - fatigue) * 0.07;

    const zones = GOAL_ZONES.map(z => {
      const vulnBonus = gkHint.vuln.includes(z.id) ? +20 : -8;
      const pct = Math.min(94, Math.max(6, Math.round(z.base + attrMod + fatMod + vulnBonus + penBonus)));
      return { ...z, pct };
    });

    return `
      <div class="goal-wrapper">
        <div class="gk-hint">
          <span class="gk-icon">🧤</span>
          <span>${gkHint.text}</span>
        </div>
        <div class="goal-net-frame">
          <div class="goal-posts-top">
            <span>▌</span><div class="goal-crossbar"></div><span>▐</span>
          </div>
          <div class="goal-grid">
            ${zones.map(z => `
              <button class="goal-zone" data-choice="${z.id}" data-pct="${z.pct}">
                <span class="gz-arrow">${z.arrow}</span>
                <span class="gz-label">${z.label}</span>
                <span class="gz-pct ${pctClass(z.pct)}">${z.pct}%</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>`;
  }

  // ── Render standard options ───────────────────────────────
  function renderOptions(options, player, attrKey) {
    const n = options.length;
    const gridClass = n <= 2 ? 'grid-2' : n === 3 ? 'grid-3' : 'grid-4';
    return `<div class="decision-options ${gridClass}">
      ${options.map(opt => {
        const pct = calcPct(opt.basePct, player, attrKey);
        const pc  = pctClass(pct);
        return `<button class="decision-btn" data-choice="${opt.id}" data-pct="${pct}">
          <span class="dopt-icon">${opt.icon}</span>
          <span class="dopt-label">${opt.label.replace(/\n/g,'<br>')}</span>
          <div class="dopt-bar"><div class="dopt-bar-fill ${pc}" style="width:${pct}%"></div></div>
          <span class="dopt-pct ${pc}">${pct}%</span>
        </button>`;
      }).join('')}
    </div>`;
  }

  // ── Build full decision HTML ──────────────────────────────
  function buildHTML(dec, player) {
    const isGrid    = dec.subtype === 'goal_grid' || dec.subtype === 'penalty_grid';
    const isPenalty = dec.subtype === 'penalty_grid';
    const body      = isGrid ? renderGoalGrid(player, isPenalty) : renderOptions(dec.options || [], player, dec.attr);
    return `
      <div class="decision-card">
        <div class="dec-header">
          <div class="dec-icon">${dec.icon}</div>
          <div class="dec-meta">
            <span class="dec-badge">${dec.badge}</span>
            <p class="dec-scenario">${dec.scenario}</p>
          </div>
          <div class="dec-timer-wrap">
            <svg class="timer-ring" viewBox="0 0 44 44">
              <circle class="ring-bg"   cx="22" cy="22" r="16"/>
              <circle class="ring-fill" cx="22" cy="22" r="16" id="drfill"
                stroke-dasharray="${CIRCUM} ${CIRCUM}" stroke-dashoffset="0"/>
            </svg>
            <span class="timer-num" id="dnum">${_seconds}</span>
          </div>
        </div>
        ${body}
      </div>`;
  }

  // ── Timer ─────────────────────────────────────────────────
  function startTimer(autoFn, totalSec) {
    const fill = document.getElementById('drfill');
    const num  = document.getElementById('dnum');
    _timer = setInterval(() => {
      _seconds--;
      if (num)  num.textContent = _seconds;
      if (fill) fill.style.strokeDashoffset = CIRCUM * (1 - _seconds / totalSec);
      if (_seconds <= 3 && num) num.classList.add('timer-urgent');
      if (_seconds <= 0) { clearInterval(_timer); autoFn(); }
    }, 1000);
  }

  // ── Result flash ──────────────────────────────────────────
  function flashResult(btn, success) {
    btn.classList.add(success ? 'dec-success' : 'dec-fail');
    const lbl = document.createElement('div');
    lbl.className = 'dec-result-lbl';
    lbl.textContent = success ? '✓ ¡ÉXITO!' : '✗ FALLIDO';
    btn.appendChild(lbl);
  }

  // ── Main prompt ───────────────────────────────────────────
  function prompt(decision, player, seconds = 9) {
    return new Promise(res => {
      _resolve = res;
      _seconds = seconds;
      clearInterval(_timer);

      const overlay = document.getElementById('decision-overlay');
      const content = document.getElementById('decision-content');
      if (!overlay || !content) { res({ choice:'auto', success: Math.random() > 0.45 }); return; }

      content.innerHTML = buildHTML(decision, player);
      overlay.classList.remove('hidden');

      const totalSec = seconds;
      const btns = [...overlay.querySelectorAll('.decision-btn, .goal-zone')];

      function choose(btn) {
        clearInterval(_timer);
        btns.forEach(b => { b.disabled = true; b.style.opacity = b === btn ? '1' : '0.35'; });
        const choice  = btn.dataset.choice;
        const pct     = parseInt(btn.dataset.pct) || 50;
        const success = Math.random() * 100 < pct;
        flashResult(btn, success);
        setTimeout(() => {
          overlay.classList.add('hidden');
          _resolve({ choice, success, pct });
        }, 950);
      }

      btns.forEach(btn => btn.addEventListener('click', () => choose(btn)));

      startTimer(() => {
        const rnd = btns[Math.floor(Math.random() * btns.length)];
        if (rnd) choose(rnd);
      }, totalSec);
    });
  }

  function hide() {
    clearInterval(_timer);
    const ov = document.getElementById('decision-overlay');
    if (ov) ov.classList.add('hidden');
  }

  // ── Between-match prompt ──────────────────────────────────
  function promptBetween(type, callback) {
    const pool = BETWEEN[type] || BETWEEN.pre;
    const dec  = pool[Math.floor(Math.random() * pool.length)];
    const html = `
      <div class="between-card">
        <div class="between-header">
          <span class="between-icon">${dec.icon}</span>
          <span class="dec-badge">${dec.badge}</span>
        </div>
        <p class="between-title">${dec.title}</p>
        <div class="decision-options grid-2">
          ${dec.opts.map(o => `
            <button class="decision-btn between-btn" data-bonus='${JSON.stringify(o.bonus||{})}'>
              <span class="dopt-icon">${o.icon}</span>
              <span class="dopt-label">${o.label.replace(/\n/g,'<br>')}</span>
              <span class="between-desc">${o.desc}</span>
            </button>
          `).join('')}
        </div>
      </div>`;
    GameUI.showModal(html);
    document.querySelectorAll('.between-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        let bonus = {};
        try { bonus = JSON.parse(btn.dataset.bonus || '{}'); } catch(e){}
        GameUI.hideModal();
        if (callback) callback(bonus);
      });
    });
  }

  // ── Get random match decision for position ────────────────
  function getForPosition(pos) {
    const pool = MATCH[pos] || MATCH.CM;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return { prompt, hide, promptBetween, getForPosition, MATCH };
})();
