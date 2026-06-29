/* ============================================================
   BE YOUR HERO v2 – main.js
   Entry point — data is inline so load is instant
   ============================================================ */

(async function init() {
  GameUI.initParticles();

  const loaderFill = document.getElementById('loaderFill');
  const loaderText = document.getElementById('loaderText');

  // Animated splash steps (all instant since data is inline)
  const steps = [
    { pct: 20,  msg: 'Cargando ligas...' },
    { pct: 45,  msg: 'Preparando clubes...' },
    { pct: 65,  msg: 'Generando escudos...' },
    { pct: 82,  msg: 'Iniciando motor...' },
    { pct: 96,  msg: 'Casi listo...' },
    { pct: 100, msg: '¡Listo para jugar!' }
  ];

  for (const step of steps) {
    await sleep(300);
    if (loaderFill) loaderFill.style.width = step.pct + '%';
    if (loaderText) loaderText.textContent  = step.msg;
  }

  // loadData is now synchronous (returns resolved promise instantly)
  await Game.loadData();
  await sleep(350);

  // Populate country selector
  GameUI.populateCountries();

  // Restore save if exists
  const hasSave = Game.hasSave();
  if (hasSave) {
    const ok = Game.loadGame();
    if (ok) CareerUI.boot();
  }

  // Show main menu
  GameUI.showScreen('screen-menu');

  // Render league logo strip in menu
  GameUI.renderMenuLeaguesStrip();

  // Disable continue button if no save
  if (!hasSave) {
    const btn = document.getElementById('btn-continue');
    if (btn) {
      btn.style.opacity = '0.4';
      btn.style.cursor  = 'not-allowed';
      btn.onclick = () => GameUI.showToast('💾 No hay partida guardada');
    }
  }

  // Close modal on backdrop click
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) GameUI.hideModal();
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      GameUI.hideModal();
      DecisionEngine.hide();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      Game.saveGame();
    }
  });

  console.log('%cBe Your Hero v2.0 ✓', 'color:#ffd700;font-size:18px;font-weight:bold;');
  console.log('%c⚽ Football Career Mode — Loaded', 'color:#00e664;font-size:12px;');
})();

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
