/* ============================================================
   BE YOUR HERO v2 -- main.js
   Entry point + save/load UI management
   ============================================================ */

(async function init() {
  GameUI.initParticles();

  const loaderFill = document.getElementById('loaderFill');
  const loaderText = document.getElementById('loaderText');

  const steps = [
    { pct: 20,  msg: 'Cargando ligas...' },
    { pct: 45,  msg: 'Preparando clubes...' },
    { pct: 65,  msg: 'Generando escudos...' },
    { pct: 82,  msg: 'Iniciando motor...' },
    { pct: 96,  msg: 'Casi listo...' },
    { pct: 100, msg: 'Listo para jugar!' }
  ];

  for (const step of steps) {
    await sleep(300);
    if (loaderFill) loaderFill.style.width = step.pct + '%';
    if (loaderText) loaderText.textContent  = step.msg;
  }

  await Game.loadData();
  await sleep(350);

  GameUI.populateCountries();

  // Auto-restore save on load
  const hasSave = Game.hasSave();
  if (hasSave) {
    const ok = Game.loadGame();
    if (ok) CareerUI.boot();
  }

  GameUI.showScreen('screen-menu');
  GameUI.renderMenuLeaguesStrip();

  // Style continue button based on save state
  updateContinueBtn();

  // Modal backdrop
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) GameUI.hideModal();
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { GameUI.hideModal(); DecisionEngine.hide(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); Game.saveGame(); }
  });

  // Warn before unload if in career
  window.addEventListener('beforeunload', () => {
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen && currentScreen.id !== 'screen-menu' && currentScreen.id !== 'screen-splash') {
      Game.autoSave();
    }
  });

  console.log('%cBe Your Hero v2.0', 'color:#ffd700;font-size:18px;font-weight:bold;');
})();

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function updateContinueBtn() {
  const btn = document.getElementById('btn-continue');
  if (!btn) return;
  const hasSave = Game.hasSave();
  if (hasSave) {
    btn.classList.add('has-save');
    btn.style.opacity = '1';
    btn.style.cursor  = 'pointer';
    // Show save info in button
    try {
      const raw = localStorage.getItem('byh_save_v2');
      if (raw) {
        const s = JSON.parse(raw);
        const pl = s.player;
        const name = pl ? (pl.firstName + ' ' + pl.lastName) : '';
        const season = s.season || 1;
        const round  = s.round  || 1;
        const label  = btn.querySelector('.btn-label');
        if (label && name) {
          label.innerHTML = 'Continuar &mdash; ' + name + '<br><small style="font-size:10px;color:var(--text-muted)">T' + season + ' J' + round + '</small>';
        }
      }
    } catch(e) {}
    btn.onclick = () => GameUI.loadCareer();
  } else {
    btn.style.opacity = '0.4';
    btn.style.cursor  = 'not-allowed';
    btn.onclick = () => GameUI.showToast('No hay partida guardada');
  }
}

// -- Exit to menu with auto-save
function exitToMenu() {
  if (!Game.getState().player) { GameUI.showScreen('screen-menu'); return; }
  const html = '<div style="text-align:center">'
    + '<div style="font-size:40px;margin-bottom:10px">🏠</div>'
    + '<h3 style="font-size:14px;font-weight:700;margin-bottom:8px">Salir al Menu Principal</h3>'
    + '<p style="font-size:12px;color:var(--text-muted);margin-bottom:20px">Tu progreso se guarda automaticamente.</p>'
    + '<div style="display:flex;gap:10px;justify-content:center">'
    + '<button class="btn-confirm" onclick="doExitToMenu()" style="padding:10px 24px;font-size:13px">Guardar y Salir</button>'
    + '<button class="btn-back-step" onclick="GameUI.hideModal()" style="padding:10px 18px">Cancelar</button>'
    + '</div></div>';
  GameUI.showModal(html);
}

function doExitToMenu() {
  Game.autoSave();
  GameUI.hideModal();
  setTimeout(() => {
    updateContinueBtn();
    GameUI.showScreen('screen-menu');
    GameUI.showToast('Progreso guardado');
  }, 200);
}

// -- Update last-save-label timestamp
function updateSaveLabel() {
  const el = document.getElementById('last-save-label');
  if (!el) return;
  const now = new Date();
  el.textContent = 'Guardado ' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
}

// -- Hook: override Game.autoSave to also update UI
const _origAutoSave = typeof Game !== 'undefined' ? Game.autoSave : null;
