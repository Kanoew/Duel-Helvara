/* Duel d'Helvara : sons, effets visuels et cinématiques.
   Extrait d'index.html le 12 octobre 2026 sans aucun changement de code : les fichiers js/ se chargent dans l'ordre d'index.html et partagent la même portée globale. */
/* ======= SONS ======= */
let AC=null;
function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ AC=null; } } if(AC&&AC.state==="suspended") AC.resume(); return AC; }
/* Volume des effets : un seul bus, réglé par P.vs (0 à 100) */
let SFXG=null;
function sfxBus(){ const c=ac(); if(!c) return null; if(!SFXG){ SFXG=c.createGain(); SFXG.connect(c.destination); } SFXG.gain.value=Math.max(0,Math.min(1,(P.vs??100)/100)); return SFXG; }
function tone(f,t0,dur,type="sine",vol=.12,f2=null){
  const c=ac(); if(!c) return;
  const o=c.createOscillator(), g=c.createGain(), s=c.currentTime+t0;
  o.type=type; o.frequency.setValueAtTime(f,s); if(f2) o.frequency.exponentialRampToValueAtTime(f2,s+dur);
  g.gain.setValueAtTime(0.0001,s); g.gain.exponentialRampToValueAtTime(vol,s+.012); g.gain.exponentialRampToValueAtTime(0.0001,s+dur);
  o.connect(g).connect(sfxBus()); o.start(s); o.stop(s+dur+.02);
}
function noise(t0,dur,vol=.15,freq=900){
  const c=ac(); if(!c) return;
  const b=c.createBuffer(1,Math.floor(c.sampleRate*dur),c.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
  const src=c.createBufferSource(), fl=c.createBiquadFilter(), g=c.createGain(), s=c.currentTime+t0;
  src.buffer=b; fl.type="bandpass"; fl.frequency.value=freq; g.gain.value=vol;
  src.connect(fl).connect(g).connect(sfxBus()); src.start(s);
}
const SFX = {
  click(){ tone(660,0,.06,"triangle",.05); },
  select(){ tone(520,0,.07,"triangle",.07,700); },
  place(){ tone(180,0,.12,"sine",.18,90); noise(0,.06,.08,600); },
  undo(){ tone(400,0,.08,"triangle",.06,260); },
  reveal(){ tone(392,0,.1,"triangle",.09); tone(587,.07,.14,"triangle",.08); },
  buff(){ tone(523,0,.08,"sine",.08); tone(784,.06,.12,"sine",.07); },
  debuff(){ tone(330,0,.16,"sawtooth",.05,200); },
  destroy(){ noise(0,.35,.22,300); tone(120,0,.3,"sawtooth",.07,50); },
  void(){ tone(600,0,.6,"sine",.1,60); noise(.05,.5,.08,1800); },
  lock(){ tone(140,0,.25,"square",.06); tone(110,.12,.35,"square",.05); },
  loc(){ tone(220,0,.5,"sine",.1,330); tone(330,.1,.5,"sine",.06,440); },
  coin(){ tone(1319,0,.08,"square",.04); tone(1760,.07,.16,"square",.04); },
  win(){ [523,659,784,1047].forEach((f,i)=>tone(f,i*.11,.28,"triangle",.1)); },
  lose(){ [392,330,262].forEach((f,i)=>tone(f,i*.16,.34,"sine",.1)); },
  draw(){ tone(440,0,.25,"triangle",.08); tone(440,.2,.3,"triangle",.06); },
  /* impacts de la cinématique de fin : ils se posent sous le jingle, ils ne le remplacent pas */
  ecwin(){ tone(82,0,.7,"sine",.24,41); noise(0,.3,.14,3200); [1319,1568,2093].forEach((f,i)=>tone(f,.05+i*.06,.5,"sine",.035)); },
  eclose(){ noise(0,.55,.26,240); noise(.04,.18,.16,2600); tone(58,0,1.3,"sine",.22,32); tone(233,.08,.9,"sawtooth",.025,110); },
  ecdraw(){ noise(0,.25,.14,1400); tone(330,0,.6,"triangle",.07); tone(311,0,.6,"triangle",.07); },
  pack(){ noise(0,.4,.12,2400); tone(300,0,.45,"sine",.08,900); },
  rare(){ [784,988,1319].forEach((f,i)=>tone(f,.9+i*.08,.3,"sine",.07)); },
  legend(){ [523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,.9+i*.07,.4,"triangle",.07)); }
};
function sfx(n){ if(!quiet && P.sfx && SFX[n]) try{ SFX[n](); }catch(e){} }
/* Musique : accueil (selon la saison), partie (deux morceaux au choix), tension dès le tour 5, jingles de fin.
   Chaque morceau est décodé une fois puis joué par Web Audio (AudioBufferSourceNode) : la boucle est sans coupure
   et la lecture ne passe plus par un élément <audio> (source de saccades sur Android). Trois morceaux décodés au plus en mémoire.
   Fondus par GainNode (sur iPhone, audio.volume est ignoré). Sans Web Audio, repli sur un élément <audio>.
   Le choix du morceau de partie utilise Math.random, jamais le tirage partagé des duels en ligne. */
const MUSIC={home:"audio/accueil.mp3",play:"audio/partie.mp3",play2:"audio/partie_2.mp3",tension:"audio/partie_tension.mp3",home_halloween:"audio/accueil_halloween.mp3",home_noel:"audio/accueil_noel.mp3",home_nouvelan:"audio/accueil_nouvelan.mp3",
  win:"audio/victoire.mp3",lose:"audio/defaite.mp3"};
/* bgm : morceau en cours ; bgmFade : celui qui s'éteint ; bgmHold : morceau de partie mis en pause pendant le jingle de fin */
let bgm=null, bgmFade=null, bgmHold=null, bgmArmed=false, jingle=null, playFor=null, playPick="play", nextPlay=null, endKey=null;
const mVol=()=>Math.max(0,Math.min(1,(P.vm??35)/100));
const MBUF=new Map(), MLOOP=new WeakMap();
/* Bornes de la boucle : on saute le silence du début et de la fin du fichier (jusqu'à 0,3 s), sinon il s'entend à chaque tour */
function mEdges(b){
  const n=b.length, lim=Math.min(n>>1,Math.floor(b.sampleRate*.3)), ch=[]; for(let c=0;c<b.numberOfChannels;c++) ch.push(b.getChannelData(c));
  const loud=i=>ch.some(d=>Math.abs(d[i])>.0015);
  let a=0; while(a<lim&&!loud(a)) a++; let z=n-1; while(n-1-z<lim&&!loud(z)) z--;
  return {ls:a/b.sampleRate,le:(z+1)/b.sampleRate};
}
function mBuf(key){
  let p=MBUF.get(key);
  if(p){ MBUF.delete(key); MBUF.set(key,p); return p; }
  p=fetch(MUSIC[key]).then(r=>{ if(!r.ok) throw new Error("audio "+r.status); return r.arrayBuffer(); })
    .then(ab=>new Promise((res,rej)=>AC.decodeAudioData(ab,res,rej))).then(b=>{ MLOOP.set(b,mEdges(b)); return b; });
  p.catch(()=>{ if(MBUF.get(key)===p) MBUF.delete(key); });
  MBUF.set(key,p);
  const busy=new Set([bgm,bgmFade,bgmHold,jingle].filter(Boolean).map(t=>t.key)); busy.add(key);
  for(const k of [...MBUF.keys()]){ if(MBUF.size<=2) break; if(!busy.has(k)) MBUF.delete(k); }
  return p;
}
function mTrack(key,loop=true){
  const c=ac(), t={key,loop,g:null,el:null,src:null,buf:null,off:0,t0:0,on:false,want:false,dead:false,onend:null,onfail:null};
  if(c){
    t.g=c.createGain(); t.g.gain.value=0; t.g.connect(c.destination);
    mBuf(key).then(b=>{ t.buf=b; if(t.want&&!t.dead) mStart(t); }).catch(()=>{ if(!t.dead) (t.onfail||t.onend||(()=>{}))(); });
  } else {
    t.el=new Audio(MUSIC[key]); t.el.loop=loop; t.el.preload="auto"; t.el.volume=0; t.el.onended=()=>{ if(t.onend) t.onend(); };
  }
  return t;
}
function mStart(t){
  if(t.on||t.dead||!t.buf) return;
  const s=AC.createBufferSource(), d=t.buf.duration, off=t.loop?t.off%d:Math.min(t.off,d);
  s.buffer=t.buf; s.loop=t.loop; s.connect(t.g);
  if(t.loop){ const e=MLOOP.get(t.buf); if(e&&e.le>e.ls){ s.loopStart=e.ls; s.loopEnd=e.le; } }
  s.onended=()=>{ if(t.src!==s) return; t.src=null; t.on=false; if(!t.loop&&t.onend) t.onend(); };
  s.start(0,off); t.src=s; t.t0=AC.currentTime-off; t.on=true;
}
function mPlay(t){ if(t.el){ return t.el.play(); } t.want=true; mStart(t); return Promise.resolve(); }
function mPause(t){
  t.want=false; if(t.el){ t.el.pause(); return; }
  if(!t.on) return; let pos=AC.currentTime-t.t0; const e=t.loop&&MLOOP.get(t.buf);
  if(e&&e.le>e.ls&&pos>e.le) pos=e.ls+(pos-e.ls)%(e.le-e.ls); t.off=pos; const s=t.src; t.src=null; t.on=false; try{ s.stop(); }catch(e){}
}
const mPaused=t=>t.el?t.el.paused:!t.want;
function mRamp(t,v,dur){ if(t.g&&AC){ const now=AC.currentTime; t.g.gain.cancelScheduledValues(now); t.g.gain.setValueAtTime(t.g.gain.value,now); t.g.gain.linearRampToValueAtTime(v,now+Math.max(.02,dur)); } else if(t.el) t.el.volume=v; }
function mStop(t,dur){ if(!t) return; mRamp(t,0,dur);
  setTimeout(()=>{ mPause(t); t.dead=true; if(t.g) try{ t.g.disconnect(); }catch(e){} if(t.el) t.el.removeAttribute("src"); },dur*1000+80); }
function musicKey(){
  if(screen==="play"&&S){
    if(playFor!==S){ playFor=S; playPick=nextPlay||(Math.random()<.5?"play":"play2"); nextPlay=null; } /* nextPlay : morceau déjà préchargé avant la partie */
    if(S.over) return endKey||playPick; /* écran de fin : le morceau de la partie reprend après le jingle */
    return S.turn>=5?"tension":playPick; }
  const se=season(); return se?"home_"+se:"home"; }
function music(){
  if(!P.music||!bgmArmed||document.hidden){ if(bgm) mPause(bgm); if(jingle){ mStop(jingle,.05); jingle=null; } return; }
  if(jingle) return;
  const key=musicKey();
  if(AC&&screen==="play"&&S&&!S.over&&S.turn===4) mBuf("tension").catch(()=>{}); /* prêt pour le tour 5 */
  if(!bgm||bgm.key!==key){
    const old=bgm, cross=!!old&&key==="tension";
    if(bgmFade){ mStop(bgmFade,0); bgmFade=null; } /* jamais plus de deux morceaux */
    if(old){ mStop(old,cross?2:.8); bgmFade=old; }
    if(bgmHold&&bgmHold.key===key){ bgm=bgmHold; bgmHold=null; mPlay(bgm).catch(()=>{}); mRamp(bgm,mVol(),2.5); }
    else { if(bgmHold){ mStop(bgmHold,0); bgmHold=null; } bgm=mTrack(key); mPlay(bgm).catch(()=>{}); mRamp(bgm,mVol(),cross?2:.8); }
  } else if(mPaused(bgm)){ mPlay(bgm).catch(()=>{}); mRamp(bgm,mVol(),.5); }
}
/* Fin de partie : le morceau de la partie s'efface en une seconde (mis en pause, pas arrêté), jingle de victoire ou de défaite,
   puis le même morceau reprend là où il s'était arrêté, en fondu. L'accueil ne revient qu'en quittant l'écran de partie. */
function endMusic(res){
  const k=res==="win"?"win":res==="lose"?"lose":null;
  endKey=bgm?bgm.key:(bgmHold?bgmHold.key:playPick);
  if(!k||!P.music||!bgmArmed||document.hidden){ sfx(k||"draw"); return; }
  if(bgm){ const h=bgm; bgm=null; if(bgmHold&&bgmHold!==h) mStop(bgmHold,0); bgmHold=h; mRamp(h,0,1); setTimeout(()=>{ if(bgmHold===h) mPause(h); },1080); }
  const j=mTrack(k,false); jingle=j; let done=false;
  const back=()=>{ if(done) return; done=true; if(jingle===j){ mStop(j,1.2); jingle=null; } music(); };
  j.onend=back; j.onfail=()=>{ sfx(k); back(); };
  setTimeout(()=>{ if(jingle!==j) return; mPlay(j).then(()=>mRamp(j,Math.min(1,mVol()*1.4),.05)).catch(j.onfail); },1000);
  setTimeout(back,9000);
}

/* ======= ÉTAT DE PARTIE ======= */
let S=null, uidN=0, games=0, screen="home", editName=false, deckMsg="", deckFilter="all", costFilter="all", rarFilter="all", ownFilter="all", searchQ="", filtOpen=false;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* ======= EFFETS VISUELS =======
   Une seule toile par-dessus l'écran, une seule boucle d'animation, en pause quand l'onglet est caché.
   Purement décoratif : aléatoire propre (jamais celui du jeu, partagé en duel), et toute erreur est avalée. */
const FX=(()=>{
  let cv=null, ctx=null, items=[], raf=0, dpr=1;
  const rnd=Math.random, reduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const size=()=>{ dpr=Math.min(2,devicePixelRatio||1); cv.width=innerWidth*dpr; cv.height=innerHeight*dpr; };
  const ensure=()=>{ if(!cv||!cv.isConnected){ cv=document.createElement("canvas"); cv.className="fxlayer"; cv.setAttribute("aria-hidden","true"); document.body.appendChild(cv); ctx=cv.getContext("2d"); size(); } return !!ctx; };
  addEventListener("resize",()=>{ if(cv) size(); });
  document.addEventListener("visibilitychange",()=>{ if(document.hidden) items=[]; });
  let amb=[];
  function loop(t){
    raf=0;
    amb=amb.filter(a=>{ if(!a.cv.isConnected) return false; try{ const c=a.ctx; c.setTransform(a.dpr,0,0,a.dpr,0,0); c.clearRect(0,0,a.w,a.h); const p=((t-a.t0)%4200)/4200; for(const g of a.gens) g(c,p,.85); return true; }catch(e){ return false; } });
    if(!ctx){ if(amb.length) raf=requestAnimationFrame(loop); return; }
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,innerWidth,innerHeight);
    items=items.filter(it=>{ const p=(t-it.t0)/it.dur; if(p>=1) return false; try{ ctx.save(); it.draw(ctx,Math.max(0,p)); ctx.restore(); return true; }catch(e){ ctx.restore(); (window.__fxErr=window.__fxErr||[]).push(String(e)); return false; } });
    if(items.length||amb.length) raf=requestAnimationFrame(loop);
  }
  const add=(dur,draw,tag)=>{ items.push({t0:performance.now(),dur,draw,tag}); if(!raf) raf=requestAnimationFrame(loop); };
  const locEl=li=>document.querySelector(`.loc[data-li="${li}"]`);
  const rect=el=>el&&el.getBoundingClientRect();
  const shake=(el,cls)=>{ if(!el||reduced()) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const ease=p=>1-Math.pow(1-p,3);
  const REG={
    /* Nike, « Les plumes de la Victoire » : une plume dorée par carte jouée avant elle, puis deux ailes et un laurier */
    nike_feathers({from,to,gap,flight,wingAt,total,pale,li}){
      const G="255,215,140", J="170,200,255", fe=from.map((f,i)=>({...f,i,cx:(f.x+to.x)/2+(rnd()-.5)*90,cy:Math.min(f.y,to.y)-80-rnd()*70,sp:rnd()*6}));
      const bz=(q,e)=>[(1-e)*(1-e)*q.x+2*(1-e)*e*q.cx+e*e*to.x,(1-e)*(1-e)*q.y+2*(1-e)*e*q.cy+e*e*to.y];
      const leaf=(c,x,y,a,l,w)=>{ c.save(); c.translate(x,y); c.rotate(a); c.beginPath(); c.ellipse(l/2,0,l/2,w,0,0,7); c.fill(); c.restore(); };
      add(total,(c,p)=>{ const t=p*total, r=rect(locEl(li)), fin=Math.max(0,Math.min(1,(total-t)/220));
        if(r){ c.fillStyle=rgba(J,.14*Math.min(1,t/200)*fin); c.fillRect(r.left,r.top,r.width,r.height); }
        for(const q of fe){ const k=(t-q.i*gap)/flight; if(k<0||k>1.2) continue; const e=ease(Math.min(1,k)), [x,y]=bz(q,e);
          for(let j=1;j<=4;j++){ const [tx,ty]=bz(q,ease(Math.max(0,Math.min(1,k)-j*.05))); c.globalAlpha=Math.max(0,.4-j*.08); c.fillStyle=rgba(G,1); c.beginPath(); c.arc(tx,ty,2.4-j*.4,0,7); c.fill(); }
          if(k<=1){ const [nx,ny]=bz(q,Math.min(1,e+.02)); c.save(); c.translate(x,y); c.rotate(Math.atan2(ny-y,nx-x)+Math.sin(t/90+q.sp)*.3);
            const g=c.createLinearGradient(-13,0,13,0); g.addColorStop(0,rgba(G,0)); g.addColorStop(.55,rgba("255,242,205",1)); g.addColorStop(1,rgba(G,.95));
            c.globalAlpha=1; c.fillStyle=g; c.beginPath(); c.ellipse(0,0,13,3.8,0,0,7); c.fill(); c.strokeStyle=rgba("255,250,232",.9); c.lineWidth=.8; c.beginPath(); c.moveTo(-13,0); c.lineTo(13,0); c.stroke(); c.restore(); }
          else { const a=1-(k-1)/.2, R=26*(k-1)/.2+8, gr=c.createRadialGradient(to.x,to.y,0,to.x,to.y,R); gr.addColorStop(0,rgba("255,245,215",.8*a)); gr.addColorStop(1,rgba(G,0)); c.globalAlpha=1; c.fillStyle=gr; c.fillRect(to.x-R,to.y-R,R*2,R*2); } }
        c.globalAlpha=1;
        if(t>=wingAt){ const w=ease(Math.min(1,(t-wingAt)/360))*(pale?.5:1), A=(pale?.45:.9)*fin;
          c.fillStyle=rgba(G,A);
          for(const sd of [-1,1]) for(let f=0;f<6;f++){ const th=(-1.15+f*.3)*w, len=to.h*(.34+f*.05)*(.45+.55*w), bx=to.x+sd*to.w*.4, by=to.y-to.h*.08;
            leaf(c,bx,by,Math.atan2(Math.sin(th),sd*Math.cos(th)),len,4.2-f*.35); }
          if(!pale){ const lk=Math.min(1,(t-wingAt)/420), R=to.w*.36, cy=to.y-to.h*.5-R*.55, n=Math.floor(9*lk);
            c.fillStyle=rgba("230,205,120",.95*fin);
            for(let i=0;i<n;i++) for(const sd of [-1,1]){ const a=Math.PI/2+sd*(.5+i*.27), lx=to.x+Math.cos(a)*R, ly=cy+Math.sin(a)*R*.8; leaf(c,lx,ly,a+sd*Math.PI/2+sd*.5,9,2.6); } } }
      },"nike_feathers");
    },
    /* La Faille s'ouvre : fissure brûlante qui court sur le lieu, braises qui s'en échappent */
    faille_open({li}){
      const el=locEl(li); if(!el) return; shake(el,"fxshake");
      const n=9, jag=Array.from({length:n+1},(_,i)=>({x:i/n,y:(i===0||i===n)?0:(rnd()-.5)*.5}));
      const sparks=Array.from({length:reduced()?0:36},()=>({u:rnd(),v:(rnd()-.5)*.1,vy:-(.2+rnd()*.6),vx:(rnd()-.5)*.3,r:1+rnd()*1.8,d:rnd()*.5}));
      add(reduced()?500:1150,(c,p)=>{ const r=rect(locEl(li)); if(!r) return;
        const cx=r.left, cy=r.top+r.height/2, w=r.width, h=r.height, k=reduced()?1:ease(Math.min(1,p/.55));
        const pts=jag.filter(q=>q.x<=k+.001).map(q=>[cx+q.x*w,cy+q.y*h*.45]);
        const glow=c.createRadialGradient(cx+w/2,cy,0,cx+w/2,cy,w*.7); glow.addColorStop(0,`rgba(255,90,60,${.35*k})`); glow.addColorStop(1,"rgba(120,20,60,0)");
        c.fillStyle=glow; c.fillRect(r.left,r.top,w,h);
        if(pts.length>1){ for(const [lw,col,blur] of [[6+6*k,"rgba(170,40,90,.55)",18],[2.5+2*k,"rgba(255,140,80,.95)",10],[1,"rgba(255,245,220,1)",0]]){
          c.beginPath(); pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.lineWidth=lw; c.strokeStyle=col; c.shadowColor="#ff5a3c"; c.shadowBlur=blur; c.lineJoin="round"; c.stroke(); } }
        c.shadowBlur=0;
        for(const sp of sparks){ const t=(p-sp.d)/(1-sp.d); if(t<=0||sp.u>k) continue;
          const x=cx+sp.u*w+sp.vx*t*w*.3, y=cy+sp.v*h+sp.vy*t*h*.9; c.globalAlpha=1-t; c.fillStyle=t<.4?"#ffe2b0":"#ff6a3c"; c.beginPath(); c.arc(x,y,sp.r,0,7); c.fill(); }
      });
    },
    /* La Faille se referme : des éclats venus des deux camps sont aspirés dans la fissure */
    faille_close({li}){
      const el=locEl(li); if(!el) return; const col=el.parentElement, sides=col?[col.children[0],col.children[2]]:[];
      const shards=reduced()?[]:sides.flatMap((sd,k)=>{ const r=rect(sd); if(!r) return []; return Array.from({length:22},()=>({x:r.left+rnd()*r.width,y:r.top+rnd()*r.height,s:3+rnd()*5,a:rnd()*6,spin:(rnd()-.5)*8,c:k?"#6fb8de":"#9a8cd0"})); });
      add(reduced()?400:900,(c,p)=>{ const r=rect(locEl(li)); if(!r) return; const cx=r.left+r.width/2, cy=r.top+r.height/2, k=ease(p);
        c.globalAlpha=1-p; c.strokeStyle="rgba(255,140,80,.9)"; c.lineWidth=3*(1-p); c.shadowColor="#ff5a3c"; c.shadowBlur=14;
        c.beginPath(); c.moveTo(r.left+r.width*p/2,cy); c.lineTo(r.right-r.width*p/2,cy); c.stroke(); c.shadowBlur=0;
        for(const sh of shards){ const x=sh.x+(cx-sh.x)*k, y=sh.y+(cy-sh.y)*k, s=sh.s*(1-k*.9);
          c.save(); c.translate(x,y); c.rotate(sh.a+sh.spin*p); c.globalAlpha=(1-p)*.9; c.fillStyle=sh.c; c.fillRect(-s/2,-s/2,s,s*.6); c.restore(); }
      });
    },
  };
  /* --- briques sur un lieu : chacune reçoit (toile, progression 0→1, rectangle du lieu, fondu) --- */
  const rgba=(c,a)=>`rgba(${c},${Math.max(0,Math.min(1,a)).toFixed(3)})`;
  const LAYER={
    rise:o=>{ const rings=Array.from({length:o.rings||0},()=>({u:.1+rnd()*.8,d:rnd()*.6}));
      return (c,p,r,f)=>{ const lvl=r.bottom-r.height*(o.h||.6)*Math.sin(Math.min(1,p*1.4)*Math.PI/2)*f;
        const g=c.createLinearGradient(0,lvl,0,r.bottom); g.addColorStop(0,rgba(o.c1,.6*f)); g.addColorStop(1,rgba(o.c2,.8*f));
        c.fillStyle=g; c.beginPath(); c.moveTo(r.left,r.bottom); for(let x=0;x<=r.width;x+=6) c.lineTo(r.left+x,lvl+Math.sin(x/14+p*14)*3); c.lineTo(r.right,r.bottom); c.closePath(); c.fill();
        c.strokeStyle=rgba(o.c3||"220,240,255",.8*f); c.lineWidth=1.5;
        for(const ri of rings){ const t=(p-ri.d)/.4; if(t<0||t>1) continue; c.globalAlpha=1-t; c.beginPath(); c.ellipse(r.left+ri.u*r.width,lvl+4,4+t*22,1.5+t*6,0,0,7); c.stroke(); } c.globalAlpha=1; }; },
    burst:o=>{ const ps=Array.from({length:o.n||32},()=>({a:o.up?-Math.PI/2+(rnd()-.5)*1.4:rnd()*7,v:.3+rnd()*.7,r:1+rnd()*2.2,d:rnd()*.3,c:o.col[1+Math.floor(rnd()*(o.col.length-1))]||o.col[0]}));
      return (c,p,r,f)=>{ const cx=r.left+r.width/2, cy=o.up?r.bottom-8:r.top+r.height/2, R=Math.max(r.width,r.height);
        const fl=Math.max(0,1-p*2.5); if(fl>0){ const g=c.createRadialGradient(cx,r.top+r.height/2,0,cx,r.top+r.height/2,R*.7); g.addColorStop(0,rgba(o.col[0],.55*fl)); g.addColorStop(1,rgba(o.col[0],0)); c.fillStyle=g; c.fillRect(r.left,r.top,r.width,r.height); }
        for(const q of ps){ const t=(p-q.d)/(1-q.d); if(t<=0) continue; const e=ease(t)*R*.6*q.v; c.globalAlpha=(1-t)*f; c.fillStyle=rgba(q.c,1); c.beginPath(); c.arc(cx+Math.cos(q.a)*e,cy+Math.sin(q.a)*e,q.r,0,7); c.fill(); } c.globalAlpha=1; }; },
    smoke:o=>{ const ps=Array.from({length:o.n||12},()=>({x:rnd(),y:rnd(),s:.25+rnd()*.35,d:rnd()*.3}));
      return (c,p,r,f)=>{ const cx=r.left+r.width/2, cy=r.top+r.height/2;
        for(const q of ps){ const t=Math.max(0,(p-q.d)/(1-q.d)), k=o.conv?ease(t):0, x=r.left+q.x*r.width, y=r.top+q.y*r.height;
          const px=o.conv?x+(cx-x)*k:x+(t-.5)*r.width*.3, py=o.conv?y+(cy-y)*k:y-t*r.height*.3, rad=q.s*r.width*(o.conv?1-k*.5:1+t*.4);
          const g=c.createRadialGradient(px,py,0,px,py,rad); g.addColorStop(0,rgba(o.col,.45*f*Math.sin(Math.min(1,t*1.2)*Math.PI))); g.addColorStop(1,rgba(o.col,0)); c.fillStyle=g; c.fillRect(px-rad,py-rad,rad*2,rad*2); } }; },
    rays:o=>{ const bs=Array.from({length:o.n||5},(_,i)=>({x:(i+.5)/(o.n||5)+(rnd()-.5)*.1,w:.06+rnd()*.08,ph:rnd()*6}));
      return (c,p,r,f)=>{ c.globalCompositeOperation="lighter";
        for(const q of bs){ const a=f*(.35+.25*Math.sin(p*9+q.ph)), x=r.left+q.x*r.width, top=r.top-r.height*.15;
          const g=c.createLinearGradient(0,top,0,r.bottom); g.addColorStop(0,rgba(o.col,a)); g.addColorStop(1,rgba(o.col,0));
          c.fillStyle=g; c.beginPath(); c.moveTo(x-r.width*q.w*.3,top); c.lineTo(x+r.width*q.w*.3,top); c.lineTo(x+r.width*q.w*1.6,r.bottom); c.lineTo(x-r.width*q.w*1.6,r.bottom); c.closePath(); c.fill(); }
        c.globalCompositeOperation="source-over"; }; },
    vortex:o=>{ const ps=Array.from({length:o.n||40},()=>({a:rnd()*7,r0:.35+rnd()*.4,s:1+rnd()*2,d:rnd()*.4,c:o.col[Math.floor(rnd()*o.col.length)]}));
      return (c,p,r,f)=>{ const cx=r.left+r.width/2, cy=r.top+r.height/2, R=Math.max(r.width,r.height)*.6, dir=o.rev?-1:1;
        const g=c.createRadialGradient(cx,cy,0,cx,cy,R*.6); g.addColorStop(0,rgba(o.col[0],.4*f)); g.addColorStop(1,rgba(o.col[0],0)); c.fillStyle=g; c.fillRect(r.left,r.top,r.width,r.height);
        for(const q of ps){ const t=Math.max(0,(p-q.d)/(1-q.d)), rr=R*q.r0*(1-ease(t)*.9), a=q.a+dir*t*7;
          c.globalAlpha=f*(1-t*.6); c.fillStyle=rgba(q.c,1); c.beginPath(); c.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.6,q.s,0,7); c.fill(); } c.globalAlpha=1; }; },
    rings:o=>(c,p,r,f)=>{ const cx=r.left+r.width/2, cy=r.top+r.height/2, R=Math.max(r.width,r.height)*.75;
      for(let i=0;i<(o.n||3);i++){ const t=p*1.4-i*.18; if(t<=0||t>=1) continue; c.strokeStyle=rgba(o.col,(1-t)*f); c.lineWidth=2.5*(1-t)+.5; c.beginPath(); c.ellipse(cx,cy,R*ease(t),R*ease(t)*.55,0,0,7); c.stroke(); } },
    chains:o=>(c,p,r,f)=>{ const k=ease(Math.min(1,p*2));
      for(const [x0,y0,x1,y1] of [[r.left,r.top,r.right,r.bottom],[r.right,r.top,r.left,r.bottom]]){ const n=11;
        for(let i=0;i<n*k;i++){ const u=i/n, x=x0+(x1-x0)*u, y=y0+(y1-y0)*u; c.strokeStyle=rgba(o.col,.9*f); c.lineWidth=2; c.beginPath(); c.ellipse(x,y,6,3.5,Math.atan2(y1-y0,x1-x0)+(i%2?Math.PI/2:0)*.0,0,7); c.stroke(); } }
      if(p>.5&&p<.75){ c.fillStyle=rgba(o.col,(.75-p)*1.6*f); c.fillRect(r.left,r.top,r.width,r.height); } },
    sweep:o=>(c,p,r,f)=>{ const x=r.left-r.width*.3+p*r.width*1.6, g=c.createLinearGradient(x-r.width*.25,0,x+r.width*.25,0);
      g.addColorStop(0,rgba(o.col,0)); g.addColorStop(.5,rgba(o.col,.6*f)); g.addColorStop(1,rgba(o.col,0)); c.fillStyle=g; c.fillRect(r.left,r.top,r.width,r.height); },
    sparkle:o=>{ const ps=Array.from({length:o.n||14},()=>({x:rnd(),y:rnd(),s:2+rnd()*3,ph:rnd()*6}));
      return (c,p,r,f)=>{ c.fillStyle=rgba(o.col,1); for(const q of ps){ const a=Math.max(0,Math.sin(p*10+q.ph))*f; if(a<=0) continue; const x=r.left+q.x*r.width, y=r.top+q.y*r.height, s=q.s*a;
        c.globalAlpha=a; c.beginPath(); c.moveTo(x,y-s*2); c.lineTo(x+s*.5,y); c.lineTo(x,y+s*2); c.lineTo(x-s*.5,y); c.closePath(); c.moveTo(x-s*2,y); c.lineTo(x,y+s*.5); c.lineTo(x+s*2,y); c.lineTo(x,y-s*.5); c.closePath(); c.fill(); } c.globalAlpha=1; }; },
    flicker:o=>(c,p,r,f)=>{ const a=f*(.25+.25*Math.sin(p*40)*Math.sin(p*13)); const g=c.createRadialGradient(r.left+r.width*(o.x||.5),r.top+r.height*(o.y||.3),0,r.left+r.width*(o.x||.5),r.top+r.height*(o.y||.3),r.width*.5); g.addColorStop(0,rgba(o.col,a)); g.addColorStop(1,rgba(o.col,0)); c.fillStyle=g; c.fillRect(r.left,r.top,r.width,r.height); },
  };
  /* --- ambiances plein écran, réservées aux ultra-légendaires --- */
  const SCREEN={
    rain:o=>{ const W=o.W||innerWidth,H=o.H||innerHeight, ds=Array.from({length:Math.min(160,Math.round(W*H/2600))},()=>({x:rnd()*W*1.2,y:-rnd()*H,l:10+rnd()*18,v:.9+rnd()*.7}));
      return (c,p,f)=>{ c.strokeStyle=rgba(o.col||"170,215,255",.55*f); c.lineWidth=1.2; c.beginPath(); for(const d of ds){ const y=(d.y+p*H*1.6*d.v)%(H+40), x=d.x-y*.18; c.moveTo(x,y); c.lineTo(x-d.l*.18,y+d.l); } c.stroke(); }; },
    petals:o=>{ const W=o.W||innerWidth,H=o.H||innerHeight, ds=Array.from({length:Math.min(70,Math.round(W*H/6000))},()=>({x:rnd()*W,y:-rnd()*H*.8,s:4+rnd()*5,v:.5+rnd()*.6,ph:rnd()*6,c:o.col[Math.floor(rnd()*o.col.length)]}));
      return (c,p,f)=>{ for(const d of ds){ const y=d.y+p*H*1.3*d.v, x=d.x+Math.sin(p*6+d.ph)*30; c.save(); c.translate(x,y); c.rotate(p*5+d.ph); c.globalAlpha=.85*f; c.fillStyle=rgba(d.c,1); c.beginPath(); c.ellipse(0,0,d.s*(o.thin?1.6:1),d.s*(o.thin?.3:.55),0,0,7); c.fill(); c.restore(); } }; },
    embers:o=>{ const W=o.W||innerWidth,H=o.H||innerHeight, ds=Array.from({length:Math.min(90,Math.round(W*H/4500))},()=>({x:rnd()*W,y:o.up?H+rnd()*H*.5:-rnd()*H*.6,s:1.5+rnd()*2.5,v:.6+rnd()*.8,ph:rnd()*6}));
      return (c,p,f)=>{ c.globalCompositeOperation="lighter"; for(const d of ds){ const y=o.up?d.y-p*H*1.2*d.v:d.y+p*H*1.4*d.v, x=d.x+Math.sin(p*5+d.ph)*12;
        const g=c.createRadialGradient(x,y,0,x,y,d.s*3); g.addColorStop(0,rgba(o.col[0],.95*f)); g.addColorStop(.4,rgba(o.col[1]||o.col[0],.5*f)); g.addColorStop(1,rgba(o.col[1]||o.col[0],0)); c.fillStyle=g; c.fillRect(x-d.s*3,y-d.s*3,d.s*6,d.s*6); }
        c.globalCompositeOperation="source-over"; }; },
    lightning:o=>{ const W=o.W||innerWidth,H=o.H||innerHeight, bolts=[.12,.42,.7].map(t=>{ let x=W*(.2+rnd()*.6), y=0; const pts=[[x,y]]; while(y<H*.7){ y+=20+rnd()*40; x+=(rnd()-.5)*60; pts.push([x,y]); } return {t,pts}; });
      return (c,p,f)=>{ for(const b of bolts){ const a=1-Math.abs(p-b.t)/.07; if(a<=0) continue;
        c.fillStyle=rgba(o.col||"210,225,255",.25*a); c.fillRect(0,0,W,H);
        for(const [lw,al] of [[6,.35],[2,1]]){ c.strokeStyle=rgba(o.col||"230,240,255",al*a); c.lineWidth=lw; c.shadowColor="#bcd4ff"; c.shadowBlur=16; c.beginPath(); b.pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.stroke(); } c.shadowBlur=0; } }; },
    snow:o=>{ const W=o.W||innerWidth,H=o.H||innerHeight, ds=Array.from({length:Math.min(110,Math.round(W*H/3500))},()=>({x:rnd()*W,y:-rnd()*H*.6,s:1+rnd()*2.5,v:.3+rnd()*.5,ph:rnd()*6}));
      return (c,p,f)=>{ c.fillStyle=rgba(o.col||"235,242,255",.85*f); for(const d of ds){ const y=d.y+p*H*1.2*d.v, x=d.x+Math.sin(p*4+d.ph)*20; c.beginPath(); c.arc(x,y,d.s,0,7); c.fill(); } }; },
    dust:o=>{ const W=o.W||innerWidth,H=o.H||innerHeight, ds=Array.from({length:Math.min(90,Math.round(W*H/4000))},()=>({x:rnd()*W,y:rnd()*H,s:1+rnd()*2,ph:rnd()*6,vx:(rnd()-.5)*40,vy:-10-rnd()*30}));
      return (c,p,f)=>{ c.globalCompositeOperation="lighter"; for(const d of ds){ const a=Math.max(0,Math.sin(p*8+d.ph))*f; c.fillStyle=rgba(o.col||"255,215,120",a); c.beginPath(); c.arc(d.x+d.vx*p,d.y+d.vy*p,d.s,0,7); c.fill(); } c.globalCompositeOperation="source-over"; }; },
    bubbles:o=>{ const W=o.W||innerWidth,H=o.H||innerHeight, ds=Array.from({length:Math.min(60,Math.round(W*H/6000))},()=>({x:rnd()*W,y:H+rnd()*H*.4,s:3+rnd()*8,v:.5+rnd()*.7,ph:rnd()*6}));
      return (c,p,f)=>{ c.strokeStyle=rgba(o.col||"190,240,255",.7*f); c.lineWidth=1.2; for(const d of ds){ const y=d.y-p*H*1.3*d.v, x=d.x+Math.sin(p*6+d.ph)*10; c.beginPath(); c.arc(x,y,d.s,0,7); c.stroke(); } }; },
  };
  /* --- mélanges : un par carte ou par lieu. loc = briques sur le lieu ; screen et tint = ultra-légendaires seulement --- */
  const W_="170,215,255", GOLD="255,205,110";
  const MIX={
    apsu:     {loc:[["rise",{c1:"90,180,235",c2:"10,50,110",rings:6}]], screen:[["rain",{}]], tint:"10,40,80"},
    vritra:   {loc:[["smoke",{col:"60,80,40",conv:true}],["chains",{col:"215,180,90"}]]},
    nyx:      {loc:[["smoke",{col:"25,12,50",conv:true,n:16}],["sparkle",{col:"220,210,255"}]]},
    lilith:   {loc:[["vortex",{col:["200,40,90","255,120,170","120,10,50"]}]]},
    ereshkigal:{loc:[["rise",{c1:"60,20,80",c2:"10,0,20",h:.5,c3:"180,120,255"}],["rings",{col:"170,110,255"}]]},
    izzy_h:   {loc:[["burst",{col:["200,20,40","255,80,80","255,170,120"]}],["flicker",{col:"220,30,40"}]]},
    yarden_d: {loc:[["burst",{col:["130,60,220","190,120,255","40,10,80"],up:true,n:40}],["smoke",{col:"30,10,60"}]]},
    voleuse:  {loc:[["sweep",{col:"255,220,150"}],["sparkle",{col:GOLD,n:10}]]},
    maree:    {loc:[["rise",{c1:"20,60,60",c2:"0,10,15",h:.7,c3:"120,200,190",rings:3}]]},
    anubis:   {loc:[["rays",{col:GOLD}],["rings",{col:"230,190,100",n:2}]]},
    nemesis:  {loc:[["vortex",{col:["170,190,230","230,235,255"],rev:true}],["rings",{col:"200,215,255"}]]},
    mohini:   {loc:[["vortex",{col:["255,150,200","255,210,230"]}],["sparkle",{col:"255,200,230"}]]},
    carillonneur:{loc:[["rings",{col:GOLD,n:4}],["flicker",{col:GOLD,y:.15}]]},
    cronos:   {loc:[["vortex",{col:["150,110,70","90,60,40","220,170,110"]}],["smoke",{col:"60,50,45"}],["flicker",{col:"200,150,90",y:.3}]]},
    zeus:     {loc:[["burst",{col:["255,245,200","200,220,255","255,255,255"]}],["rays",{col:"230,235,255",n:4}],["flicker",{col:"210,225,255",y:.2}]]},
    odin:     {loc:[["smoke",{col:"120,130,150"}],["rays",{col:"200,215,235",n:3}]]},
    hel:      {loc:[["smoke",{col:"120,170,210"}],["sparkle",{col:"200,230,255"}]]},
    hades:    {loc:[["rise",{c1:"140,30,20",c2:"20,0,0",h:.45,c3:"255,120,60"}],["burst",{col:["255,90,40","255,170,80"],up:true}]]},
    ulji:     {loc:[["vortex",{col:["200,30,60","255,110,140"]}]], screen:[["petals",{col:["200,30,60","150,10,40","255,120,150"]}]], tint:"60,0,20"},
    ulaph:    {loc:[["vortex",{col:["255,120,180","255,200,225"]}]], screen:[["petals",{col:["255,150,200","255,200,225","230,90,150"]}]], tint:"70,10,40"},
    ulcal:    {loc:[["rings",{col:"140,230,240",n:4}],["rise",{c1:"80,200,210",c2:"10,70,90",h:.35}]], screen:[["bubbles",{}]], tint:"0,50,60"},
    ulnem:    {loc:[["burst",{col:["230,240,255","180,200,255"]}],["rings",{col:"220,230,255"}]], screen:[["lightning",{}]], tint:"10,15,40"},
    ulcirce:  {loc:[["vortex",{col:["90,200,120","180,120,255","210,255,200"]}]], screen:[["dust",{col:"170,255,190"}]], tint:"15,30,25"},
    uloshun:  {loc:[["rise",{c1:"240,200,90",c2:"120,80,10",rings:5,c3:"255,240,200"}]], screen:[["dust",{col:GOLD}],["rain",{col:"255,215,130"}]], tint:"50,35,0"},
    ulqetjor: {loc:[["rays",{col:"255,170,200"}]], screen:[["petals",{col:["255,180,200","255,220,230"]}]], tint:"50,10,30"},
    ulpele_r: {loc:[["rise",{c1:"230,70,15",c2:"90,5,0",h:.5,c3:"255,190,100"}],["burst",{col:["255,90,30","255,190,80","255,240,200"],up:true,n:40}],["flicker",{col:"255,140,40",y:.7}]], screen:[["embers",{col:["255,210,100","255,80,20"]}]], tint:"50,10,0"},
    ulqetjor_r:{loc:[["rays",{col:"255,215,140"}],["sparkle",{col:"255,230,170"}]], screen:[["bubbles",{}]], tint:"45,30,5"},
    ulqetyar: {loc:[["rise",{c1:"255,120,30",c2:"120,10,0",h:.5,c3:"255,200,120"}],["burst",{col:["255,120,40","255,200,90"],up:true}]], screen:[["embers",{col:["255,200,90","255,80,20"]}]], tint:"50,10,0"},
    ulhel:    {loc:[["rays",{col:"255,240,200"}],["smoke",{col:"150,190,230"}]], screen:[["snow",{}]], tint:"20,30,50"},
    styx:     {loc:[["rise",{c1:"60,70,90",c2:"5,8,14",h:.55,c3:"190,150,255",rings:4}],["sparkle",{col:"180,230,220",n:10}]]},
    promethee:{loc:[["burst",{col:["255,150,50","255,200,90","255,240,200"],up:true,n:36}],["flicker",{col:"255,140,40",y:.7}]]},
    ananke:   {loc:[["smoke",{col:"40,20,70",conv:true,n:16}],["chains",{col:"255,205,120"}],["sparkle",{col:"255,215,140",n:12}]], screen:[["dust",{col:GOLD}]], tint:"15,8,30"},
    hedone:   {loc:[["rise",{c1:"255,190,70",c2:"90,40,5",h:.5,c3:"255,230,160"}],["chains",{col:"255,205,120"}],["sparkle",{col:"255,215,140",n:14}]], screen:[["petals",{col:["255,200,90","240,150,60","255,230,170"],thin:true}],["dust",{col:GOLD}]], tint:"30,15,5"},
    source:   {loc:[["rise",{c1:"110,190,255",c2:"10,30,70",h:.5,c3:"220,245,255"}],["sparkle",{col:"170,225,255",n:14}],["rings",{col:"150,210,255",n:3}]], screen:[["rain",{col:"170,200,240"}],["dust",{col:"170,215,255"}]], tint:"8,18,40"},
    nike:     {loc:[["rays",{col:"255,215,140"}],["rings",{col:"255,220,150",n:3}]], screen:[["petals",{col:["240,200,120","45,40,48","255,230,170"],thin:true}],["rain",{col:"200,215,240"}],["dust",{col:GOLD}]], tint:"20,25,45"},
    /* lieux, à leur révélation */
    l_ouchy:  {loc:[["rise",{c1:"110,170,220",c2:"20,50,90",h:.25,rings:5}]]},
    l_sousgare:{loc:[["sweep",{col:"255,230,170"}],["smoke",{col:"90,90,100"}]]},
    l_ruelle: {loc:[["smoke",{col:"110,120,140"}],["flicker",{col:"255,200,120",x:.75,y:.2}]]},
    l_tour:   {loc:[["sparkle",{col:"255,220,160",n:18}],["flicker",{col:"255,190,120",y:.6}]]},
    l_domaine:{loc:[["rays",{col:GOLD}],["sparkle",{col:GOLD}]]},
    l_tombeau:{loc:[["smoke",{col:"90,140,130"}]]},
    l_cirque: {loc:[["burst",{col:["255,90,90","255,200,100","120,180,255"],n:26}],["sparkle",{col:"255,215,140",n:12}]]},
    l_sauvabelin:{loc:[["smoke",{col:"110,190,130",n:14}],["sparkle",{col:"200,240,150",n:10}]]},
    l_flon:   {loc:[["sweep",{col:"255,205,150"}],["rays",{col:"180,205,255",n:3}]]},
    l_escaliers:{loc:[["rays",{col:"255,210,150",n:4}],["smoke",{col:"205,205,225"}]]},
    l_encheres:{loc:[["rings",{col:GOLD,n:3}],["sweep",{col:"255,225,150"}]]},
    l_faille: {loc:[["flicker",{col:"255,80,60",y:.5}],["burst",{col:["255,80,60","255,160,90","255,230,190"],n:20}]]},
    l_archives:{loc:[["burst",{col:["230,210,170","245,235,210"],up:true,n:22}],["flicker",{col:"240,210,150"}]]},
    l_cathedrale:{loc:[["rays",{col:"235,235,255",n:4}],["rings",{col:GOLD,n:2}]]},
    /* épiques : une brève gerbe d'étincelles sur le lieu, à la couleur de la faction (moins d'une seconde) */
    epic_helvara:   {loc:[["sparkle",{col:"255,215,140",n:11}],["rings",{col:"255,215,140",n:1}]]},
    epic_primordial:{loc:[["sparkle",{col:"255,150,100",n:11}],["rings",{col:"255,150,100",n:1}]]},
    epic_desir:     {loc:[["sparkle",{col:"255,160,205",n:11}],["rings",{col:"255,160,205",n:1}]]},
    epic_jugement:  {loc:[["sparkle",{col:"175,205,255",n:11}],["rings",{col:"175,205,255",n:1}]]},
    tombeau_rise:{loc:[["smoke",{col:"110,200,170",conv:false,n:16}],["burst",{col:["150,255,210","90,200,170"],up:true,n:30}]]},
  };
  function mix({key,li,ultra,epic}){
    const M=MIX[key], el=locEl(li); if(!M||!el) return; const red=reduced(); if(epic&&red) return;
    const layers=red?[]:M.loc.map(([k,o])=>LAYER[k](o)), scr=(ultra&&!red&&M.screen)?M.screen.map(([k,o])=>SCREEN[k](o)):[];
    if(ultra||key==="tombeau_rise") shake(el,"fxshake");
    add(red?450:(ultra?1900:(epic?800:1250)),(c,p)=>{ const r=rect(locEl(li)); if(!r) return; const f=p<.15?p/.15:p>.78?(1-p)/.22:1, W=innerWidth, H=innerHeight;
      if(ultra&&M.tint){ c.fillStyle=rgba(M.tint,.32*f); c.fillRect(0,0,W,H); }
      if(red){ c.fillStyle=rgba((M.loc[0][1].col&&[].concat(M.loc[0][1].col)[0])||M.loc[0][1].c1||"200,200,255",.3*f); c.fillRect(r.left,r.top,r.width,r.height); return; }
      for(const d of scr) d(c,p,f);
      c.save(); c.beginPath(); c.roundRect?c.roundRect(r.left,r.top,r.width,r.height,12):c.rect(r.left,r.top,r.width,r.height); c.clip();
      for(const d of layers) d(c,p,r,f); c.restore();
      if(ultra&&p<.2){ c.fillStyle=`rgba(255,255,255,${(.2-p)*1.1})`; c.fillRect(0,0,W,H); }
    });
  }
  /* Ambiance vivante dans l'illustration d'une ultra-légendaire en grand (aperçu, appui long) */
  function decorate(root){
    if(reduced()||document.hidden) return;
    root.querySelectorAll(".full.amb").forEach(el=>{ if(el.querySelector("canvas.ambcv")) return; const M=MIX[el.dataset.vfx]; if(!M||!M.screen) return;
      const r=el.getBoundingClientRect(); if(!r.width) return; const cv=document.createElement("canvas"), d=Math.min(2,devicePixelRatio||1);
      cv.className="ambcv"; cv.width=r.width*d; cv.height=r.height*d; el.appendChild(cv);
      amb.push({cv,ctx:cv.getContext("2d"),dpr:d,w:r.width,h:r.height,t0:performance.now(),gens:M.screen.map(([k,o])=>SCREEN[k]({...o,W:r.width,H:r.height}))});
      if(!raf) raf=requestAnimationFrame(loop); });
  }
  return { stop(tag){ items=items.filter(it=>it.tag!==tag); }, decorate(root){ try{ decorate(root); }catch(e){} }, play(key,arg){ try{ if(!ensure()) return; if(REG[key]) REG[key](arg||{}); else if(MIX[key]) mix({...(arg||{}),key}); }catch(e){ (window.__fxErr=window.__fxErr||[]).push(String(e)); } } };
})();
/* Effet visuel d'une carte à sa Révélation : réservé aux légendaires et ultra-légendaires qui en ont un (champ vfx). */
function cardVfx(id,li){ const d=CARDS[id]; if(!d) return; if(d.vfx&&(d.r==="L"||d.r==="U")) FX.play(d.vfx,{li,ultra:d.r==="U"}); else if(d.r==="E"&&!d.token) FX.play("epic_"+d.fac,{li,epic:true}); }
/* Cinématique de fusion : les deux cartes sources se percutent et la fusion apparaît (1,5 s au plus, un toucher la saute).
   Réservée aux vraies fusions (entrée ULS avec des req). Locale : elle ne touche ni l'état de la partie ni la synchro en ligne. */
function fusionCine(id,s){
  return new Promise(done=>{
    if(typeof Element.prototype.animate!=="function"||matchMedia("(prefers-reduced-motion: reduce)").matches){ done(); return; }
    const u=ULof(id), dk=(S&&S.blitz&&P.bz&&P.bz.run)?P.bz.run.deck:P.deck;
    const srcs=(u&&u.req||[]).map(r=>{ const ids=[].concat(r); return (s==="p"&&ids.find(x=>dk.includes(x)))||ids[0]; }).filter(x=>CARDS[x]);
    if(srcs.length<2){ done(); return; }
    const nm=x=>CARDS[x].name, ov=document.createElement("div"); ov.className="cine"; ov.setAttribute("aria-hidden","true");
    ov.innerHTML=srcs.map((x,i)=>`<div class="cc ${i?"r":"l"}" style="left:50%;top:50%">${art(x)}<span>${nm(x)}</span></div>`).join("")
      +`<div class="res" style="left:50%;top:50%">${art(id)}<span>${nm(id)}</span></div><div class="flash"></div><div class="skip">${trUI("Touche pour passer")}</div>`;
    document.body.appendChild(ov);
    const anims=[], A=(el,kf,o)=>{ if(el) anims.push(el.animate(kf,{fill:"both",...o})); };
    const T="translate(-50%,-50%)", q=sel=>ov.querySelector(sel), resAt=600;
    A(q(".cc.l"),[{transform:`${T} translateX(-72vw) rotate(-9deg)`,opacity:1},{transform:`${T} translateX(-9vw) rotate(0)`,opacity:1,offset:.8},{transform:`${T} translateX(-3vw) scale(1.12)`,opacity:0}],{duration:700,easing:"cubic-bezier(.5,0,.9,.6)"});
    A(q(".cc.r"),[{transform:`${T} translateX(72vw) rotate(9deg)`,opacity:1},{transform:`${T} translateX(9vw) rotate(0)`,opacity:1,offset:.8},{transform:`${T} translateX(3vw) scale(1.12)`,opacity:0}],{duration:700,easing:"cubic-bezier(.5,0,.9,.6)"});
    A(q(".flash"),[{opacity:0},{opacity:.95,offset:.3},{opacity:0}],{duration:420,delay:resAt-150});
    A(q(".res"),[{opacity:0,transform:`${T} scale(.55)`},{opacity:1,transform:`${T} scale(1)`}],{duration:380,delay:resAt,easing:"cubic-bezier(.2,.9,.3,1.2)"});
    A(ov,[{opacity:1},{opacity:0}],{duration:150,delay:1300});
    let over=false; const end=()=>{ if(over) return; over=true; clearTimeout(tm); anims.forEach(a=>{ try{ a.cancel(); }catch(e){} }); ov.remove(); done(); };
    const tm=setTimeout(end,1450); ov.addEventListener("pointerdown",end);
  });
}
/* Ultra-légendaires de faction : pas de fusion, mais un effet de pose propre à chacune (Nike d'abord ; Helvara, Désir et Primordial viendront) */
const FACTION_CINE={nike:nikeCine,nike_v:nikeCine};
function factionCine(id,s,li){ const f=FACTION_CINE[id]; return f?f(id,s,li):Promise.resolve(); }
/* Nike, « Les plumes de la Victoire » : chaque carte posée avant elle ce tour lâche une plume qui vole vers elle, le compteur monte de 2,
   puis deux ailes s'ouvrent et un laurier se forme. Jouée en premier : ailes à moitié ouvertes, plus pâles, sans compteur.
   1,5 s au plus, un toucher la saute. Cinématique coupée ou mouvement réduit : seulement le compteur final, 0,8 s. */
function nikeCine(id,s,li){
  return new Promise(done=>{
    const nk=S.board[s][li].find(c=>c.id===id&&!c.rev)||S.board[s][li].find(c=>c.id===id);
    const plays=(S.turnPlays&&S.turnPlays[s])||[], k=plays.indexOf(nk), before=(k>0?plays.slice(0,k):[]).filter(x=>charOf(x.id)!=="aphrodite"&&x.id!=="ulaph"), n=before.length;
    const elOf=c=>c&&document.querySelector(`[data-cu="${c.uid}"]`);
    const tEl=elOf(nk)||document.querySelector(`.loc[data-li="${li}"]`), tr=tEl&&tEl.getBoundingClientRect();
    if(!tr||!tr.width){ done(); return; }
    const to={x:tr.left+tr.width/2,y:tr.top+tr.height/2,w:tr.width,h:tr.height};
    const counter=v=>{ const d=document.createElement("div"); d.className="fcount"; d.textContent="+"+v; d.style.left=to.x+"px"; d.style.top=(tr.top-4)+"px"; document.body.appendChild(d); return d; };
    if(P.cine===false||matchMedia("(prefers-reduced-motion: reduce)").matches){ if(n){ const d=counter(2*n); setTimeout(()=>d.remove(),800); } done(); return; }
    const flight=420, gap=n>1?Math.min(150,560/(n-1)):0, wingAt=n?(n-1)*gap+flight+40:60, total=Math.min(1500,wingAt+700);
    const from=before.map(c=>{ const r=elOf(c)&&elOf(c).getBoundingClientRect(); return r&&r.width?{x:r.left+r.width/2,y:r.top+r.height/2}:{x:to.x,y:to.y-140}; });
    FX.play("nike_feathers",{from,to,gap,flight,wingAt,total,pale:!n,li});
    const ov=document.createElement("div"); ov.className="fcine"; ov.setAttribute("aria-hidden","true"); document.body.appendChild(ov);
    const cnt=n?counter(0):null; if(cnt) cnt.style.opacity="0";
    const tms=before.map((_,i)=>setTimeout(()=>{ cnt.textContent="+"+2*(i+1); cnt.style.opacity="1"; if(cnt.animate) cnt.animate([{transform:"translate(-50%,-100%) scale(1.4)"},{transform:"translate(-50%,-100%) scale(1)"}],{duration:220}); sfx("buff"); },i*gap+flight));
    tms.push(setTimeout(()=>sfx(n?"legend":"reveal"),wingAt));
    let over=false; const end=()=>{ if(over) return; over=true; tms.forEach(clearTimeout); FX.stop("nike_feathers"); ov.remove(); if(cnt){ cnt.style.transition="opacity .25s"; cnt.style.opacity="0"; setTimeout(()=>cnt.remove(),260); } done(); };
    tms.push(setTimeout(end,total)); ov.addEventListener("pointerdown",end);
  });
}
/* ======= CINÉMATIQUE DE FIN DE PARTIE =======
   Entièrement en code (une toile + du CSS), jouée avant le panneau de résultat, par-dessus la musique de fin.
   Victoire : l'écran s'assombrit, chaque lieu gagné lance une colonne de lumière dorée, le titre tombe dans une gerbe d'or
   sous des rayons tournants, puis des paillettes retombent. Défaite : le plateau se fige en gris, des fissures partent du centre
   jusqu'aux bords, les lieux perdus tremblent et s'affaissent, des cendres tombent. Égalité : un front bleu et un front violet se heurtent.
   Environ 2,7 s, un toucher la saute. Cinématiques coupées ou mouvement réduit : le panneau s'affiche directement.
   Aléatoire propre (Math.random), jamais celui de la partie : sans effet sur les duels en ligne. */
function endCine(o){
  if(!o||o.tut||P.cine===false||matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  o.hold=true;
  const R=Math.random, res=o.res, D=res==="lose"?3000:res==="draw"?2400:2700;
  let ov=null, done=false; const tms=[];
  const release=()=>{ if(done) return; done=true; tms.forEach(clearTimeout);
    document.body.classList.remove("ec-win","ec-lose","ec-draw");
    if(ov){ const v=ov; v.classList.add("out"); setTimeout(()=>v.remove(),460); }
    o.hold=false; if(S&&S.over===o) render(); };
  const run=()=>{
    if(!S||S.over!==o||screen!=="play"){ release(); return; }
    const W=innerWidth, H=innerHeight, dpr=Math.min(2,devicePixelRatio||1), cx=W/2, cy=H*.46, M=Math.hypot(W,H)/2;
    const se=season(), title=res==="win"?(se?SEASON[se].win:"Victoire"):res==="lose"?(se?SEASON[se].lose:"Défaite"):"Égalité";
    ov=document.createElement("div"); ov.className="endcine "+res; ov.setAttribute("role","presentation");
    ov.innerHTML=`<canvas></canvas><div class="ectx"><h2>${esc(title)}</h2><div class="ecsub">${o.pw} lieu${o.pw>1?"x":""} contre ${o.ew}${o.tie?` · départage à la puissance totale ${o.pt} contre ${o.et}`:""}</div></div>`;
    document.body.appendChild(ov); translateDOM(ov); ov.addEventListener("pointerdown",release);
    const cv=ov.querySelector("canvas"), c=cv.getContext("2d"); cv.width=W*dpr; cv.height=H*dpr;
    document.body.classList.add("ec-"+res);
    const locs=[0,1,2].map(li=>{ const el=document.querySelector(`.loc[data-li="${li}"]`), r=el&&el.getBoundingClientRect(); return {el,r:r&&r.width?r:null,w:o.rows[li]&&o.rows[li].w}; });
    const mine=locs.filter(l=>l.w==="p"&&l.r), theirs=locs.filter(l=>l.w==="e"&&l.r);
    const ease=p=>1-Math.pow(1-Math.max(0,Math.min(1,p)),3), cl=v=>Math.max(0,Math.min(1,v)), N=k=>Math.round(Math.min(k,W*H/5200));
    let draw=()=>{};
    if(res==="win"){
      mine.forEach((l,i)=>tms.push(setTimeout(()=>{ l.el.classList.add("ecwon"); sfx("buff"); },150+i*170)));
      const IMP=700; tms.push(setTimeout(()=>sfx("ecwin"),IMP));
      const burst=Array.from({length:N(110)},()=>{ const a=R()*Math.PI*2, v=220+R()*620; return {vx:Math.cos(a)*v,vy:Math.sin(a)*v-180,s:3+R()*5,rot:R()*6,sp:(R()-.5)*14,tw:R()*6,c:R()<.25?"255,248,225":R()<.5?"255,214,120":"230,175,80"}; });
      const rise=Array.from({length:N(50)},()=>({x:R()*W,y:H+R()*H*.3,v:40+R()*90,s:1+R()*2,ph:R()*6,d:R()*900}));
      draw=t=>{
        const k=ease(t/400), g=c.createRadialGradient(cx,cy,M*.15,cx,cy,M); g.addColorStop(0,"rgba(4,6,12,0)"); g.addColorStop(1,`rgba(4,6,12,${.62*k})`); c.fillStyle=g; c.fillRect(0,0,W,H);
        c.globalCompositeOperation="lighter";
        mine.forEach((l,i)=>{ const u=t-(150+i*170); if(u<0) return; const a=u<200?u/200:Math.max(.22,1-(u-200)/1300), x=l.r.left+l.r.width/2, w=l.r.width*.7, bot=l.r.top+l.r.height;
          const lg=c.createLinearGradient(0,bot,0,0); lg.addColorStop(0,`rgba(255,225,150,${.55*a})`); lg.addColorStop(1,"rgba(255,200,110,0)");
          c.fillStyle=lg; c.beginPath(); c.moveTo(x-w/2,bot); c.lineTo(x+w/2,bot); c.lineTo(x+w*.15,0); c.lineTo(x-w*.15,0); c.closePath(); c.fill(); });
        if(t>300){ const e=cl((t-300)/500)*(1-cl((t-D+500)/500)), rot=t*.00018;
          for(let i=0;i<14;i++){ const a=rot+i*Math.PI/7, rg=c.createRadialGradient(cx,cy,0,cx,cy,M*1.1); rg.addColorStop(0,`rgba(255,220,140,${.2*e})`); rg.addColorStop(1,"rgba(255,220,140,0)");
            c.fillStyle=rg; c.beginPath(); c.moveTo(cx,cy); c.arc(cx,cy,M*1.1,a-.07,a+.07); c.closePath(); c.fill(); } }
        if(t>IMP){ const u=(t-IMP)/1000;
          if(u<.6){ const rr=M*ease(u/.6); c.strokeStyle=`rgba(255,235,190,${.8*(1-u/.6)})`; c.lineWidth=10*(1-u/.6)+1; c.beginPath(); c.arc(cx,cy,rr,0,7); c.stroke();
            c.fillStyle=`rgba(255,240,210,${.35*cl(1-u/.25)})`; c.fillRect(0,0,W,H); }
          for(const q of burst){ const dr=Math.exp(-1.6*u), x=cx+q.vx*(1-dr)/1.6, y=cy+q.vy*(1-dr)/1.6+260*u*u, s=q.s*(.6+.4*Math.abs(Math.sin(u*8+q.tw)));
            c.save(); c.translate(x,y); c.rotate(q.rot+q.sp*u); c.globalAlpha=cl(1.6-u*.8); c.fillStyle=`rgb(${q.c})`; c.fillRect(-s/2,-s*.3,s,s*.6); c.restore(); }
          c.globalAlpha=1; }
        for(const q of rise){ const u=t-900-q.d; if(u<0) continue; const y=q.y-q.v*u/1000, x=q.x+Math.sin(u/500+q.ph)*14; c.fillStyle=`rgba(255,215,130,${.8*cl(u/300)})`; c.beginPath(); c.arc(x,y,q.s,0,7); c.fill(); }
        c.globalCompositeOperation="source-over"; };
    } else if(res==="lose"){
      const CR=250; tms.push(setTimeout(()=>{ sfx("eclose"); const b=document.querySelector(".board"); if(b&&b.animate) b.animate([{transform:"none"},{transform:"translate(-5px,2px)"},{transform:"translate(5px,-2px)"},{transform:"translate(-3px,1px)"},{transform:"none"}],{duration:420}); },CR));
      theirs.forEach((l,i)=>tms.push(setTimeout(()=>l.el.classList.add("eclost"),CR+120+i*160)));
      const walk=(x,y,a,len)=>{ const pts=[[x,y]]; let d=0; while(d<len){ const st=16+R()*22; a+=(R()-.5)*.7; x+=Math.cos(a)*st; y+=Math.sin(a)*st; d+=st; pts.push([x,y]); if(x<-20||x>W+20||y<-20||y>H+20) break; } return pts; };
      const cracks=[]; const n=7+Math.floor(R()*3);
      for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+(R()-.5)*.5, main=walk(cx,cy,a,M*1.2); cracks.push({pts:main,d0:0});
        for(let j=2;j<main.length-2;j++) if(R()<.16){ const [bx,by]=main[j]; cracks.push({pts:walk(bx,by,a+(R()<.5?-1:1)*(.5+R()*.6),M*(.15+R()*.3)),d0:j/main.length}); } }
      const ash=Array.from({length:N(80)},()=>({x:R()*W,y:-R()*H*.5,v:30+R()*55,s:1+R()*2.2,ph:R()*6,g:120+Math.floor(R()*60)}));
      const emb=Array.from({length:N(18)},()=>({x:R()*W,y:H*(.6+R()*.4),v:15+R()*30,s:1.5+R()*2,ph:R()*6}));
      draw=t=>{
        const k=ease(t/1400), inner=M*(1-.62*k), g=c.createRadialGradient(cx,cy,inner*.35,cx,cy,Math.max(inner,1)+M*.25); g.addColorStop(0,"rgba(10,4,12,0)"); g.addColorStop(1,`rgba(8,3,10,${.8*k})`); c.fillStyle=g; c.fillRect(0,0,W,H);
        if(t>CR){ const u=t-CR, grow=ease(u/950), glow=Math.max(.25,1-u/1800);
          if(u<180){ c.fillStyle=`rgba(200,60,110,${.18*(1-u/180)})`; c.fillRect(0,0,W,H); }
          c.lineJoin="round"; c.lineCap="round";
          for(const cr of cracks){ const p=cl((grow-cr.d0)/(1-cr.d0)); if(p<=0) continue; const m=Math.max(2,Math.ceil(cr.pts.length*p));
            for(const [lw,col,bl] of [[5,`rgba(150,30,80,${.45*glow})`,14],[2.2,"rgba(8,4,10,.95)",0],[.9,`rgba(255,150,190,${.8*glow})`,6]]){
              c.lineWidth=cr.d0?lw*.6:lw; c.strokeStyle=col; c.shadowColor="#c0306a"; c.shadowBlur=bl; c.beginPath();
              for(let i=0;i<m;i++){ const [x,y]=cr.pts[i]; i?c.lineTo(x,y):c.moveTo(x,y); } c.stroke(); } }
          c.shadowBlur=0; }
        for(const q of ash){ const u=t-500; if(u<0) break; const y=q.y+q.v*u/1000*1.6+u*.04, x=q.x+Math.sin(u/700+q.ph)*22; c.globalAlpha=.7*cl(u/600); c.fillStyle=`rgb(${q.g},${q.g-8},${q.g+6})`;
          c.save(); c.translate(x,y); c.rotate(u/600+q.ph); c.fillRect(-q.s,-q.s*.5,q.s*2,q.s); c.restore(); }
        c.globalCompositeOperation="lighter";
        for(const q of emb){ const u=t-700; if(u<0) break; const y=q.y-q.v*u/1000, x=q.x+Math.sin(u/400+q.ph)*8, a=.6*cl(u/500)*(.5+.5*Math.sin(u/120+q.ph));
          const rg=c.createRadialGradient(x,y,0,x,y,q.s*3); rg.addColorStop(0,`rgba(255,110,90,${a})`); rg.addColorStop(1,"rgba(160,30,60,0)"); c.fillStyle=rg; c.fillRect(x-q.s*3,y-q.s*3,q.s*6,q.s*6); }
        c.globalCompositeOperation="source-over"; c.globalAlpha=1; };
    } else {
      const HIT=700; tms.push(setTimeout(()=>sfx("ecdraw"),HIT));
      const sp=Array.from({length:N(80)},()=>{ const left=R()<.5, a=(left?Math.PI:0)+(R()-.5)*1.4, v=150+R()*450; return {vx:Math.cos(a)*v,vy:Math.sin(a)*v,s:1.5+R()*2.5,c:left?"111,184,222":"154,140,208"}; });
      draw=t=>{
        c.fillStyle=`rgba(4,6,12,${.5*ease(t/400)})`; c.fillRect(0,0,W,H);
        const f=ease(t/HIT)*cx, fade=t<HIT?1:Math.max(.25,1-(t-HIT)/900);
        c.globalCompositeOperation="lighter";
        for(const [x0,x1,col] of [[0,f,"111,184,222"],[W,W-f,"154,140,208"]]){ const lg=c.createLinearGradient(x0,0,x1,0); lg.addColorStop(0,`rgba(${col},0)`); lg.addColorStop(1,`rgba(${col},${.45*fade})`); c.fillStyle=lg; c.fillRect(Math.min(x0,x1),0,Math.abs(x1-x0),H); }
        if(t>HIT){ const u=(t-HIT)/1000;
          c.fillStyle=`rgba(235,235,255,${.9*cl(1-u/.5)})`; c.fillRect(cx-3-u*30,0,6+u*60,H);
          for(const q of sp){ const dr=Math.exp(-2*u), x=cx+q.vx*(1-dr)/2, y=cy+q.vy*(1-dr)/2; c.fillStyle=`rgba(${q.c},${cl(1.3-u)})`; c.beginPath(); c.arc(x,y,q.s,0,7); c.fill(); } }
        c.globalCompositeOperation="source-over"; };
    }
    const t0=performance.now();
    const loop=now=>{ if(!ov.isConnected) return; try{ c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,W,H); draw(now-t0); }catch(e){ (window.__fxErr=window.__fxErr||[]).push(String(e)); release(); return; } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    tms.push(setTimeout(release,D));
  };
  setTimeout(()=>{ try{ run(); }catch(e){ (window.__fxErr=window.__fxErr||[]).push(String(e)); release(); } },60);
}
