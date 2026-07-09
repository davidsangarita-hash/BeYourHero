/* ============================================================
   BE YOUR HERO v2 – decisions.js (v3.0)
   • Fixed decisions that weren't resolving
   • Visual goal SVG with goalkeeper
   • 30+ position-specific decisions
   • Between-match decisions
   ============================================================ */

const DecisionEngine = (() => {
  let _timer   = null;
  let _seconds = 0;
  const CIRCUM = 2 * Math.PI * 16;

  // ── Goal Zones 3×3 ──────────────────────────────────────
  const GOAL_ZONES = [
    { id:'tl', row:0, col:0, label:'Alto\nIzq',    arrow:'↖', base:32 },
    { id:'tc', row:0, col:1, label:'Alto\nCentro',  arrow:'↑', base:36 },
    { id:'tr', row:0, col:2, label:'Alto\nDer',     arrow:'↗', base:32 },
    { id:'ml', row:1, col:0, label:'Medio\nIzq',    arrow:'←', base:44 },
    { id:'mc', row:1, col:1, label:'Centro',         arrow:'⊕', base:20 },
    { id:'mr', row:1, col:2, label:'Medio\nDer',    arrow:'→', base:44 },
    { id:'bl', row:2, col:0, label:'Bajo\nIzq',     arrow:'↙', base:52 },
    { id:'bc', row:2, col:1, label:'Bajo\nCentro',  arrow:'↓', base:36 },
    { id:'br', row:2, col:2, label:'Bajo\nDer',     arrow:'↘', base:52 },
  ];

  const GK_HINTS = [
    { text:'El portero está centrado',          vuln:['tl','tr','bl','br'] },
    { text:'Cubre su derecha (tu izquierda)',    vuln:['mr','br','tr'] },
    { text:'Cubre su izquierda (tu derecha)',    vuln:['ml','bl','tl'] },
    { text:'Anticipa pelota baja',               vuln:['tl','tc','tr'] },
    { text:'Se adelanta — tirá al suelo',        vuln:['tl','tc','tr','mc'] },
    { text:'Cubre los palos — buscá el centro', vuln:['mc','ml','mr'] },
  ];

  // ── Match Decisions by Position ─────────────────────────
  const MATCH = {
    ST: [
      { type:'shot',    icon:'🎯', badge:'DISPARO AL ARCO',   scenario:'Recibes el balón dentro del área. ¡Un segundo para disparar!',            attr:'shooting',  subtype:'goal_grid' },
      { type:'header',  icon:'🏹', badge:'CABEZAZO',          scenario:'Centro al área. Vas de frente. ¿Cuándo y cómo cabeceás?',                 attr:'physical',  options:[
          { id:'early',  icon:'⬆', label:'Anticipar\nel salto',    basePct:46 },
          { id:'timed',  icon:'✅', label:'Saltar\na tiempo',       basePct:70 },
          { id:'power',  icon:'💪', label:'Empujar\ncon fuerza',    basePct:54 },
          { id:'flick',  icon:'↩', label:'Desviar\nde cabeza',     basePct:38 },
      ]},
      { type:'duel',    icon:'⚡', badge:'DUELO EN ÁREA',     scenario:'Cara a cara con el central. ¿Cómo encarás?',                               attr:'dribbling', options:[
          { id:'left',   icon:'◀', label:'Encarar\nizquierda',     basePct:55 },
          { id:'right',  icon:'▶', label:'Encarar\nderecha',       basePct:55 },
          { id:'nutmeg', icon:'🌀', label:'Caño',                  basePct:30 },
          { id:'layoff', icon:'↙', label:'Dar y\ncontinuar',       basePct:72 },
      ]},
      { type:'first',   icon:'🦶', badge:'PRIMER TOQUE',      scenario:'Pase largo. El defensa llega. ¿Primer toque?',                             attr:'dribbling', options:[
          { id:'control',icon:'🔄', label:'Controlar\ny girar',    basePct:62 },
          { id:'flick',  icon:'👟', label:'Dar de\ntalón',         basePct:40 },
          { id:'volley', icon:'💥', label:'Volear\ndirecto',       basePct:30 },
          { id:'layoff', icon:'↩', label:'Tocar atrás',            basePct:76 },
      ]},
      { type:'penalty', icon:'⚽', badge:'¡PENALTI!',         scenario:'El árbitro señala el punto. Todos esperan. El portero espera tu decisión.', attr:'shooting',  subtype:'penalty_grid' },
      { type:'run',     icon:'🏃', badge:'TIMING DE CARRERA', scenario:'¿Cuándo arrancás la carrera en profundidad?',                              attr:'pace',      options:[
          { id:'early',  icon:'💨', label:'Arrancar\nantes',        basePct:48 },
          { id:'perfect',icon:'⚡', label:'Timing\nperfecto',       basePct:72 },
          { id:'late',   icon:'🐢', label:'Esperar\ny explotar',    basePct:44 },
          { id:'decoy',  icon:'🌀', label:'Hacer\nel señuelo',      basePct:58 },
      ]},
      { type:'freekick',icon:'🌙', badge:'TIRO LIBRE',        scenario:'Tiro libre a 22 metros. ¿Cómo pegás?',                                    attr:'shooting',  options:[
          { id:'curve',  icon:'🌙', label:'Curva\nal poste',        basePct:48 },
          { id:'power',  icon:'💥', label:'Potencia\nal medio',     basePct:40 },
          { id:'chip',   icon:'⬆', label:'Globito\npor arriba',    basePct:36 },
          { id:'cross',  icon:'📐', label:'Pase al\nárea',          basePct:68 },
      ]},
    ],

    LW: [
      { type:'cross',   icon:'📐', badge:'CENTRO AL ÁREA',    scenario:'Llegás por la banda con ventaja. ¿Cómo centrás?',                          attr:'passing',   options:[
          { id:'low',    icon:'↘', label:'Centro\nraso',            basePct:66 },
          { id:'driven', icon:'⚡', label:'Pase\ntenso',            basePct:58 },
          { id:'lob',    icon:'⬆', label:'Centro\nlobado',          basePct:50 },
          { id:'cutback',icon:'↩', label:'Recortar\nal segundo palo',basePct:62 },
      ]},
      { type:'dribble', icon:'💨', badge:'DRIBBLING EN BANDA', scenario:'El lateral te cierra. Tenés un metro de espacio.',                          attr:'dribbling', options:[
          { id:'outside',icon:'↗', label:'Finta\nafuera',           basePct:60 },
          { id:'inside', icon:'↙', label:'Corte\nadentro',          basePct:64 },
          { id:'elastico',icon:'🌀',label:'Elástico',               basePct:38 },
          { id:'pass',   icon:'→', label:'Dar y\npedir',            basePct:72 },
      ]},
      { type:'shot',    icon:'🎯', badge:'DISPARO',            scenario:'Cortaste y quedaste frente al arco. ¡Ahora!',                              attr:'shooting',  subtype:'goal_grid' },
    ],

    RW: [
      { type:'cross',   icon:'📐', badge:'CENTRO AL ÁREA',    scenario:'Por la derecha con espacio. ¿Centrás o recortás?',                          attr:'passing',   options:[
          { id:'low',    icon:'↙', label:'Centro\nraso',            basePct:66 },
          { id:'driven', icon:'⚡', label:'Pase\ntenso',            basePct:58 },
          { id:'lob',    icon:'⬆', label:'Centro\nlobado',          basePct:50 },
          { id:'cutback',icon:'↩', label:'Recortar',                basePct:62 },
      ]},
      { type:'shot',    icon:'🎯', badge:'DISPARO',            scenario:'Espacio en el área. ¡Tu oportunidad!',                                     attr:'shooting',  subtype:'goal_grid' },
      { type:'dribble', icon:'💨', badge:'DRIBBLING',          scenario:'El lateral derecho te encaró. ¿Qué hacés?',                               attr:'dribbling', options:[
          { id:'inside', icon:'↙', label:'Corte\ninterior',         basePct:64 },
          { id:'outside',icon:'↗', label:'Finta\npor afuera',       basePct:58 },
          { id:'speed',  icon:'💨', label:'Velocidad\npura',        basePct:56 },
          { id:'pass',   icon:'→', label:'Combinación\ncorta',      basePct:70 },
      ]},
    ],

    CAM: [
      { type:'through', icon:'📐', badge:'PASE DECISIVO',     scenario:'Ves el espacio entre los centrales. ¿Mandás el pase filtrado?',             attr:'passing',   options:[
          { id:'ground', icon:'→', label:'Pase raso\npreciso',      basePct:62 },
          { id:'lob',    icon:'⬆', label:'Pase\nlobado',            basePct:50 },
          { id:'lay',    icon:'↩', label:'Mover\nla pelota',        basePct:74 },
          { id:'shoot',  icon:'🎯', label:'Disparar\ntú mismo',     basePct:44 },
      ]},
      { type:'shot',    icon:'🎯', badge:'DISPARO LEJANO',    scenario:'Espacio fuera del área. ¿La intentás desde lejos?',                         attr:'shooting',  subtype:'goal_grid' },
      { type:'dribble', icon:'⚡', badge:'GAMBETA',           scenario:'El mediocampista rival te presiona en el círculo central.',                  attr:'dribbling', options:[
          { id:'turn',   icon:'🔄', label:'Girar\ny proteger',      basePct:68 },
          { id:'dribble',icon:'💨', label:'Driblar\ny avanzar',     basePct:52 },
          { id:'quick',  icon:'⚡', label:'Toque\nrápido',          basePct:72 },
          { id:'switch', icon:'↔', label:'Cambiar\nflancos',        basePct:64 },
      ]},
      { type:'freekick',icon:'🌙', badge:'TIRO LIBRE',        scenario:'Tiro libre en posición privilegiada. ¿Cómo ejecutás?',                     attr:'shooting',  options:[
          { id:'curve',  icon:'🌙', label:'Curva\nal palo',          basePct:52 },
          { id:'power',  icon:'💥', label:'Disparo\nrasante',        basePct:44 },
          { id:'wall',   icon:'⬆', label:'Por\nencima del muro',    basePct:40 },
          { id:'pass',   icon:'📐', label:'Pase al\nárea',           basePct:72 },
      ]},
    ],

    CM: [
      { type:'press',   icon:'💪', badge:'PRESIÓN ALTA',      scenario:'El equipo rival tiene la pelota en su zona defensiva. ¿Presionás?',         attr:'physical',  options:[
          { id:'press',  icon:'▶', label:'Presión\nintensa',         basePct:58 },
          { id:'block',  icon:'🧱', label:'Bloquear\npasillo',       basePct:66 },
          { id:'hold',   icon:'🛡', label:'Mantener\nforma',         basePct:76 },
          { id:'intercept',icon:'✂',label:'Interceptar',             basePct:42 },
      ]},
      { type:'pass',    icon:'📐', badge:'DISTRIBUCIÓN',      scenario:'Tenés la pelota en el centro del campo. ¿Cómo iniciás el ataque?',         attr:'passing',   options:[
          { id:'through',icon:'⚡', label:'Pase\nfiltrado',          basePct:52 },
          { id:'wide',   icon:'↔', label:'Cambiar\nel juego',        basePct:68 },
          { id:'forward',icon:'⬆', label:'Pase\nal delantero',       basePct:60 },
          { id:'back',   icon:'↩', label:'Retener\ny buscar',        basePct:80 },
      ]},
      { type:'shot',    icon:'🎯', badge:'DISPARO LEJANO',    scenario:'La pelota cae en tu pie a 25 metros. ¡Está sola!',                         attr:'shooting',  subtype:'goal_grid' },
      { type:'tackle',  icon:'🦵', badge:'RECUPERACIÓN',      scenario:'El rival conduce hacia tu área. Tenés que pararlo.',                        attr:'defending', options:[
          { id:'jockey', icon:'↩', label:'Temporizar',               basePct:70 },
          { id:'slide',  icon:'🦵', label:'Entrada\nbaja',           basePct:50 },
          { id:'stand',  icon:'🛡', label:'Ponerse\ndelante',         basePct:64 },
          { id:'foul',   icon:'⚠', label:'Falta\ntáctica',           basePct:72 },
      ]},
    ],

    CDM: [
      { type:'intercept',icon:'✂', badge:'INTERCEPCÍON',      scenario:'El rival busca un pase vertical. ¿Lo interceptás?',                         attr:'defending', options:[
          { id:'step',   icon:'⬆', label:'Adelantar\nun paso',       basePct:56 },
          { id:'read',   icon:'🧠', label:'Leer\nla jugada',         basePct:70 },
          { id:'wait',   icon:'🛡', label:'Esperar\ny tapar',         basePct:74 },
          { id:'pressure',icon:'▶',label:'Presión\ninmediata',       basePct:54 },
      ]},
      { type:'tackle',  icon:'🦵', badge:'ENTRADA DECISIVA',  scenario:'El delantero rival encaró solo. ¡Es tu momento!',                          attr:'defending', options:[
          { id:'slide',  icon:'🦵', label:'Entrada\nbaja',           basePct:52 },
          { id:'block',  icon:'🧱', label:'Blocar\ncon el cuerpo',   basePct:64 },
          { id:'jockey', icon:'↩', label:'Temporizar',               basePct:72 },
          { id:'foul',   icon:'⚠', label:'Parar\nla jugada',         basePct:68 },
      ]},
      { type:'pass',    icon:'📐', badge:'SALIDA LIMPIA',     scenario:'La pelota llegó del defensa. Hay presión. ¿Qué hacés?',                   attr:'passing',   options:[
          { id:'short',  icon:'→', label:'Pase corto\nal lateral',   basePct:80 },
          { id:'switch', icon:'↔', label:'Cambio\nde frente',        basePct:62 },
          { id:'carry',  icon:'⬆', label:'Conducir\ny avanzar',      basePct:52 },
          { id:'long',   icon:'🚀', label:'Pelotazo\nal ataque',      basePct:46 },
      ]},
    ],

    LB: [
      { type:'overlap', icon:'🏃', badge:'LATERAL IZQUIERDO',  scenario:'Tenés espacio en la banda. ¿Te proyectás hacia adelante?',                 attr:'pace',      options:[
          { id:'overlap',icon:'⬆', label:'Subir al\noverlap',        basePct:60 },
          { id:'stay',   icon:'🛡', label:'Mantener\nposición',       basePct:86 },
          { id:'cross',  icon:'📐', label:'Centro\ndirecto',          basePct:50 },
          { id:'cut',    icon:'↩', label:'Cortar\nadentro',           basePct:44 },
      ]},
      { type:'defend',  icon:'🛡', badge:'DUELO EN BANDA',     scenario:'El extremo derecho rival te encaró. Decidís rápido.',                      attr:'defending', options:[
          { id:'jockey', icon:'↩', label:'Temporizar',               basePct:68 },
          { id:'tackle', icon:'🦵', label:'Entrada\ndeslizante',     basePct:50 },
          { id:'pressure',icon:'▶',label:'Presión\nalta',            basePct:54 },
          { id:'foul',   icon:'⚠', label:'Falta\ntáctica',           basePct:64 },
      ]},
    ],

    RB: [
      { type:'overlap', icon:'🏃', badge:'LATERAL DERECHO',    scenario:'Tenés espacio en la banda derecha.',                                        attr:'pace',      options:[
          { id:'overlap',icon:'⬆', label:'Subir al\noverlap',        basePct:60 },
          { id:'stay',   icon:'🛡', label:'Mantener\nposición',       basePct:86 },
          { id:'cross',  icon:'📐', label:'Centro\nen profundidad',   basePct:48 },
          { id:'chip',   icon:'🌙', label:'Centro\nlobado',           basePct:42 },
      ]},
      { type:'defend',  icon:'🛡', badge:'DUELO EN BANDA',     scenario:'El extremo izquierdo rival te encaró.',                                    attr:'defending', options:[
          { id:'jockey', icon:'↩', label:'Temporizar',               basePct:68 },
          { id:'tackle', icon:'🦵', label:'Entrada\ndeslizante',     basePct:50 },
          { id:'pressure',icon:'▶',label:'Presión\nalta',            basePct:54 },
          { id:'foul',   icon:'⚠', label:'Falta\ntáctica',           basePct:64 },
      ]},
    ],

    CB: [
      { type:'aerial',  icon:'🏹', badge:'DUELO AÉREO',        scenario:'Balón largo al delantero rival. ¿Cómo defendés?',                          attr:'physical',  options:[
          { id:'early',  icon:'⬆', label:'Anticipar\nel salto',      basePct:56 },
          { id:'body',   icon:'🧱', label:'Bloquear\ncon cuerpo',     basePct:66 },
          { id:'clear',  icon:'💨', label:'Despejar\nlargo',          basePct:72 },
          { id:'intercept',icon:'✂',label:'Interceptar\ntrayectoria',basePct:46 },
      ]},
      { type:'oneone',  icon:'⚔', badge:'UNO A UNO',           scenario:'¡El delantero quedó solo frente a vos!',                                   attr:'defending', options:[
          { id:'slide',  icon:'🦵', label:'Entrada\nbaja',            basePct:50 },
          { id:'stand',  icon:'🛡', label:'Esperar\nsu movimiento',   basePct:68 },
          { id:'push',   icon:'→', label:'Empujar\nfuera del área',  basePct:54 },
          { id:'sprint', icon:'💨', label:'Sprint\na despejar',       basePct:46 },
      ]},
      { type:'buildup', icon:'📐', badge:'SALIDA DESDE ATRÁS', scenario:'El portero te da el balón. Presionan alto. ¿Qué hacés?',                   attr:'passing',   options:[
          { id:'short',  icon:'→', label:'Pase corto\nal lateral',   basePct:78 },
          { id:'long',   icon:'🚀', label:'Pelotazo\npreciso',       basePct:48 },
          { id:'carry',  icon:'⬆', label:'Conducir\ny avanzar',      basePct:54 },
          { id:'back',   icon:'↙', label:'Devolver\nal portero',     basePct:90 },
      ]},
    ],

    GK: [
      { type:'save',    icon:'🧤', badge:'¡ATAJADA!',          scenario:'¡El rival dispara! Tenés milésimas para reaccionar.',                       attr:'physical',  options:[
          { id:'left',   icon:'⬅', label:'Lanzarse\nizquierda',       basePct:50 },
          { id:'right',  icon:'➡', label:'Lanzarse\nderecha',         basePct:50 },
          { id:'center', icon:'⊙', label:'Quedarse\nal centro',       basePct:36 },
          { id:'tip',    icon:'⬆', label:'Desviar\nal córner',        basePct:44 },
      ]},
      { type:'dist',    icon:'⚽', badge:'DISTRIBUCIÓN',        scenario:'Tenés el balón. El rival presiona. ¿Cómo iniciás?',                        attr:'passing',   options:[
          { id:'throw',  icon:'→', label:'Lanzar corto\nal lateral',  basePct:82 },
          { id:'kick',   icon:'🚀', label:'Pelotazo\nlargo',          basePct:54 },
          { id:'roll',   icon:'↙', label:'Rodar\nal defensa',         basePct:78 },
          { id:'dribble',icon:'⬆', label:'Salir\ncon la pelota',      basePct:40 },
      ]},
      { type:'cross',   icon:'🏹', badge:'PELOTA PARADA',       scenario:'Córner del rival. ¿Cómo comandás el área?',                               attr:'physical',  options:[
          { id:'punch',  icon:'💪', label:'Puñetazo\nlejos',          basePct:64 },
          { id:'catch',  icon:'🧤', label:'Atrapar\nel balón',        basePct:52 },
          { id:'push',   icon:'→', label:'Sacar\ncon el cuerpo',     basePct:58 },
          { id:'claim',  icon:'⬆', label:'Saltar\ny reclamar',       basePct:60 },
      ]},
      { type:'penalty_gk',icon:'🧤',badge:'PENALTI EN CONTRA', scenario:'¡El rival va a patear el penalti! ¿Hacia dónde te lanzás?',               attr:'physical',  options:[
          { id:'left',   icon:'⬅', label:'Lanzarse\na la izquierda', basePct:42 },
          { id:'right',  icon:'➡', label:'Lanzarse\na la derecha',   basePct:42 },
          { id:'wait',   icon:'⊙', label:'Esperar\nel tiro',         basePct:22 },
          { id:'read',   icon:'🧠', label:'Leer\nla carrera',        basePct:34 },
      ]},
    ],
  };

  // ── Between-match scenarios ──────────────────────────────
  const BETWEEN = {

    // ── Always shown after match ─────────────────────────
    training: [
      { icon:'🏋', badge:'POST-ENTRENAMIENTO', title:'Partido terminado. ¿Cómo usás el tiempo del día?',
        opts:[
          { id:'shoot',   icon:'⚽', label:'Practicar\ntiros extra',      desc:'+2 Remate',          bonus:{"attr":"shooting","val":2} },
          { id:'pool',    icon:'🏊', label:'Recuperación\nen piscina',  desc:'+Energía',           bonus:{"fatigue":22} },
          { id:'gym',     icon:'💪', label:'Trabajo\nde fuerza',          desc:'+2 Físico',           bonus:{"attr":"physical","val":2} },
          { id:'film',    icon:'📹', label:'Analizar\nmi partido',         desc:'+2 Pase',             bonus:{"attr":"passing","val":2} },
        ]},
      { icon:'🧘', badge:'RECUPERACIÓN', title:'El cuerpo lo dio todo. ¿Cómo te recuperás?',
        opts:[
          { id:'ice',     icon:'🧊', label:'Baño de\nhielo',               desc:'+Recuperación',      bonus:{"fatigue":25} },
          { id:'stretch', icon:'🤸', label:'Estiramiento\nprofundo',         desc:'+Físico +Energía', bonus:{"attr":"physical","val":1,"fatigue":12} },
          { id:'sleep',   icon:'😴', label:'Dormir\nbien',                   desc:'+Energía ++',         bonus:{"fatigue":30} },
          { id:'drills',  icon:'⚡',    label:'Ejercicios\neo técnicos',     desc:'+Velocidad',          bonus:{"attr":"pace","val":1} },
        ]},
      { icon:'🍽', badge:'NUTRICIÓN', title:'Tu nutricionista te espera. ¿Qué decídis?',
        opts:[
          { id:'protein', icon:'🥩', label:'Dieta de\nproteínas',          desc:'+Físico',             bonus:{"attr":"physical","val":1} },
          { id:'carbs',   icon:'🍝', label:'Carbohidratos\npara mañana',   desc:'+Energía',            bonus:{"fatigue":18} },
          { id:'full',    icon:'🥗', label:'Dieta\ncompleta',                 desc:'+Energía +Físico',  bonus:{"attr":"physical","val":1,"fatigue":10} },
          { id:'cheat',   icon:'🍕', label:'Comer\nlo que quiero',             desc:'+Moral',               bonus:{"morale":2} },
        ]},
    ],

    // ── Press conference — only after MVP / big win / captain ──
    press_win: [
      { icon:'🎤', badge:'RUEDA DE PRENSA — VICTORIA', title:'El periodista te apunta el micrófono. Ganaron. ¿Qué decís?',
        opts:[
          { id:'team',   icon:'🤝', label:'El mérito\nes del equipo',    desc:'+Moral del grupo',     bonus:{"morale":2} },
          { id:'honest', icon:'😎', label:'Fuimos\nclaramente mejores',      desc:'+Reputación',       bonus:{"rep":2} },
          { id:'praise', icon:'👏', label:'Reconocer\nal rival',             desc:'+Deportividad',         bonus:{"rep":1,"morale":1} },
          { id:'fire',   icon:'🔥', label:'¡Solo\nestamos empezando!',   desc:'+Moral ++',             bonus:{"morale":3} },
        ]},
      { icon:'📸', badge:'FOTO DE VICTORIA', title:'Te piden para la foto de campeones. ¿Cómo reaccionás?',
        opts:[
          { id:'lead',   icon:'🏆', label:'Al frente\ncon el trofeo',        desc:'+Reputación ++',     bonus:{"rep":3} },
          { id:'team',   icon:'🤝', label:'Con todo\nel equipo',             desc:'+Moral',               bonus:{"morale":2} },
          { id:'humble', icon:'😊', label:'Con humildad\nal fondo',          desc:'+Imagen positiva',      bonus:{"rep":1} },
          { id:'skip',   icon:'🏃', label:'Evitás\nlos flashes',        desc:'Ninguno',               bonus:{} },
        ]},
    ],

    // ── Press conference after defeat ──────────────────────
    press_loss: [
      { icon:'🎤', badge:'RUEDA DE PRENSA — DERROTA', title:'Perdieron. El periodista insiste. ¿Qué decís?',
        opts:[
          { id:'own',    icon:'🙏', label:'Asumir la\nresponsabilidad',      desc:'+Respeto',             bonus:{"rep":2} },
          { id:'team',   icon:'🛡', label:'Defender\nal equipo',             desc:'+Moral del grupo',     bonus:{"morale":2} },
          { id:'angry',  icon:'😡', label:'El árbitro fue\nuna verguenza', desc:'Polémico 🌶',  bonus:{"morale":1,"rep":-2} },
          { id:'silent', icon:'🤐', label:'Sin\ncomentarios',                desc:'Neutral',              bonus:{} },
        ]},
    ],

    // ── Pre-match (shown before starting match) ────────────
    pre: [
      { icon:'🎯', badge:'PREPARACIÓN PRE-PARTIDO', title:'¿Cómo te preparás para el partido de hoy?',
        opts:[
          { id:'focus',  icon:'🧘', label:'Concentración\ntotal',        desc:'+2 Remate',            bonus:{"attr":"shooting","val":2} },
          { id:'video',  icon:'📹', label:'Ver vídeo\ndel rival',         desc:'+2 Pase',              bonus:{"attr":"passing","val":2} },
          { id:'sprint', icon:'🏃', label:'Entrada en\ncalor intensa',        desc:'+2 Velocidad',         bonus:{"attr":"pace","val":2} },
          { id:'rest',   icon:'😴', label:'Descansar\ny relajarse',           desc:'+Energía',         bonus:{"fatigue":15} },
        ]},
      { icon:'🗣', badge:'CHARLA TÉCNICA', title:'El técnico pregunta: ¿Cómo te sentís para el partido?',
        opts:[
          { id:'great',  icon:'💪', label:'Al 100%,\nlisto',                 desc:'+Moral',               bonus:{"morale":2} },
          { id:'ok',     icon:'😐', label:'Bien,\nnormal',                   desc:'Sin cambios',          bonus:{} },
          { id:'fired',  icon:'🔥', label:'¡Quiero\nreventar!',           desc:'+Moral ++',            bonus:{"morale":3} },
          { id:'sore',   icon:'🩹', label:'Molestia\npero juego',             desc:'-Moral',               bonus:{"morale":-1} },
        ]},
    ],
  };

  function calcPct(base, player, attrKey) {
    const attrVal = player && attrKey ? (player.attributes[attrKey] || 65) : 65;
    const fatigue  = player ? (player.fatigue  || 80) : 80;
    const attrMod  = (attrVal - 60) * 0.45;
    const fatMod   = -(100 - fatigue) * 0.07;
    return Math.min(94, Math.max(6, Math.round(base + attrMod + fatMod)));
  }

  function pctClass(p) { return p >= 62 ? 'pct-high' : p >= 40 ? 'pct-mid' : 'pct-low'; }

  // ── Render visual goal grid (zones embedded in SVG) ──
  function renderGoalGrid(player, isPenalty) {
    const gkHint   = GK_HINTS[Math.floor(Math.random() * GK_HINTS.length)];
    const penBonus = isPenalty ? 22 : 0;
    const attrVal  = player ? (player.attributes.shooting || 65) : 65;
    const fatigue  = player ? (player.fatigue || 80) : 80;
    const attrMod  = (attrVal - 60) * 0.4;
    const fatMod   = -(100 - fatigue) * 0.07;

    const zones = GOAL_ZONES.map(function(z) {
      const vBonus = gkHint.vuln.includes(z.id) ? +20 : -8;
      const pct    = Math.min(94, Math.max(6, Math.round(z.base + attrMod + fatMod + vBonus + penBonus)));
      return Object.assign({}, z, { pct: pct });
    });

    // GK position based on vulnerability
    var vuln = gkHint.vuln;
    var gkX  = 150;
    if (vuln.includes('mr') && !vuln.includes('ml')) gkX = 110;
    if (vuln.includes('ml') && !vuln.includes('mr')) gkX = 190;
    var gkY  = 52;
    if (vuln.some(function(v){ return ['tl','tc','tr'].includes(v); }) &&
       !vuln.some(function(v){ return ['bl','bc','br'].includes(v); })) gkY = 40;
    if (vuln.some(function(v){ return ['bl','bc','br'].includes(v); }) &&
       !vuln.some(function(v){ return ['tl','tc','tr'].includes(v); })) gkY = 62;
    var armLY = vuln.includes('ml') ? gkY - 4 : gkY + 8;
    var armRY = vuln.includes('mr') ? gkY - 4 : gkY + 8;

    var pc = function(p) { return p >= 62 ? '#22dd88' : p >= 40 ? '#ffaa22' : '#ff5555'; };

    // ── Goal interior zone layout (SVG coords) ──────────
    // Goal: left post x=29, right post x=271, crossbar y=13, ground y=80
    // Interior: w=242, h=67 → each zone ~80.7×22.3
    var ZX0=29, ZW=242, ZY0=13, ZH=67;
    var cw=ZW/3, ch=ZH/3;

    // ── Net lines ──────────────────────────────────────
    var netV='', netH='';
    for (var i=0;i<=14;i++) netV+='<line x1="'+(ZX0+i*(ZW/14))+'" y1="'+ZY0+'" x2="'+(ZX0+i*(ZW/14))+'" y2="80" stroke="rgba(255,255,255,0.045)" stroke-width="0.6"/>';
    for (var j=0;j<=5;j++)  netH+='<line x1="'+ZX0+'" y1="'+(ZY0+j*(ZH/5))+'" x2="'+(ZX0+ZW)+'" y2="'+(ZY0+j*(ZH/5))+'" stroke="rgba(255,255,255,0.045)" stroke-width="0.6"/>';

    // ── Zone dividers (visible lines on the goal) ──────
    // Vertical dividers at 1/3 and 2/3
    var v1=ZX0+cw, v2=ZX0+2*cw;
    // Horizontal divider at 1/3 and 2/3
    var h1=ZY0+ch, h2=ZY0+2*ch;
    var dividers =
      '<line x1="'+v1+'" y1="'+ZY0+'" x2="'+v1+'" y2="80" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" stroke-dasharray="2,2"/>' +
      '<line x1="'+v2+'" y1="'+ZY0+'" x2="'+v2+'" y2="80" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" stroke-dasharray="2,2"/>' +
      '<line x1="'+ZX0+'" y1="'+h1+'" x2="'+(ZX0+ZW)+'" y2="'+h1+'" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" stroke-dasharray="2,2"/>' +
      '<line x1="'+ZX0+'" y1="'+h2+'" x2="'+(ZX0+ZW)+'" y2="'+h2+'" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" stroke-dasharray="2,2"/>';

    // ── Clickable SVG zone rects ───────────────────────
    var zoneRects = zones.map(function(z) {
      var rx = ZX0 + z.col * cw;
      var ry = ZY0 + z.row * ch;
      var cx = rx + cw/2;
      var cy = ry + ch/2;
      var pColor = pc(z.pct);
      return (
        '<g class="svg-zone" data-choice="'+z.id+'" data-pct="'+z.pct+'" role="button" tabindex="0" style="cursor:pointer">'+
          // transparent hover zone
          '<rect x="'+rx+'" y="'+ry+'" width="'+cw+'" height="'+ch+'" rx="0"'+
            ' fill="rgba(0,0,0,0)" class="svg-zone-rect" data-color="'+pColor+'" />'+
          // Arrow glyph (always visible)
          '<text x="'+cx+'" y="'+(cy+2)+'" text-anchor="middle" dominant-baseline="middle"'+
            ' fill="rgba(255,255,255,0.55)" font-size="11" font-family="Arial" class="svg-zone-arrow">'+z.arrow+'</text>'+
          // Success % label (visible on hover via CSS, always shown in accessible form)
          '<text x="'+cx+'" y="'+(cy+13)+'" text-anchor="middle" dominant-baseline="middle"'+
            ' fill="'+pColor+'" font-size="8.5" font-weight="900" font-family="Arial,monospace" class="svg-zone-pct"'+
            ' style="paint-order:stroke;stroke:rgba(0,0,0,0.8);stroke-width:2.5">'+z.pct+'%</text>'+
        '</g>'
      );
    }).join('');

    // ── Ball ──────────────────────────────────────────
    var ball = isPenalty
      ? '<circle cx="150" cy="140" r="7" fill="#111"/><path d="M150 133 Q155 137 155 140 Q155 145 150 147 Q145 145 145 140 Q145 137 150 133Z" fill="#fff" opacity="0.5"/>'
      : '<circle cx="150" cy="145" r="5" fill="#111"/><path d="M150 140 Q154 143 154 145 Q154 148 150 150 Q146 148 146 145 Q146 143 150 140Z" fill="#fff" opacity="0.5"/>';

    // ── GK figure ─────────────────────────────────────
    var gk =
      // Shadow
      '<ellipse cx="'+gkX+'" cy="'+(gkY+32)+'" rx="16" ry="3.5" fill="rgba(0,0,0,0.35)"/>' +
      // Legs
      '<line x1="'+(gkX-6)+'" y1="'+(gkY+14)+'" x2="'+(gkX-8)+'" y2="'+(gkY+30)+'" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>' +
      '<line x1="'+(gkX+6)+'" y1="'+(gkY+14)+'" x2="'+(gkX+8)+'" y2="'+(gkY+30)+'" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>' +
      // Boots
      '<ellipse cx="'+(gkX-8)+'" cy="'+(gkY+31)+'" rx="5.5" ry="2" fill="#1a1a1a"/>' +
      '<ellipse cx="'+(gkX+8)+'" cy="'+(gkY+31)+'" rx="5.5" ry="2" fill="#1a1a1a"/>' +
      // Shorts
      '<rect x="'+(gkX-10)+'" y="'+(gkY+12)+'" width="20" height="8" rx="2.5" fill="#1a1a4a"/>' +
      // Jersey
      '<rect x="'+(gkX-13)+'" y="'+(gkY-2)+'" width="26" height="16" rx="4" fill="#FFD700"/>' +
      // Arms
      '<line x1="'+(gkX-13)+'" y1="'+(gkY+4)+'" x2="'+(gkX-28)+'" y2="'+armLY+'" stroke="#FFD700" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="'+(gkX+13)+'" y1="'+(gkY+4)+'" x2="'+(gkX+28)+'" y2="'+armRY+'" stroke="#FFD700" stroke-width="5" stroke-linecap="round"/>' +
      // Gloves
      '<circle cx="'+(gkX-28)+'" cy="'+armLY+'" r="5" fill="#c04800"/>' +
      '<circle cx="'+(gkX+28)+'" cy="'+armRY+'" r="5" fill="#c04800"/>' +
      // Head
      '<circle cx="'+gkX+'" cy="'+(gkY-9)+'" r="9.5" fill="#C68642"/>' +
      // Cap
      '<ellipse cx="'+gkX+'" cy="'+(gkY-16)+'" rx="9.5" ry="4.5" fill="#111"/>' +
      '<rect x="'+(gkX-10)+'" y="'+(gkY-19)+'" width="20" height="5" rx="2.5" fill="#FFD700"/>' +
      // Eyes
      '<circle cx="'+(gkX-3)+'" cy="'+(gkY-9)+'" r="1.5" fill="#1a1a1a"/>' +
      '<circle cx="'+(gkX+3)+'" cy="'+(gkY-9)+'" r="1.5" fill="#1a1a1a"/>' +
      '<circle cx="'+(gkX-2)+'" cy="'+(gkY-10)+'" r="0.6" fill="white"/>' +
      '<circle cx="'+(gkX+4)+'" cy="'+(gkY-10)+'" r="0.6" fill="white"/>';

    // ── Assemble SVG ──────────────────────────────────
    var uid = Math.random().toString(36).slice(2,7);
    var svgStr =
      '<svg class="vgoal-svg" id="vgoal-'+uid+'" viewBox="0 0 300 155" xmlns="http://www.w3.org/2000/svg">'+
      '<defs>'+
        '<linearGradient id="vfG'+uid+'" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">'+
          '<stop offset="0" stop-color="#163d1f"/><stop offset="1" stop-color="#0a2610"/>'+
        '</linearGradient>'+
        '<linearGradient id="vsG'+uid+'" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">'+
          '<stop offset="0" stop-color="#02050e"/><stop offset="1" stop-color="#071220"/>'+
        '</linearGradient>'+
        '<filter id="glow'+uid+'">'+
          '<feGaussianBlur stdDeviation="3" result="coloredBlur"/>'+
          '<feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>'+
        '</filter>'+
      '</defs>'+
      // Sky
      '<rect width="300" height="82" fill="url(#vsG'+uid+')"/>'+
      // Stars
      '<circle cx="28" cy="11" r="0.7" fill="white" opacity="0.4"/>'+
      '<circle cx="83" cy="6" r="0.55" fill="white" opacity="0.3"/>'+
      '<circle cx="198" cy="18" r="0.65" fill="white" opacity="0.35"/>'+
      '<circle cx="255" cy="8" r="0.55" fill="white" opacity="0.3"/>'+
      '<circle cx="272" cy="30" r="0.5" fill="white" opacity="0.22"/>'+
      '<circle cx="145" cy="5" r="0.5" fill="white" opacity="0.28"/>'+
      // Field
      '<rect y="82" width="300" height="73" fill="url(#vfG'+uid+')"/>'+
      // Field stripes
      '<rect y="82" width="300" height="12" fill="rgba(255,255,255,0.018)"/>'+
      '<rect y="106" width="300" height="12" fill="rgba(255,255,255,0.018)"/>'+
      '<rect y="130" width="300" height="12" fill="rgba(255,255,255,0.018)"/>'+
      // Penalty arc
      '<path d="M95 155 Q150 114 205 155" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>'+
      '<circle cx="150" cy="146" r="2" fill="rgba(255,255,255,0.45)"/>'+
      // Net
      netV + netH +
      // Goal frame — back net face (depth effect)
      '<rect x="29" y="13" width="242" height="67" fill="rgba(255,255,255,0.015)" rx="0"/>'+
      // Posts (left, right)
      '<rect x="22" y="9" width="7" height="71" fill="#f0f0f0" rx="2.5"/>'+
      '<rect x="271" y="9" width="7" height="71" fill="#f0f0f0" rx="2.5"/>'+
      // Crossbar
      '<rect x="22" y="7" width="256" height="6.5" fill="#fff" rx="2.5"/>'+
      // Ground line
      '<rect x="22" y="80" width="256" height="2" fill="rgba(255,255,255,0.18)" rx="1"/>'+
      // Post shadows (depth)
      '<rect x="29" y="9" width="4" height="71" fill="rgba(0,0,0,0.18)"/>'+
      '<rect x="268" y="9" width="4" height="71" fill="rgba(0,0,0,0.18)"/>'+
      // Zone dividers
      dividers +
      // GK
      gk +
      // Clickable zones (on top)
      zoneRects +
      // Ball
      ball +
      '</svg>';

    var penBadge = isPenalty ? '<span class="penalty-badge">PENALTI</span>' : '';
    var hint = '<div class="gk-hint"><span class="gk-icon">🧤</span><span>'+gkHint.text+'</span>'+penBadge+'</div>';

    return '<div class="goal-wrapper">' + hint + '<div class="vgoal-svg-wrap">' + svgStr + '</div></div>';
  }

  // ── Render standard options ──────────────────────────────
  function renderOptions(options, player, attrKey) {
    const n = options.length;
    const gridClass = n <= 2 ? 'grid-2' : n === 3 ? 'grid-3' : 'grid-4';
    return '<div class="decision-options ' + gridClass + '">'
      + options.map(function(opt) {
          const pct = calcPct(opt.basePct, player, attrKey);
          const pc  = pctClass(pct);
          return '<button class="decision-btn" data-choice="' + opt.id + '" data-pct="' + pct + '">'
            + '<span class="dopt-icon">' + opt.icon + '</span>'
            + '<span class="dopt-label">' + opt.label.replace(/\n/g, '<br>') + '</span>'
            + '<div class="dopt-bar"><div class="dopt-bar-fill ' + pc + '" style="width:' + pct + '%"></div></div>'
            + '<span class="dopt-pct ' + pc + '">' + pct + '%</span>'
            + '</button>';
        }).join('')
      + '</div>';
  }

  // ── Build full decision card HTML ────────────────────────
  function buildHTML(dec, player) {
    const isGrid    = dec.subtype === 'goal_grid' || dec.subtype === 'penalty_grid';
    const isPenalty = dec.subtype === 'penalty_grid';
    const body      = isGrid ? renderGoalGrid(player, isPenalty) : renderOptions(dec.options || [], player, dec.attr);
    return '<div class="decision-card">'
      + '<div class="dec-header">'
      + '<div class="dec-icon">' + dec.icon + '</div>'
      + '<div class="dec-meta">'
      + '<span class="dec-badge">' + dec.badge + '</span>'
      + '<p class="dec-scenario">' + dec.scenario + '</p>'
      + '</div>'
      + '<div class="dec-timer-wrap">'
      + '<svg class="timer-ring" viewBox="0 0 44 44">'
      + '<circle class="ring-bg" cx="22" cy="22" r="16"/>'
      + '<circle class="ring-fill" cx="22" cy="22" r="16" id="drfill" stroke-dasharray="' + CIRCUM + ' ' + CIRCUM + '" stroke-dashoffset="0"/>'
      + '</svg>'
      + '<span class="timer-num" id="dnum">' + _seconds + '</span>'
      + '</div>'
      + '</div>'
      + body
      + '</div>';
  }

  // ── Timer ─────────────────────────────────────────────────
  function startTimer(autoFn, totalSec) {
    const fill = document.getElementById('drfill');
    const num  = document.getElementById('dnum');
    _timer = setInterval(function() {
      _seconds--;
      if (num)  num.textContent = _seconds;
      if (fill) fill.style.strokeDashoffset = CIRCUM * (1 - _seconds / totalSec);
      if (_seconds <= 3 && num) num.classList.add('timer-urgent');
      if (_seconds <= 0) { clearInterval(_timer); autoFn(); }
    }, 1000);
  }

  // ── Flash result (SVG zones + regular buttons) ───────────
  function flashResult(btn, success) {
    var isSVGZone = btn && btn.tagName && btn.tagName.toLowerCase() === 'g';
    if (isSVGZone) {
      // Overlay on the SVG wrap
      var svgWrap = document.querySelector('.vgoal-svg-wrap');
      if (svgWrap) {
        svgWrap.style.position = 'relative';
        var res = document.createElement('div');
        res.className = 'goal-shot-result ' + (success ? 'shot-goal' : 'shot-miss');
        var sp = document.createElement('span');
        sp.textContent = success ? '⚽ ¡GOOOL!' : '✗ Atajado';
        res.appendChild(sp);
        svgWrap.appendChild(res);
      }
    } else {
      btn.classList.add(success ? 'dec-success' : 'dec-fail');
      var lbl = document.createElement('div');
      lbl.className = 'dec-result-lbl';
      lbl.style.color = success ? '#22dd88' : '#ff5555';
      lbl.textContent = success ? '✓ ¡Éxito!' : '✗ Fallido';
      btn.appendChild(lbl);
    }
  }

  // ── Main prompt (returns Promise) ─────────────────────────
  function prompt(decision, player, seconds) {
    if (!seconds) seconds = 9;
    return new Promise(function(resolve) {
      _seconds = seconds;
      clearInterval(_timer);

      const overlay = document.getElementById('decision-overlay');
      const content = document.getElementById('decision-content');
      if (!overlay || !content) {
        // Fallback: auto-resolve
        resolve({ choice: 'auto', success: Math.random() > 0.45, pct: 55 });
        return;
      }

      content.innerHTML = buildHTML(decision, player);
      overlay.classList.remove('hidden');

      const totalSec = seconds;
      const btns = Array.from(overlay.querySelectorAll('.decision-btn, .svg-zone'));

      var chosen = false;

      function choose(btn) {
        if (chosen) return;
        chosen = true;
        clearInterval(_timer);

        // Disable all zones/btns
        btns.forEach(function(b) {
          if (b.tagName && b.tagName.toLowerCase() === 'g') {
            // SVG zone
            b.classList.add('zone-disabled');
            if (b === btn) b.classList.add('zone-chosen');
            else           b.classList.add('zone-dim');
          } else {
            b.disabled = true;
            b.style.opacity = (b === btn) ? '1' : '0.28';
          }
        });

        const choice  = btn.dataset.choice;
        const pct     = parseInt(btn.dataset.pct) || 50;
        const success = (Math.random() * 100) < pct;

        flashResult(btn, success);

        setTimeout(function() {
          overlay.classList.add('hidden');
          resolve({ choice: choice, success: success, pct: pct });
        }, 1100);
      }

      btns.forEach(function(btn) {
        btn.addEventListener('click', function() { choose(btn); });
      });

      startTimer(function() {
        if (!chosen) {
          const rnd = btns[Math.floor(Math.random() * btns.length)];
          if (rnd) choose(rnd);
          else {
            overlay.classList.add('hidden');
            resolve({ choice: 'timeout', success: false, pct: 0 });
          }
        }
      }, totalSec);
    });
  }

  function hide() {
    clearInterval(_timer);
    const ov = document.getElementById('decision-overlay');
    if (ov) ov.classList.add('hidden');
  }

  // ── Between-match prompt (uses modal) ────────────────────
  function promptBetween(type, callback) {
    const pool = BETWEEN[type] || BETWEEN['training'] || BETWEEN['pre'] || [];
    if (!pool || !pool.length) { if (callback) callback({}); return; }
    const dec  = pool[Math.floor(Math.random() * pool.length)];
        const optsHTML = dec.opts.map(function(o) {
      var bonusStr = (typeof o.bonus === 'string') ? o.bonus : JSON.stringify(o.bonus || {});
      return '<button class="decision-btn between-btn" data-bonus=\'' + bonusStr + '\'>'
        + '<span class="dopt-icon">' + o.icon + '</span>'
        + '<span class="dopt-label">' + o.label.replace(/\n/g, '<br>') + '</span>'
        + '<span class="between-desc">' + o.desc + '</span>'
        + '</button>';
    }).join('');
    const html = '<div class="between-card">'
      + '<div class="between-header"><span class="between-icon">' + dec.icon + '</span><span class="dec-badge">' + dec.badge + '</span></div>'
      + '<p class="between-title">' + dec.title + '</p>'
      + '<div class="decision-options grid-2">' + optsHTML + '</div>'
      + '</div>';
    GameUI.showModal(html);
    document.querySelectorAll('.between-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var bonus = {};
        try { bonus = JSON.parse(btn.dataset.bonus || '{}'); } catch(e) {}
        GameUI.hideModal();
        if (callback) callback(bonus);
      });
    });
  }

  // ── Get random decision for a position ───────────────────
  function getForPosition(pos) {
    const pool = MATCH[pos] || MATCH.CM;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return { prompt, hide, promptBetween, getForPosition, MATCH };
})();



