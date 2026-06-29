/* ============================================================
   BE YOUR HERO v2 – ui.js
   Screen transitions, toast, modal, particles, country flags
   ============================================================ */

const GameUI = (() => {
  let toastTimeout=null;

  function showScreen(id){
    document.querySelectorAll('.screen').forEach(s=>{ s.classList.remove('active'); });
    const screen=document.getElementById(id);
    if (screen){ screen.classList.add('active'); }
  }

  function loadCareer(){
    if (!Game.hasSave()){ showToast('💾 No hay partida guardada'); return; }
    if (Game.loadGame()){ CareerUI.boot(); showScreen('screen-career'); showToast('✅ Partida cargada'); }
    else showToast('❌ Error al cargar');
  }

  function showToast(msg,duration=3000){
    const toast=document.getElementById('toast');
    toast.textContent=msg; toast.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout=setTimeout(()=>toast.classList.add('hidden'),duration);
  }

  function showModal(html){
    document.getElementById('modal-content').innerHTML=html;
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  function hideModal(){
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  // ── Country selector with flag SVGs ──────────────────────
  function populateCountries(){
    const countries=Game.getCountries();
    const sel=document.getElementById('player-country');
    countries.forEach(c=>{
      const opt=document.createElement('option');
      opt.value=c.code; opt.textContent=`${c.flag} ${c.name}`;
      sel.appendChild(opt);
    });
    sel.addEventListener('change',()=>{
      const found=countries.find(c=>c.code===sel.value);
      const flagEl=document.getElementById('flag-preview-svg');
      if (flagEl&&found) flagEl.innerHTML=Logos.getFlagSVG(found.code);
    });
  }

  // ── League logos strip in menu ────────────────────────────
  function renderMenuLeaguesStrip(){
    const strip=document.getElementById('menu-leagues-strip');
    if (!strip) return;
    const t1=Game.getLeaguesTier1();
    strip.innerHTML=t1.map(l=>`
      <div class="menu-league-logo" title="${l.name}">
        ${Logos.getLeagueLogo(l.id)}
      </div>`).join('');
  }

  // ── Particles ─────────────────────────────────────────────
  function initParticles(){
    const canvas=document.getElementById('particlesCanvas');
    const ctx=canvas.getContext('2d');
    let particles=[]; let W,H;
    function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
    resize(); window.addEventListener('resize',resize);
    class Particle {
      constructor(){ this.reset(); }
      reset(){ this.x=Math.random()*W; this.y=H+10; this.vx=(Math.random()-0.5)*0.5; this.vy=-(Math.random()*0.4+0.15); this.r=Math.random()*1.5+0.5; this.a=Math.random()*0.3+0.05; this.col=Math.random()>0.5?`rgba(0,230,100,${this.a})`:`rgba(255,215,0,${this.a})`; }
      update(){ this.x+=this.vx; this.y+=this.vy; this.a-=0.0006; if(this.y<-10||this.a<=0) this.reset(); }
      draw(){ ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=this.col; ctx.fill(); }
    }
    for (let i=0;i<50;i++){ const p=new Particle(); p.y=Math.random()*H; particles.push(p); }
    function loop(){ ctx.clearRect(0,0,W,H); particles.forEach(p=>{ p.update(); p.draw(); }); requestAnimationFrame(loop); }
    loop();
  }

  return { showScreen, loadCareer, showToast, showModal, hideModal, populateCountries, renderMenuLeaguesStrip, initParticles };
})();
