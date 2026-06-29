/* ============================================================
   BE YOUR HERO v2 – game.js
   Global state — uses inline GameData, no fetch() needed
   ============================================================ */

const Game = (() => {
  const SAVE_KEY = 'byh_save_v2';

  let state = {
    player: null, club: null, league: null, tier: 2,
    season: 1, round: 1, totalRounds: 34,
    standings: [], schedule: [],
    careerStats: { goals:0, assists:0, matches:0, seasons:1, history:[], decisionsOk:0 },
    seasonStats: { goals:0, assists:0, matches:0, ratings:[], results:[], decisionsOk:0 },
    growthLog: [], news: [], transferOffers: [], promotionOffer: null,
    marketOpen: false
  };

  // ── Load data (now synchronous — no fetch needed) ─────────
  function loadData() {
    // GameData is defined in js/data.js (inline)
    return Promise.resolve(true);
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      GameUI.showToast('💾 Partida guardada');
    } catch(e) { GameUI.showToast('❌ Error al guardar'); }
  }

  function loadGame() {
    try {
      const r = localStorage.getItem(SAVE_KEY);
      if (!r) return false;
      state = JSON.parse(r);
      return true;
    } catch(e) { return false; }
  }

  function hasSave()    { return !!localStorage.getItem(SAVE_KEY); }
  function deleteSave() { localStorage.removeItem(SAVE_KEY); }
  function getState()   { return state; }

  function getLeaguesTier1() { return GameData.leagues;  }
  function getLeaguesTier2() { return GameData.leagues2; }
  function getCountries()    { return GameData.countries; }

  // ── Career Init ────────────────────────────────────────────
  function initCareer(player, club, league) {
    state.player  = player;
    state.club    = club;
    state.league  = league;
    state.tier    = league.tier || 2;
    state.season  = 1;
    state.round   = 1;
    state.totalRounds = Math.max((league.clubs.length * 2) - 2, 20);
    state.careerStats = { goals:0, assists:0, matches:0, seasons:1, history:[], decisionsOk:0 };
    state.seasonStats = { goals:0, assists:0, matches:0, ratings:[], results:[], decisionsOk:0 };
    state.growthLog   = [];
    state.news = [
      `🎉 ¡${player.firstName} ${player.lastName} firma con ${club.name}!`,
      `🏟️ La temporada ${state.season} en ${league.name} acaba de comenzar.`,
      `⚡ Todo empieza aquí. Demuestra de qué estás hecho.`
    ];
    state.transferOffers = [];
    state.promotionOffer = null;
    state.marketOpen = false;
    state.schedule   = Schedule.generate(league, club);
    state.standings  = Table.init(league);
  }

  // ── Season progression ─────────────────────────────────────
  function advanceRound() {
    state.round++;
    if (state.round > state.totalRounds) endSeason();
  }

  function endSeason() {
    const ss  = state.seasonStats;
    const avg = ss.ratings.length
      ? (ss.ratings.reduce((a,b)=>a+b,0)/ss.ratings.length).toFixed(1)
      : '—';

    state.careerStats.history.push({
      season: state.season, club: state.club.name,
      league: state.league.name, tier: state.tier,
      goals: ss.goals, assists: ss.assists,
      matches: ss.matches, avgRating: avg
    });
    state.careerStats.goals       += ss.goals;
    state.careerStats.assists     += ss.assists;
    state.careerStats.matches     += ss.matches;
    state.careerStats.decisionsOk += ss.decisionsOk;
    state.season++;
    state.careerStats.seasons = state.season;

    const tablePos  = getStandingPosition();
    const promoted  = state.tier === 2 && tablePos <= 3;
    const personalStar = ss.goals >= 15 || parseFloat(avg) >= 7.5;

    state.seasonStats = { goals:0, assists:0, matches:0, ratings:[], results:[], decisionsOk:0 };
    state.marketOpen  = true;

    if (promoted || personalStar) generatePromotionOffer();
    else if (Math.random() > 0.5)  generateTransferOffer();

    addNews(`🏁 Temporada ${state.season-1} finalizada. ${promoted ? '🎉 ¡Top 3! Ascenso disponible.' : ''}`);
    if (promoted) addNews(`⬆️ ¡Hay ofertas de Primera División!`);

    // Reset schedule for new season
    state.schedule   = Schedule.generate(state.league, state.club);
    state.standings  = Table.init(state.league);
    state.round      = 1;
    state.totalRounds = Math.max((state.league.clubs.length * 2) - 2, 20);

    saveGame();
  }

  function generatePromotionOffer() {
    const t1 = GameData.leagues;
    const byCountry = t1.filter(l => l.country === state.league.country);
    const pool = byCountry.length ? byCountry : t1;
    const randLeague = pool[Math.floor(Math.random() * pool.length)];
    const lowClubs   = randLeague.clubs.filter(c => c.prestige <= 3);
    const randClub   = (lowClubs.length ? lowClubs : randLeague.clubs)[Math.floor(Math.random() * (lowClubs.length || randLeague.clubs.length))];
    state.promotionOffer = { club: randClub, league: randLeague, tier: 1 };
    addNews(`🌟 ¡${randClub.name} de Primera te quiere!`);
  }

  function generateTransferOffer() {
    const pool = [...GameData.leagues, ...GameData.leagues2];
    const randLeague = pool[Math.floor(Math.random() * pool.length)];
    const randClub   = randLeague.clubs[Math.floor(Math.random() * randLeague.clubs.length)];
    const amount     = Math.floor(Math.random() * 30 + 5);
    state.transferOffers = [{ club: randClub, league: randLeague, amount, id: Date.now() }];
    addNews(`💼 Oferta de traspaso de ${randClub.name}.`);
  }

  function acceptPromotion() {
    const offer = state.promotionOffer;
    if (!offer) return;
    state.club    = offer.club;
    state.league  = offer.league;
    state.tier    = 1;
    state.schedule   = Schedule.generate(offer.league, offer.club);
    state.standings  = Table.init(offer.league);
    state.totalRounds = Math.max((offer.league.clubs.length * 2) - 2, 28);
    state.promotionOffer = null;
    state.marketOpen     = false;
    addNews(`✅ ¡Bienvenido a Primera División con ${offer.club.name}!`);
    saveGame();
  }

  function acceptTransfer(id) {
    const offer = state.transferOffers.find(o => o.id === id);
    if (!offer) return;
    state.club    = offer.club;
    state.league  = offer.league;
    state.tier    = offer.league.tier || 1;
    state.schedule   = Schedule.generate(offer.league, offer.club);
    state.standings  = Table.init(offer.league);
    state.totalRounds = Math.max((offer.league.clubs.length * 2) - 2, 28);
    state.transferOffers = [];
    state.marketOpen     = false;
    addNews(`✅ Traspaso completado. Ahora en ${offer.club.name}.`);
    saveGame();
  }

  function rejectTransfer(id) {
    state.transferOffers = state.transferOffers.filter(o => o.id !== id);
  }

  function addNews(msg) {
    state.news.unshift(msg);
    if (state.news.length > 12) state.news.pop();
  }

  function getStandingPosition() {
    if (!state.standings || !state.club) return 99;
    const idx = state.standings.findIndex(s => s.club.id === state.club.id);
    return idx >= 0 ? idx + 1 : 99;
  }

  return {
    loadData, saveGame, loadGame, hasSave, deleteSave,
    getState, getLeaguesTier1, getLeaguesTier2, getCountries,
    initCareer, advanceRound, addNews,
    acceptPromotion, acceptTransfer, rejectTransfer, getStandingPosition
  };
})();

/* ── Schedule generator ──────────────────────────────────── */
const Schedule = (() => {
  function generate(league, playerClub) {
    const opponents = league.clubs.filter(c => c.id !== playerClub.id);
    const matches = [];
    const doubled = [...opponents, ...opponents];
    const count = Math.min(doubled.length, 36);
    for (let i = 0; i < count; i++) {
      const isHome = i < opponents.length;
      matches.push({
        round: i + 1,
        homeTeam:     isHome ? playerClub : doubled[i],
        awayTeam:     isHome ? doubled[i] : playerClub,
        isPlayerHome: isHome,
        played: false,
        homeScore: null, awayScore: null,
        playerGoals: 0, playerAssists: 0,
        playerRating: null, result: null
      });
    }
    return matches;
  }
  return { generate };
})();

/* ── Standings table ─────────────────────────────────────── */
const Table = (() => {
  function init(league) {
    return league.clubs.map(club => ({
      club, played:0, won:0, drawn:0, lost:0, gf:0, ga:0, gd:0, points:0
    }));
  }

  function update(standings, homeClub, awayClub, homeScore, awayScore) {
    const home = standings.find(s => s.club.id === homeClub.id);
    const away = standings.find(s => s.club.id === awayClub.id);
    if (!home || !away) return;
    home.played++; away.played++;
    home.gf += homeScore; home.ga += awayScore;
    away.gf += awayScore; away.ga += homeScore;
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;
    if (homeScore > awayScore)      { home.won++;  home.points += 3; away.lost++; }
    else if (homeScore < awayScore) { away.won++;  away.points += 3; home.lost++; }
    else                            { home.drawn++; home.points++;   away.drawn++; away.points++; }
    standings.sort((a,b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  }

  return { init, update };
})();
