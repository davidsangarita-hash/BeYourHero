// Patch 2: fix btn selector in prompt() + add auto-save hook to match.js
const fs = require('fs');

// --- decisions.js: fix .goal-zone selector to include .vgoal-zone-btn ---
let dec = fs.readFileSync('js/decisions.js', 'utf8');
dec = dec.replace(
  "const btns = [...overlay.querySelectorAll('.decision-btn, .goal-zone')];",
  "const btns = [...overlay.querySelectorAll('.decision-btn, .goal-zone, .vgoal-zone-btn')];"
);
// fix gloves emoji (unicode escape issue)
dec = dec.replace('\\u{1F9E4}', '\u{1F9E4}');
fs.writeFileSync('js/decisions.js', dec, 'utf8');
console.log('decisions.js patched: selector fixed');

// --- game.js: add autoSave function that saves silently ---
let game = fs.readFileSync('js/game.js', 'utf8');
if (!game.includes('function autoSave')) {
  game = game.replace(
    'function saveGame() {',
    `function autoSave() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e) {}
  }
  function saveGame() {`
  );
  // expose autoSave
  game = game.replace(
    'return { loadData, saveGame, loadGame, hasSave, deleteSave, getState,',
    'return { loadData, saveGame, autoSave, loadGame, hasSave, deleteSave, getState,'
  );
  fs.writeFileSync('js/game.js', game, 'utf8');
  console.log('game.js patched: autoSave added');
} else {
  console.log('game.js already has autoSave');
}

// --- match.js: call Game.autoSave() after each finishMatch ---
let match = fs.readFileSync('js/match.js', 'utf8');
if (!match.includes('Game.autoSave()')) {
  match = match.replace(
    'Game.advanceRound();\n    CareerUI.boot();\n    GameUI.showScreen(\'screen-career\');\n    GameUI.showToast(`\u2705 Partido finalizado',
    'Game.autoSave();\n      Game.advanceRound();\n    CareerUI.boot();\n    GameUI.showScreen(\'screen-career\');\n    GameUI.showToast(`\u2705 Partido finalizado'
  );
  // Also add after the between-match path
  match = match.replace(
    "GameUI.showScreen('screen-career');\n          GameUI.showToast(`\u2705 Partido finalizado",
    "Game.autoSave();\n          GameUI.showScreen('screen-career');\n          GameUI.showToast(`\u2705 Partido finalizado"
  );
  fs.writeFileSync('js/match.js', match, 'utf8');
  console.log('match.js patched: autoSave added');
} else {
  console.log('match.js already has autoSave');
}

console.log('All patches applied successfully!');
