/* ============================================================
   BE YOUR HERO – decisions.js
   Interactive decision system during matches
   ============================================================ */

const DecisionEngine = (() => {

  let onDecisionMade = null;
  let timerInterval  = null;
  let timeLeft       = 7;

  // ── Decision Templates by Position ────────────────────────
  const decisionSets = {

    // ── STRIKER / WINGER ────────────────────────────────────
    ST: [
      {
        id: 'shot_corner',
        label: '¡Recibes el balón dentro del área! El portero está adelantado.',
        type: 'shot',
        icon: '⚽',
        options: [
          { id: 'left',    label: '← Ángulo izquierdo', attrKey: 'shooting', basePct: 72, icon: '↙️' },
          { id: 'right',   label: 'Ángulo derecho →',   attrKey: 'shooting', basePct: 68, icon: '↘️' },
          { id: 'center',  label: 'Centro rasante',      attrKey: 'shooting', basePct: 48, icon: '➡️' },
          { id: 'chip',    label: 'Vaselina sutil',      attrKey: 'dribbling',basePct: 38, icon: '🎯' }
        ]
      },
      {
        id: 'header',
        label: 'Un centro perfecto llega al área. Tienes el salto ganado.',
        type: 'header',
        icon: '🏃',
        options: [
          { id: 'power',   label: 'Remate fuerte',  attrKey: 'physical', basePct: 65, icon: '💥' },
          { id: 'dir',     label: 'Colocado',        attrKey: 'shooting', basePct: 58, icon: '🎯' },
          { id: 'back',    label: 'Hacia atrás',     attrKey: 'passing',  basePct: 40, icon: '🔙' }
        ]
      },
      {
        id: 'one_on_one',
        label: 'Mano a mano con el portero. Solo faltas tú y él.',
        type: 'shot',
        icon: '⚡',
        options: [
          { id: 'left',    label: 'Dispara izquierda', attrKey: 'shooting', basePct: 60, icon: '↙️' },
          { id: 'right',   label: 'Dispara derecha',   attrKey: 'shooting', basePct: 60, icon: '↘️' },
          { id: 'dribble', label: 'Gambeta al portero',attrKey: 'dribbling',basePct: 45, icon: '🌀' },
          { id: 'chip',    label: 'Globito',            attrKey: 'dribbling',basePct: 32, icon: '🎩' }
        ]
      }
    ],

    LW: [
      {
        id: 'cross_decision',
        label: 'Llegas por la banda con espacio. El área está llena de compañeros.',
        type: 'assist',
        icon: '📐',
        options: [
          { id: 'low_cross', label: 'Centro raso',   attrKey: 'passing',  basePct: 68, icon: '⬅️' },
          { id: 'high_cross',label: 'Centro alto',   attrKey: 'passing',  basePct: 58, icon: '⬆️' },
          { id: 'cut_in',    label: 'Corte y remate',attrKey: 'dribbling',basePct: 52, icon: '🔄' },
          { id: 'back_pass', label: 'Pase atrás',    attrKey: 'passing',  basePct: 70, icon: '🔙' }
        ]
      },
      {
        id: 'dribble_1v1',
        label: '¡1 vs 1 con el lateral! Tu velocidad es tu arma.',
        type: 'dribble',
        icon: '💨',
        options: [
          { id: 'speed',   label: 'Velocidad pura',    attrKey: 'pace',     basePct: 74, icon: '💨' },
          { id: 'feint',   label: 'Finta y recorte',   attrKey: 'dribbling',basePct: 65, icon: '🌀' },
          { id: 'pass',    label: 'Ceder el balón',    attrKey: 'passing',  basePct: 78, icon: '➡️' }
        ]
      }
    ],

    CAM: [
      {
        id: 'key_pass',
        label: 'Ves una carrera perfecta de tu delantero entre defensas.',
        type: 'pass',
        icon: '🎯',
        options: [
          { id: 'through', label: 'Pase filtrado',  attrKey: 'passing',  basePct: 62, icon: '🔪' },
          { id: 'lob',     label: 'Pase en globo',  attrKey: 'passing',  basePct: 55, icon: '🌈' },
          { id: 'dribble', label: 'Avanzar',         attrKey: 'dribbling',basePct: 58, icon: '⚡' },
          { id: 'shoot',   label: 'Disparar tú',    attrKey: 'shooting', basePct: 42, icon: '⚽' }
        ]
      },
      {
        id: 'freekick',
        label: '¡Falta en posición peligrosa! Eres el ejecutor designado.',
        type: 'set_piece',
        icon: '📍',
        options: [
          { id: 'top_left',    label: 'Esquina sup. izq.', attrKey: 'shooting', basePct: 44, icon: '↖️' },
          { id: 'top_right',   label: 'Esquina sup. der.', attrKey: 'shooting', basePct: 44, icon: '↗️' },
          { id: 'low_left',    label: 'Bajo a la izq.',    attrKey: 'shooting', basePct: 56, icon: '↙️' },
          { id: 'low_right',   label: 'Bajo a la der.',    attrKey: 'shooting', basePct: 56, icon: '↘️' }
        ]
      }
    ],

    CM: [
      {
        id: 'tackle_decision',
        label: 'El mediapunta rival viene con el balón hacia ti.',
        type: 'defend',
        icon: '🛡️',
        options: [
          { id: 'tackle',    label: 'Entrada agresiva',   attrKey: 'defending',basePct: 62, icon: '💥' },
          { id: 'jockey',    label: 'Posicionarse',       attrKey: 'defending',basePct: 75, icon: '🛡️' },
          { id: 'intercept', label: 'Cortar el pase',     attrKey: 'physical', basePct: 52, icon: '✋' }
        ]
      },
      {
        id: 'long_shot',
        label: 'El balón te llega en la frontal del área. El portero está algo adelantado.',
        type: 'shot',
        icon: '💥',
        options: [
          { id: 'shoot',   label: 'Disparar de larga',  attrKey: 'shooting', basePct: 38, icon: '🔥' },
          { id: 'pass',    label: 'Pase al delantero',  attrKey: 'passing',  basePct: 72, icon: '➡️' },
          { id: 'dribble', label: 'Regatear',           attrKey: 'dribbling',basePct: 50, icon: '🌀' }
        ]
      }
    ],

    CB: [
      {
        id: 'aerial_duel',
        label: '¡Saque de esquina rival! Tienes que despejar el balón.',
        type: 'defend',
        icon: '🛡️',
        options: [
          { id: 'header',  label: 'Despejar de cabeza', attrKey: 'physical', basePct: 72, icon: '💪' },
          { id: 'punch',   label: 'Puño',               attrKey: 'defending',basePct: 60, icon: '👊' },
          { id: 'catch',   label: 'Controlar el balón', attrKey: 'defending',basePct: 48, icon: '🎯' }
        ]
      },
      {
        id: 'build_up',
        label: 'El portero te da el balón. Presión rival alta.',
        type: 'pass',
        icon: '📐',
        options: [
          { id: 'short',   label: 'Pase corto seguro',  attrKey: 'passing',  basePct: 82, icon: '➡️' },
          { id: 'long',    label: 'Pelotazo largo',      attrKey: 'passing',  basePct: 55, icon: '⬆️' },
          { id: 'carry',   label: 'Conducir el balón',  attrKey: 'dribbling',basePct: 45, icon: '🏃' },
          { id: 'clear',   label: 'Despejar fuerte',    attrKey: 'physical', basePct: 70, icon: '💥' }
        ]
      }
    ],

    LB: [
      {
        id: 'overlap',
        label: 'Tu extremo te llama. Tienes el carril libre para subir.',
        type: 'assist',
        icon: '📐',
        options: [
          { id: 'overlap',  label: 'Subir al ataque',  attrKey: 'pace',    basePct: 68, icon: '🏃' },
          { id: 'stay',     label: 'Quedarse atrás',   attrKey: 'defending',basePct: 90, icon: '🛡️' },
          { id: 'cross',    label: 'Centro directo',   attrKey: 'passing', basePct: 58, icon: '📐' }
        ]
      }
    ],

    RB: [
      {
        id: 'overlap',
        label: 'Tu extremo te llama. Tienes el carril libre para subir.',
        type: 'assist',
        icon: '📐',
        options: [
          { id: 'overlap',  label: 'Subir al ataque',  attrKey: 'pace',    basePct: 68, icon: '🏃' },
          { id: 'stay',     label: 'Quedarse atrás',   attrKey: 'defending',basePct: 90, icon: '🛡️' },
          { id: 'cross',    label: 'Centro directo',   attrKey: 'passing', basePct: 58, icon: '📐' }
        ]
      }
    ],

    GK: [
      {
        id: 'penalty_save',
        label: '¡PENALTI! El delantero se prepara para lanzar. ¿A qué lado te tiras?',
        type: 'save',
        icon: '🧤',
        options: [
          { id: 'left',    label: 'Tirarse izquierda', attrKey: 'defending',basePct: 33, icon: '⬅️' },
          { id: 'right',   label: 'Tirarse derecha',   attrKey: 'defending',basePct: 33, icon: '➡️' },
          { id: 'center',  label: 'Quedarse en centro',attrKey: 'defending',basePct: 20, icon: '🧤' }
        ]
      },
      {
        id: 'aerial_catch',
        label: 'Un centro peligroso llega a tu área. Tres atacantes te rodean.',
        type: 'save',
        icon: '🧤',
        options: [
          { id: 'catch',  label: 'Atrapar el balón',  attrKey: 'defending',basePct: 62, icon: '🤲' },
          { id: 'punch',  label: 'Puñetazo',          attrKey: 'physical', basePct: 78, icon: '👊' },
          { id: 'claim',  label: 'Salir a por todo',  attrKey: 'defending',basePct: 55, icon: '💥' }
        ]
      }
    ]
  };

  // Fallback for positions without specific sets
  decisionSets['CAM'].forEach(d => { decisionSets['LW'] = decisionSets['LW'] || []; });
  Object.keys(decisionSets).forEach(pos => {
    if (!decisionSets[pos]) decisionSets[pos] = decisionSets['CM'];
  });

  // ── Calculate success percentage ─────────────────────────
  function calcSuccessPct(option, playerAttrs, fatigue) {
    const attrVal = playerAttrs[option.attrKey] || 60;
    // base: 40-99 range mapped to -15% to +15% modifier
    const attrBonus = ((attrVal - 60) / 60) * 20;
    const fatiguePenalty = fatigue * 0.08; // up to -8% at 100% fatigue
    const pct = Math.round(option.basePct + attrBonus - fatiguePenalty);
    return Math.min(95, Math.max(8, pct));
  }

  // ── Pick a random decision for current match context ─────
  function pickDecision(position) {
    const pool = decisionSets[position] || decisionSets['CM'];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ── Show decision overlay ─────────────────────────────────
  function show(position, playerAttrs, fatigue, callback) {
    onDecisionMade = callback;
    const decision = pickDecision(position);
    const overlay  = document.getElementById('decision-overlay');
    const container = document.getElementById('decision-container');

    if (!overlay || !container) { callback(null); return; }

    timeLeft = 7;
    const options = decision.options.map(opt => ({
      ...opt,
      pct: calcSuccessPct(opt, playerAttrs, fatigue)
    }));

    container.innerHTML = `
      <div class="decision-card">
        <div class="decision-header">
          <span class="decision-icon">${decision.icon}</span>
          <div class="decision-meta">
            <span class="decision-badge">¡DECISIÓN!</span>
            <span class="decision-type">${getTypeLabel(decision.type)}</span>
          </div>
          <div class="decision-timer-wrap">
            <svg class="timer-ring" viewBox="0 0 36 36">
              <circle class="ring-bg" cx="18" cy="18" r="15.9"/>
              <circle class="ring-fill" id="timer-ring-fill" cx="18" cy="18" r="15.9"
                      stroke-dasharray="100 100" stroke-dashoffset="0"/>
            </svg>
            <span class="timer-num" id="decision-timer">7</span>
          </div>
        </div>
        <p class="decision-scenario">${decision.label}</p>
        <div class="decision-options grid-${options.length <= 3 ? 3 : 4}">
          ${options.map(opt => `
            <button class="decision-btn" data-id="${opt.id}" onclick="DecisionEngine.choose('${opt.id}')">
              <span class="dopt-icon">${opt.icon}</span>
              <span class="dopt-label">${opt.label}</span>
              <div class="dopt-pct-bar">
                <div class="dopt-pct-fill" style="width:${opt.pct}%"></div>
              </div>
              <span class="dopt-pct">${opt.pct}% éxito</span>
            </button>
          `).join('')}
        </div>
      </div>`;

    overlay.classList.remove('hidden');
    startTimer(options);
    return decision;
  }

  function startTimer(options) {
    clearInterval(timerInterval);
    const ringFill = document.getElementById('timer-ring-fill');
    const timerNum = document.getElementById('decision-timer');
    const totalTime = 7;

    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerNum) timerNum.textContent = timeLeft;
      if (ringFill) {
        const dashOffset = ((totalTime - timeLeft) / totalTime) * 100;
        ringFill.style.strokeDashoffset = dashOffset;
      }
      if (timeLeft <= 2 && timerNum) timerNum.style.color = '#ff5050';
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        // Auto-pick best option
        const best = options.reduce((a, b) => a.pct > b.pct ? a : b);
        resolveDecision(best.id, options);
      }
    }, 1000);
  }

  function choose(optionId) {
    clearInterval(timerInterval);
    const overlay = document.getElementById('decision-overlay');
    if (!overlay) return;

    // Get options from current displayed buttons
    const buttons = overlay.querySelectorAll('.decision-btn');
    const options = Array.from(buttons).map(btn => ({
      id: btn.dataset.id,
      pct: parseInt(btn.querySelector('.dopt-pct').textContent)
    }));

    resolveDecision(optionId, options);
  }

  function resolveDecision(optionId, options) {
    const overlay = document.getElementById('decision-overlay');
    const chosen  = options.find(o => o.id === optionId) || options[0];
    const pct     = chosen.pct || 50;

    // Roll success
    const roll    = Math.random() * 100;
    const success = roll <= pct;

    // Show result feedback on the button
    const btn = overlay.querySelector(`[data-id="${optionId}"]`);
    if (btn) {
      btn.classList.add(success ? 'decision-success' : 'decision-fail');
      btn.innerHTML += `<span class="decision-result-label">${success ? '✅ ¡Éxito!' : '❌ Fallo'}</span>`;
    }

    setTimeout(() => {
      overlay.classList.add('hidden');
      if (onDecisionMade) onDecisionMade({ success, optionId, pct });
    }, 1200);
  }

  function hide() {
    clearInterval(timerInterval);
    const overlay = document.getElementById('decision-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  function getTypeLabel(type) {
    const labels = {
      shot: 'Oportunidad de gol', assist: 'Oportunidad de asistencia',
      dribble: 'Regate', pass: 'Jugada de pase',
      defend: 'Acción defensiva', save: 'Parada', set_piece: 'Balón parado'
    };
    return labels[type] || 'Decisión táctica';
  }

  return { show, choose, hide, pickDecision, calcSuccessPct };
})();
