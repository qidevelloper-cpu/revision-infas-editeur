"use strict";
/* ============================================================
   RÉVISION INFAS — PORTAIL UNIFIÉ · MOTEUR (présent dans toutes les versions)
   Données : #app-data · Modifications : #app-edits · Applis complètes : #app-src-<id>
   L'éditeur (#ed-js) est séparé et retiré de la version lecture seule.
   Règle : tout texte affiché passe par T()/Tx() avec une clé littérale entre apostrophes.
   ============================================================ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jsq=s=>esc(String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"));
const clone=o=>JSON.parse(JSON.stringify(o));
const nrm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
const DATA0=JSON.parse($('#app-data').textContent);
const EMB=JSON.parse(($('#app-edits')||{}).textContent||'{}');
const META=Object.assign({appId:'revInfas',brand:['RÉVISION','INFAS'],welcome:'Bienvenue',tagline:'En marche vers la maîtrise et l’excellence',signature:'Créé par <b>Daniel Noufe</b> · INFAS',title:'Révision INFAS',defaultPalette:0,sujet:50},DATA0.meta||{});
const APPID=META.appId, SKEY=APPID+'_progress_v1', EKEY=APPID+'_edits_v1', HKEY=APPID+'_edits_hist_v1';
/* numéros (Studio RI, lot 2B étape 1) : version du moteur = ce qu'il sait lire ; FORMAT_MAX = format de configuration le plus récent qu'il lit */
const MOTEUR_VERSION=2, FORMAT_MAX=2;
let RO=true, EDITMODE=false;
function blankE(){return{rev:0,ui:null,oui:null,blkv:0,nocol:false,covers:{},soonk:{},icons:'emoji',custom:{},appColors:true,texts:{},layout:{},tiles:{},menu:null,palette:null,font:null,fontH:null,fontFiles:[],fontApps:false,gts:1,shape:null,look:null,content:{},studio:null}}
function normE(e){const b=blankE();e=e&&typeof e==='object'?clone(e):{};Object.keys(b).forEach(k=>{if(e[k]!==undefined&&e[k]!==null)b[k]=e[k]});if(!Array.isArray(b.fontFiles))b.fontFiles=[];b.base=e.base;b.rev=e.rev||0;return b}
let E=normE(EMB);

/* ---------- textes modifiables ---------- */
const TREG={};
function tget(k,d){const t=E.texts;return t&&Object.prototype.hasOwnProperty.call(t,k)?t[k]:d}
function tfill(s,v){return v?String(s).replace(/\{(\w+)\}/g,(m,k)=>v[k]!=null?v[k]:m):String(s)}
function T(k,d,v){if(!TREG[k])TREG[k]={d,v:v?Object.keys(v):[]};return '<span data-t="'+k+'">'+tfill(tget(k,d),v)+'</span>'}
function Tx(k,d,v){if(!TREG[k])TREG[k]={d,v:v?Object.keys(v):[],plain:1};return tfill(tget(k,d),v).replace(/<[^>]+>/g,'')}

/* ---------- contenu (données + corrections de l'éditeur) ---------- */
let DATA,MAT,MATI,QI,QBM,FIL;const XD={},IMGR={};let IMGN=0;
function regX(id,x){if(!x)return;(x.res&&x.res.ch||[]).forEach(c=>c.imgs=(c.imgs||[]).map(i=>{if(String(i[0]).startsWith('data:')){const k='x'+(IMGN++);IMGR[k]=i[0];return[k,i[1]]}return i}));XD[id]=x}
function loadXDom(){$$('script[id^="app-xdata-"]').forEach(s=>{try{regX(s.id.slice(10),JSON.parse(s.textContent))}catch(e){}})}
function applyContent(){const c=E.content||{};
 const d={meta:DATA0.meta,niveaux:(c.niveaux&&c.niveaux.length?c.niveaux:DATA0.niveaux).slice(),filieres:clone(DATA0.filieres),mat:clone(DATA0.mat).concat(Array.isArray(c.newMat)?clone(c.newMat).map(m=>Object.assign(m,{added:1})):[]),q:Object.assign({},DATA0.q),res:Object.assign({},DATA0.res||{}),cards:Object.assign({},DATA0.cards||{}),course:Object.assign({},DATA0.course||{})};
 d.mat.forEach(m=>{const x=XD[m.id];if(!m.added||!x)return;d.q[m.id]=x.q||[];d.res[m.id]=x.res||{ch:[],comp:[]};d.cards[m.id]=x.cards||[];if(x.course){const n=Math.max((x.ch||[]).length,1);d.course[m.id]=Array.from({length:n},(z,i)=>x.course[i]||'')}if(!(m.ch||[]).length)m.ch=x.ch||[]});
 if(c.fil)d.filieres.forEach(f=>Object.assign(f,c.fil[f.id]||{}));
 if(c.mat)d.mat.forEach(m=>Object.assign(m,c.mat[m.id]||{}));
 if(Array.isArray(c.matOrder)){const o=c.matOrder;d.mat.sort((a,b)=>{const i=o.indexOf(a.id),j=o.indexOf(b.id);return(i<0?999:i)-(j<0?999:j)})}
 QI={};QBM={};
 d.mat.forEach(m=>{let arr=(d.q[m.id]||[]).map((q,i)=>Object.assign({id:m.id+'.'+i,m:m.id},q));
  if(c.q)arr=arr.map(q=>c.q[q.id]?Object.assign({},q,c.q[q.id],{id:q.id,m:m.id}):q);
  if(Array.isArray(c.qAdd))arr=arr.concat(c.qAdd.filter(q=>q.m===m.id));
  if(Array.isArray(c.qDel)){const s=new Set(c.qDel);arr=arr.filter(q=>!s.has(q.id))}
  arr.forEach(q=>QI[q.id]=q);QBM[m.id]=arr});
 DATA=d;MAT=d.mat;MATI={};MAT.forEach(m=>MATI[m.id]=m);FIL={};d.filieres.forEach(f=>FIL[f.id]=f);d.mat.forEach(m=>{const v=visCh(m);if(v)QBM[m.id]=QBM[m.id].filter(q=>v.has(q.c))});
 DATA=d;MAT=d.mat;MATI={};MAT.forEach(m=>MATI[m.id]=m);FIL={};d.filieres.forEach(f=>FIL[f.id]=f)}
function groups(){const G=clone((E.content&&Array.isArray(E.content.groups)&&E.content.groups.length)?E.content.groups:(DATA0.groups||[]));const seen=new Set();G.forEach(g=>{g.subs=g.subs||[];g.subs.forEach(s=>{s.mats=(s.mats||[]).filter(id=>MATI[id]&&!seen.has(id));s.mats.forEach(id=>seen.add(id))})});
 const rest=MAT.filter(m=>!seen.has(m.id)).map(m=>m.id);if(rest.length)G.push({id:'_autres',n:Tx('grp.other','AUTRES COURS'),e:'📚',col:'#6B7B76',subs:[{id:'_s',n:'',mats:rest}]});return G}
const matOf=id=>MATI[id]||{id,title:id,short:id,emo:'📘',col:'#888',fil:[],niv:'L1',ch:[]};
const chName=(m,i)=>((matOf(m).ch||[])[i])||'';
function typeLabel(q){if(q.s)return Tx('type.cas','Cas clinique');if(q.t==='vf')return Tx('type.vf','Vrai / Faux');if(q.t==='open')return Tx('type.open','Question ouverte');return Tx('type.qcm','QCM')}
function typeCls(q){return q.s?'cas':q.t}

/* ---------- progression de l'étudiant ---------- */
let S;
function load(){let d={};try{d=JSON.parse(localStorage.getItem(SKEY)||'{}')||{}}catch(e){}
 return Object.assign({name:'',avatar:'🧑🏾‍⚕️',fil:'',niv:'',extra:[],onb:false,start:'',xp:0,streak:{last:'',count:0},qs:{},diff:{},fav:{},exams:[],cur:null,hours:{},theme:null,lastMat:'',sujMode:'suj',lt:{},sess:{},done:[]},d)}
function save(){try{localStorage.setItem(SKEY,JSON.stringify(S))}catch(e){}}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function touchStreak(){const t=today();if(S.streak.last===t)return;const y=new Date(Date.now()-864e5);const ys=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');S.streak.count=(S.streak.last===ys)?S.streak.count+1:1;S.streak.last=t;save()}
function levels(){return[[0,Tx('level.1','Recrue')],[500,Tx('level.2','Externe')],[1500,Tx('level.3','Interne')],[3500,Tx('level.4','Major de promo')],[6000,Tx('level.5','Chef de clinique')],[10000,Tx('level.6','Professeur')],[16000,Tx('level.7','Légende de l’INFAS')]]}
function level(){const LV=levels();let i=0;LV.forEach((l,k)=>{if(S.xp>=l[0])i=k});const cur=LV[i][0],nxt=LV[i+1]?LV[i+1][0]:cur+6000;return{n:i+1,name:LV[i][1],pct:Math.min(100,(S.xp-cur)/(nxt-cur)*100)}}
const AVATARS=['🧑🏾‍⚕️','👩🏾‍⚕️','👨🏾‍⚕️','👩🏿‍⚕️','👨🏿‍⚕️','👩🏾‍🎓','👨🏾‍🎓','🧕🏾','🤰🏾','👩🏾‍🔬','🦸🏾‍♀️','🦸🏾‍♂️','🩺','💉','🧠','🫀','🦁','🦋','⭐','🎓'];

/* ---------- filière, année, cours disponibles ---------- */
const nivIdx=n=>DATA.niveaux.indexOf(n);
function filBase(f){const F=FIL[f];return F&&F.like?F.like:f}
function chLvl(m,i){const l=(m.chLvl||{})[i];return l&&nivIdx(l)>=0?l:m.niv}
function nivMin(m){let b=nivIdx(m.niv);(m.ch||[]).forEach((c,i)=>{const k=nivIdx(chLvl(m,i));if(k>=0&&k<b)b=k});return b<0?0:b}
function isBase(m){if(!S.fil||!S.niv)return true;return(m.fil||[]).includes(filBase(S.fil))&&nivMin(m)<=nivIdx(S.niv)}
function visCh(m){if(!S||!S.niv||!m||!m.chLvl||!Object.keys(m.chLvl).length)return null;if(!isBase(m))return null;const me=nivIdx(S.niv);const v=new Set();(m.ch||[]).forEach((c,i)=>{const k=nivIdx(chLvl(m,i));if(S.prevCh===false?k===me:k<=me)v.add(i)});return v.size===(m.ch||[]).length?null:v}
function chVisible(mid,i){const v=visCh(MATI[mid]);return!v||v.has(i)}
function myMats(){return MAT.filter(m=>!m.off&&(isBase(m)||S.extra.includes(m.id)))}
function otherMats(){return MAT.filter(m=>!m.off&&!isBase(m))}

/* ---------- palettes (7, dont 3 blanches), police, formes ---------- */
const PALETTES_DEF=[
 {n:'INFAS émeraude & orange',h1:'#0E3B33',h2:'#17594C',acc:'#E8772E',acc2:'#2BB39A',bg:'#F4F1EA'},
 {n:'Bleu nuit & or',h1:'#0E1F45',h2:'#23407E',acc:'#E89B00',acc2:'#4C8DFF',bg:'#EEF2FA'},
 {n:'Bordeaux & ambre',h1:'#45101F',h2:'#7A1E35',acc:'#E8902E',acc2:'#F2C14E',bg:'#F8F1EE'},
 {n:'Rouge & noir',h1:'#141414',h2:'#4A1015',acc:'#D7263D',acc2:'#FF7A7A',bg:'#F6F1F1'},
 {n:'Blanc & émeraude',h1:'#0F5132',h2:'#1E7A4C',acc:'#16A34A',acc2:'#34D399',bg:'#FFFFFF',w:1},
 {n:'Blanc & azur',h1:'#0B3A6E',h2:'#1D5FA8',acc:'#2563EB',acc2:'#38BDF8',bg:'#FFFFFF',w:1},
 {n:'Blanc & corail',h1:'#5A1E12',h2:'#A3402B',acc:'#F0614A',acc2:'#FFB199',bg:'#FFFFFF',w:1},
 {n:'Violet néon (sombre)',h1:'#090820',h2:'#2B1466',acc:'#7030EF',acc2:'#DB1FFF',bg:'#0C0A22',card:'#171338',d:1},
 {n:'Bleu glacier',h1:'#03195B',h2:'#0B2CB1',acc:'#1951FC',acc2:'#3781FC',bg:'#EEF6FE'},
 {n:'Rideau bleu nuit (sombre)',h1:'#021A3A',h2:'#0A3E91',acc:'#19C3F5',acc2:'#0A5BD8',bg:'#04122A',card:'#0B2148',d:1},
 {n:'Space vert néon (sombre)',h1:'#050805',h2:'#1A2410',acc:'#C4E62B',acc2:'#8FB31A',bg:'#070A06',card:'#121810',d:1},
 {n:'Feu rouge-orange',h1:'#5A0006',h2:'#920004',acc:'#F3500A',acc2:'#F37100',bg:'#FFF3EC'},
 {n:'Blanc & orange vif',h1:'#1C1C1C',h2:'#3A2A1A',acc:'#FF4F00',acc2:'#FFC400',bg:'#FFFFFF',w:1}];
const PALETTES=()=>(Array.isArray(META.palettes)&&META.palettes.length?META.palettes:PALETTES_DEF);
function hx(h){h=String(h).replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return[0,2,4].map(i=>parseInt(h.substr(i,2),16)||0)}
function mixc(a,b,t){const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function lum(h){const[r,g,b]=hx(h);return(0.299*r+0.587*g+0.114*b)/255}
function authorPalette(){const P=PALETTES(),p=E.palette;if(p&&p.custom)return p.custom;const i=p&&p.pal!=null?p.pal:(META.defaultPalette||0);return P[i]||P[0]}
function palette(){const P=PALETTES(),t=S&&S.theme;if(t&&t.custom)return t.custom;if(t&&t.pal!=null&&P[t.pal])return P[t.pal];return authorPalette()}
const SHAPES={carre:'4px',arrondi:'12px',doux:'22px',tres:'34px',pilule:'40px',feuille:'30px 6px 30px 6px'};
const STYLES={plat:{sh:'none',bd:'none'},ombre:{sh:'0 6px 22px rgba(0,0,0,.09)',bd:'none'},relief:{sh:'0 6px 0 color-mix(in srgb,var(--h1) 60%,transparent),0 16px 26px rgba(0,0,0,.2)',bd:'1px solid rgba(255,255,255,.55)'},verre:{sh:'0 8px 30px rgba(0,0,0,.12)',bd:'1px solid rgba(255,255,255,.75)',bf:'blur(12px)'},contour:{sh:'none',bd:'2px solid var(--h2)'},neo:{sh:'8px 8px 16px rgba(0,0,0,.13),-8px -8px 16px rgba(255,255,255,.95)',bd:'none'},flottant:{sh:'0 24px 46px -12px rgba(0,0,0,.38)',bd:'none'}};
function shapeVars(o){const v={},a={};if(!o)return{v,a};
 if(o.r&&SHAPES[o.r]){v['--shR']=SHAPES[o.r];a.shr=1}
 if(o.st&&STYLES[o.st]){const s=STYLES[o.st];v['--shSh']=s.sh;v['--shBd']=s.bd;v['--shBf']=s.bf||'none';a.shs=1}
 if(o.bg&&o.bg!=='auto'){let bg=null,base=null;const c1=o.c1||'#ffffff',c2=o.c2||'#dddddd';
  if(o.bg==='couleur'){bg=c1;base=c1}else if(o.bg==='degrade'){bg='linear-gradient('+(o.ang||135)+'deg,'+c1+','+c2+')';base=mixc(c1,c2,.5)}
  else if(o.bg==='teinte'){bg='var(--tint3)';base='#ffffff'}else if(o.bg==='verre'){bg='rgba(255,255,255,.55)';base='#ffffff'}
  else if(o.bg==='motif'){bg='radial-gradient(color-mix(in srgb,var(--coral) 25%,transparent) 1.6px,transparent 1.8px) 0 0/14px 14px,#ffffff';base='#ffffff'}
  else if(o.bg==='transparent'){bg='transparent'}
  if(bg){v['--shBg']=bg;v['--shInk']=base?(lum(base)>.55?'#16231F':'#ffffff'):'inherit';a.shb=1}}
 return{v,a}}
function fontFaces(){return(E.fontFiles||[]).filter(f=>f&&f.data).map(f=>'@font-face{font-family:"'+String(f.name).replace(/["\\]/g,'')+'";src:url('+f.data+');font-display:swap}').join('\n')}
function applyLook(){const t=palette(),r=document.documentElement.style,set=(k,v)=>r.setProperty(k,v);
 set('--h1',t.h1);set('--h2',t.h2);set('--coral',t.acc);set('--turq',t.acc2);set('--bg',t.bg);
 set('--mint',mixc(t.acc2,'#ffffff',.82));set('--peach',mixc(t.acc,'#ffffff',.82));set('--line',mixc(t.h2,'#ffffff',.84));
 set('--tint',mixc(t.h2,'#ffffff',.86));set('--tint2',mixc(t.h2,'#ffffff',.93));set('--tint3',mixc(t.acc,'#ffffff',.9));set('--blob',t.acc2+'59');
 if(t.w){set('--hdrA','#ffffff');set('--hdrB',mixc(t.acc,'#ffffff',.9));set('--hdrInk',t.h1);set('--hdrSh','0 4px 18px rgba(0,0,0,.07)');set('--brand1a',t.h2);set('--brand1b',t.acc2);set('--b2a',t.acc);set('--b2b',t.h1);set('--sigB',t.acc);
  set('--navBg','#ffffff');set('--navInk',mixc(t.h1,'#ffffff',.4));set('--navOn',t.h1);set('--cardBd','1px solid '+mixc(t.h2,'#ffffff',.85))}
 else{set('--hdrA',t.h1);set('--hdrB',t.h2);set('--hdrInk','#ffffff');set('--hdrSh','none');set('--brand1a',mixc(t.acc2,'#ffffff',.6));set('--brand1b',mixc(t.acc2,'#ffffff',.15));set('--b2a',mixc(t.acc,'#ffffff',.45));set('--b2b',t.acc);set('--sigB',mixc(t.acc,'#ffffff',.15));
  set('--navBg',t.h1);set('--navInk',mixc(t.h1,'#ffffff',.72));set('--navOn','#ffffff');set('--cardBd','none')}
 const q=s=>'"'+String(s).replace(/["\\]/g,'')+'"';
 if(t.d){const cd=t.card||mixc(t.bg,'#ffffff',.08);set('--card',cd);set('--ink','#F2F0FA');set('--soft',mixc('#ffffff',t.bg,.35));set('--line',mixc(cd,'#ffffff',.14));set('--tint',mixc(cd,'#ffffff',.08));set('--tint2',mixc(cd,'#ffffff',.04));set('--tint3',mixc(cd,t.acc,.18));set('--mint',mixc(cd,t.acc2,.3));set('--peach',mixc(cd,t.acc,.3));set('--hdrB',mixc(t.h2,t.acc,.25));set('--navBg',mixc(t.h1,'#000000',.2));set('--cardBd','1px solid '+mixc(cd,'#ffffff',.1));document.body.classList.add('dark')}else{['--card','--ink','--soft'].forEach(k=>r.removeProperty(k));document.body.classList.remove('dark')}
 const f=E.font&&E.font.family;if(f)set('--font',q(f));else r.removeProperty('--font');
 const fh=E.fontH&&E.fontH.family;if(fh)set('--fontH',q(fh));else r.removeProperty('--fontH');
 set('--gts',String(E.gts||1));const lk=E.look||{};[['ink','--ink'],['soft','--soft'],['card','--card']].forEach(([k,v])=>{if(lk[k])set(v,lk[k]);else if(!t.d)r.removeProperty(v)});
 set('--fw',String(lk.fw||400));set('--fst',lk.it?'italic':'normal');set('--ls',(lk.ls||0)+'px');set('--lh',String(lk.lh||1.45));
 let st=$('#emb-fonts');if(!st){st=document.createElement('style');st.id='emb-fonts';document.head.appendChild(st)}st.textContent=fontFaces();
 const sv=shapeVars(E.shape);['--shR','--shSh','--shBd','--shBf','--shBg','--shInk'].forEach(k=>{if(sv.v[k]!=null)set(k,sv.v[k]);else r.removeProperty(k)});
 ['shr','shb','shs'].forEach(k=>{if(sv.a[k])document.body.setAttribute('data-'+k,'1');else document.body.removeAttribute('data-'+k)});
 const m=$('meta[name=theme-color]');if(m)m.content=t.w?'#ffffff':t.h1;document.title=Tx('meta.title',META.title)}
function toast(m,t=2200){const e=$('#toast');if(!e)return;e.textContent=m;e.style.display='block';clearTimeout(toast._t);toast._t=setTimeout(()=>e.style.display='none',t)}

/* ---------- icônes : emoji ou traits fins (au choix) ---------- */
function icoStyle(){return(S&&S.icons)||E.icons||'emoji'}
function ico(n,emo){const st=icoStyle();if(st==='emoji'||!ICONS[n])return emo;return `<svg class="ico ico-${st}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${n}"/></svg>`}
const ICONS={home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>',folder:'<path d="M3 6.5h6.5l2 2.2H21V19H3z"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.2 2"/>',chart:'<path d="M3.5 20.5h17"/><path d="M6.5 17v-4M10.5 17V9.5M14.5 17v-6M18.5 17V6"/><path d="M5.5 10.5 10 6.5l4 3 5.5-5.5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4.2 4.2-6.2 8-6.2s6.8 2 8 6.2"/>',edit:'<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14.5 7 3 3"/>',doc:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 11h7M9 14.5h7M9 18h5"/>',cards:'<path d="M5 7h12v14H5z"/><path d="M8 4h11v14"/>',app:'<rect x="3" y="4" width="18" height="15" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m21 16-5-5-9 8"/>',star:'<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10z"/>',page:'<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',check:'<circle cx="12" cy="12" r="8.5"/><path d="m8 12.3 2.8 2.7L16.5 9"/>'};
Object.assign(ICONS,{
 pin:'<path d="M9 3h6l-1 6 4 4H6l4-4z"/><path d="M12 13v8"/>',
 ok:'<circle cx="12" cy="12" r="8.5"/><path d="m8 12.3 2.8 2.7L16.5 9"/>',
 xc:'<circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/>',
 starf:'<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>',
 cap:'<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c1.5 1.6 3.4 2.4 5.5 2.4s4-.8 5.5-2.4V11"/><path d="M21.5 9v5"/>',
 books:'<path d="M4 4h4v16H4zM10 4h4v16h-4z"/><path d="m16 5 3.8-1 3 15.4-3.8 1z"/>',
 book:'<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/>',
 bookopen:'<path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1z"/><path d="M21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1z"/>',
 baby:'<circle cx="12" cy="5.5" r="2.5"/><path d="M9 21v-6.5c0-2 1-4.5 3-5.5 2.5 0 4.5 2 4.5 4.5S14.7 18 12.5 18H11"/><path d="M14.5 21v-3"/>',
 repeat:'<path d="M4 11V9a3 3 0 0 1 3-3h12"/><path d="m16 3 3 3-3 3"/><path d="M20 13v2a3 3 0 0 1-3 3H5"/><path d="m8 21-3-3 3-3"/>',
 steth:'<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M10 12v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
 bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
 target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
 trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4"/><path d="M12 13v4M8.5 20h7M9.5 17h5"/>',
 cal:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 note:'<path d="M5 3h10l4 4v14H5z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
 party:'<path d="m3 21 5-14 9 9z"/><path d="M14 3v2M19 5l-1.5 1.5M21 10h-2M15 8.5c1-1 2.5-1.5 4-1"/>',
 video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',
 syringe:'<path d="m18 3 3 3M19.5 4.5 15 9"/><path d="m16 8-9 9-3 1 1-3 9-9z"/><path d="m10 10 2 2M7.5 12.5l2 2"/>',
 butterfly:'<path d="M12 7v13"/><path d="M12 9C10 4 4 3 4 7c0 3 3 4.5 8 5-4 .5-7 2-6 4.5 1 2.3 5 .5 6-2.5"/><path d="M12 9c2-5 8-6 8-2 0 3-3 4.5-8 5 4 .5 7 2 6 4.5-1 2.3-5 .5-6-2.5"/>',
 clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h6M9 18h4"/>',
 smile:'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2"/><path d="M9 9.5h.01M15 9.5h.01"/>',
 flag:'<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
 ambulance:'<path d="M2.5 16V8h11v8"/><path d="M13.5 10.5h4.5l3 3V16h-7.5"/><circle cx="7" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/><path d="M8 10v4M6 12h4"/>',
 scalpel:'<path d="M4 20 15 9l2 2-9 9z"/><path d="M15 9c1-3 3-5 6-6-1 3-3 5-4 8"/>',
 micro:'<path d="M7 20h11M9 17h6"/><path d="m10 3 4 2-4 8-4-2z"/><path d="M12 13a5 5 0 0 1 5 5"/>',
 heart:'<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10z"/>',
 sprout:'<path d="M12 21v-9"/><path d="M12 12C12 7 8 5 4 5c0 4 3 7 8 7z"/><path d="M12 14c0-4 3-6 7-6 0 4-3 6-7 6z"/>',
 rocket:'<path d="M12 15c-2-2-2.5-6 0-11 2.5 5 2 9 0 11z"/><path d="M9.5 12.5 6 15l1 3 3-1.5M14.5 12.5 18 15l-1 3-3-1.5"/><path d="M11 19.5h2"/>',
 flame:'<path d="M12 21c-4 0-6.5-2.6-6.5-6 0-4 3.5-6 4-10 3 2 3.5 4 3.5 6 1-1 1.5-2.5 1.5-3.5 2 1.5 4 4 4 7.5 0 3.4-2.5 6-6.5 6z"/>',
 bolt:'<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
 mountain:'<path d="m2.5 20 7-12 4 6.5 2-3 6 8.5z"/><path d="m8 10.5 1.5 1.5 1.5-1.5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 music:'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
 ext:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5H5V6h5"/>',
 flow:'<rect x="3" y="3" width="7" height="6" rx="1.5"/><rect x="14" y="15" width="7" height="6" rx="1.5"/><path d="M6.5 9v4.5a2 2 0 0 0 2 2H14"/>',
 bars:'<path d="M3.5 20.5h17"/><path d="M7 17v-6M12 17V6M17 17v-9"/>',
 scale:'<path d="M12 4v16M7 20h10M5 7h14"/><path d="m5 7-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
 tap:'<path d="M9 11V5a1.5 1.5 0 0 1 3 0v5l5 1c1.5.3 2.3 1.6 2 3l-1 5H10l-4-5c-.8-1 0-2.5 1.3-2.2L9 13"/>',
 palette:'<path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8z"/><path d="M7.5 11h.01M10 7.5h.01M14.5 7.5h.01"/>',
 save:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-6h8v6"/>',
 down:'<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
 up:'<path d="M12 15V3M7 8l5-5 5 5M4 20h16"/>',
 trash:'<path d="M4 6.5h16M9 6.5V4h6v2.5"/><path d="M6 6.5 7 21h10l1-14.5"/><path d="M10 10.5v7M14 10.5v7"/>',
 ribbon:'<path d="M12 4c-2 0-3.5 1.6-3.5 3.6 0 2.2 1.5 4.2 3.5 6.4 2-2.2 3.5-4.2 3.5-6.4C15.5 5.6 14 4 12 4z"/><path d="M10 12 5.5 20.5M14 12l4.5 8.5"/>',
 bug:'<path d="M9 7.5a3 3 0 0 1 6 0"/><rect x="7.5" y="7.5" width="9" height="12" rx="4.5"/><path d="M12 10v9M3.5 11h4M16.5 11h4M4 17l3.5-1.5M20 17l-3.5-1.5M5 5l3 2.5M19 5l-3 2.5"/>',
 ear:'<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0"/><path d="M10 9a2 2 0 0 1 4 0c0 1.5-2 2-2 3.5"/>',
 bottle:'<path d="M10 3h4v3h-4z"/><path d="M8.5 9a2.5 2.5 0 0 1 2.5-3h2a2.5 2.5 0 0 1 2.5 3v12h-7z"/><path d="M8.5 13h7"/>',
 globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>',
 pill:'<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="m9.5 9.5 5 5"/>',
 notebook:'<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M5 7H3M5 12H3M5 17H3M9 3v18"/>',
 timer:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M9.5 2.5h5"/>',
 hand:'<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-2.5-4a1.5 1.5 0 0 1 2.5-1.6L7 14"/>',
 muscle:'<path d="M4 15c0-4 3-7 5-9l2 2-1.5 2c2 0 4 1 5 3 1.5-1 4-1 5 1 1 3-2 5-5 5H9c-3 0-5-1-5-4z"/>'});
const EMOMAP={'📌':'pin','✅':'ok','⭐':'starf','☆':'starf','🎓':'cap','📝':'note','📚':'books','🤰':'baby','🏠':'home','🔁':'repeat','🃏':'cards','🩺':'steth','🧠':'bulb','🎯':'target','🏆':'trophy','🗓':'cal','📅':'cal','📈':'chart','👤':'user','📒':'notebook','🎉':'party','✍':'edit','📖':'bookopen','🕒':'clock','⏰':'timer','⏱':'timer','🎬':'video','🖼':'app','❌':'xc','💡':'bulb','👏':'party','📘':'book','💉':'syringe','🦋':'butterfly','📁':'folder','📋':'clip','🧒':'smile','🏁':'flag','✏':'edit','🚑':'ambulance','🔪':'scalpel','🔬':'micro','🫀':'heart','🌱':'sprout','🚀':'rocket','📄':'page','👋':'hand','🔥':'flame','⚡':'bolt','🏔':'mountain','➕':'plus','🎵':'music','🔀':'flow','💪':'muscle','📊':'bars','⚖':'scale','👆':'tap','🎨':'palette','💾':'save','⬇':'down','⬆':'up','🗑':'trash','🎗':'ribbon','🦟':'bug','👂':'ear','🧴':'bottle','🧸':'smile','🌍':'globe','💊':'pill','⚙':'gear','🔍':'search','🔎':'search','❓':'xc','🦠':'bug','🦴':'scalpel','🍽':'flame','💧':'bottle','👶':'baby','🧪':'bottle','📍':'pin','🔔':'flame','❤':'heart','🏥':'ambulance','🩹':'plus','🧬':'flow','🔢':'bars','🔤':'note','✨':'party','🥇':'trophy','🥈':'trophy','🥉':'trophy','🎮':'target','⏳':'timer','🌟':'starf','📷':'app','🗂':'folder','📂':'folder','🔒':'save','🔓':'save'};
const EMORX=/(\p{Extended_Pictographic})(️)?(?:\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}️?(?:\p{Emoji_Modifier})?)*/gu;
const NOICO='.ava,.avgrid,.ed-panel,.ed-ov,.ed-bar,.ed-tb,.ed-tt,script,style,textarea,input,select,svg,.icp,.pbox .avgrid';
function iconize(root){const st=icoStyle();if(st==='emoji'||!root)return;const w=document.createTreeWalker(root,4,{acceptNode:n=>{const p=n.parentElement;if(!p||p.closest(NOICO))return 2;EMORX.lastIndex=0;return EMORX.test(n.nodeValue)?1:2}});const L=[];let n;while(n=w.nextNode())L.push(n);
 L.forEach(t=>{EMORX.lastIndex=0;const v=t.nodeValue;let h='',last=0,ch=false,m;while(m=EMORX.exec(v)){const k=EMOMAP[m[1]];if(!k)continue;h+=esc(v.slice(last,m.index))+`<svg class="ico ico-${st}" viewBox="0 0 24 24" aria-label="${esc(m[0])}"><use href="#i-${k}"/></svg>`;last=m.index+m[0].length;ch=true}
  if(!ch)return;h+=esc(v.slice(last));const sp=document.createElement('span');sp.className='icw';sp.innerHTML=h;t.replaceWith(sp)})}
function iconSprite(){if($('#icoSprite'))$('#icoSprite').remove();const d=document.createElement('div');d.id='icoSprite';d.style.display='none';d.innerHTML='<svg xmlns="http://www.w3.org/2000/svg">'+Object.keys(ICONS).map(k=>`<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</symbol>`).join('')+'</svg>';document.body.appendChild(d)}

/* ---------- maîtrise ---------- */
function mStat(mid){const qs=QBM[mid]||[];let seen=0,ok=0;qs.forEach(q=>{const s=S.qs[q.id];if(s){seen++;if(s.l)ok++}});return{seen,ok,total:qs.length,pct:qs.length?Math.round(ok/qs.length*100):0}}
function mLevel(pct){const L=[[0,'🌱',Tx('mlv.1','Débutant')],[20,'📘',Tx('mlv.2','Apprenti')],[40,'🎯',Tx('mlv.3','Confirmé')],[60,'🚀',Tx('mlv.4','Avancé')],[80,'🏆',Tx('mlv.5','Expert')]];let r=L[0],i=0;L.forEach((l,k)=>{if(pct>=l[0]){r=l;i=k}});return{e:r[1],n:r[2],i:i+1}}
function ring(pct,col){const r=21,C=2*Math.PI*r;return `<svg class="ring" viewBox="0 0 54 54"><circle cx="27" cy="27" r="${r}" fill="none" style="stroke:var(--tint)" stroke-width="7"/><circle cx="27" cy="27" r="${r}" fill="none" stroke="${col||'var(--coral)'}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct/100)}" transform="rotate(-90 27 27)"/><text x="27" y="31" text-anchor="middle" font-size="12" font-weight="800" style="fill:var(--ink)">${pct}%</text></svg>`}
function diffIds(mid){return Object.keys(S.diff).filter(id=>QI[id]&&(!mid||QI[id].m===mid))}
function sujSize(){return Math.max(10,+(E.content&&E.content.sujet)||META.sujet||50)}
function sujets(mid){const qs=(QBM[mid]||[]).slice().sort((a,b)=>a.c-b.c);const n=Math.max(1,Math.ceil(qs.length/sujSize()));const out=Array.from({length:n},()=>[]);qs.forEach((q,i)=>out[i%n].push(q.id));return out}
function correctText(q){if(q.t==='vf')return q.v?Tx('quiz.true','Vrai'):Tx('quiz.false','Faux');if(q.t==='open')return q.r||'';return(q.o||[])[q.a]}

/* ---------- écrans, blocs, mise en page ---------- */
const BLK={},AFTER={};
function B(id,label,html,o){BLK[id]=Object.assign({id,label,html,portable:true},o||{})}
let VIEW='home',VSTACK=[],ctx={};
const SIG=()=>T('meta.signature',META.signature);
function header(where){return `<header class="hdr"><div class="sig top">${SIG()}</div><div class="wel">${T('meta.welcome',esc(META.welcome))}</div><h1 class="brand"><span class="b1">${T('meta.brand1',esc(META.brand[0]))}</span> <span class="b2">${T('meta.brand2',esc(META.brand[1]))}</span></h1><div class="sub">${T('meta.tagline',esc(META.tagline))}</div>${where?`<div class="where">${where}</div>`:''}</header>`}
function miniHeader(small,title,backHtml){return `<header class="hdr mini">${backHtml||`<button class="back" onclick="back()">${Tx('ui.back','← Retour')}</button>`}<div class="tt"><small>${small}</small><div class="mt">${title}</div><div class="sig">${SIG()}</div></div></header>`}
const FOOT=()=>`<div class="foot">${SIG()}</div>`;
const SCREENS={
 welcome:{n:'1 · Connexion',onb:1,blocks:['welcome.hero','welcome.form']},
 filiere:{n:'2 · Filière',onb:1,blocks:['filiere.ask']},
 annee:{n:'3 · Année d’étude',onb:1,blocks:['annee.ask']},
 autres:{n:'4 · Autres cours',onb:1,blocks:['autres.ask']},
 home:{n:'Accueil',main:1,hdr:()=>header(''),blocks:['home.hello','home.resume','home.step','home.mat','home.fav','home.diff']},
 matieres:{n:'Matières',main:1,hdr:()=>header(T('matieres.where','📚 Mes matières')),blocks:['matieres.list','matieres.more']},
 programme:{n:'Programme',main:1,hdr:()=>header(T('programme.where','🗓️ Programme d’étude')),blocks:['programme.choose','programme.today','programme.week','programme.me','programme.table','programme.gen']},
 stats:{n:'Statistiques',main:1,hdr:()=>header(T('stats.where','📈 Statistiques')),blocks:['stats.kpis','stats.mat','stats.exams']},
 profile:{n:'Profil',main:1,hdr:()=>header(T('profile.where','👤 Profil')),blocks:['profile.identity','profile.cursus','profile.colors','profile.data']},
 matiere:{n:'Fiche matière',ctx:1,hdr:()=>{const m=matOf(ctx.id);return miniHeader(esc((m.fil||[]).join(' · '))+' · '+esc(m.niv),esc(m.emo+' '+m.short))},blocks:['matiere.badge','matiere.actions','matiere.links','matiere.diff']},
 sujets:{n:'Faire les quiz',ctx:1,hdr:()=>{const m=matOf(ctx.id);return miniHeader(T('sujets.small','Faire les quiz'),esc(m.emo+' '+m.short))},blocks:['sujets.list']},
 resumes:{n:'Résumés de cours',ctx:1,hdr:()=>{const m=matOf(ctx.id);return miniHeader(T('resumes.small','Résumés de cours'),esc(m.emo+' '+m.short))},blocks:['resumes.main']},
 examcfg:{n:'Mode chronométré',ctx:1,hdr:()=>{const m=matOf(ctx.id);return miniHeader(T('examcfg.small','Sujet chronométré'),esc(m.emo+' '+m.short))},blocks:['examcfg.main']},
 flashcfg:{n:'Flashcards',ctx:1,hdr:()=>{const m=matOf(ctx.id);return miniHeader(T('flashcfg.small','Flashcards'),esc(m.emo+' '+m.short))},blocks:['flashcfg.main']},
 flash:{n:'Session de flashcards',ctx:1,nonav:1,hdr:()=>{const m=matOf(FL?FL.mid:ctx.id);return miniHeader(FL&&!FL.mid?esc(FL.label):esc(m.emo+' '+m.short),FL&&FL.i<FL.deck.length?T('flash.num','Carte {i}/{n}',{i:FL.i+1,n:FL.deck.length}):T('flash.done','Session terminée'),`<button class="back" onclick="endFlash()">${Tx('flash.quit','✕ Terminer')}</button>`)},blocks:['flash.main']},
 heures:{n:'Heures de cours',ctx:1,hdr:()=>{const m=matOf(ctx.id);return miniHeader(T('heures.small','Heures de cours'),esc(m.emo+' '+m.short))},blocks:['heures.intro','heures.list']},
 diff:{n:'Notions difficiles',ctx:1,hdr:()=>miniHeader(T('diff.small','À revoir'),T('diff.title','📌 Notions difficiles')),blocks:['diff.list']},
 quiz:{n:'Quiz',ctx:1,nonav:1,hdr:()=>{const q=curQ();return miniHeader(esc(matOf(q.m).emo+' '+matOf(q.m).short)+' · '+esc(QZ.label||''),T('quiz.qnum','Question {i}/{n}',{i:QZ.idx+1,n:QZ.ids.length}),`<button class="back" onclick="quitQuiz()">${Tx('quiz.quit','✕ Quitter')}</button>`)},blocks:['quiz.main']},
 exam:{n:'Examen',ctx:1,nonav:1,hdr:()=>miniHeader(T('exam.small','📝 Sujet type examen')+' · <span class="timer" id="tmr"></span>',T('exam.qnum','Question {i}/{n}',{i:EX.idx+1,n:EX.ids.length}),`<button class="back" onclick="askRI('${jsq(Tx('exam.abandon','Abandonner l’examen ?'))}',function(){finishExam(true)})">✕</button>`),blocks:['exam.main']},
 result:{n:'Résultat',ctx:1,hdr:()=>miniHeader(T('result.small','Résultat'),esc(RES?RES.label:'')),blocks:['result.score','result.review','result.actions']},
 appview:{n:'Application complète',ctx:1,raw:1,blocks:[]}};
const MENU_DEF=[{v:'home',i:'🏠',l:'Accueil'},{v:'matieres',i:'📚',l:'Matières'},{v:'programme',i:'🗓️',l:'Programme'},{v:'stats',i:'📈',l:'Stats'},{v:'profile',i:'👤',l:'Profil'}];
function menu(){return Array.isArray(E.menu)&&E.menu.length?E.menu:MENU_DEF}
const NAVI={home:'home',matieres:'folder',programme:'clock',stats:'chart',profile:'user'};
function buildNav(){const n=$('#nav');if(!n)return;n.innerHTML=menu().map(m=>`<button data-v="${esc(m.v)}"><span class="i">${ico(NAVI[m.v]||'star',esc(m.i))}</span><span class="nl">${esc(m.l)}</span></button>`).join('');$$('#nav button').forEach(b=>b.onclick=()=>tab(b.dataset.v))}
function layoutOf(sc){const l=E.layout&&E.layout[sc];if(Array.isArray(l))return l;return((SCREENS[sc]||{}).blocks||[]).map(id=>BLK[id]&&BLK[id].opt?{id,inst:id,hidden:true}:{id,inst:id})}
function bstyle(b,d){let s='--ts:'+(b.ts||1)+';';if(d.grid)s+='--cols:'+(b.cols||3)+';';else if(b.bs&&b.bs!==1)s+='zoom:'+b.bs+';';const sv=shapeVars(b.shape);Object.keys(sv.v).forEach(k=>s+=k+':'+sv.v[k]+';');try{s+=ouVars(b)}catch(e){}
 const SP=[0,6,12,20,32];if(SP[b.m]!=null)s+='margin-top:'+SP[b.m]+'px;margin-bottom:'+SP[b.m]+'px;';if(SP[b.p]!=null)s+='padding:'+SP[b.p]+'px;';const AL={l:'left',c:'center',r:'right'}[b.al];if(AL)s+='text-align:'+AL+';';return s}
function battrs(b){const sv=shapeVars(b.shape);return Object.keys(sv.a).map(k=>' data-'+k+'="1"').join('')+(b.w==='h'||b.w==='t'?' data-w="'+b.w+'"':'')}
function go(v,c={},push=true){if(VIEW==='appview')closeApp();if(push&&VIEW){VSTACK.push({v:VIEW,c:ctx,y:window.scrollY});try{history.pushState({pt:VSTACK.length},'')}catch(e){}}VIEW=v;ctx=c;DRAWER=false;if(MATSC.includes(v))PANE=true;render();window.scrollTo(0,c.y||0)}
function back(){render._dir='back';const p=VSTACK.pop();if(VIEW==='appview')closeApp();if(!p){VIEW='home';ctx={};PANE=false;render();return}VIEW=p.v;ctx=p.c;if(VIEW==='home')PANE=false;render();setTimeout(()=>window.scrollTo(0,p.y||0),0)}
function tab(v){VSTACK=[];PANE=false;go(v,{},false)}
window.addEventListener('popstate',()=>{{const co=document.getElementById('calc-ov');if(co&&!co.classList.contains('hidden')){co.classList.add('hidden');try{history.pushState({pt:1},'')}catch(e){}return}if(document.getElementById('gs')){gsClose();return}const rk=document.getElementById('rkup');if(rk){rk.remove();try{history.pushState({pt:1},'')}catch(e){}return}}if(VIEW==='appview'){try{history.pushState({pt:1},'')}catch(e){}leaveApp();return}if(VSTACK.length)back();else if(VIEW!=='home'&&S&&S.onb)tab('home')});
const MATSC=['matiere','sujets','resumes','heures','examcfg','diff','result','flashcfg'];let PANE=false;
const CONTSC=MATSC.concat(['quiz','exam','flash']);let DRAWER=false;
function sideOn(){return S.side!==false}
let LASTC=null;
function hasC(){return!!(LASTC||(S.lastMat&&MATI[S.lastMat]))}
function toggleA(){const cont=CONTSC.includes(VIEW);
 if(cont){if(isWide()){S.side=!sideOn();save()}else DRAWER=!DRAWER;render();return}
 if(VIEW==='home'&&hasC()){S.side=false;save();openC();return}
 tab('home')}
function toggleC(){const cont=CONTSC.includes(VIEW);
 if(cont){S.side=true;save();PANE=false;tab('home');return}
 if(VIEW==='home'&&hasC()){if(isWide()){PANE=!PANE;render()}else openC();return}}
function openC(){const c=LASTC||{v:'matiere',c:{id:S.lastMat}};VSTACK=[];go(c.v,c.c,false)}
function togglePane(){toggleA()}
function closeDrawer(){DRAWER=false;render()}
function isWide(){const w=!!(window.matchMedia&&window.matchMedia('(min-width:1000px)').matches);if(LASTW===null)LASTW=w;return w}
function renderBody(sc){const present=[];const body=layoutOf(sc).map(b=>{const d=BLK[b.id]||custBlk(b.id);if(!d)return'';if(b.hidden&&!EDITMODE)return'';const _ou=uiOf(b)==='s';let h='';try{h=(_ou&&d.oneui?d.oneui():d.html())||''}catch(e){console.error(b.id,e);h=''}
  if(!h&&!EDITMODE)return'';if(!present.includes(d))present.push(d);
  return `<section class="blk${b.hidden?' blk-hid':''}${_ou?' oui':''}" data-n="${present.length}" data-inst="${esc(b.inst)}" data-bid="${esc(b.id)}" style="${bstyle(b,d)}"${battrs(b)}>${h||'<div class="emptyblk">'+esc(d.label)+' — vide ici</div>'}</section>`}).join('');return{body,present}}
function render(){let sc=SCREENS[VIEW]?VIEW:'home';if(sc!==VIEW)VIEW=sc;const spec=SCREENS[sc];
 if(!S.onb&&!spec.onb&&!EDITMODE){VIEW=sc='welcome'}
 const sp=SCREENS[sc];
 const root=VSTACK.length?VSTACK[0].v:VIEW;$$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===VIEW||b.dataset.v===root));
 const nav=$('#nav');if(nav)nav.classList.toggle('hide',!!(sp.nonav||sp.onb||sp.raw));
 const lay=$('#layout'),side=$('#side'),app=$('#app');
 if(sp.raw){const pb=$('#paneBtns');if(pb)pb.style.display='none';document.body.classList.remove('haspane','drawer-on');lay.classList.remove('split');side.classList.remove('drawer');side.innerHTML='';app.className='app nonav';app.innerHTML=appViewHTML();iconize(app);appViewAfter();return}
 const {body,present}=renderBody(sc);
 if(sp.onb){app.className='app nonav';lay.classList.remove('split');side.innerHTML='';app.innerHTML=`<div class="onb">${body}<div class="foot">${SIG()}</div></div>`}
 else{app.className='app'+(sp.nonav?' nonav':'');let hd='';try{hd=sp.hdr()}catch(e){console.error(e);hd=header('')}
  app.innerHTML=hd+'<div class="wrap" id="main">'+body+FOOT()+'</div>';
  const lastM=S.lastMat&&MATI[S.lastMat]?S.lastMat:'';
  const wide=isWide(),cont=CONTSC.includes(VIEW);
  const split=wide&&S.onb&&((cont&&sideOn())||(VIEW==='home'&&PANE&&hasC()));const drawer=!wide&&S.onb&&cont&&DRAWER;
  lay.classList.toggle('split',split);side.classList.toggle('drawer',drawer);document.body.classList.toggle('drawer-on',drawer);
  if(split||drawer){const saveV=VIEW,saveC=ctx;let sideSc='home',sideCtx={};
   if(VIEW==='home'){if(LASTC&&MATSC.includes(LASTC.v)&&LASTC.v!=='result'){sideSc=LASTC.v;sideCtx=LASTC.c}else{sideSc='matiere';sideCtx={id:lastM}}}
   VIEW=sideSc;ctx=sideCtx;let sb='';const r2=renderBody(sideSc);try{sb=SCREENS[sideSc].hdr()}catch(e){}
   side.innerHTML=(drawer?`<button class="drawer-x" onclick="closeDrawer()">${esc(Tx('pane.drawer.close','✕ Fermer le volet accueil'))}</button>`:'')+sb+'<div class="wrap">'+r2.body+'</div>';r2.present.forEach(d=>{if(d.after)try{d.after(side)}catch(e){console.error(e)}});VIEW=saveV;ctx=saveC;
   if(sideSc==='home'){side.classList.add('right');lay.insertBefore(app,side)}else{side.classList.remove('right');lay.insertBefore(side,app)}}
  else side.innerHTML=''}
 paneBtn(sp);
 const ak=VIEW+'|'+JSON.stringify(ctx||{});if(ak!==render._ak){render._ak=ak;app.classList.remove('anim','back');void app.offsetWidth;app.classList.add('anim');if(render._dir==='back')app.classList.add('back')}render._dir='';
 present.forEach(d=>{if(d.after)try{d.after(app)}catch(e){console.error(d.id,e)}});
 if(AFTER[sc])try{AFTER[sc]()}catch(e){console.error(e)}
 iconize($('#app'));iconize($('#side'));iconize($('#nav'));
 if(window.PORTAIL_EDITOR&&!RO)window.PORTAIL_EDITOR.decorate(sc)}
function paneBtn(sp){let g=$('#paneBtns');if(!g){g=document.createElement('div');g.id='paneBtns';g.className='panebtns';g.innerHTML='<button id="paneC" class="panebtn2"></button><button id="paneBtn" class="panebtn2"></button>';document.body.appendChild(g);$('#paneBtn').onclick=toggleA;$('#paneC').onclick=toggleC}
 const wide=isWide(),cont=CONTSC.includes(VIEW),split=$('#layout').classList.contains('split');
 if(cont&&MATSC.includes(VIEW))LASTC={v:VIEW,c:ctx};
 const can=S.onb&&!sp.onb&&!sp.raw&&(cont||VIEW==='home');
 g.style.display=can?'flex':'none';document.body.classList.toggle('haspane',!!can);g.classList.toggle('mini',!wide);
 const aOn=VIEW==='home'||(cont&&(wide?split:DRAWER)),cOn=cont||(VIEW==='home'&&split);
 const bA=$('#paneBtn'),bC=$('#paneC');bC.style.display=(cont||hasC())?'':'none';
 bA.classList.toggle('on',aOn);bC.classList.toggle('on',cOn);
 bA.innerHTML='<span>'+ico('home','🏠')+'</span>'+(wide?'<em>'+esc(Tx('pane.a','Volet accueil'))+'</em>':'');bC.innerHTML='<span>'+ico('page','📄')+'</span>'+(wide?'<em>'+esc(Tx('pane.c','Volet contenu'))+'</em>':'');
 bA.title=(aOn?Tx('pane.a.close','Fermer le volet accueil'):Tx('pane.a.open','Ouvrir le volet accueil'));bC.title=(cOn?Tx('pane.c.close','Fermer le volet contenu'):Tx('pane.c.open','Ouvrir le volet contenu'));
 let bg=$('#drawerBg');if(!bg){bg=document.createElement('div');bg.id='drawerBg';bg.className='drawer-bg';bg.onclick=closeDrawer;document.body.appendChild(bg)}bg.style.display=document.body.classList.contains('drawer-on')?'block':'none'}
let LASTW=null;window.addEventListener('resize',()=>{clearTimeout(render._r);render._r=setTimeout(()=>{const w=isWide();if(w===LASTW)return;LASTW=w;const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))return;if(VIEW!=='appview'&&VIEW!=='quiz'&&VIEW!=='exam')render()},250)});
/* grille de tuiles réordonnables */
function grid(gid,tiles){const ord=E.tiles&&E.tiles[gid];let list=tiles.slice();
 if(Array.isArray(ord)){const m={};tiles.forEach(t=>m[t.id]=t);list=ord.filter(o=>m[o.id]).map(o=>Object.assign({},m[o.id],{hidden:!!o.hidden}));tiles.forEach(t=>{if(!ord.some(o=>o.id===t.id))list.push(t)})}
 return `<div class="grid" data-grid="${gid}">${list.filter(t=>!t.hidden||EDITMODE).map(t=>`<button class="tile sf${t.hidden?' tile-hid':''}${t.cls?' '+t.cls:''}" data-tile="${esc(t.id)}" style="--tc:${t.c||'var(--coral)'}" onclick="${t.on}">${t.st?`<span class="st">${t.st}</span>`:''}<span class="e">${t.e}</span><span><span class="l" style="display:block">${t.l}</span><span class="n" style="display:block">${t.n}</span></span></button>`).join('')}</div>`}

/* volets ajoutés par le formateur (texte, encadré, bouton, image) */
function custBlk(id){if(!String(id).startsWith('cust.'))return null;const k=id.slice(5),c=(E.custom||{})[k];if(!c)return null;return{id,label:'Volet : '+(c.title||c.type),portable:true,cust:k,html:()=>custHTML(c,k)}}
function custHTML(c,k){const t=c.title?`<h3>${esc(c.title)}</h3>`:'';
 if(c.type==='note')return `<div class="card sf cnote" style="--nc:${esc(c.col||'#E8772E')}">${c.emo?`<span class="ce">${esc(c.emo)}</span>`:''}<div>${t}<div class="custx" data-cx="${esc(k)}">${c.html||''}</div></div></div>`;
 if(c.type==='button')return `<button class="btn ${c.style||'coral'}" onclick="custGo('${jsq(k)}')">${esc((c.emo?c.emo+' ':'')+(c.title||'…'))}</button>`;
 if(c.type==='image')return `<figure class="card sf cimg">${t}${c.img?`<img src="${c.img}" alt="">`:''}${c.html?`<figcaption class="custx" data-cx="${esc(k)}">${c.html}</figcaption>`:''}</figure>`;
 return `<div class="card sf">${t}<div class="custx" data-cx="${esc(k)}">${c.html||''}</div></div>`}
function custGo(k){const c=(E.custom||{})[k];if(!c)return;const g=c.go||'';if(g.startsWith('mat:'))openMat(g.slice(4));else if(g.startsWith('http'))window.open(g,'_blank');else if(SCREENS[g])go(g,{})}

/* ======================= CONNEXION & FILTRES ======================= */
function dots(i){return `<div class="dots">${[0,1,2,3].map(k=>`<i class="${k===i?'on':''}"></i>`).join('')}</div>`}
B('welcome.hero','Bienvenue (connexion)',()=>`<div class="hero sf"><div class="sig">${SIG()}</div><div class="wel" style="margin-top:14px">${T('welcome.title','Révision Infos · Bienvenue')}</div><h1 class="brand" style="font-size:calc(46px*var(--gts,1)*var(--ts,1))"><span class="b1">${T('meta.brand1',esc(META.brand[0]))}</span><br><span class="b2">${T('meta.brand2',esc(META.brand[1]))}</span></h1><div class="sub" style="font-size:calc(17px*var(--gts,1)*var(--ts,1));margin-top:12px">${T('meta.tagline',esc(META.tagline))}</div></div>${dots(0)}`);
B('welcome.form','Se connecter (nom)',()=>`<div class="card sf"><div class="bigq" style="font-size:calc(22px*var(--gts,1)*var(--ts,1))">${T('welcome.ask','Se connecter')}</div><div class="muted small" style="margin-bottom:10px">${T('welcome.help','Entre ton nom pour commencer. Ta progression reste enregistrée sur cet appareil.')}</div>
 <input class="tin" id="wName" autocomplete="name" placeholder="${esc(Tx('welcome.ph','Ton prénom et ton nom'))}" value="${esc(S.name)}">
 <button class="btn coral" style="margin-top:12px" id="wGo">${T('welcome.go','Se connecter →')}</button></div>`,{after:r=>{const b=$('#wGo',r),i=$('#wName',r);if(!b)return;const go2=()=>{const v=i.value.trim();if(!v){toast(Tx('toast.name','Écris ton nom pour continuer'));i.focus();return}S.name=v;if(!S.start)S.start=today();save();go('filiere',{},false)};b.onclick=go2;i.onkeydown=e=>{if(e.key==='Enter')go2()}}});
B('filiere.ask','Question filière',()=>`<div class="hero sf"><div class="sig">${SIG()}</div><div class="wel" style="margin-top:10px">${T('filiere.title','Filtre · Révision Infos')}</div></div>${dots(1)}
 <div class="qlab">${T('filiere.qst','Qst :')}</div> <div class="bigq">${T('filiere.q','Quelle est votre filière ?')}</div>
 <div class="choices">${DATA.filieres.map(f=>`<button class="choice sf ${S.fil===f.id?'on':''}" onclick="pickFil('${jsq(f.id)}')"><span class="ce">${esc(f.e||'🎓')}</span><span><b>${esc(f.id)}</b><small>${esc(f.n||'')}</small></span></button>`).join('')}</div>`);
function pickFil(f){S.fil=f;PLANC=null;S.extra=S.extra.filter(id=>MATI[id]);save();go('annee',{},false)}
B('annee.ask','Question année',()=>`<div class="hero sf"><div class="sig">${SIG()}</div><div class="wel" style="margin-top:10px">${T('annee.title','Filtres')}</div></div>${dots(2)}
 <div class="qlab">${T('annee.qst','Qst :')}</div> <div class="bigq">${T('annee.q','Année d’étude ?')}</div>
 <div class="choices n3">${DATA.niveaux.map(n=>`<button class="choice sf ${S.niv===n?'on':''}" onclick="pickNiv('${jsq(n)}')"><b>${esc(n)}</b><small>${esc(Tx('annee.lic','Licence {n}',{n:n.replace(/\D/g,'')}))}</small></button>`).join('')}</div>
 <button class="btn ghost" style="margin-top:16px" onclick="go('filiere',{},false)">${T('ui.prev','← Étape précédente')}</button>`);
function pickNiv(n){S.niv=n;save();recalc();go('autres',{},false)}
let CAHIER=null;
B('autres.ask','Accès à d’autres cours',()=>{const base=MAT.filter(m=>!m.off&&isBase(m)),oth=otherMats();const yes=CAHIER!==null;
 const grp={};oth.forEach(m=>{const k=(m.fil||[]).join(' / ')+' · '+m.niv;(grp[k]=grp[k]||[]).push(m)});
 return `<div class="hero sf"><div class="sig">${SIG()}</div><div class="wel" style="margin-top:10px">${T('autres.title','Filière {fil} · {niv}',{fil:esc(S.fil),niv:esc(S.niv)})}</div></div>${dots(3)}
 <div class="card sf"><h3>${T('autres.base','✅ Tes cours disponibles ({n})',{n:base.length})}</h3>${base.length?base.map(m=>`<div class="pill" style="display:inline-block;margin:0 6px 6px 0">${esc(m.emo+' '+m.short)}</div>`).join(''):`<div class="empty">${T('autres.none','Aucun cours pour ce choix pour l’instant.')}</div>`}</div>
 ${oth.length?`<div class="bigq">${T('autres.q','Voulez-vous avoir accès à d’autres cours ?')}</div><div class="muted small">${T('autres.help','Cours d’autres filières ou d’autres années.')}</div>
 <div class="row2" style="margin-top:12px"><button class="choice sf ${yes?'on':''}" style="justify-content:center" onclick="{CAHIER=S.extra.slice();render()}"><b style="font-size:22px">${T('autres.yes','Oui')}</b></button><button class="choice sf" style="justify-content:center" onclick="{CAHIER=null;S.extra=[];finishOnb()}"><b style="font-size:22px">${T('autres.no','Non → Aller')}</b></button></div>
 ${yes?`<div class="card sf cahier" style="margin-top:14px"><h3>${T('autres.cahier','📒 Cahier des cours')}</h3><div class="muted small">${T('autres.cahier.help','Coche les cours à ajouter à ton espace.')}</div>${Object.keys(grp).map(k=>`<div class="grp">${esc(k)}</div>${grp[k].map(m=>`<label class="ck ${CAHIER.includes(m.id)?'on':''}"><input type="checkbox" data-mx="${esc(m.id)}" ${CAHIER.includes(m.id)?'checked':''}><span style="font-size:24px">${esc(m.emo)}</span><span><b>${esc(m.title)}</b><br><small class="muted">${(QBM[m.id]||[]).length} ${Tx('ui.questions','questions')}</small></span></label>`).join('')}`).join('')}</div>`:''}`
 :`<div class="card sf"><div class="muted">${T('autres.all','Tous les cours sont déjà disponibles pour toi.')}</div></div>`}
 <button class="btn coral" style="margin-top:14px" onclick="{if(CAHIER)S.extra=CAHIER.slice();finishOnb()}">${T('autres.go','Aller →')}</button>
 <button class="btn ghost" onclick="go('annee',{},false)">${T('ui.prev','← Étape précédente')}</button>`},{after:r=>$$('[data-mx]',r).forEach(c=>c.onchange=()=>{const id=c.dataset.mx;if(c.checked){if(!CAHIER.includes(id))CAHIER.push(id)}else CAHIER=CAHIER.filter(x=>x!==id);c.closest('.ck').classList.toggle('on',c.checked)})});
function finishOnb(){S.onb=true;CAHIER=null;save();recalc();toast(Tx('toast.welcome','Bienvenue {name} 🎉',{name:S.name}));tab('home')}

/* ======================= ACCUEIL ======================= */
B('home.hello','Bonjour & bienvenue',()=>{const L=level();return `<div class="card sf hello"><button class="ava" onclick="profileModal()" title="${esc(Tx('home.editme','Modifier mon nom et mon avatar'))}">${S.avatar}</button><div style="flex:1;min-width:0"><div class="nm" onclick="profileModal()" style="cursor:pointer">${T('home.hello','Bonjour {name} et bienvenue parmi nous 👋',{name:esc(S.name||Tx('home.anon','futur(e) soignant(e)'))})}</div><div class="lv">${T('home.level','Niv. {n} · {lname} · {xp} XP · 🔥 {streak} j',{n:L.n,lname:esc(L.name),xp:S.xp,streak:S.streak.count})}</div><div class="pills">${S.fil?`<span class="pill">${esc(S.fil)}</span>`:''}${S.niv?`<span class="pill o">${esc(S.niv)}</span>`:''}</div><div class="bar"><i style="width:${L.pct}%"></i></div></div></div>`});
B('home.resume','Reprendre le quiz',()=>{const c=S.cur;if(!c||!c.ids||c.idx>=c.ids.length)return'';return `<div class="card sf resume" onclick="resumeQuiz()"><div class="ic">▶</div><div style="flex:1"><b>${T('home.resume','Continuer : {label} · {i}/{n}',{label:esc(matOf(c.mid).short+' · '+c.label),i:c.idx,n:c.ids.length})}</b></div></div>`});
/* ---------- programmes d'étude : 3 mois, 6 mois (standard), 1 an ---------- */
function PROGS(){return{
 '3m':{n:Tx('prog3.n','Essentiel · 3 mois'),d:Tx('prog3.d','Maîtriser l’essentiel en 3 mois, rythme intensif'),e:'⚡',w:13,ph:[
  {f:1,t:4,n:Tx('prog3.s1','Essentiel'),o:Tx('prog3.o1','Lire les résumés et faire la moitié des sujets'),c:'#2B7BD8',det:[Tx('prog3.d1a','Lire le résumé de chaque matière avant ses quiz'),Tx('prog3.d1b','Un sujet de 50 questions par jour de révision'),Tx('prog3.d1c','Marquer 📌 chaque notion oubliée')]},
  {f:5,t:8,n:Tx('prog3.s2','Compléter'),o:Tx('prog3.o2','Finir tous les sujets et combler les lacunes'),c:'#D8467A',det:[Tx('prog3.d2a','Terminer les sujets restants'),Tx('prog3.d2b','Revoir chaque jour les notions difficiles'),Tx('prog3.d2c','Étudier les tableaux comparatifs')]},
  {f:9,t:11,n:Tx('prog3.s3','Entraînement'),o:Tx('prog3.o3','Sujets en mode chronométré'),c:'#1FAE6B',det:[Tx('prog3.d3a','Refaire en chronométré les sujets sous 12/20'),Tx('prog3.d3b','Mélanger les matières d’un jour à l’autre'),Tx('prog3.d3c','Comprendre chaque erreur avec la correction')]},
  {f:12,t:13,n:Tx('prog3.s4','Projet'),o:Tx('prog3.o4','Viser la note maximale'),c:'#E8772E',det:[Tx('prog3.d4a','Vider la liste des notions difficiles'),Tx('prog3.d4b','Dernier tour des résumés et des images'),Tx('prog3.d4c','Se reposer la veille de l’évaluation')]}]},
 '6m':{n:Tx('prog6.n','Standard · 6 mois'),d:Tx('prog6.d','Le programme conseillé : complet et régulier'),e:'⭐',w:26,ph:[
  {f:1,t:8,n:Tx('prog6.s1','Essentiel'),o:Tx('prog6.o1','Maîtriser l’essentiel (mois 1 – 2)'),c:'#2B7BD8',det:[Tx('prog6.d1a','Revoir les notions du cours avec les résumés'),Tx('prog6.d1b','Identifier les notions oubliées'),Tx('prog6.d1c','Se concentrer sur l’essentiel')]},
  {f:9,t:17,n:Tx('prog6.s2','Compléter'),o:Tx('prog6.o2','Approfondir les notions manquantes (mois 3 – 4)'),c:'#D8467A',det:[Tx('prog6.d2a','Programme ciblé sur les points faibles'),Tx('prog6.d2b','Révision des notions difficiles'),Tx('prog6.d2c','Entraînement avec Q&A')]},
  {f:18,t:22,n:Tx('prog6.s3','Entraînement'),o:Tx('prog6.o3','Préparation aux évaluations (mois 5)'),c:'#1FAE6B',det:[Tx('prog6.d3a','Faire des QCM après chaque chapitre'),Tx('prog6.d3b','Résoudre des sujets complets'),Tx('prog6.d3c','Suivre des tests chronométrés')]},
  {f:23,t:26,n:Tx('prog6.s4','Projet'),o:Tx('prog6.o4','Atteindre une note maximale (mois 6)'),c:'#E8772E',det:[Tx('prog6.d4a','Développer une méthode personnelle'),Tx('prog6.d4b','S’entraîner régulièrement'),Tx('prog6.d4c','Se préparer pour une excellente note et un bon classement')]}]},
 '12m':{n:Tx('prog12.n','Approfondi · 1 an'),d:Tx('prog12.d','Pour tout maîtriser en profondeur, à son rythme'),e:'🏔️',w:52,ph:[
  {f:1,t:13,n:Tx('prog12.s1','Essentiel'),o:Tx('prog12.o1','Maîtrise de l’essentiel (0 – 3 mois)'),c:'#2B7BD8',det:[Tx('prog12.d1a','Revoir les notions du cours'),Tx('prog12.d1b','Identifier les notions oubliées'),Tx('prog12.d1c','Se concentrer sur l’essentiel')]},
  {f:14,t:26,n:Tx('prog12.s2','Compléter'),o:Tx('prog12.o2','Approfondir les notions manquantes (3 – 6 mois)'),c:'#D8467A',det:[Tx('prog12.d2a','Programme ciblé sur les points faibles'),Tx('prog12.d2b','Révision des notions difficiles'),Tx('prog12.d2c','Entraînement avec Q&A')]},
  {f:27,t:44,n:Tx('prog12.s3','Entraînement'),o:Tx('prog12.o3','Préparation aux évaluations (6 – 10 mois)'),c:'#1FAE6B',det:[Tx('prog12.d3a','Faire des QCM après chaque chapitre'),Tx('prog12.d3b','Résoudre des annales'),Tx('prog12.d3c','Suivre des tests chronométrés')]},
  {f:45,t:52,n:Tx('prog12.s4','Projet'),o:Tx('prog12.o4','Atteindre une note maximale (10 – 12 mois)'),c:'#E8772E',det:[Tx('prog12.d4a','Développer une méthode personnelle'),Tx('prog12.d4b','S’entraîner régulièrement'),Tx('prog12.d4c','Se préparer pour une excellente note et un bon classement')]}]}}}
function progId(){return PROGS()[S.prog]?S.prog:'6m'}
function weekNow(){if(!S.start)return 1;return Math.max(1,Math.floor((Date.now()-new Date(S.start).getTime())/(864e5*7))+1)}
function phaseNow(){const P=PROGS()[progId()],w=weekNow();let i=P.ph.findIndex(p=>w>=p.f&&w<=p.t);if(i<0)i=P.ph.length-1;return{P,i,ph:P.ph[i],w,over:w>P.w}}
function planStats(){const mats=myMats();let tot=0;mats.forEach(m=>tot+=(QBM[m.id]||[]).length?sujets(m.id).length:0);const done=S.done||[];const uniq=new Set(done.filter(x=>MATI[x.mid]).map(x=>x.mid+'#'+x.k)).size;
 const {P,i,w}=phaseNow();const wk0=new Date(new Date(S.start||today()).getTime()+(w-1)*7*864e5).getTime();const thisWeek=done.filter(x=>x.t>=wk0).length;
 let target;if(i<=1){const left=Math.max(0,tot-uniq),weeks=Math.max(1,P.ph[1].t-w+1);target=Math.max(1,Math.ceil((left+thisWeek)/weeks))}else if(i===2){target=Math.max(1,Math.ceil(tot*.5/Math.max(1,P.ph[2].t-P.ph[2].f+1)))}else target=Math.max(1,Math.ceil(tot*.25/Math.max(1,P.ph[3].t-P.ph[3].f+1)));
 return{tot,uniq,thisWeek,target}}
B('home.step','Mon programme (résumé)',()=>{const {P,i,ph,w}=phaseNow(),st=planStats();return `<div class="card sf step" onclick="tab('programme')"><div class="n" style="background:${ph.c}">${i+1}</div><div class="tx"><small class="muted">${T('home.step.lbl','{prog} · semaine {w}/{tw}',{prog:esc(P.n),w:Math.min(w,P.w),tw:P.w})}</small><b>${esc(ph.n)} — ${esc(ph.o)}</b><small class="muted">${T('home.step.week','Aujourd’hui : {s} séance(s) · cette semaine : {d}/{t} sujet(s) →',{s:plan().filter(x=>x.d===todayIdx()).length,d:st.thisWeek,t:st.target})}</small><div class="bar"><i style="width:${Math.min(100,st.thisWeek/st.target*100)}%"></i></div></div></div>`});
function matTile(m){const st=mStat(m.id),lv=mLevel(st.pct);return{id:m.id,e:esc(m.emo),l:esc(m.short),n:esc(lv.e+' '+st.pct+'% · '+m.niv),c:m.col,st:S.fav[m.id]?'⭐':'',on:`openMat('${jsq(m.id)}')`}}
B('home.mat','Matières par groupe',()=>{const mine=new Set(myMats().map(m=>m.id));const G=groups().map(g=>Object.assign(g,{subs:g.subs.map(s=>Object.assign(s,{mats:s.mats.filter(id=>mine.has(id))})).filter(s=>s.mats.length)})).filter(g=>g.subs.length);
 const open=S.gOpen||{};
 return `<div class="secT">${T('home.mat','Matières')}<span class="ln"></span></div>`+G.map((g,gi)=>`<details class="grp sf" style="--gc:${esc(g.col||'var(--coral)')}" data-g="${esc(g.id)}" ${open[g.id]===false?'':'open'}><summary><span class="ge">${esc(g.e||'📁')}</span><b>${esc(g.n)}</b><small>${g.subs.reduce((a,s)=>a+s.mats.length,0)} ${esc(Tx('grp.n','cours'))}</small></summary>${(()=>{const solo=g.subs.filter(s=>s.mats.length===1),multi=g.subs.filter(s=>s.mats.length>1);
  return (solo.length?grid('g.'+g.id,solo.map(s=>{const t=matTile(MATI[s.mats[0]]);if(s.n&&nrm(s.n)!==nrm(MATI[s.mats[0]].short))t.n=esc(s.n)+' · '+t.n;return t})):'')+multi.map(s=>`<div class="sgrp">${esc(s.n)}</div>${grid('g.'+g.id+'.'+s.id,s.mats.map(id=>matTile(MATI[id])))}`).join('')})()}</details>`).join('')
 +(otherMats().length?`<button class="btn light" style="margin-top:4px" onclick="CAHIER=S.extra.slice();go('autres')">${T('home.mat.add','➕ Autres cours (cahier des cours)')}</button>`:'')},{grid:1,after:r=>$$('details.grp',r).forEach(d=>d.addEventListener('toggle',()=>{S.gOpen=S.gOpen||{};S.gOpen[d.dataset.g]=d.open;save()}))});
function openMat(id){S.lastMat=id;save();go('matiere',{id})}
B('home.fav','Cours mis en favoris',()=>{const L=myMats().filter(m=>S.fav[m.id]);return `<div class="card sf"><h3>${T('home.fav','⭐ Liste des cours mis en favoris')}</h3>${L.length?L.map(m=>`<div class="li" onclick="openMat('${jsq(m.id)}')"><span class="em">${esc(m.emo)}</span><span class="tx"><b>${esc(m.title)}</b><small>${mStat(m.id).pct}% ${Tx('ui.mastered','maîtrisé')}</small></span><span class="go">›</span></div>`).join(''):`<div class="empty">${T('home.fav.empty','Touche ☆ dans une matière pour l’ajouter ici.')}</div>`}</div>`});
B('home.diff','Notions difficiles à revoir',()=>{const L=myMats().map(m=>({m,n:diffIds(m.id).length})).filter(x=>x.n);const tot=L.reduce((a,x)=>a+x.n,0);
 return `<div class="card sf"><h3>${T('home.diff','📌 Liste des notions difficiles à revoir')}</h3>${L.length?L.map(x=>`<div class="li" onclick="go('diff',{id:'${jsq(x.m.id)}'})"><span class="em">${esc(x.m.emo)}</span><span class="tx"><b>${esc(x.m.short)}</b><small>${T('home.diff.n','{n} notion(s) à revoir',{n:x.n})}</small></span><span class="go">›</span></div>`).join('')+`<button class="btn coral" onclick="startDiff('')">${T('home.diff.all','🔁 Tout revoir ({n})',{n:tot})}</button>`:`<div class="empty">${T('home.diff.empty','Les questions ratées et celles marquées 📌 apparaîtront ici.')}</div>`}</div>`});

function profileModal(){if(EDITMODE)return;let o=$('#pmod');if(o)o.remove();o=document.createElement('div');o.id='pmod';o.className='pmod';
 o.innerHTML=`<div class="pbox"><h3>${esc(Tx('pm.title','👤 Mon profil'))}</h3><div class="muted small">${esc(Tx('pm.help','Ce profil est utilisé partout, y compris dans chaque application complète.'))}</div><input class="tin" id="pmName" value="${esc(S.name)}" placeholder="${esc(Tx('welcome.ph','Ton prénom et ton nom'))}" style="margin:10px 0"><div class="avgrid">${AVATARS.map(a=>`<button class="${S.avatar===a?'on':''}" data-pa="${a}">${a}</button>`).join('')}</div><div class="row2"><button class="btn coral" id="pmOk">${esc(Tx('profile.save','Enregistrer'))}</button><button class="btn light" id="pmX">${esc(Tx('pm.cancel','Annuler'))}</button></div></div>`;
 document.body.appendChild(o);let av=S.avatar;$$('[data-pa]',o).forEach(b=>b.onclick=()=>{av=b.dataset.pa;$$('[data-pa]',o).forEach(x=>x.classList.toggle('on',x===b))});
 $('#pmX',o).onclick=()=>o.remove();o.onclick=e=>{if(e.target===o)o.remove()};$('#pmOk',o).onclick=()=>{const v=$('#pmName',o).value.trim();if(v)S.name=v;S.avatar=av;save();o.remove();toast(Tx('toast.profile','Profil enregistré ✅'));render()};setTimeout(()=>$('#pmName',o).focus(),50)}

/* ======================= MATIÈRES ======================= */
B('matieres.list','Liste des matières',()=>{const mine=new Set(myMats().map(m=>m.id));const L=[];groups().forEach(g=>g.subs.forEach(s=>s.mats.forEach(id=>{if(mine.has(id))L.push(Object.assign({},MATI[id],{_g:g.n+(s.n?' › '+s.n:'')}))})));let lastG='';return L.length?L.map(m=>{const gh=m._g!==lastG?`<div class="sgrp" style="margin-top:12px">${esc(m._g)}</div>`:'';lastG=m._g;return gh+(()=>{const st=mStat(m.id),lv=mLevel(st.pct);return `<div class="li sf" style="background:#fff;box-shadow:var(--sh);padding:14px" onclick="openMat('${jsq(m.id)}')"><span class="em" style="background:${esc(m.col)};color:#fff">${esc(m.emo)}</span><span class="tx"><b>${esc(m.title)}</b><small>${esc((m.fil||[]).join(' · ')+' · '+m.niv)} · ${(QBM[m.id]||[]).length} ${Tx('ui.questions','questions')} · ${lv.e} ${esc(lv.n)}</small></span>${ring(st.pct,m.col)}</div>`})()}).join(''):`<div class="card sf empty">${T('matieres.none','Aucune matière. Ajoute des cours avec le bouton ci-dessous.')}</div>`});
B('matieres.more','Ajouter d’autres cours',()=>otherMats().length?`<button class="btn light" onclick="{CAHIER=S.extra.slice();go('autres')}">${T('matieres.more','📒 Accéder à d’autres cours (cahier des cours)')}</button>`:'');

/* ======================= FICHE MATIÈRE (interface contenu appli) ======================= */
B('matiere.badge','Titre, niveau & badge',()=>{const m=matOf(ctx.id),st=mStat(m.id),lv=mLevel(st.pct);return `<div class="card sf"><div class="mhead" style="--tc:${esc(m.col)}"><div class="big">${esc(m.emo)}</div><div style="flex:1;min-width:0"><div class="t">${esc(m.title)}</div><div class="muted small">${esc(m.sub||'')}</div><span class="lvb">${lv.e} ${T('matiere.lvl','Niveau {i} · {n}',{i:lv.i,n:esc(lv.n)})}</span></div><button class="star" title="${esc(Tx('matiere.fav','Favori'))}" onclick="toggleFav('${jsq(m.id)}')">${S.fav[m.id]?'⭐':'☆'}</button></div>
 <div style="display:flex;align-items:center;gap:12px;margin-top:14px">${ring(st.pct,m.col)}<div class="small">${T('matiere.stat','{ok}/{total} questions maîtrisées · {seen} déjà vues',{ok:st.ok,total:st.total,seen:st.seen})}</div></div></div>`});
function toggleFav(id){if(S.fav[id])delete S.fav[id];else S.fav[id]=1;save();toast(S.fav[id]?Tx('toast.fav','⭐ Ajouté aux favoris'):Tx('toast.unfav','Retiré des favoris'));render()}
B('matiere.actions','Les 5 actions',()=>{const m=matOf(ctx.id),n=(QBM[m.id]||[]).length,ns=sujets(m.id).length;
 return `<button class="act sf" onclick="go('sujets',{id:'${jsq(m.id)}'})"><span class="dot"><span>${ico('edit','✍️')}</span></span><span><b>${T('matiere.a1','FAIRE les quiz')}</b><small>${T('matiere.a1.s','{n} questions en {s} sujets d’environ {k}',{n,s:ns,k:sujSize()})}</small></span><span class="arr">›</span></button>
 <button class="act exam sf" onclick="go('resumes',{id:'${jsq(m.id)}'})"><span class="dot"><span>${ico('doc','📋')}</span></span><span><b>${T('matiere.a2','Voir les résumés de cours')}</b><small>${T('matiere.a2.s','Résumés, tableaux, comparatifs, images et schémas')}</small></span><span class="arr">›</span></button>
 <button class="act sf" onclick="go('flashcfg',{id:'${jsq(m.id)}'})"><span class="dot"><span>${ico('cards','🃏')}</span></span><span><b>${T('matiere.a5','Faire les flashcards')}</b><small>${T('matiere.a5.s','{n} cartes · répétition espacée',{n:cardsOf(m.id).length})}</small></span><span class="arr">›</span></button>
 <button class="act sf" onclick="go('appview',{id:'${jsq(m.id)}'})"><span class="dot"><span>${ico('app','📖')}</span></span><span><b>${T('matiere.a3','Voir l’application complète')}</b><small>${T('matiere.a3.s','Cours, flashcards, résumés, tableaux…')}</small></span><span class="arr">›</span></button>
 <button class="act sf" onclick="go('heures',{id:'${jsq(m.id)}'})"><span class="dot"><span>${ico('clock','🕒')}</span></span><span><b>${T('matiere.a4','Voir les heures de cours')}</b><small>${T('matiere.a4.s','Planning selon ton programme ({p})',{p:esc(PROGS()[progId()].n)})}</small></span><span class="arr">›</span></button>`});
function ytId(u){const m=String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);return m?m[1]:''}
function linksOf(mid,ch){return(((E.content.links||{})[mid])||[]).filter(l=>ch==null?true:l.ch===ch)}
function linkHTML(l,i,mid){const id=ytId(l.url);return `<a class="ytl" href="${esc(l.url)}" target="_blank" rel="noopener" onclick="return playYt(this.href,'${jsq(l.title||'')}')">${id?`<span class="yth" style="background-image:url(https://img.youtube.com/vi/${id}/mqdefault.jpg)"><i>▶</i></span>`:'<span class="yth"><i>▶</i></span>'}<span class="ytx"><small>${l.t==='musique'?esc(Tx('yt.music','🎵 Version musicale')):esc(Tx('yt.video','🎬 Vidéo explicative'))}${l.ch!=null&&l.ch!==''?' · '+esc(Tx('resumes.ch','Ch. {n}',{n:+l.ch+1})):''}</small><b>${esc(l.title||l.url)}</b></span></a>`}
function playYt(url,title){if(EDITMODE)return false;const id=ytId(url);if(!id)return true;if(!/^https?:$/.test(location.protocol)){window.open(url,'_blank');return false}let o=$('#ytp');if(o)o.remove();o=document.createElement('div');o.id='ytp';o.className='ytp';
 o.innerHTML=`<div class="ytbox2"><div class="ytbar"><b>${esc(title||Tx('yt.video','🎬 Vidéo explicative'))}</b><button class="btn coral" style="width:auto;margin:0;padding:9px 14px" id="ytX">${esc(Tx('yt.close','✕ Fermer'))}</button></div><div class="ytfr"><iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="ytalt">${esc(Tx('yt.alt','La vidéo ne démarre pas ?'))} <a href="${esc(url)}" target="_blank" rel="noopener">${esc(Tx('yt.open','Ouvrir sur YouTube ↗'))}</a></div></div>`;
 document.body.appendChild(o);const close=()=>o.remove();$('#ytX',o).onclick=close;o.onclick=e=>{if(e.target===o)close()};return false}
B('matiere.links','Liens YouTube (musique, vidéos)',()=>{const mid=ctx.id,L=linksOf(mid);const ed=!RO&&EDITMODE;if(!L.length&&!ed)return'';return `<div class="card sf"><h3>${T('yt.h','🎬 Vidéos & versions musicales')}</h3>${L.map((l,i)=>linkHTML(l,i,mid)).join('')||`<div class="empty">${T('yt.none','Aucun lien pour ce cours.')}</div>`}${ed?`<button class="btn light" onclick="PORTAIL_EDITOR.linkModal('${jsq(mid)}')">${esc('＋ Ajouter un lien YouTube')}</button>`:''}</div>`});
B('matiere.diff','Notions à revoir (matière)',()=>{const n=diffIds(ctx.id).length;if(!n)return'';return `<button class="btn light" onclick="go('diff',{id:'${jsq(ctx.id)}'})">${T('matiere.diff','📌 {n} notion(s) difficile(s) à revoir',{n})}</button>`});

/* ======================= SUJETS DE 50 ======================= */
B('sujets.list','Sujets / chapitres',()=>{const m=matOf(ctx.id),mode=S.sujMode||'suj';let h=`<div class="seg"><button class="${mode==='suj'?'on':''}" onclick="S.sujMode='suj';save();render()">${T('sujets.bysuj','Par sujet')}</button><button class="${mode==='ch'?'on':''}" onclick="S.sujMode='ch';save();render()">${T('sujets.bych','Par chapitre')}</button></div>`;
 if(mode==='suj'){const L=sujets(m.id);h+=`<div class="muted small" style="margin-bottom:8px">${T('sujets.help','Chaque sujet suit l’ordre du cours : toutes ses questions s’affichent, avec la correction dès que tu réponds.')}</div><label class="timed"><input type="checkbox" ${S.timed?'checked':''} onchange="S.timed=this.checked;save()"> ${T('sujets.timed','⏱️ Mode chronométré (1 min par question, correction à la fin)')}</label>`+L.map((ids,k)=>{let seen=0,ok=0;ids.forEach(id=>{const s=S.qs[id];if(s){seen++;if(s.l)ok++}});const done=seen===ids.length;
  return `<div class="suj sf ${done?'done':''}" onclick="startSujet('${jsq(m.id)}',${k})"><div class="no"><small>${esc(Tx('sujets.no','SUJET'))}</small>${k+1}</div><div class="tx"><b>${T('sujets.t','Sujet {k} · {n} questions',{k:k+1,n:ids.length})}</b><small>${T('sujets.s','{seen}/{n} faites · {ok} justes',{seen,n:ids.length,ok})}</small><div class="bar"><i style="width:${Math.round(seen/ids.length*100)}%"></i></div></div><span class="go" style="font-weight:900;color:var(--coral);font-size:20px">▶</span></div>`}).join('')}
 else{h+=(m.ch||[]).map((c,i)=>{const ids=(QBM[m.id]||[]).filter(q=>q.c===i).map(q=>q.id);if(!ids.length)return'';let ok=0;ids.forEach(id=>{if((S.qs[id]||{}).l)ok++});return `<div class="suj sf" onclick="startChap('${jsq(m.id)}',${i})"><div class="no" style="background:${esc(m.col)}">${i+1}</div><div class="tx"><b>${esc(c)}</b><small>${T('sujets.ch.s','{n} questions · {ok} justes',{n:ids.length,ok})}</small></div><span class="go" style="font-weight:900;color:var(--coral);font-size:20px">▶</span></div>`}).join('')}
 return h});

/* ======================= MOTEUR DE QUIZ ======================= */
let QZ=null;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function startQuiz(mid,ids,label,mode,k,week){ids=ids.filter(id=>QI[id]);if(!ids.length){toast(Tx('toast.noq','Aucune question ici'));return}
 QZ={mid,ids:shuffle(ids),idx:0,ans:{},perm:{},label,mode:mode||'suj',ok:0,k,week};S.cur=QZ;save();go('quiz',{})}
function startSujet(mid,k){if(S.timed){startTimed(mid,sujets(mid)[k],Tx('quiz.lbl.suj','Sujet {k}',{k:k+1}),k);return}startQuiz(mid,sujets(mid)[k],Tx('quiz.lbl.suj','Sujet {k}',{k:k+1}),'suj',k)}
function startChap(mid,i){startQuiz(mid,(QBM[mid]||[]).filter(q=>q.c===i).map(q=>q.id),Tx('quiz.lbl.ch','Chapitre {k}',{k:i+1}),'ch')}
function startDiff(mid){const ids=diffIds(mid);startQuiz(mid||(QI[ids[0]]||{}).m,ids,Tx('quiz.lbl.diff','Notions à revoir'),'diff')}
function resumeQuiz(){QZ=S.cur;if(!QZ)return;go('quiz',{})}
function curQ(){return QI[QZ.ids[QZ.idx]]||{m:QZ.mid,q:'',t:'qcm',o:[]}}
function permOf(q){if(!QZ.perm[q.id])QZ.perm[q.id]=shuffle((q.o||[]).map((x,i)=>i));return QZ.perm[q.id]}
function rec(q,ok){const s=S.qs[q.id]||{n:0,k:0};s.n++;if(ok)s.k++;s.l=ok?1:0;s.t=Date.now();S.qs[q.id]=s;
 if(!ok)S.diff[q.id]=1;else if(QZ&&QZ.mode==='diff')delete S.diff[q.id];S.xp+=ok?10:2;touchStreak();save()}
function imgSrc(n){if(String(n)[0]==='x'){if(IMGR[n])return IMGR[n];const e=document.getElementById('img-'+n);return e?e.textContent:''}const e=document.getElementById('img-'+n);return e?e.textContent:''}
function extrasHTML(q,noImg){let h='';
 if(!noImg&&q.img!=null&&imgSrc(q.img)){const cap=imgCap(q.m,q.img);h+=`<figure class="xfig"><img src="${imgSrc(q.img)}" alt="" onclick="zoomImg('${q.img}','${jsq(cap)}')">${cap?`<figcaption>🖼️ ${esc(cap)}</figcaption>`:''}</figure>`}
 const L=[['mn','🧠',Tx('x.mn','Technique de mémorisation')],['kid','🧒',Tx('x.kid','Astuce : expliqué simplement')],['rf','📌',Tx('x.rf','À retenir')],['sc','🔀',Tx('x.sc','Schéma')]];
 const rows=L.filter(l=>q[l[0]]).map(l=>`<div class="xrow x-${l[0]}"><div class="xh">${l[1]} ${esc(l[2])}</div><div>${esc(q[l[0]])}</div></div>`).join('');
 return h||rows?`<div class="xbox">${h}${rows}</div>`:''}
const CAPS={};function imgCap(mid,n){if(!CAPS[mid]){CAPS[mid]={};const R=DATA.res[mid];if(R)R.ch.forEach(c=>(c.imgs||[]).forEach(i=>CAPS[mid][i[0]]=i[1]))}return CAPS[mid][n]||''}
function zoomImg(n,cap){let o=$('#lb');if(!o){o=document.createElement('div');o.id='lb';o.className='lb';o.onclick=()=>o.classList.remove('on');document.body.appendChild(o)}o.innerHTML=`<img src="${imgSrc(n)}" alt=""><div class="cap">${esc(cap||'')}</div><button class="btn coral" style="width:auto;margin:10px auto 0">${esc(Tx('lb.close','✕ Fermer'))}</button>`;o.classList.add('on')}
function courseHTML(mid,c){const L=(DATA.course||{})[mid];const t=L&&L[c];if(t&&t.length>40)return t;return resChapHTML0(mid,c)}
function readCourse(mid,c,qid){const m=matOf(mid);const q=qid?QI[qid]:null;let o=$('#crd');if(o)o.remove();o=document.createElement('div');o.id='crd';o.className='crd';
 const words=q?[...new Set(nrm((q.t==='qcm'?q.o[q.a]:q.t==='open'?q.r:'')+' '+(q.x||'')).split(' ').filter(w=>w.length>5))].slice(0,12):[];
 o.innerHTML=`<div class="crbox"><div class="crbar"><div class="tt"><small>${esc(m.emo+' '+m.short)} · ${esc(Tx('read.ch','Chapitre {n}',{n:c+1}))}</small><b>${esc(chName(mid,c))}</b></div><button class="btn coral" id="crX" style="width:auto;margin:0;padding:9px 14px">${esc(Tx('read.close','✕ Retour au quiz'))}</button></div>${words.length?`<div class="crhint">${esc(Tx('read.hint','Les passages liés à la réponse sont surlignés.'))}</div>`:''}<div class="crtx" id="crTx">${courseHTML(mid,c)}</div></div>`;
 document.body.appendChild(o);const tx=$('#crTx',o);
 if(words.length){const rx=new RegExp('('+words.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','i');const w=document.createTreeWalker(tx,4);const L=[];let n;while(n=w.nextNode())if(rx.test(nrm(n.nodeValue)))L.push(n);
  L.slice(0,60).forEach(t=>{const p=t.parentElement;if(p&&!p.classList.contains('hlq'))p.classList.add('hlq')});const f=tx.querySelector('.hlq');if(f)setTimeout(()=>f.scrollIntoView({block:'center'}),80)}
 iconize(o);$('#crX',o).onclick=()=>o.remove();o.onclick=e=>{if(e.target===o)o.remove()}}
function qCard(q,body){return `<div class="card sf"><span class="qtype ${typeCls(q)}">${esc(typeLabel(q))}</span><span class="qch">${esc(chName(q.m,q.c))}</span>${q.s?`<div class="scen">${esc(q.s)}</div>`:''}<div class="qq">${esc(q.q)}</div>${body}</div>`}
B('quiz.main','Question',()=>{if(!QZ)return'';if(QZ.idx>=QZ.ids.length)return'';const q=curQ(),a=QZ.ans[q.id],L='ABCDEFGH';let body='';
 if(q.t==='qcm'){const P=permOf(q);body=P.map((oi,k)=>{let c='';if(a){if(oi===q.a)c='ok';else if(oi===a.sel)c='ko'}return `<button class="opt ${c}" ${a?'disabled':''} onclick="ansQ(${oi})"><span class="k">${L[k]}</span><span>${esc(q.o[oi])}</span></button>`}).join('')}
 else if(q.t==='vf'){body=`<div class="vfrow">${[[1,Tx('quiz.true','Vrai')],[0,Tx('quiz.false','Faux')]].map(([v,l])=>{let c='';if(a){if(v===q.v)c='ok';else if(v===a.sel)c='ko'}return `<button class="opt ${c}" ${a?'disabled':''} onclick="ansQ(${v})">${esc(l)}</button>`}).join('')}</div>`}
 else{body=a?`<div class="fb neu"><b>${T('quiz.yours','Ta réponse :')}</b> ${esc(a.txt||'—')}</div>`:`<textarea class="tin" id="openA" rows="3" placeholder="${esc(Tx('quiz.open.ph','Écris ta réponse…'))}"></textarea><button class="btn" style="margin-top:10px" onclick="ansOpen()">${T('quiz.open.show','Voir la réponse')}</button>`}
 let fb='';if(a){const good=a.ok;fb=`<div class="fb ${a.pending?'neu':good?'good':'bad'}"><div class="h">${a.pending?T('quiz.selfq','Avais-tu la bonne réponse ?'):good?T('quiz.good','Bonne réponse ✅'):T('quiz.bad','Réponse incorrecte ❌')}</div>${(!good||q.t==='open')?`<div><b>${T('quiz.answer','Réponse :')}</b> ${esc(correctText(q))}</div>`:''}${q.x?`<div class="ex">💡 ${esc(q.x)}</div>`:''}</div>${a.pending?'':extrasHTML(q)}${a.pending?'':`<button class="btn light readbtn" onclick="readCourse('${jsq(q.m)}',${q.c},'${jsq(q.id)}')">${T('read.btn','📖 Lire le cours de ce chapitre')}</button>`}`;
  if(a.pending)fb+=`<div class="row2"><button class="btn" style="background:var(--green)" onclick="selfGrade(1)">${T('quiz.knew','✅ Je savais')}</button><button class="btn" style="background:var(--red)" onclick="selfGrade(0)">${T('quiz.didnt','❌ À revoir')}</button></div>`;
  else fb+=`<div class="qbtns"><button class="btn pin ${S.diff[q.id]?'on':''}" title="${esc(Tx('quiz.pin','À revoir'))}" onclick="togglePin('${jsq(q.id)}')">📌</button><button class="btn coral" onclick="nextQ()">${QZ.idx+1<QZ.ids.length?T('quiz.next','Suivant →'):T('quiz.finish','Terminer 🏁')}</button></div>`}
 return `<div class="qtop"><span>${T('quiz.progress','{i}/{n} · ✅ {ok}',{i:QZ.idx+1,n:QZ.ids.length,ok:QZ.ok})}</span><span>${esc(QZ.label)}</span></div><div class="pbar"><i style="width:${QZ.idx/QZ.ids.length*100}%"></i></div>${qCard(q,body)}${fb}`});
function ansQ(v){const q=curQ();if(QZ.ans[q.id])return;const ok=q.t==='vf'?v===q.v:v===q.a;QZ.ans[q.id]={sel:v,ok};if(ok)QZ.ok++;rec(q,ok);S.cur=QZ;save();render()}
function ansOpen(){const q=curQ(),t=($('#openA')||{}).value||'';const acc=(q.acc||[q.r]).map(nrm).filter(x=>x.length>1);const n=nrm(t);
 const auto=n&&acc.some(x=>n.includes(x)||(x.includes(n)&&n.length>=Math.max(4,x.length*.6)));if(auto){QZ.ans[q.id]={txt:t,ok:true};QZ.ok++;rec(q,true)}else QZ.ans[q.id]={txt:t,pending:1};S.cur=QZ;save();render()}
function selfGrade(ok){const q=curQ(),a=QZ.ans[q.id];a.pending=0;a.ok=!!ok;if(ok)QZ.ok++;rec(q,!!ok);S.cur=QZ;save();render()}
function togglePin(id){if(S.diff[id]){delete S.diff[id];toast(Tx('toast.unpin','Retiré des notions à revoir'))}else{S.diff[id]=1;toast(Tx('toast.pin','📌 Ajouté aux notions à revoir'))}save();render()}
function nextQ(){QZ.idx++;S.cur=QZ;save();if(QZ.idx>=QZ.ids.length){finishQuiz();return}render();window.scrollTo(0,0)}
function quitQuiz(){S.cur=QZ&&QZ.idx<QZ.ids.length?QZ:null;save();VSTACK=[];if(QZ&&!QZ.mid){go('programme',{},false);return}go(QZ?'matiere':'home',QZ?{id:QZ.mid}:{},false)}
let RES=null;
function finishQuiz(){const n=QZ.ids.length,ok=QZ.ok;RES={mid:QZ.mid,label:QZ.label,n,ok,sc:Math.round(ok/n*200)/10,ids:QZ.ids,ans:QZ.ans,kind:'quiz',mode:QZ.mode};S.cur=null;if(QZ.mode==='suj')logDone(QZ.mid,QZ.k,RES.sc);S.xp+=20;if(QZ.week){S.wq=S.wq||{};S.wq[QZ.week]=Math.max(S.wq[QZ.week]||0,RES.sc)}save();VSTACK=[QZ.mid?{v:'matiere',c:{id:QZ.mid},y:0}:{v:'programme',c:{},y:0}];VIEW='result';ctx={};render();window.scrollTo(0,0)}

/* ======================= SUJET TYPE EXAMEN ======================= */
let EX=null,EXT=null;
B('examcfg.main','Réglage de l’examen',()=>{const m=matOf(ctx.id),c=S.examCfg||{n:40,min:40};const pool=(QBM[m.id]||[]).filter(q=>q.t!=='open').length;
 return `<div class="card sf"><h3>${T('examcfg.h','📝 Sujet type examen')}</h3><div class="muted small">${T('examcfg.help','Questions tirées de tous les chapitres (QCM, vrai/faux, cas cliniques). Pas de correction avant la fin, note sur 20.')}</div>
 <div class="secT" style="font-size:16px;margin-top:14px">${T('examcfg.nq','Nombre de questions')}</div><div class="seg">${[20,40,60].map(n=>`<button class="${c.n===n?'on':''}" onclick="S.examCfg=Object.assign(S.examCfg||{n:40,min:40},{n:${n}});save();render()">${n}</button>`).join('')}</div>
 <div class="secT" style="font-size:16px">${T('examcfg.min','Durée')}</div><div class="seg">${[20,30,40,60].map(n=>`<button class="${c.min===n?'on':''}" onclick="S.examCfg=Object.assign(S.examCfg||{n:40,min:40},{min:${n}});save();render()">${n} min</button>`).join('')}</div>
 <button class="btn coral" style="margin-top:8px" onclick="startExam('${jsq(m.id)}')">${T('examcfg.go','Commencer l’examen ⏱️')}</button><div class="muted small center">${T('examcfg.pool','{n} questions disponibles pour ce sujet',{n:pool})}</div></div>
 ${S.exams.filter(e=>e.mid===m.id).length?`<div class="card sf"><h3>${T('examcfg.hist','Mes derniers examens')}</h3>${S.exams.filter(e=>e.mid===m.id).slice(-5).reverse().map(e=>`<div class="sbar"><span class="nmx">${esc(e.d)}</span><span class="tr"><i style="width:${e.sc*5}%;background:${e.sc>=10?'var(--green)':'var(--red)'}"></i></span><span class="pc">${e.sc}/20</span></div>`).join('')}</div>`:''}`});
function startExam(mid){const c=S.examCfg||{n:40,min:40};const pool=(QBM[mid]||[]).filter(q=>q.t!=='open');const by={};pool.forEach(q=>(by[q.c]=by[q.c]||[]).push(q.id));
 const keys=shuffle(Object.keys(by));Object.keys(by).forEach(k=>by[k]=shuffle(by[k]));const ids=[];let guard=0;while(ids.length<Math.min(c.n,pool.length)&&guard<9999){keys.forEach(k=>{if(ids.length<c.n&&by[k].length)ids.push(by[k].pop())});guard++}
 if(!ids.length){toast(Tx('toast.noq','Aucune question ici'));return}
 EX={mid,ids:shuffle(ids),idx:0,ans:{},perm:{},end:Date.now()+c.min*60000,min:c.min};QZ={perm:EX.perm};go('exam',{});tickExam()}
function startTimed(mid,ids,label,k){ids=ids.filter(id=>QI[id]&&QI[id].t!=='open');if(!ids.length){toast(Tx('toast.noq','Aucune question ici'));return}
 EX={mid,ids:shuffle(ids),idx:0,ans:{},perm:{},end:Date.now()+ids.length*60000,min:ids.length,label,k};QZ={perm:EX.perm};go('exam',{});tickExam()}
function logDone(mid,k,sc){if(k==null)return;(S.done=S.done||[]).push({d:today(),t:Date.now(),mid,k,sc});save()}
function tickExam(){clearInterval(EXT);EXT=setInterval(()=>{if(!EX||VIEW!=='exam'){clearInterval(EXT);return}const r=Math.max(0,EX.end-Date.now());const e=$('#tmr');if(e)e.textContent=Math.floor(r/60000)+':'+String(Math.floor(r/1000)%60).padStart(2,'0');if(r<=0){clearInterval(EXT);toast(Tx('toast.time','⏰ Temps écoulé'));finishExam()}},500)}
B('exam.main','Question d’examen',()=>{if(!EX)return'';const q=QI[EX.ids[EX.idx]];if(!q)return'';const a=EX.ans[q.id],L='ABCDEFGH';let body='';
 if(q.t==='qcm'){if(!EX.perm[q.id])EX.perm[q.id]=shuffle(q.o.map((x,i)=>i));body=EX.perm[q.id].map((oi,k)=>`<button class="opt ${a===oi?'sel':''}" onclick="exAns(${oi})"><span class="k">${L[k]}</span><span>${esc(q.o[oi])}</span></button>`).join('')}
 else body=`<div class="vfrow">${[[1,Tx('quiz.true','Vrai')],[0,Tx('quiz.false','Faux')]].map(([v,l])=>`<button class="opt ${a===v?'sel':''}" onclick="exAns(${v})">${esc(l)}</button>`).join('')}</div>`;
 return `<div class="pbar"><i style="width:${Object.keys(EX.ans).length/EX.ids.length*100}%"></i></div>${qCard(q,body)}
 <div class="row2"><button class="btn light" ${EX.idx===0?'disabled':''} onclick="EX.idx--;render()">${T('exam.prev','← Précédente')}</button>${EX.idx+1<EX.ids.length?`<button class="btn" onclick="EX.idx++;render();window.scrollTo(0,0)">${T('exam.next','Suivante →')}</button>`:`<button class="btn coral" onclick="askRI('${jsq(Tx('exam.confirm','Rendre la copie ?'))}',function(){finishExam()})">${T('exam.end','Rendre la copie ✔')}</button>`}</div>
 <button class="btn ghost" onclick="askRI('${jsq(Tx('exam.confirm','Rendre la copie ?'))}',function(){finishExam()})">${T('exam.end2','🏁 Rendre la copie maintenant ({a}/{n} répondues)',{a:Object.keys(EX.ans).length,n:EX.ids.length})}</button>
 <div class="qnums">${EX.ids.map((id,i)=>`<button class="${EX.ans[id]!=null?'a':''} ${i===EX.idx?'c':''}" onclick="EX.idx=${i};render()">${i+1}</button>`).join('')}</div>`});
function exAns(v){const q=QI[EX.ids[EX.idx]];EX.ans[q.id]=v;render()}
function finishExam(abort){clearInterval(EXT);if(!EX)return;if(abort){const m=EX.mid;EX=null;VSTACK=[{v:'matiere',c:{id:m},y:0}];go('sujets',{id:m},false);return}
 let ok=0;const ans={};EX.ids.forEach(id=>{const q=QI[id],v=EX.ans[id];const good=v!=null&&(q.t==='vf'?v===q.v:v===q.a);if(good)ok++;ans[id]={sel:v,ok:good};if(v!=null){QZ={mode:'exam'};rec(q,good)}});
 const n=EX.ids.length,sc=Math.round(ok/n*200)/10;S.exams.push({mid:EX.mid,sc,n,ok,d:today()});S.xp+=30;save();
 RES={mid:EX.mid,label:EX.label||Tx('result.exam','Sujet chronométré'),n,ok,sc,ids:EX.ids,ans,kind:'exam',k:EX.k};logDone(EX.mid,EX.k,sc);const m=EX.mid;EX=null;VSTACK=[{v:'matiere',c:{id:m},y:0}];VIEW='result';ctx={};render();window.scrollTo(0,0)}
B('result.score','Note',()=>{if(!RES)return'';const r=RES,men=r.sc>=16?Tx('result.m1','Excellent ! 🏆'):r.sc>=14?Tx('result.m2','Très bien 🎉'):r.sc>=10?Tx('result.m3','Admis — continue ! 💪'):Tx('result.m4','À retravailler 📚');
 return `<div class="card sf center"><div class="muted">${r.mid?esc(matOf(r.mid).emo+' '+matOf(r.mid).title):esc(r.label)}</div><div class="score">${r.sc}<span style="font-size:.45em">/20</span></div><div style="font-weight:800;font-size:20px;margin-top:6px">${esc(men)}</div><div class="muted">${T('result.line','{ok} bonnes réponses sur {n}',{ok:r.ok,n:r.n})}</div></div>`});
B('result.review','Correction',()=>{if(!RES)return'';const bad=RES.ids.filter(id=>!(RES.ans[id]||{}).ok);if(!bad.length)return `<div class="card sf center">${T('result.perfect','Aucune erreur 👏')}</div>`;
 return `<div class="secT">${T('result.rev','Correction des erreurs ({n})',{n:bad.length})}<span class="ln"></span></div>`+bad.map(id=>{const q=QI[id];return q?`<div class="rv">${q.s?`<div class="muted small">${esc(q.s)}</div>`:''}<b>${esc(q.q)}</b><div class="ans">✔ ${esc(correctText(q))}</div>${q.x?`<div class="muted small">💡 ${esc(q.x)}</div>`:''}${extrasHTML(q,1)}<button class="btn light readbtn" style="margin:8px 0 0" onclick="readCourse('${jsq(q.m)}',${q.c},'${jsq(q.id)}')">${T('read.btn','📖 Lire le cours de ce chapitre')}</button></div>`:''}).join('')});
B('result.actions','Boutons de fin',()=>RES?`<button class="btn coral" onclick="${RES.kind==='exam'?`startTimed(RES.mid,RES.ids,RES.label,RES.k)`:`startQuiz('${jsq(RES.mid)}',RES.ids,RES.label,RES.mode)`}">${T('result.again','🔁 Recommencer')}</button><button class="btn light" onclick="startDiff('${jsq(RES.mid)}')">${T('result.diff','📌 Revoir mes notions difficiles')}</button><button class="btn ghost" onclick="tab('home')">${T('result.home','🏠 Accueil')}</button>`:'');

/* ======================= RÉSUMÉS DE COURS ======================= */
function tableHTML(t,m){return `<div class="rtab"><div class="rtt">${esc(t.t)}${t.c!=null&&m?` <span class="pill">${esc(Tx('resumes.ch','Ch. {n}',{n:t.c+1}))}</span>`:''}</div><div class="tw"><table>${t.h&&t.h.length?`<tr>${t.h.map(x=>`<th>${esc(x)}</th>`).join('')}</tr>`:''}${(t.r||[]).map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table></div></div>`}
function resOf(mid){const R=DATA.res[mid]||{ch:[],comp:[]};const m=matOf(mid);const n=Math.max((m.ch||[]).length,R.ch.length,1);return{R,n}}
function resChapHTML(mid,i){const lk=linksOf(mid,i);const lh=lk.length?`<div class="ytbox">${lk.map(l=>linkHTML(l,0,mid)).join('')}</div>`:'';return lh+resChapHTML0(mid,i)}
function resChapHTML0(mid,i){const ov=((E.content.res||{})[mid]||{})[i];if(ov!=null)return ov;const c=(resOf(mid).R.ch[i])||{pts:[],tabs:[],imgs:[]};let h='';
 if(c.pts.length)h+=`<h4>${esc(Tx('resumes.pts','📌 Points clés'))}</h4><ul class="rpts">${c.pts.map(p=>`<li>${p[0]?`<b>${esc(p[0])}</b><br>`:''}${esc(p[1])}</li>`).join('')}</ul>`;
 if(c.tabs.length)h+=`<h4>${esc(Tx('resumes.tabs','📊 Tableaux'))}</h4>`+c.tabs.map(t=>tableHTML(t)).join('');
 if(c.imgs.length)h+=`<h4>${esc(Tx('resumes.imgs','🖼️ Images & schémas'))}</h4><div class="rgal">${c.imgs.map(x=>`<figure onclick="zoomImg('${x[0]}','${jsq(x[1])}')"><img src="${imgSrc(x[0])}" alt="" loading="lazy"><figcaption>${esc(x[1])}</figcaption></figure>`).join('')}</div>`;
 return h||`<div class="empty">${esc(Tx('resumes.none','Pas encore de résumé pour ce chapitre.'))}</div>`}
B('resumes.main','Résumés, tableaux, images',()=>{const mid=ctx.id,m=matOf(mid),{R,n}=resOf(mid),tb=S.resTab||'ch';const nimg=R.ch.reduce((a,c)=>a+c.imgs.length,0);
 let h=`<div class="seg"><button class="${tb==='ch'?'on':''}" onclick="S.resTab='ch';save();render()">${T('resumes.t1','📖 Par chapitre')}</button><button class="${tb==='cmp'?'on':''}" onclick="S.resTab='cmp';save();render()">${T('resumes.t2','⚖️ Comparatifs ({n})',{n:R.comp.length})}</button><button class="${tb==='img'?'on':''}" onclick="S.resTab='img';save();render()">${T('resumes.t3','🖼️ Images ({n})',{n:nimg})}</button></div>`;
 if(tb==='cmp')h+=R.comp.length?R.comp.map(t=>`<div class="card sf">${tableHTML(t,1)}</div>`).join(''):`<div class="card sf empty">${T('resumes.nocmp','Aucun tableau comparatif pour ce cours.')}</div>`;
 else if(tb==='img')h+=nimg?`<div class="card sf"><div class="rgal">${R.ch.map((c,i)=>c.imgs.map(x=>`<figure onclick="zoomImg('${x[0]}','${jsq(x[1])}')"><img src="${imgSrc(x[0])}" alt="" loading="lazy"><figcaption>${esc(x[1])}</figcaption></figure>`).join('')).join('')}</div></div>`:`<div class="card sf empty">${T('resumes.noimg','Aucune image pour ce cours.')}</div>`;
 else{h+=`<input class="tin" id="rq" placeholder="${esc(Tx('resumes.search','Chercher un chapitre…'))}" style="margin-bottom:10px">`+Array.from({length:n},(x,i)=>{if(!chVisible(mid,i))return'';const t=(m.ch||[])[i]||Tx('resumes.whole','Résumé du cours');const c=R.ch[i]||{pts:[],tabs:[],imgs:[]};
  return `<details class="rch sf" data-rc="${i}" data-q="${esc(nrm(t))}"><summary><span class="rno" style="background:${esc(m.col)}">${i+1}</span><span class="rt">${esc(t)}<small>${T('resumes.cnt','{p} points · {t} tableau(x) · {i} image(s)',{p:c.pts.length,t:c.tabs.length,i:c.imgs.length})}</small></span></summary><div class="rbody" data-k="${esc(mid)}|${i}"></div></details>`}).join('')}
 return h},{after:r=>{$$('details.rch',r).forEach(d=>d.addEventListener('toggle',()=>{const b=$('.rbody',d);if(d.open&&!b.dataset.f){b.dataset.f=1;const[mid,i]=b.dataset.k.split('|');b.innerHTML=resChapHTML(mid,+i);iconize(b);if(EDITMODE&&window.PORTAIL_EDITOR)window.PORTAIL_EDITOR.resBtn(d,b,mid,+i)}}));
 if(ctx.open!=null){const d=$(`details.rch[data-rc="${ctx.open}"]`,r);if(d){d.open=true;setTimeout(()=>d.scrollIntoView({block:'start'}),60)}}
 const q=$('#rq',r);if(q)q.oninput=()=>{const v=nrm(q.value);$$('details.rch',r).forEach(d=>d.style.display=!v||d.dataset.q.includes(v)?'':'none')}}});

/* ======================= NOTIONS DIFFICILES ======================= */
B('diff.list','Liste des notions',()=>{const mid=ctx.id||'';const ids=diffIds(mid);if(!ids.length)return `<div class="card sf empty">${T('diff.empty','Rien à revoir pour l’instant 👏')}</div>`;
 return `<button class="btn coral" onclick="startDiff('${jsq(mid)}')">${T('diff.go','🔁 M’entraîner sur ces {n} notions',{n:ids.length})}</button><div class="card sf">${ids.map(id=>{const q=QI[id];return `<details class="dl"><summary>${mid?'':esc(matOf(q.m).emo)+' '}${esc(q.q)}</summary>${q.s?`<div class="ex">${esc(q.s)}</div>`:''}<div class="ra">✔ ${esc(correctText(q))}</div>${q.x?`<div class="ex">💡 ${esc(q.x)}</div>`:''}${extrasHTML(q)}<button class="btn light readbtn" onclick="readCourse('${jsq(q.m)}',${q.c},'${jsq(q.id)}')">${T('read.btn','📖 Lire le cours de ce chapitre')}</button><button class="btn ghost" style="margin-top:8px;padding:9px" onclick="togglePin('${jsq(id)}')">${T('diff.remove','Retirer de la liste')}</button></details>`}).join('')}</div>`});

/* ======================= HEURES DE COURS ======================= */
const CARDC={};function cardsOf(mid){if(!CARDC[mid]){const v=visCh(MATI[mid]);CARDC[mid]=((DATA.cards||{})[mid]||[]).map((c,i)=>Object.assign({id:mid+'.f'+i,m:mid},c)).filter(c=>!v||v.has(c.c))}return CARDC[mid]}
function recalc(){Object.keys(CARDC).forEach(k=>delete CARDC[k]);PLANC=null;applyContent()}
const LT=[0,1,3,7,16,35,90];
function cardDue(c){const s=S.lt[c.id];return!s||s.due<=Date.now()}
function dueDeck(mid){const L=cardsOf(mid);const rev=L.filter(c=>S.lt[c.id]&&S.lt[c.id].due<=Date.now()).map(c=>c.id);const nw=L.filter(c=>!S.lt[c.id]).slice(0,20).map(c=>c.id);return rev.concat(nw)}
B('flashcfg.main','Flashcards',()=>{const mid=ctx.id,m=matOf(mid),L=cardsOf(mid);if(!L.length)return `<div class="card sf empty">${T('flash.none','Pas encore de flashcards pour ce cours.')}</div>`;
 const box=[0,0,0,0,0,0,0];L.forEach(c=>{const s=S.lt[c.id];box[s?s.b:0]++});const due=dueDeck(mid).length;
 return `<div class="card sf"><h3>${T('flash.h','🃏 Flashcards · répétition espacée')}</h3><div class="muted small">${T('flash.help','Chaque carte revient juste avant d’être oubliée : 1, 3, 7, 16, 35 puis 90 jours après une bonne réponse.')}</div>
 <div class="boxes">${box.map((n,i)=>`<div><b>${n}</b>${i?esc(Tx('flash.box','Boîte {i}',{i})):esc(Tx('flash.new','Nouvelles'))}</div>`).join('')}</div>
 <button class="btn coral" onclick="startFlash('${jsq(mid)}',dueDeck('${jsq(mid)}'),'${jsq(Tx('flash.today','Cartes du jour'))}')">${T('flash.go','▶ Cartes du jour ({n})',{n:due})}</button>
 <button class="btn light" onclick="startFlash('${jsq(mid)}',cardsOf('${jsq(mid)}').map(c=>c.id),'${jsq(Tx('flash.all','Toutes les cartes'))}')">${T('flash.goall','Toutes les cartes ({n})',{n:L.length})}</button></div>
 <div class="secT">${T('flash.bych','Par chapitre')}<span class="ln"></span></div>${(m.ch||[]).map((t,i)=>{const ids=L.filter(c=>c.c===i).map(c=>c.id);if(!ids.length)return'';const ok=ids.filter(id=>(S.lt[id]||{}).b>=3).length;return `<div class="suj sf" onclick="startFlash('${jsq(mid)}',cardsOf('${jsq(mid)}').filter(c=>c.c===${i}).map(c=>c.id),'${jsq(Tx('quiz.lbl.ch','Chapitre {k}',{k:i+1}))}')"><div class="no" style="background:${esc(m.col)}">${i+1}</div><div class="tx"><b>${esc(t)}</b><small>${T('flash.ch.s','{n} cartes · {ok} bien sues',{n:ids.length,ok})}</small></div><span class="go" style="font-weight:900;color:var(--coral);font-size:20px">▶</span></div>`}).join('')}`});
let FL=null;
function startFlash(mid,ids,label){if(!ids.length){toast(Tx('toast.noflash','Aucune carte à revoir aujourd’hui 👏'));return}FL={mid,deck:shuffle(ids),i:0,flip:false,ok:0,ko:0,label};go('flash',{id:mid})}
function endFlash(){const m=FL?FL.mid:ctx.id;FL=null;if(!m){VSTACK=[];go('programme',{},false);return}VSTACK=[{v:'matiere',c:{id:m},y:0}];go('flashcfg',{id:m},false)}
function cardById(id){const mid=id.split('.f')[0];return cardsOf(mid)[+id.split('.f')[1]]}
B('flash.main','Carte',()=>{if(!FL)return'';if(FL.i>=FL.deck.length)return `<div class="card sf center"><div class="score">${FL.ok}<span style="font-size:.4em">/${FL.deck.length}</span></div><div style="font-weight:800;margin:8px 0">${T('flash.end','Cartes sues du premier coup')}</div><button class="btn coral" onclick="endFlash()">${T('flash.back','Retour aux flashcards')}</button></div>`;
 const c=cardById(FL.deck[FL.i]);if(!c)return'';const fl=FL.flip;
 return `<div class="pbar"><i style="width:${FL.i/FL.deck.length*100}%"></i></div><div class="fcard sf ${fl?'flip':''}" onclick="FL.flip=!FL.flip;render()"><div class="qch">${esc(chName(c.m,c.c))}</div><div class="ff">${esc(c.f)}</div>${fl?`<div class="fb2">${esc(c.b)}</div>`:`<div class="muted small center" style="margin-top:14px">${T('flash.tap','👆 Touche la carte pour voir la réponse')}</div>`}</div>
 ${fl?`${(c.mn||c.kid)?`<div class="xbox">${c.mn?`<div class="xrow x-mn"><div class="xh">🧠 ${esc(Tx('x.mn','Technique de mémorisation'))}</div><div>${esc(c.mn)}</div></div>`:''}${c.kid?`<div class="xrow x-kid"><div class="xh">🧒 ${esc(Tx('x.kid','Astuce : expliqué simplement'))}</div><div>${esc(c.kid)}</div></div>`:''}</div>`:''}<button class="btn light readbtn" onclick="readCourse('${jsq(c.m)}',${c.c})">${T('read.btn','📖 Lire le cours de ce chapitre')}</button><div class="row2"><button class="btn" style="background:var(--red)" onclick="rateCard(0)">${T('flash.ko','❌ À revoir')}</button><button class="btn" style="background:var(--green)" onclick="rateCard(1)">${T('flash.ok','✅ Je savais')}</button></div>`:''}`});
function rateCard(ok){const id=FL.deck[FL.i];const s=S.lt[id]||{b:0};s.b=ok?Math.min(6,(s.b||0)+1):1;s.due=Date.now()+LT[s.b]*864e5-36e5;S.lt[id]=s;if(ok)FL.ok++;else{FL.ko++;if(FL.deck.indexOf(id,FL.i+1)<0)FL.deck.push(id)}S.xp+=ok?3:1;touchStreak();save();FL.i++;FL.flip=false;render();window.scrollTo(0,0)}

/* ---------- heures de cours : planning espacé selon la courbe de l'oubli ---------- */
const REVS={'3m':[1,3,7,14,30],'6m':[1,3,7,21,45,90],'12m':[1,4,10,30,60,120,200]};
let PLANC=null;
function dayDate(d){const t=new Date((S.start||today())+'T00:00:00');t.setDate(t.getDate()+d);return t}
function hm(m){return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
function plan(){const pid=progId(),mats=myMats();const key=[pid,S.start,mats.map(m=>m.id+':'+(m.ch||[]).length).join(',')].join('|');if(PLANC&&PLANC.key===key)return PLANC.L;
 const P=PROGS()[pid],learnEnd=P.ph[1].t*7,end=P.w*7;const isSun=d=>dayDate(d).getDay()===0;const study=[];for(let d=0;d<learnEnd;d++)if(!isSun(d))study.push(d);
 const per=mats.map(m=>(m.ch||[]).map((t,i)=>({m,i,n:(QBM[m.id]||[]).filter(q=>q.c===i).length})).filter(u=>u.n||!(QBM[m.id]||[]).length));const units=[];let more=true,k=0;while(more){more=false;per.forEach(l=>{if(l[k]){units.push(l[k]);more=true}});k++}
 const L=[];units.forEach((u,j)=>{const d=study[Math.min(study.length-1,Math.floor(j*study.length/Math.max(1,units.length)))]||0;const min=Math.min(75,Math.max(25,Math.round((20+u.n*1.1)/5)*5));
  L.push({d,mid:u.m.id,c:u.i,ty:'learn',n:0,min});(REVS[pid]||REVS['6m']).forEach((o,r)=>{let rd=d+o;if(isSun(rd))rd++;if(rd<end)L.push({d:rd,mid:u.m.id,c:u.i,ty:'rev',n:r+1,min:10})})});
 L.sort((a,b)=>a.d-b.d||(a.ty==='learn'?-1:1));let cd=-1,t=0;L.forEach(x=>{if(x.d!==cd){cd=x.d;t=18*60}x.t0=t;x.t1=t+x.min;t=x.t1+5;x.key=x.mid+'|'+x.c+'|'+x.ty+x.n});
 PLANC={key,L};return L}
function sessRow(x,showMat){const m=matOf(x.mid),dt=dayDate(x.d),done=(S.sess||{})[x.key],td=x.d===todayIdx();
 return `<div class="sess ${done?'done':''} ${td?'today':''}"><button class="sck" onclick="event.stopPropagation();toggleSess('${jsq(x.key)}')">${done?'✔':''}</button><div class="stx" onclick="openSess('${jsq(x.mid)}',${x.c},'${x.ty}')"><small>${esc(dt.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'2-digit'}))} · ${hm(x.t0)}–${hm(x.t1)}</small><b>${x.ty==='learn'?'📖 ':'🔁 '}${showMat?esc(m.emo+' '+m.short)+' · ':''}${esc(Tx('heures.ch','Ch. {n}',{n:x.c+1}))} — ${esc(chName(x.mid,x.c))}</b><small>${x.ty==='learn'?esc(Tx('heures.learn','Apprentissage : résumé puis quiz du chapitre')):esc(Tx('heures.rev','Révision {n} (flashcards du chapitre)',{n:x.n}))}</small></div></div>`}
function todayIdx(){return Math.floor((new Date(today()+'T00:00:00')-new Date((S.start||today())+'T00:00:00'))/864e5)}
function toggleSess(k){S.sess=S.sess||{};if(S.sess[k])delete S.sess[k];else S.sess[k]=1;save();render()}
function openSess(mid,c,ty){if(ty==='learn'){S.resTab='ch';save();go('resumes',{id:mid,open:c})}else{const ids=cardsOf(mid).filter(x=>x.c===c).map(x=>x.id);if(ids.length)startFlash(mid,ids,Tx('quiz.lbl.ch','Chapitre {k}',{k:c+1}));else startChap(mid,c)}}
B('heures.intro','Programme & date de début',()=>{const L=plan().filter(x=>x.mid===ctx.id);const h=L.reduce((a,x)=>a+x.min,0);const P=PROGS()[progId()];const done=L.filter(x=>(S.sess||{})[x.key]).length;
 return `<div class="card sf"><h3>${T('heures.h','🕒 Mes heures de cours')}</h3><div class="muted small">${T('heures.help','Planning organisé automatiquement selon ton programme et la courbe de l’oubli : chaque chapitre est appris, puis révisé juste avant d’être oublié.')}</div>
 <div class="pills" style="margin:10px 0"><span class="pill o">${esc(P.e+' '+P.n)}</span><span class="pill">${T('heures.tot','{h} h au total · {n} séances',{h:Math.round(h/6)/10,n:L.length})}</span><span class="pill">${T('heures.done','{d} faites',{d:done})}</span></div>
 <div class="small muted">${T('programme.start','Début de ma révision :')}</div><input type="date" class="tin" id="hStart" value="${esc(S.start||today())}"><button class="btn light" style="margin-top:10px" onclick="tab('programme')">${T('heures.prog','Changer de programme')}</button></div>`},{after:r=>{const e=$('#hStart',r);if(e)e.onchange=()=>{S.start=e.value;save();render()}}});
B('heures.list','Planning des séances',()=>{const L=plan().filter(x=>x.mid===ctx.id);if(!L.length)return `<div class="card sf empty">${T('heures.empty','Aucune séance : ce cours n’a pas encore de chapitres.')}</div>`;
 const wk={};L.forEach(x=>{const w=Math.floor(x.d/7)+1;(wk[w]=wk[w]||[]).push(x)});const cw=Math.floor(Math.max(0,todayIdx())/7)+1;
 return Object.keys(wk).map(w=>{const a=dayDate((w-1)*7),b=dayDate((w-1)*7+6);const f=d=>d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});return `<details class="wk sf" ${+w===cw||+w===cw+1?'open':''}><summary><b>${esc(Tx('heures.week','Semaine {w}',{w}))}</b> <small>${f(a)} → ${f(b)} · ${wk[w].length} ${esc(Tx('heures.sess','séance(s)'))}</small>${+w===cw?' <span class="pill o">'+esc(Tx('heures.now','cette semaine'))+'</span>':''}</summary>${wk[w].map(x=>sessRow(x)).join('')}<div class="row2" style="margin:10px 0"><button class="btn coral" onclick="startWeek(${w},'q','${jsq(ctx.id)}')">📝 ${esc(Tx('week.qm','Quiz de la semaine'))}</button><button class="btn light" onclick="startWeek(${w},'f','${jsq(ctx.id)}')">🃏 ${esc(Tx('week.fm','Flashcards de la semaine'))}</button></div></details>`}).join('')});
B('programme.today','Mes séances du jour',()=>{const t=todayIdx();const L=plan().filter(x=>x.d===t);return `<div class="card sf"><h3>${T('programme.today','📅 Aujourd’hui')}</h3>${L.length?L.map(x=>sessRow(x,1)).join(''):`<div class="empty">${T('programme.today.none','Pas de séance prévue aujourd’hui : repos ou flashcards du jour.')}</div>`}</div>`});

/* ======================= APPLICATION COMPLÈTE ======================= */
function leaveApp(){if(confirm(Tx('app.leave','Voulez-vous revenir au menu principal ?'))){closeApp();VSTACK=[];PANE=false;go('home',{},false)}}
function appViewHTML(){const m=matOf(ctx.id);return `<div class="appwrap"><div class="appbar"><button class="back" onclick="leaveApp()">${esc(Tx('ui.back','← Retour'))}</button><div class="tt"><b>${esc(m.emo+' '+m.title)}</b><div class="sig">${SIG()}</div></div>${!RO?`<button class="appedit" id="appEditBtn" onclick="PORTAIL_EDITOR.appEdit()">${esc(Tx('app.edit','✏️ Modifier'))}</button>`:''}</div><div class="loading" id="appLoad">${T('app.loading','Ouverture de l’application…')}</div><iframe class="appframe hide" id="appFrame" title="${esc(m.title)}"></iframe></div>`}
const FORM_CSS=':where(input,select,textarea,button){font-family:inherit}input,select,textarea{font-size:max(16px,1em)}:where(input[type=text],input[type=search],input:not([type]),input[type=number],select,textarea){border-radius:12px;padding:10px 12px;border:1.5px solid rgba(0,0,0,.18);background:#fff;outline:none;transition:box-shadow .15s,border-color .15s}:where(input,select,textarea):focus{border-color:#2BB39A;box-shadow:0 0 0 3px rgba(43,179,154,.25)}';
function unesc(t){return t.replace(/<%\/(script)/gi,'</$1').replace(/<%!--/g,'<!'+'--').replace(/@@IMG(\d+)@@/g,(x,n)=>imgSrc(n)).replace(/@@XIMG:(\w+)@@/g,(x,n)=>imgSrc(n))}
function idb(){return new Promise((ok,ko)=>{try{const r=indexedDB.open(APPID+'_apps',1);r.onupgradeneeded=()=>r.result.createObjectStore('src');r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)}catch(e){ko(e)}})}
async function idbGet(k){const db=await idb();return new Promise((ok,ko)=>{const q=db.transaction('src').objectStore('src').get(k);q.onsuccess=()=>ok(q.result||null);q.onerror=()=>ko(q.error)})}
async function idbPut(k,v){const db=await idb();return new Promise((ok,ko)=>{const t=db.transaction('src','readwrite');t.objectStore('src').put(v,k);t.oncomplete=()=>ok();t.onerror=()=>ko(t.error)})}
async function appSource(m){const el=document.getElementById('app-src-'+m.src);if(el)return unesc(el.textContent);try{const t=await idbGet(m.src);if(t&&t.includes('@@XIMG:')){const im=await idbGet(m.src+':img');if(im)Object.assign(IMGR,im)}return t?unesc(t):null}catch(e){return null}}
function appViewAfter(){const m=matOf(ctx.id);setTimeout(async()=>{let h=await appSource(m);if(!h){$('#appLoad').textContent=Tx('app.missing','Application introuvable dans ce fichier.');return}
 const nm=JSON.stringify(S.name||'').replace(/</g,'\\u003c');
 const av=JSON.stringify(S.avatar||'');
 const seed=m.key?'<script>try{var k='+JSON.stringify(m.key)+',s=JSON.parse(localStorage.getItem(k)||"{}")||{};if('+nm+'){s.name='+nm+';s.avatar=s.av=s.ava='+av+';s.welcomed=true;s.welcome=true;localStorage.setItem(k,JSON.stringify(s))}}catch(e){}<'+'/script>':'';
 const R=((E.content.appTxt||{})[m.id])||{};const rep=(Object.keys(R).length||!RO)?'<script>('+appRep.toString()+')('+JSON.stringify(R).replace(/</g,'\\u003c')+')<'+'/script>':'';
 let css=FORM_CSS+'h1,h2,h3,h4,h5,h6,th,summary,b,strong{font-weight:800!important}';if(E.fontApps&&(E.font&&E.font.family)){css=fontFaces()+'body,button,input,select,textarea{font-family:"'+String(E.font.family).replace(/["\\]/g,'')+'",system-ui,sans-serif!important}'+css}
 if(E.appColors!==false&&m.cv&&appUiOf(m.id)==='ri'){const t=palette(),V={d1:t.h1,d2:t.h2,a:t.acc,ad:mixc(t.acc,'#000000',.2),al:mixc(t.acc,'#ffffff',.72),bg:t.bg};css=':root{'+Object.keys(m.cv).map(g=>m.cv[g].map(v=>v+':'+V[g]+'!important').join(';')).join(';')+'}'+css}
 if(!RO)css+='html.pt-edit body *:hover{outline:2px dashed #F5A524;outline-offset:1px;cursor:text}';
 const ist=icoStyle();const icoJs=ist!=='emoji'?'<script>('+appIco.toString()+')('+JSON.stringify(ICONS).replace(/</g,'\\u003c')+','+JSON.stringify(EMOMAP)+','+JSON.stringify(ist)+')<'+'/script>':'';if(icoJs)css+='.ptico{width:1em;height:1em;display:inline-block;vertical-align:-.15em;stroke-width:1.6}.ptico-epais{stroke-width:2.3}.ptico-rond{background:color-mix(in srgb,currentColor 14%,transparent);border-radius:50%;padding:.15em;width:1.3em;height:1.3em}';
 const _x=appExtra(m,h);const inj=seed+rep+icoJs+'<style id="portail-forms">'+css+_x.css+'</style>'+_x.js;
 h=/<head[^>]*>/i.test(h)?h.replace(/<head[^>]*>/i,x=>x+inj):inj+h;
 const f=$('#appFrame');if(!f)return;f.onload=()=>{f.classList.remove('hide');const l=$('#appLoad');if(l)l.remove()};f.srcdoc=h},30)}
function appRep(R){var W=new WeakMap();window.__appRep=R;
 function tx(n){var rec=W.get(n),cur=n.nodeValue,o=(rec&&cur===rec.v)?rec.o:cur,k=o.trim();if(!k)return;var v=R[k]!=null?o.replace(k,R[k]):o;if(v!==o||rec)W.set(n,{o:o,v:v});if(cur!==v)n.nodeValue=v}
 function walk(r){if(!r)return;if(r.nodeType===3){tx(r);return}if(r.nodeType!==1)return;var w=document.createTreeWalker(r,4),n;while(n=w.nextNode())tx(n)}
 window.__appOrigOf=function(n){var r=W.get(n);return(r&&n.nodeValue===r.v?r.o:n.nodeValue)};window.__appRefresh=function(){walk(document.body)};
 new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='characterData')tx(m.target);else m.addedNodes.forEach(walk)})}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
 document.addEventListener('DOMContentLoaded',function(){walk(document.body)})}
function appIco(I,M,st){var rx=/(\p{Extended_Pictographic})(️)?(?:\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}️?(?:\p{Emoji_Modifier})?)*/gu;
 function sprite(){if(document.getElementById('ptIco'))return;var d=document.createElement('div');d.id='ptIco';d.style.display='none';d.innerHTML='<svg xmlns="http://www.w3.org/2000/svg">'+Object.keys(I).map(function(k){return '<symbol id="pti-'+k+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'+I[k]+'</symbol>'}).join('')+'</svg>';document.body.appendChild(d)}
 function run(root){if(!root||!document.body)return;sprite();var w=document.createTreeWalker(root,4,{acceptNode:function(n){var p=n.parentElement;if(!p||p.closest('script,style,textarea,input,select,svg,option'))return 2;rx.lastIndex=0;return rx.test(n.nodeValue)?1:2}}),L=[],n;while(n=w.nextNode())L.push(n);
  L.forEach(function(t){rx.lastIndex=0;var v=t.nodeValue,h='',last=0,ch=false,m;while(m=rx.exec(v)){var k=M[m[1]];if(!k)continue;h+=v.slice(last,m.index).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+'<svg class="ptico ptico-'+st+'" viewBox="0 0 24 24"><use href="#pti-'+k+'"/></svg>';last=m.index+m[0].length;ch=true}
   if(!ch)return;h+=v.slice(last).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]});var sp=document.createElement('span');sp.innerHTML=h;t.replaceWith(sp)})}
 var q=false;new MutationObserver(function(){if(q)return;q=true;requestAnimationFrame(function(){q=false;run(document.body)})}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
 document.addEventListener('DOMContentLoaded',function(){run(document.body)})}
function closeApp(){const f=$('#appFrame');if(f)f.removeAttribute('srcdoc')}

/* ======================= PROGRAMME D'ÉTUDE ======================= */
B('programme.choose','Choix du programme',()=>{const PR=PROGS(),cur=progId();return `<div class="secT">${T('programme.choose','Choisis ton programme')}<span class="ln"></span></div><div class="choices">${Object.keys(PR).map(k=>`<button class="choice sf ${k===cur?'on':''}" onclick="setProg('${k}')"><span class="ce">${PR[k].e}</span><span style="flex:1"><b style="font-size:calc(20px*var(--gts,1)*var(--ts,1))">${esc(PR[k].n)}</b><small>${esc(PR[k].d)}</small></span>${k===cur?'<span class="pill o">'+esc(Tx('programme.mine','mon choix'))+'</span>':(k==='6m'?'<span class="pill">'+esc(Tx('programme.std','standard'))+'</span>':'')}</button>`).join('')}</div><div style="height:14px"></div>`});
function setProg(k){if(S.prog===k)return;if(S.prog&&!setProg.__ok){askRI(Tx('programme.confirm','Changer de programme ? Ta progression reste enregistrée.'),function(){setProg.__ok=1;try{setProg(k)}finally{setProg.__ok=0}});return}S.prog=k;save();toast(Tx('toast.prog','Programme « {n} » choisi ✅',{n:PROGS()[k].n}));render()}
function weekUnits(w,mid){const L=plan().filter(x=>Math.floor(x.d/7)+1===w&&(!mid||x.mid===mid));const learn=L.filter(x=>x.ty==='learn');const src=learn.length?learn:L;const u=[],k=new Set();src.forEach(x=>{const kk=x.mid+'|'+x.c;if(!k.has(kk)){k.add(kk);u.push({mid:x.mid,c:x.c})}});return{u,learn:learn.length>0}}
function weekQuizIds(w,mid,n){const {u}=weekUnits(w,mid);if(!u.length)return[];const per=Math.max(3,Math.ceil((n||30)/u.length));let ids=[];u.forEach(x=>{ids=ids.concat(shuffle((QBM[x.mid]||[]).filter(q=>q.c===x.c&&q.t!=='open').map(q=>q.id)).slice(0,per))});return shuffle(ids).slice(0,Math.max(n||30,u.length*2))}
function weekCardIds(w,mid){const {u}=weekUnits(w,mid);let ids=[];u.forEach(x=>{ids=ids.concat(cardsOf(x.mid).filter(c=>c.c===x.c).map(c=>c.id))});return ids}
function startWeek(w,kind,mid){const lab=Tx('week.lbl','Semaine {w}',{w});if(kind==='q'){const ids=weekQuizIds(w,mid,30);if(!ids.length){toast(Tx('toast.noq','Aucune question ici'));return}startQuiz(mid||'',ids,Tx('week.quiz','Quiz de la semaine {w}',{w}),'week',null,w)}else{const ids=weekCardIds(w,mid);startFlash(mid||'',ids,Tx('week.flash','Flashcards de la semaine {w}',{w}))}}
B('programme.week','Quiz & flashcards de la semaine',()=>{const P=PROGS()[progId()],cw=Math.min(P.w,Math.max(1,Math.floor(Math.max(0,todayIdx())/7)+1));const row=w=>{const {u,learn}=weekUnits(w);if(!u.length)return'';const nq=weekQuizIds(w,'',30).length,nc=weekCardIds(w).length,sc=(S.wq||{})[w];
  return `<div class="wkq ${w===cw?'cur':''}"><div class="wh"><b>${esc(Tx('week.lbl','Semaine {w}',{w}))}</b>${w===cw?' <span class="pill o">'+esc(Tx('heures.now','cette semaine'))+'</span>':''}${sc!=null?' <span class="pill">'+esc(Tx('week.best','meilleure note {s}/20',{s:sc}))+'</span>':''}<small>${esc(learn?Tx('week.learn','{n} chapitre(s) appris',{n:u.length}):Tx('week.rev','{n} chapitre(s) révisé(s)',{n:u.length}))} : ${esc(u.slice(0,4).map(x=>matOf(x.mid).short+' ch.'+(x.c+1)).join(', '))}${u.length>4?'…':''}</small></div><div class="row2"><button class="btn coral" onclick="startWeek(${w},'q')">📝 ${esc(Tx('week.q','Quiz ({n})',{n:nq}))}</button><button class="btn light" onclick="startWeek(${w},'f')">🃏 ${esc(Tx('week.f','Flashcards ({n})',{n:nc}))}</button></div></div>`};
 const past=[];for(let w=cw-1;w>=1;w--)past.push(w);
 return `<div class="card sf"><h3>${T('week.h','🗓️ Quiz & flashcards de la semaine')}</h3><div class="muted small">${T('week.help','Chaque semaine du programme a son quiz et ses flashcards, sur les chapitres prévus cette semaine-là.')}</div>${row(cw)||`<div class="empty">${T('week.none','Rien de prévu cette semaine.')}</div>`}${row(cw+1)?`<div class="muted small" style="margin-top:8px">${T('week.next','Semaine suivante')}</div>`+row(cw+1):''}${past.length?`<details class="dl"><summary>${T('week.past','Semaines précédentes ({n})',{n:past.length})}</summary>${past.map(row).join('')}</details>`:''}</div>`});
B('programme.me','Ma semaine',()=>{const {P,i,ph,w,over}=phaseNow(),st=planStats();
 const acts=[[[Tx('prog.a1a','📋 Lire les résumés de cours'),"tab('matieres')"],[Tx('prog.a1b','✍️ Faire un sujet de 50 questions'),"tab('matieres')"],[Tx('prog.a1c','📌 Voir mes notions oubliées'),"go('diff',{id:''})"]],[[Tx('prog.a2a','🎯 Travailler mes points faibles'),"startDiff('')"],[Tx('prog.a2b','✍️ Continuer les sujets'),"tab('matieres')"]],[[Tx('prog.a3a','⏱️ Sujets en mode chronométré'),"S.timed=true;save();tab('matieres')"],[Tx('prog.a3b','📈 Suivre mes résultats'),"tab('stats')"]],[[Tx('prog.a4a','📌 Vider ma liste de notions difficiles'),"startDiff('')"],[Tx('prog.a4b','🏆 Refaire les sujets en chronométré'),"S.timed=true;save();tab('matieres')"]]][i];
 return `<div class="card sf"><div class="step"><div class="n" style="background:${ph.c}">${i+1}</div><div class="tx"><small class="muted">${T('programme.me.lbl','{prog} · semaine {w} sur {tw}',{prog:esc(P.n),w:Math.min(w,P.w),tw:P.w})}</small><b>${esc(ph.n)} — ${esc(ph.o)}</b></div></div>
 ${over?`<div class="fb good" style="margin-top:12px">${T('programme.over','🎉 Programme terminé ! Continue en mode Projet ou choisis un autre programme.')}</div>`:''}
 <div class="kpis" style="margin-top:12px"><div class="kpi sf"><b>${st.thisWeek}/${st.target}</b><span>${T('programme.k1','sujets cette semaine')}</span></div><div class="kpi sf"><b>${st.uniq}/${st.tot}</b><span>${T('programme.k2','sujets faits au moins une fois')}</span></div></div>
 <div class="bar" style="margin:10px 0 4px"><i style="width:${Math.min(100,st.thisWeek/st.target*100)}%"></i></div>
 <div style="margin-top:12px">${acts.map(a=>`<button class="btn light" style="justify-content:flex-start" onclick="${a[1]}">${esc(a[0])}</button>`).join('')}</div>
 <div class="small muted">${T('programme.start','Début de ma révision :')}</div><input type="date" class="tin" id="pStart" value="${esc(S.start||today())}"></div>`},{after:r=>{const e=$('#pStart',r);if(e)e.onchange=()=>{S.start=e.value;save();render()}}});
B('programme.gen','Généralité & méthode',()=>`<div class="gen"><div class="box sf" style="--bx:#FDECEE"><h4>${T('prog.g.h','Généralité')}</h4><ul><li>${T('prog.g.1','Se fixer un objectif général')}</li><li>${T('prog.g.2','Objectif : être au top en stage')}</li><li>${T('prog.g.3','Avoir le meilleur score au National')}</li></ul></div>
 <div class="box sf" style="--bx:#EAF7EC"><h4>${T('prog.n.h','Notions du cours')}</h4><ul><li>${T('prog.n.1','Identifier les notions oubliées')}</li><li>${T('prog.n.2','Suivre le programme choisi')}</li><li>${T('prog.n.3','Faire chaque sujet au moins une fois')}</li></ul></div>
 <div class="box sf" style="--bx:#E7F1FC"><h4>${T('prog.p.h','La méthode')}</h4><ul><li>${T('prog.p.1','Se concentrer sur les points faibles et l’essentiel')}</li><li>${T('prog.p.2','Résumés complets + Q&A')}</li></ul></div></div><div style="height:14px"></div>`);
B('programme.table','Les 4 étapes du programme',()=>{const {P,i:cur}=phaseNow();return `<div class="secT">${T('programme.table','Étapes · Objectifs · Période')}<span class="ln"></span></div><div class="muted small" style="margin:-6px 0 10px">${esc(P.e+' '+P.n)}</div><div class="ptab">${P.ph.map((p,n)=>`<div class="pst sf ${n===cur?'cur':''}" style="--pc:${p.c}"><div class="h"><b style="color:${p.c}">${n+1}. ${esc(p.n)}</b><span class="per">${esc(Tx('programme.weeks','Semaines {a} à {b}',{a:p.f,b:p.t}))}</span></div><div class="ob">🎯 ${esc(p.o)}</div><ul>${p.det.map(d=>`<li>${esc(d)}</li>`).join('')}</ul></div>`).join('')}</div>`});

/* ======================= STATISTIQUES ======================= */
B('stats.kpis','Chiffres clés',()=>{const ans=Object.values(S.qs);const n=ans.length,ok=ans.filter(a=>a.l).length;const ex=S.exams;const best=ex.length?Math.max(...ex.map(e=>e.sc)):0;
 return `<div class="kpis"><div class="kpi sf"><b>${n}</b><span>${T('stats.k1','questions travaillées')}</span></div><div class="kpi sf"><b>${n?Math.round(ok/n*100):0}%</b><span>${T('stats.k2','de réussite')}</span></div><div class="kpi sf"><b>${ex.length}</b><span>${T('stats.k3','examens passés')}</span></div><div class="kpi sf"><b>${best}/20</b><span>${T('stats.k4','meilleure note')}</span></div><div class="kpi sf"><b>${S.xp}</b><span>${T('stats.k5','XP gagnés')}</span></div><div class="kpi sf"><b>${diffIds('').length}</b><span>${T('stats.k6','notions à revoir')}</span></div></div><div style="height:14px"></div>`});
B('stats.mat','Maîtrise par matière',()=>`<div class="card sf"><h3>${T('stats.mat','Maîtrise par matière')}</h3>${myMats().map(m=>{const st=mStat(m.id);return `<div class="sbar" onclick="openMat('${jsq(m.id)}')" style="cursor:pointer"><span class="nmx">${esc(m.emo+' '+m.short)}</span><span class="tr"><i style="width:${st.pct}%;background:${esc(m.col)}"></i></span><span class="pc">${st.pct}%</span></div>`}).join('')}</div>`);
B('stats.exams','Historique des examens',()=>S.exams.length?`<div class="card sf"><h3>${T('stats.exams','📝 Mes examens')}</h3>${S.exams.slice(-10).reverse().map(e=>`<div class="sbar"><span class="nmx">${esc(matOf(e.mid).short)} · ${esc(e.d)}</span><span class="tr"><i style="width:${e.sc*5}%;background:${e.sc>=10?'var(--green)':'var(--red)'}"></i></span><span class="pc">${e.sc}</span></div>`).join('')}</div>`:'');

/* ======================= PROFIL ======================= */
B('profile.identity','Identité & avatar',()=>`<div class="card sf"><h3>${T('profile.me','Mon profil')}</h3><input class="tin" id="pName" value="${esc(S.name)}" placeholder="${esc(Tx('welcome.ph','Ton prénom et ton nom'))}"><div class="avgrid">${AVATARS.map(a=>`<button class="${S.avatar===a?'on':''}" data-av="${a}">${a}</button>`).join('')}</div><button class="btn coral" id="pSave">${T('profile.save','Enregistrer')}</button></div>`,{after:r=>{$$('[data-av]',r).forEach(b=>b.onclick=()=>{S.avatar=b.dataset.av;save();render()});const s=$('#pSave',r);if(s)s.onclick=()=>{S.name=$('#pName',r).value.trim()||S.name;save();toast(Tx('toast.profile','Profil enregistré ✅'));render()}}});
B('profile.cursus','Filière, année & cahier des cours',()=>`<div class="card sf"><h3>${T('profile.cursus','🎓 Mon cursus')}</h3><div class="pills" style="margin-bottom:12px"><span class="pill">${esc(S.fil||'—')}</span><span class="pill o">${esc(S.niv||'—')}</span><span class="pill">${T('profile.extra','+{n} cours ajouté(s)',{n:S.extra.length})}</span></div>
 <label class="timed"><input type="checkbox" ${S.prevCh!==false?'checked':''} onchange="S.prevCh=this.checked;save();recalc();render()"> ${T('profile.prevch','Voir aussi les chapitres des années précédentes')}</label><button class="btn light" onclick="go('filiere')">${T('profile.change','✏️ Changer de filière / d’année')}</button><button class="btn light" onclick="{CAHIER=S.extra.slice();go('autres')}">${T('profile.cahier','📒 Mon cahier des cours')}</button></div>`);
B('profile.colors','Couleurs (étudiant)',()=>{const P=PALETTES();return `<div class="card sf"><h3>${T('profile.colors','🎨 Couleurs de l’application')}</h3><div class="thg">${P.map((c,i)=>`<button class="thb ${S.theme&&S.theme.pal===i?'on':''}" data-th="${i}"><span class="sw" style="background:linear-gradient(135deg,${c.w?'#ffffff':c.h1} 0 50%,${c.acc} 50% 75%,${c.acc2} 75%);border:1px solid #ddd"></span>${esc(c.n)}</button>`).join('')}</div><button class="btn light" id="pDef">${T('profile.c.default','Palette par défaut de l’appli')}</button>
 <div class="lbl3">${T('profile.icons','Style des icônes')}</div><div class="icsel">${[['emoji',Tx('ic.emoji','Emoji couleur')],['fin',Tx('ic.fin','Traits fins')],['epais',Tx('ic.epais','Traits épais')],['rond',Tx('ic.rond','Pastilles')]].map(o=>`<button class="${icoStyle()===o[0]?'on':''}" onclick="S.icons='${o[0]}';save();buildNav();render()"><span class="icp">${o[0]==='emoji'?'🏠 📁 🕒':`<svg class="ico ico-${o[0]}" viewBox="0 0 24 24"><use href="#i-home"/></svg><svg class="ico ico-${o[0]}" viewBox="0 0 24 24"><use href="#i-folder"/></svg><svg class="ico ico-${o[0]}" viewBox="0 0 24 24"><use href="#i-clock"/></svg>`}</span>${esc(o[1])}</button>`).join('')}</div></div>`},{after:r=>{$$('[data-th]',r).forEach(b=>b.onclick=()=>{S.theme={pal:+b.dataset.th};save();applyLook();render()});const d=$('#pDef',r);if(d)d.onclick=()=>{S.theme=null;save();applyLook();render()}}});
B('profile.data','Mes données',()=>`<div class="card sf"><h3>${T('profile.data','💾 Mes données')}</h3><div class="small muted" style="margin-bottom:10px">${T('profile.data.help','Ta progression est enregistrée sur cet appareil. Exporte-la pour la transférer sur un autre téléphone.')}</div>
 <button class="btn" onclick="if(!EDITMODE)exportData()">${T('profile.export','⬇️ Exporter ma progression')}</button><button class="btn light" onclick="if(!EDITMODE)$('#imp').click()">${T('profile.import','⬆️ Importer une progression')}</button>
 <button class="btn ghost" onclick="if(!EDITMODE)askRI('${jsq(Tx('profile.reset.confirm','Effacer toute ta progression ?'))}',function(){localStorage.removeItem(SKEY);S=load();applyLook();tab('home')})">${T('profile.reset','🗑️ Réinitialiser')}</button></div>`);
function download(name,text,type){const b=new Blob([text],{type:type||'application/octet-stream'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
function exportData(){download(APPID+'-progression-'+today()+'.json',JSON.stringify(S),'application/json')}

/* ======================= APPARENCE « SAMSUNG » (One UI) PAR RUBRIQUE =======================
   Chaque rubrique peut s'afficher en « Classique » (d'origine) ou « Samsung » :
   b.ui ('c' | 's') sur le bloc, sinon E.ui (réglage global), sinon classique.
   Les rubriques qui ont une version dédiée (BLK[id].oneui) l'utilisent ; les autres reçoivent l'habillage Samsung. */
function uiOf(b){return(b&&b.ui)||E.ui||'c'}
function ouIc(inner,cls,st){return `<span class="ou-ic${cls?' '+cls:''}"${st?` style="${st}"`:''}>${inner}</span>`}
function ouPill(ic,title,sub,act,on){return `<button class="ou-pill" onclick="${act}">${ouIc(ic,on?'on':'')}<span class="ou-tx"><b>${title}</b><small>${sub}</small></span></button>`}
function ouSlider(pct,ic,label,btn,cap){const p=Math.max(0,Math.min(100,pct||0)),lab=`<span class="ou-li">${ic}</span><span>${label}</span>`;return `<div class="ou-card ou-sl">${cap?`<div class="ou-cap">${cap}</div>`:''}<div class="ou-row"><div class="ou-track"><span class="ou-lab">${lab}</span><i class="ou-fill" style="width:${p}%"><span class="ou-lab dk" style="width:${p>0?Math.round(1e6/p)/100:1e4}%">${lab}</span></i></div>${btn||''}</div></div>`}
function ouMatTile(m){const st=mStat(m.id);return `<button class="ou-tile" onclick="openMat('${jsq(m.id)}')" title="${esc(m.title)}">${ouIc(esc(m.emo),'m','--mc:'+esc(m.col))}<span class="l">${esc(m.short)}</span><small>${st.pct} %</small></button>`}
function ouHead(t,r){return `<div class="ou-head"><b>${t}</b>${r?`<small>${r}</small>`:''}</div>`}
function dueAll(){let n=0;const now=Date.now();myMats().forEach(m=>{try{cardsOf(m.id).forEach(c=>{if(S.lt[c.id]&&S.lt[c.id].due<=now)n++})}catch(e){}});return n}
function ouFlashAct(){const lm=S.lastMat&&MATI[S.lastMat]?S.lastMat:'';return lm?`startFlash('${jsq(lm)}',dueDeck('${jsq(lm)}'),'${jsq(Tx('oui.flash.t','Flashcards'))}')`:`tab('matieres')`}

/* --- versions Samsung dédiées --- */
BLK['home.hello'].oneui=()=>{const L=level();let d='';try{d=new Date().toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})}catch(e){}
 return `<div class="ou-hello"><button class="ou-ava" onclick="profileModal()" aria-label="${esc(Tx('home.editme','Modifier mon nom et mon avatar'))}">${S.avatar}</button><div class="ou-hi"><b>${T('oui.hello','Bonjour {name}',{name:esc(S.name||Tx('home.anon','futur(e) soignant(e)'))})}</b><span>${esc(d)}${S.fil?' · '+esc(S.fil):''}${S.niv?' · '+esc(S.niv):''}</span></div></div>`
 +ouSlider(L.pct,'⭐',T('oui.level','Niv. {n} · {lname} · {xp} XP',{n:L.n,lname:esc(L.name),xp:S.xp}),`<button class="ou-ic on ou-fire" onclick="tab('stats')" aria-label="${esc(Tx('oui.streak.a','Série de jours'))}"><span>🔥</span><small>${T('oui.streak','{n} j',{n:S.streak.count})}</small></button>`)};
BLK['home.resume'].oneui=()=>{const c=S.cur,ok=c&&c.ids&&c.idx<c.ids.length,n=dueAll();
 return `<div class="ou-pills">${ok?ouPill('▶',T('oui.resume','Reprendre'),esc(matOf(c.mid).short)+' · '+c.idx+'/'+c.ids.length,'resumeQuiz()',1):ouPill('▶',T('oui.start','Faire un quiz'),T('oui.start.s','Choisir une matière'),"tab('matieres')",0)}${ouPill('🗂️',T('oui.flash','Flashcards'),T('oui.flash.s','{n} à revoir',{n}),ouFlashAct(),n>0)}</div>`};
BLK['home.step'].oneui=()=>{const {P,i,ph,w}=phaseNow(),st=planStats();
 return ouSlider(st.thisWeek/st.target*100,'📅',T('oui.week','Semaine {w} : {d} / {t} sujet(s)',{w:Math.min(w,P.w),d:st.thisWeek,t:st.target}),`<button class="ou-ic ou-num" style="background:${esc(ph.c)}" onclick="tab('programme')" aria-label="${esc(Tx('oui.prog.a','Mon programme'))}">${i+1}</button>`,esc(P.n)+' · '+esc(ph.n)+' — '+esc(ph.o))};
BLK['home.mat'].oneui=()=>{const mine=new Set(myMats().map(m=>m.id));const G=groups().map(g=>({g,ids:[].concat(...g.subs.map(s=>s.mats)).filter(id=>mine.has(id))})).filter(x=>x.ids.length);
 return `<div class="secT">${T('home.mat','Matières')}<span class="ln"></span></div>`+G.map(({g,ids})=>`<div class="ou-card grpc" style="--gcol:${esc(g.col||'#17594C')}">${ouHead(esc((g.e||'📁')+' '+g.n),ids.length+' '+esc(Tx('grp.n','cours')))}<div class="ou-grid">${ids.map(id=>ouMatTile(MATI[id])).join('')}</div></div>`).join('')
 +(otherMats().length?`<button class="ou-pill ou-wide" onclick="CAHIER=S.extra.slice();go('autres')">${ouIc('➕')}<span class="ou-tx"><b>${T('oui.more','Autres cours')}</b><small>${T('oui.more.s','Cahier des cours')}</small></span></button>`:'')};
BLK['home.fav'].oneui=()=>{const L=myMats().filter(m=>S.fav[m.id]);return `<div class="ou-card">${ouHead(T('oui.fav','⭐ Mes favoris'),L.length?String(L.length):'')}${L.length?`<div class="ou-grid">${L.map(ouMatTile).join('')}</div>`:`<div class="ou-empty">${T('home.fav.empty','Touche ☆ dans une matière pour l’ajouter ici.')}</div>`}</div>`};
BLK['home.diff'].oneui=()=>{const L=myMats().map(m=>({m,n:diffIds(m.id).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n);const tot=L.reduce((a,x)=>a+x.n,0);
 if(!L.length)return `<div class="ou-card">${ouHead(T('oui.diff','📌 Notions à revoir'))}<div class="ou-empty">${T('home.diff.empty','Les questions ratées et celles marquées 📌 apparaîtront ici.')}</div></div>`;
 return `<div class="ou-card">${ouHead(T('oui.diff','📌 Notions à revoir'),T('oui.diff.n','{n} au total',{n:tot}))}<div class="ou-seg">${L.slice(0,3).map(x=>`<button onclick="go('diff',{id:'${jsq(x.m.id)}'})"><span class="t">${esc(x.m.emo+' '+x.m.short)}</span><span class="v">${x.n}</span><small>${esc(Tx('oui.diff.u','notion(s)'))}</small></button>`).join('')}</div><button class="ou-btn" onclick="startDiff('')">${T('home.diff.all','🔁 Tout revoir ({n})',{n:tot})}</button></div>`};

/* --- nouvelle rubrique : raccourcis façon panneau rapide (masquée par défaut, à afficher dans l'éditeur) --- */
B('home.tiles','Raccourcis rapides (style Samsung)',()=>{const c=S.cur,ok=c&&c.ids&&c.idx<c.ids.length,n=dueAll(),nd=myMats().reduce((s,m)=>s+diffIds(m.id).length,0),lm=S.lastMat&&MATI[S.lastMat]?MATI[S.lastMat]:null;
 const T8=[
  [ok?'resumeQuiz()':"tab('matieres')",'▶',ok?Tx('oui.t.resume','Reprendre'):Tx('oui.t.quiz','Quiz'),ok],
  [ouFlashAct(),'🗂️',Tx('oui.t.flash','Flashcards'),n>0,n],
  [nd?"startDiff('')":"toast('"+jsq(Tx('oui.t.nodiff','Aucune notion à revoir 👏'))+"')",'📌',Tx('oui.t.diff','À revoir'),nd>0,nd],
  ["tab('programme')",'📅',Tx('oui.t.prog','Programme'),0],
  ["tab('matieres')",'📚',Tx('oui.t.mat','Matières'),0],
  [lm?`openMat('${jsq(lm.id)}')`:"tab('matieres')",lm?esc(lm.emo):'📖',lm?esc(lm.short):Tx('oui.t.last','Dernier cours'),0],
  ["tab('stats')",'📈',Tx('oui.t.stats','Stats'),0],
  ["tab('profile')",'👤',Tx('oui.t.prof','Profil'),0]];
 return `<div class="ou-card">${ouHead(T('oui.tiles','Raccourcis'))}<div class="ou-grid">${T8.map(([a,ic,l,on,badge])=>`<button class="ou-tile" onclick="${a}">${ouIc(ic+(badge?`<em class="ou-badge">${badge>99?'99+':badge}</em>`:''),on?'on':'')}<span class="l">${esc(l)}</span></button>`).join('')}</div><div class="ou-handle"></div></div>`},{opt:1});
SCREENS.home.blocks.splice(1,0,'home.tiles');

/* --- réglages Samsung : formes, tailles, colonnes, couleurs (E.oui global, b.ou par rubrique) --- */
const OU_SHAPES={cercle:{x:1,y:1,r:'50%'},squircle:{x:1,y:1,r:'32%'},pilule:{x:1.45,y:.8,r:'999px'},rect:{x:1.45,y:.8,r:'14px'},carre:{x:1,y:1,r:'14px'},goutte:{x:1,y:1,r:'50% 50% 50% 14%'}};
const OU_SIZES={petit:.8,moyen:1,grand:1.2};
const OU_CARDS={pilule:'40px',tres:'32px',doux:'22px',carre:'10px'};
function ouConf(b){return Object.assign({},E.oui||{},(b&&b.ou)||{})}
function ouVarsOf(o){let s='';const sh=OU_SHAPES[o.shape];if(sh)s+='--oicX:'+sh.x+';--oicY:'+sh.y+';--oicR:'+sh.r+';';
 if(OU_SIZES[o.size])s+='--oicK:'+OU_SIZES[o.size]+';';if(o.cols)s+='--ocols:'+(+o.cols)+';';if(OU_CARDS[o.card])s+='--ocR:'+OU_CARDS[o.card]+';';
 const ink=c=>lum(c)>.55?'#10241F':'#FFFFFF',ok=c=>/^#[0-9a-f]{3,8}$/i.test(c||'');
 if(ok(o.bg)){const k=ink(o.bg);s+='--oc:'+o.bg+';--oink:'+k+';--otr:'+mixc(o.bg,k==='#FFFFFF'?'#ffffff':'#000000',.16)+';'}
 if(ok(o.btn))s+='--ocirc:'+o.btn+';--ocircink:'+ink(o.btn)+';';
 if(ok(o.on))s+='--oon:'+o.on+';--ooni:'+ink(o.on)+';';
 if(ok(o.fill))s+='--ofill:'+o.fill+';--ofilli:'+ink(o.fill)+';';
 return s}
function ouVars(b){return ouVarsOf(ouConf(b))}

/* ======================= PLUS : grades & ceintures, sujets D.E, musique, communauté, recherche, rappels, confort de lecture =======================
   Créé par Daniel Noufe · INFAS */

/* ---------- 1. GRADES : ceintures de karaté + grades militaires, de la L1 au D.E ---------- */
const RANKS=[
 {b:'blanche',g:'Soldat de 2e classe',c:'#F4F4F4',y:'L1'},{b:'jaune',g:'Soldat de 1re classe',c:'#F2C94C',y:'L1'},{b:'orange',g:'Caporal',c:'#F2994A',y:'L1'},{b:'verte',g:'Caporal-chef',c:'#27AE60',y:'L1'},
 {b:'bleue',g:'Sergent',c:'#2F80ED',y:'L2'},{b:'violette',g:'Sergent-chef',c:'#9B51E0',y:'L2'},{b:'marron',g:'Adjudant',c:'#8B5A2B',y:'L2'},
 {b:'marron · 1 barrette',g:'Adjudant-chef',c:'#7A4A22',y:'L3'},{b:'marron · 2 barrettes',g:'Major',c:'#6B3F1D',y:'L3'},{b:'marron · 3 barrettes',g:'Aspirant',c:'#5C3517',y:'L3'},
 {b:'noire · 1er dan',g:'Sous-lieutenant',c:'#111111',y:'DE'},{b:'noire · 2e dan',g:'Lieutenant',c:'#111111',y:'DE'},{b:'noire · 3e dan',g:'Capitaine',c:'#111111',y:'DE'},{b:'noire · 4e dan',g:'Commandant',c:'#111111',y:'DE'},
 {b:'noire · 5e dan',g:'Lieutenant-colonel',c:'#111111',y:'DE'},{b:'noire · 6e dan',g:'Colonel',c:'#111111',y:'DE'},{b:'noire · 7e dan',g:'Général',c:'#111111',y:'DE'}];
const RK_SEG=[['L1',0,3],['L2',4,6],['L3',7,9],['DE',10,16]];
const DAN_XP=2000;
function yearIdx(){const i=nivIdx(S.niv);return i<0?0:Math.min(i,2)}
function preCap(){return[3,6,9][yearIdx()]}
/* maîtrise = questions réussies + flashcards bien retenues, sur TOUS les cours de l'étudiant (s'adapte aux cours ajoutés) */
function masteryOf(ids){let P=0,T=0;ids.forEach(mid=>{const qs=QBM[mid]||[];T+=qs.length;qs.forEach(q=>{const s=S.qs[q.id];if(s&&s.l)P++});let L=[];try{L=cardsOf(mid)}catch(e){}T+=L.length*.5;L.forEach(c=>{const s=S.lt[c.id];if(s&&(s.b||0)>=3)P+=.5})});return{P,T,r:T?P/T:0}}
function rankNow(){const M=masteryOf(myMats().map(m=>m.id));let cap=preCap(),i,pct;
 const x=M.r*(cap+1);i=Math.min(cap,Math.floor(x+1e-9));pct=i>=cap?100:(x-i)*100;
 /* 3e année : une fois Aspirant, les ceintures noires se gagnent à l'entraînement (un dan tous les DAN_XP XP) */
 if(yearIdx()===2&&i>=9){if(S.bbXp==null){S.bbXp=S.xp;save()}const ex=Math.max(0,S.xp-S.bbXp),d=Math.floor(ex/DAN_XP);i=Math.min(RANKS.length-1,9+d);pct=i>=RANKS.length-1?100:(ex%DAN_XP)/DAN_XP*100;cap=RANKS.length-1}
 return{i,pct,cap,R:RANKS[i],M}}
function rankName(R){return Tx('rank.belt','Ceinture {b}',{b:R.b})+' · '+R.g}
level=function(){const k=rankNow();return{n:k.i+1,name:rankName(k.R),pct:k.pct}};
mLevel=function(pct){const L=[[0,'⚪','blanche'],[15,'🟡','jaune'],[30,'🟠','orange'],[45,'🟢','verte'],[60,'🔵','bleue'],[72,'🟣','violette'],[84,'🟤','marron'],[95,'⚫','noire']];let r=L[0],i=0;L.forEach((l,k)=>{if(pct>=l[0]){r=l;i=k}});return{e:r[1],n:Tx('belt.course','Ceinture {b}',{b:r[2]}),i:i+1}};
function beltSvg(c,w){w=w||46;const dark=lum(c)<.35;return `<svg class="beltsvg" width="${w}" height="${Math.round(w*.52)}" viewBox="0 0 46 24" aria-hidden="true"><rect x="1" y="8" width="44" height="8" rx="2" fill="${c}" stroke="${dark?'#444':'rgba(0,0,0,.25)'}"/><path d="M19 6h8l3 12-4 4-3-7-3 7-4-4z" fill="${c}" stroke="${dark?'#444':'rgba(0,0,0,.3)'}"/><rect x="20" y="7" width="6" height="10" rx="1.5" fill="${c}" stroke="${dark?'#555':'rgba(0,0,0,.3)'}"/></svg>`}
/* avatars : 8 tirés au hasard au départ, les autres se débloquent grade après grade */
const AV_POOL=['🧑🏾‍⚕️','👩🏾‍⚕️','👨🏾‍⚕️','👩🏿‍⚕️','👨🏿‍⚕️','🧑🏽‍⚕️','👩🏽‍⚕️','👨🏽‍⚕️','👩🏾‍💼','👨🏾‍💼','🙋🏾‍♀️','🙋🏿‍♂️','🤰🏾','🧑🏾','👩🏾','👨🏿','🧕🏾','👩🏿‍🦱'];
const AV_UNLOCK=[[1,'👩🏾‍🎓'],[1,'👨🏿‍🎓'],[2,'👩🏿‍🔬'],[2,'🧑🏾‍🔬'],[3,'👳🏾‍♂️'],[3,'🧕🏿'],[4,'👮🏾‍♀️'],[4,'👮🏿‍♂️'],[5,'💂🏾‍♀️'],[5,'💂🏿‍♂️'],[6,'🦸🏾‍♀️'],[6,'🦸🏿‍♂️'],[7,'👩🏾‍✈️'],[7,'🧑🏿‍✈️'],[8,'👩🏿‍🚀'],[8,'👨🏾‍🚀'],[9,'🧙🏾‍♀️'],[9,'🧙🏿‍♂️'],[10,'🥷🏾'],[10,'🥷🏿'],[11,'👸🏾'],[11,'🤴🏿'],[12,'🧝🏾‍♀️'],[12,'🧝🏿‍♂️'],[13,'🦁'],[14,'🦅'],[15,'🐉'],[16,'👑']];
function availAvatars(){if(!Array.isArray(S.avBase)||!S.avBase.length){S.avBase=shuffle(AV_POOL).slice(0,8);save()}const k=rankNow().i;const L=S.avBase.concat(AV_UNLOCK.filter(a=>a[0]<=k).map(a=>a[1]));if(S.avatar&&!L.includes(S.avatar))L.unshift(S.avatar);return[...new Set(L)]}
function syncAvatars(){try{AVATARS.splice(0,AVATARS.length,...availAvatars())}catch(e){}}
function celebrate(k,old){let o=$('#rkup');if(o)o.remove();o=document.createElement('div');o.id='rkup';o.className='rkup';const nu=AV_UNLOCK.filter(a=>a[0]>old&&a[0]<=k.i).map(a=>a[1]);
 o.innerHTML=`<div class="rkbox"><div class="rkt">${esc(Tx('rank.up','🥋 Nouveau grade !'))}</div>${beltSvg(k.R.c,120)}<div class="rkn">${esc(rankName(k.R))}</div><div class="muted">${esc(k.i>=10?Tx('rank.up.de','Ceinture noire : continue à t’entraîner pour gagner les dans suivants.'):Tx('rank.up.s','Bravo ! Continue comme ça.'))}</div>${nu.length?`<div class="rkav">${esc(Tx('rank.up.av','Nouveaux avatars débloqués :'))}<div>${nu.join(' ')}</div></div>`:''}<button class="btn coral" id="rkOk">${esc(Tx('rank.up.ok','Super !'))}</button></div>`;
 document.body.appendChild(o);o.onclick=e=>{if(e.target===o||e.target.id==='rkOk')o.remove()}}
function rankCheck(){if(!S.onb||EDITMODE)return;const k=rankNow();if(S.rk==null){S.rk=k.i;save();return}if(k.i>S.rk){const old=S.rk;S.rk=k.i;save();celebrate(k,old)}else if(k.i<S.rk){S.rk=k.i;save()}}
function gradeHTML(){const k=rankNow(),yi=yearIdx(),nx=RANKS[k.i+1];
 const st=i=>{if(i<=k.i)return i===k.i?'cur':'ok';const R=RANKS[i];if(R.y==='DE')return'de';if(['L1','L2','L3'].indexOf(R.y)>yi)return'yr';return'nx'};
 const segN={L1:Tx('rank.y1','1re année'),L2:Tx('rank.y2','2e année'),L3:Tx('rank.y3','3e année'),DE:Tx('rank.yde','Ceintures noires — 3e année, à force d’entraînement')};
 const lock={yr:R=>Tx('rank.lock.y','🔒 en {y}',{y:R.y}),de:()=>yi===2?Tx('rank.lock.bb','🔒 entraîne-toi'):Tx('rank.lock.de3','🔒 en L3'),nx:()=>''};
 const mats=myMats();
 return `<div class="card sf grade"><h3>${T('rank.h','🥋 Mon grade')}</h3><div class="grtop">${beltSvg(k.R.c,84)}<div><div class="grn">${esc(rankName(k.R))}</div><div class="muted small">${T('rank.sub','Grade {n} sur {t} · maîtrise de tes cours : {p} %',{n:k.i+1,t:RANKS.length,p:Math.round(k.M.r*100)})}</div></div></div>
 <div class="bar"><i style="width:${Math.round(k.pct)}%"></i></div><div class="muted small">${nx&&k.i<k.cap?T('rank.next','Prochain : {n}',{n:esc(rankName(nx))}):(k.i>=RANKS.length-1?T('rank.max','Grade maximal atteint 👑'):T('rank.capmsg','Grade maximal de ton année : passe à l’année suivante pour débloquer la suite.'))}</div>
 ${k.i>=9&&yi===2?`<div class="maint">${T('de.maint','💪 Ce qu’on ne pratique pas s’oublie : continue tes révisions pour garder ton niveau et gagner un dan tous les {x} XP.',{x:DAN_XP})}</div>`:''}
 <details class="grlad"><summary>${T('rank.all','Voir toutes les ceintures')}</summary>${RK_SEG.map(([y,a,b])=>`<div class="lbl3">${esc(segN[y])}</div>${RANKS.slice(a,b+1).map((R,j)=>{const i=a+j,s=st(i);return `<div class="grli ${s}">${beltSvg(R.c,34)}<span class="tx">${esc(rankName(R))}</span><span class="stt">${s==='ok'?'✓':s==='cur'?'◀':esc((lock[s]||lock.nx)(R))}</span></div>`}).join('')}`).join('')}</details>
 <details class="grlad"><summary>${T('rank.av','Avatars à débloquer')}</summary><div class="avlock">${AV_UNLOCK.map(([i,a])=>`<span class="${i<=k.i?'on':''}" title="${esc(rankName(RANKS[i]))}">${a}<small>${i<=k.i?'✓':'🔒 '+(i+1)}</small></span>`).join('')}</div></details>
 <details class="grlad"><summary>${T('rank.courses','Ma ceinture dans chaque cours')}</summary>${mats.map(m=>{const s=mStat(m.id),lv=mLevel(s.pct);return `<div class="li" onclick="openMat('${jsq(m.id)}')"><span class="em">${lv.e}</span><span class="tx"><b>${esc(m.short)}</b><small>${esc(lv.n)} · ${s.pct} %</small></span><span class="go">›</span></div>`}).join('')}</details></div>`}
B('profile.grade','Mon grade (ceintures & grades)',gradeHTML);
B('stats.grade','Mon grade (statistiques)',gradeHTML);

/* ---------- 2. SUJETS DE PRÉPARATION AU D.E ---------- */
function deKind(m){if(m.de==='blanc'||m.de==='examen')return m.de;if(m.de==='non')return'';const g=groups().find(g=>g.subs.some(s=>s.mats.includes(m.id)));if(g&&/sujet|examen|d\.\s?e\b|blanc/i.test(g.n||''))return/blanc/i.test(g.n)?'blanc':'examen';return''}
function examBlanc(n){n=n||40;const mats=myMats().filter(m=>(QBM[m.id]||[]).some(q=>q.t!=='open'));if(!mats.length){toast(Tx('toast.noq','Aucune question ici'));return}
 const per=Math.max(1,Math.ceil(n/mats.length));let ids=[];shuffle(mats).forEach(m=>{ids=ids.concat(shuffle((QBM[m.id]||[]).filter(q=>q.t!=='open').map(q=>q.id)).slice(0,per))});
 startTimed(mats[0].id,shuffle(ids).slice(0,n),Tx('de.blanc.lbl','Examen blanc D.E (toutes matières)'))}
function deLists(){const L=myMats().map(m=>({m,k:deKind(m)})).filter(x=>x.k);return{bl:L.filter(x=>x.k==='blanc').map(x=>x.m),ex:L.filter(x=>x.k==='examen').map(x=>x.m)}}
function openDE(id){S.lastMat=id;save();VSTACK=[];go('appview',{id})}
B('home.de','Sujets préparation D.E',()=>{const{bl,ex}=deLists();const li=m=>{const s=mStat(m.id);return `<div class="li" onclick="openDE('${jsq(m.id)}')"><span class="em">${esc(m.emo)}</span><span class="tx"><b>${esc(m.title)}</b><small>${s.pct} % · ${(QBM[m.id]||[]).length} ${esc(Tx('de.q','questions'))}</small></span><span class="go">›</span></div>`};
 return `<div class="card sf dec"><h3>${T('de.h','🎓 Sujets préparation D.E')}</h3><div class="muted small">${T('de.sub','Sujets d’examen blanc et d’examen, pour t’entraîner dans les conditions du D.E.')}</div>
 <button class="btn coral" onclick="examBlanc(40)">${T('de.blanc.btn','⏱️ Examen blanc chronométré · 40 questions de tous tes cours')}</button>
 <div class="lbl3">${T('de.bl','📝 Sujets d’examen blanc')}</div>${bl.length?bl.map(li).join(''):`<div class="empty">${T('de.none','Bientôt disponibles.')}</div>`}
 <div class="lbl3">${T('de.ex','🏛️ Sujets d’examen (D.E)')}</div>${ex.length?ex.map(li).join(''):`<div class="empty">${T('de.none2','Bientôt disponibles.')}</div>`}</div>`});
BLK['home.de'].oneui=()=>{const{bl,ex}=deLists();const grid=(L,t)=>`<div class="ou-card">${ouHead(t,L.length?String(L.length):'')}${L.length?`<div class="ou-grid">${L.map(m=>ouMatTile(m).replace("onclick=\"openMat(","onclick=\"openDE(")).join('')}</div>`:`<div class="ou-empty">${T('de.none','Bientôt disponibles.')}</div>`}</div>`;
 return `<div class="secT">${T('de.h','🎓 Sujets préparation D.E')}<span class="ln"></span></div><button class="ou-pill ou-wide" onclick="examBlanc(40)">${ouIc('⏱️','on')}<span class="ou-tx"><b>${T('de.blanc.t','Examen blanc chronométré')}</b><small>${T('de.blanc.s','40 questions de tous tes cours · 40 min')}</small></span></button>`+grid(bl,T('de.bl','📝 Sujets d’examen blanc'))+grid(ex,T('de.ex','🏛️ Sujets d’examen (D.E)'))};

/* ---------- 3. COURS EN MUSIQUE (liens YouTube « musique » de chaque cours) ---------- */
function musicList(){const L=[];myMats().forEach(m=>linksOf(m.id).filter(l=>l.t==='musique').forEach(l=>L.push({m,l})));return L}
function musItem(m,l){const id=ytId(l.url),ch=l.ch!=null&&l.ch!==''?+l.ch:null;return `<a class="ytl" href="${esc(l.url)}" target="_blank" rel="noopener" onclick="return playYt(this.href,'${jsq(l.title||'')}')">${id?`<span class="yth" style="background-image:url(https://img.youtube.com/vi/${id}/mqdefault.jpg)"><i>▶</i></span>`:'<span class="yth"><i>▶</i></span>'}<span class="ytx"><small>🎵 ${ch!=null?esc(Tx('resumes.ch','Ch. {n}',{n:ch+1}))+' · '+esc(chName(m.id,ch)):esc(m.short)}</small><b>${esc(l.title||l.url)}</b></span></a>`}
function musicHTML(ou){const L=musicList();if(!L.length)return EDITMODE?`<div class="card sf"><h3>${T('mus.h','🎵 Cours en musique')}</h3><div class="empty">${esc('Ajoute des liens YouTube de type « Version musicale » : Éditeur → Contenu → Liens YouTube. Ils apparaîtront ici, classés par cours et par chapitre.')}</div></div>`:'';
 const by={};L.forEach(x=>(by[x.m.id]=by[x.m.id]||{m:x.m,a:[]}).a.push(x.l));
 const body=Object.values(by).map(g=>`<div class="lbl3" style="color:${esc(g.m.col)}">${esc(g.m.emo+' '+g.m.short)}</div>`+g.a.sort((a,b)=>(+a.ch||0)-(+b.ch||0)).map(l=>musItem(g.m,l)).join('')).join('');
 return ou?`<div class="ou-card">${ouHead(T('mus.h','🎵 Cours en musique'),String(L.length))}${body}</div>`:`<div class="card sf"><h3>${T('mus.h','🎵 Cours en musique')}</h3>${body}</div>`}
B('home.music','Cours en musique',()=>musicHTML(0));BLK['home.music'].oneui=()=>musicHTML(1);

/* ---------- 4. SERVICE CLIENT & COMMUNAUTÉ (liens saisis dans l'éditeur) ---------- */
const COMMU=[['wa_chan','📢','Intégrer la chaîne WhatsApp','Nouveautés et annonces','#128C7E'],['wa_g1','💬','Intégrer le groupe WhatsApp','Entraide entre étudiants','#25D366'],['wa_g2','💬','Intégrer le 2e groupe WhatsApp','Entraide entre étudiants','#25D366'],['tg','✈️','Intégrer le groupe Telegram','Documents et discussions','#229ED9'],['admin','✉️','Écrire à l’administrateur de l’application','Poser une question, signaler un problème','#E8772E']];
const linkOk=u=>/^(https:\/\/|mailto:|tel:)/i.test(u||'');
function commuHTML(ou,big){const c=(E.content&&E.content.commu)||{};const H=big?T('cm.big','🤝 REJOINS LA COMMUNAUTÉ'):T('cm.h','🤝 Service client & communauté');
 const L=COMMU.filter(x=>x[0]!=='wa_g2'||linkOk(c.wa_g2));
 const soon=Tx('cm.soon','Bientôt disponible');
 const btns=L.map(([k,e,n,s,col])=>linkOk(c[k])?`<a class="cmb" href="${esc(c[k])}" ${/^https/i.test(c[k])?'target="_blank" rel="noopener"':''} style="--cc:${col}"><span class="ce">${e}</span><span class="ct"><b>${esc(c[k+'_n']||n)}</b><small>${esc(s)}</small></span><span class="go">›</span></a>`
  :`<button class="cmb cmsoon" style="--cc:${col}" onclick="toast('${jsq(soon+' ⏳')}')"><span class="ce">${e}</span><span class="ct"><b>${esc(n)}</b><small>⏳ ${esc(soon)}</small></span></button>`).join('');
 const note=c.note?`<div class="muted small" style="margin-top:6px">${esc(c.note)}</div>`:'';
 return ou?`<div class="ou-card cmcard">${ouHead(H)}${btns}${note}</div>`:`<div class="card sf cmcard${big?' cmbig':''}"><h3>${H}</h3>${btns}${note}</div>`}
B('profile.commu','Service client & communauté',()=>commuHTML(0));BLK['profile.commu'].oneui=()=>commuHTML(1);
B('home.commu','Rejoins la communauté (bas de l’accueil)',()=>commuHTML(0,1));BLK['home.commu'].oneui=()=>commuHTML(1,1);

/* ---------- 4 bis. PROPOSITION D'INSTALLER L'APPLICATION (ouverture depuis le lien dans le navigateur) ---------- */
let BIP=null;
const isStandalone=()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}catch(e){return false}};
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();BIP=e;setTimeout(()=>instAsk(),2500)});
window.addEventListener('appinstalled',()=>{try{S.installed=1;save()}catch(e){}const d=$('#instAsk');if(d)d.remove();toast(Tx('in.ok','📲 Application installée : retrouve-la sur ton écran d’accueil'),4000)});
function instDo(){if(BIP){const p=BIP;BIP=null;p.prompt();p.userChoice.then(c=>{if(c&&c.outcome!=='accepted'){S.instAsk=Date.now();save()}}).catch(()=>{})}else if(isIOS())instAsk(true)}
function instAsk(force){try{if(isStandalone()||!/^https?:$/.test(location.protocol)||EDITMODE)return;if(!BIP&&!isIOS())return;if(!force&&S.instAsk&&Date.now()-S.instAsk<2*864e5)return;
 if($('#instAsk'))return;if(!force&&($('#relNote')||$('#rkup')||$('#updBar')||$('#nfAsk'))){setTimeout(()=>instAsk(),4000);return}
 const d=document.createElement('div');d.id='instAsk';d.className='nfask instask';const ios=!BIP&&isIOS();
 d.innerHTML=`<div class="nfab"><img src="icons/icon-192.png" alt="" class="instic" onerror="this.style.display='none'"><div><b>${esc(Tx('in.t','📲 Installe l’application Révision INFAS'))}</b><div class="muted small">${esc(Tx('in.s','Ouvre-la d’un seul appui depuis ton écran d’accueil, même sans internet, et reçois tes rappels de révision. C’est gratuit et léger.'))}</div></div></div>${ios?`<div class="insios">${esc(Tx('in.ios','Sur iPhone : touche le bouton Partager (carré avec une flèche vers le haut) en bas de Safari, puis « Sur l’écran d’accueil ».'))}</div><div class="nfab2"><button class="btn light" id="inN" style="width:100%">${esc(Tx('in.okios','J’ai compris'))}</button></div>`:`<div class="nfab2"><button class="btn coral" id="inY">${esc(Tx('in.y','Installer'))}</button><button class="btn light" id="inN">${esc(Tx('in.n','Plus tard'))}</button></div>`}`;
 document.body.appendChild(d);const y=$('#inY',d);if(y)y.onclick=()=>{d.remove();instDo()};$('#inN',d).onclick=()=>{S.instAsk=Date.now();save();d.remove()}}catch(e){}}

/* ---------- 5. TAILLE DU TEXTE (choix de l'étudiant) + type de recherche ---------- */
const FZ=[.85,.92,1,1.1,1.2,1.3,1.45];
function setFz(d){let i=FZ.indexOf(S.fz||1);if(i<0)i=2;i=Math.max(0,Math.min(FZ.length-1,i+d));S.fz=FZ[i];save();applyLook();render()}
function setSrch(v){S.srch=v;save();render()}
B('profile.text','Taille du texte & recherche',()=>`<div class="card sf"><h3>${T('pt.h','🔠 Taille du texte')}</h3><div class="fzrow"><button class="btn light" onclick="setFz(-1)" aria-label="Texte plus petit">A−</button><b>${Math.round((S.fz||1)*100)} %</b><button class="btn light" onclick="setFz(1)" aria-label="Texte plus grand">A+</button></div><div class="muted small">${T('pt.help','Agrandis ou réduis les textes de toute l’application.')}</div>
 <div class="lbl3">${T('pt.srch','🔍 Barre de recherche')}</div><div class="seg"><button class="${S.srch==='big'?'':'on'}" onclick="setSrch('icon')">${T('pt.srch.i','Icône en haut')}</button><button class="${S.srch==='big'?'on':''}" onclick="setSrch('big')">${T('pt.srch.b','Grande barre')}</button></div></div>`);
const _applyLook0=applyLook;applyLook=function(){_applyLook0.apply(this,arguments);try{document.documentElement.style.setProperty('--gts',String((E.gts||1)*((S&&S.fz)||1)))}catch(e){}};

/* ---------- 6. RECHERCHE GLOBALE (partout : icône en haut ou grande barre) ---------- */
let GSI=null,GSK='all';
function gsBuild(){const key=MAT.length+'|'+Object.keys(QI).length;if(GSI&&GSI.key===key)return GSI;const it=[];
 myMats().forEach(m=>{it.push({k:'mat',mid:m.id,t:m.title,s:nrm(m.title+' '+m.short)});(m.ch||[]).forEach((c,i)=>it.push({k:'ch',mid:m.id,c:i,t:c,s:nrm(c)}));
  (QBM[m.id]||[]).forEach(q=>it.push({k:'q',mid:m.id,id:q.id,t:q.q,s:nrm(q.q+' '+correctText(q)+' '+(q.x||''))}));
  let L=[];try{L=cardsOf(m.id)}catch(e){}L.forEach(c=>it.push({k:'card',mid:m.id,id:c.id,c:c.c,t:c.f,b:c.b,s:nrm(c.f+' '+c.b)}))});
 return GSI={key,it}}
function gsCourse(words){const out=[];myMats().forEach(m=>{const L=(DATA.course||{})[m.id];if(!L)return;L.forEach((h,i)=>{if(!h)return;const tx=String(h).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');const n=nrm(tx);if(words.every(w=>n.includes(w))){const p=n.indexOf(words[0]);out.push({k:'course',mid:m.id,c:i,t:chName(m.id,i),x:tx.slice(Math.max(0,p-50),p+110)})}})});return out}
function gsOpen(){if($('#gs'))return;const o=document.createElement('div');o.id='gs';o.className='gs';
 o.innerHTML=`<div class="gsbox"><div class="gstop"><span>🔍</span><input id="gsQ" type="search" placeholder="${esc(Tx('gs.ph','Rechercher dans tous les cours…'))}" autocomplete="off"><button class="gsx" id="gsX" aria-label="Fermer">✕</button></div><div class="gschips">${[['all',Tx('gs.all','Tout')],['q',Tx('gs.q','Questions')],['card',Tx('gs.card','Flashcards')],['ch',Tx('gs.ch','Chapitres & cours')],['mat',Tx('gs.mat','Matières')]].map(([k,l])=>`<button data-gk="${k}" class="${GSK===k?'on':''}">${esc(l)}</button>`).join('')}</div><div id="gsR" class="gsr"><div class="empty">${esc(Tx('gs.hint','Tape au moins 2 lettres : question, réponse, notion, chapitre…'))}</div></div></div>`;
 document.body.appendChild(o);try{history.pushState({gs:1},'')}catch(e){}const q=$('#gsQ',o);setTimeout(()=>q.focus(),60);
 let t;q.oninput=()=>{clearTimeout(t);t=setTimeout(gsRun,140)};$('#gsX',o).onclick=gsClose;o.onclick=e=>{if(e.target===o)gsClose()};
 $$('[data-gk]',o).forEach(b=>b.onclick=()=>{GSK=b.dataset.gk;$$('[data-gk]',o).forEach(x=>x.classList.toggle('on',x===b));gsRun()});
 $('#gsR',o).onclick=e=>{const r=e.target.closest('[data-gi]');if(r)gsPick(+r.dataset.gi,r)}}
function gsClose(){const o=$('#gs');if(o)o.remove()}
let GSR=[];
function gsRun(){const v=nrm(($('#gsQ')||{}).value||''),box=$('#gsR');if(!box)return;if(v.length<2){box.innerHTML=`<div class="empty">${esc(Tx('gs.hint','Tape au moins 2 lettres : question, réponse, notion, chapitre…'))}</div>`;return}
 const W=v.split(' ').filter(Boolean),I=gsBuild().it;let R=I.filter(x=>(GSK==='all'||x.k===GSK||(GSK==='ch'&&x.k==='course'))&&W.every(w=>x.s.includes(w)));
 if(GSK==='all'||GSK==='ch')R=R.concat(gsCourse(W));const ord={mat:0,ch:1,course:2,q:3,card:4};R.sort((a,b)=>ord[a.k]-ord[b.k]);GSR=R.slice(0,80);
 const lab={mat:'📚',ch:'📖',course:'📄',q:'❓',card:'🗂️'};
 box.innerHTML=GSR.length?`<div class="muted small" style="padding:0 4px 6px">${esc(Tx('gs.n','{n} résultat(s)',{n:R.length}))}</div>`+GSR.map((x,i)=>{const m=matOf(x.mid);return `<button class="gsi" data-gi="${i}"><span class="gse">${lab[x.k]}</span><span class="gst"><small style="color:${esc(m.col)}">${esc(m.emo+' '+m.short)}${x.c!=null&&x.k!=='mat'?' · '+esc(Tx('resumes.ch','Ch. {n}',{n:x.c+1})):''}</small><b>${esc(x.t)}</b>${x.x?`<span class="muted small">… ${esc(x.x)} …</span>`:''}</span></button>`}).join(''):`<div class="empty">${esc(Tx('gs.none','Aucun résultat.'))}</div>`}
function gsPick(i,el){const x=GSR[i];if(!x)return;
 if(x.k==='mat'){gsClose();openMat(x.mid);return}
 if(x.k==='ch'||x.k==='course'){gsClose();readCourse(x.mid,x.c);return}
 const nx=el.nextElementSibling;if(nx&&nx.classList.contains('gsd')){nx.remove();return}const d=document.createElement('div');d.className='gsd';
 if(x.k==='q'){const q=QI[x.id];d.innerHTML=`<div class="ra">✔ ${esc(correctText(q))}</div>${q.x?`<div class="ex">💡 ${esc(q.x)}</div>`:''}<div class="row2"><button class="btn light" data-a="rc">${esc(Tx('read.btn2','📖 Lire le cours'))}</button><button class="btn light" data-a="pin">${esc(S.diff[q.id]?Tx('gs.unpin','📌 Retirer des notions'):Tx('gs.pin','📌 À revoir'))}</button></div>`;
  d.onclick=e=>{const a=e.target.closest('[data-a]');if(!a)return;if(a.dataset.a==='rc'){gsClose();readCourse(q.m,q.c,q.id)}else{togglePin(q.id);a.textContent=S.diff[q.id]?Tx('gs.unpin','📌 Retirer des notions'):Tx('gs.pin','📌 À revoir')}}}
 else d.innerHTML=`<div class="ra">${esc(x.b||'')}</div><div class="row2"><button class="btn light" onclick="gsClose();readCourse('${jsq(x.mid)}',${+x.c||0})">${esc(Tx('read.btn2','📖 Lire le cours'))}</button></div>`;
 el.after(d)}
function gsSync(){const sp=SCREENS[VIEW]||{};const off=!S.onb||sp.onb;let b=$('#gsBtn');if(!b){b=document.createElement('button');b.id='gsBtn';b.className='gsbtn';b.setAttribute('aria-label',Tx('gs.btn','Rechercher'));b.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';b.onclick=gsOpen;document.body.appendChild(b)}
 const big=S.srch==='big'&&!sp.raw;b.style.display=off||big?'none':'flex';const pb=$('#paneBtns');const vis=pb&&getComputedStyle(pb).display!=='none';let occ=vis?pb.offsetWidth+14:0;if(!off&&!big){b.style.right=(vis?pb.offsetWidth+22:14)+'px';occ=(vis?pb.offsetWidth+22:14)+44}document.documentElement.style.setProperty('--fixR',(occ?occ+6:0)+'px');
 const app=$('#app');if(!app)return;let bar=$('#app .gsbar');if(big&&!off){if(!bar){bar=document.createElement('button');bar.className='gsbar';bar.innerHTML=`<span>🔍</span><span>${esc(Tx('gs.ph','Rechercher dans tous les cours…'))}</span>`;bar.onclick=gsOpen;const h=$('#app > header');if(h)h.after(bar);else app.prepend(bar)}}else if(bar)bar.remove()}

/* ---------- 7. LECTURE : titres et sous-titres des cours en gras ---------- */
function boldify(root){if(!root)return;$$('p,li,div.pgm+p',root).forEach(p=>{if(p.dataset.bt)return;p.dataset.bt=1;const t=(p.textContent||'').trim();if(!t||t.length>110)return;
 const up=t.replace(/[^A-Za-zÀ-ÿ]/g,''),caps=up.length>=4&&up===up.toUpperCase();const num=/^((\d+(\.\d+)*)|([IVX]+)|([A-H]))\s*[.)\-–]\s+\S/.test(t)&&t.length<80;const colon=/:\s*$/.test(t)&&t.length<80;
 if(caps||num||colon)p.classList.add('bt-auto')})}
const _readCourse0=readCourse;readCourse=function(){const r=_readCourse0.apply(this,arguments);const go=()=>boldify($('#crd'));setTimeout(go,0);if(r&&r.then)r.then(()=>setTimeout(go,0));return r};

/* ---------- 8. COULEURS DIFFÉRENTES pour chaque cours (si deux cours ont la même couleur) ---------- */
function hsl2hex(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return'#'+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')}
function hex2hsl(h){let[r,g,b]=hx(h).map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let H=0,S0=0;const L=(mx+mn)/2;if(mx!==mn){const d=mx-mn;S0=L>.5?d/(2-mx-mn):d/(mx+mn);H=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;H*=60}return[H,S0*100,L*100]}
function distinctCols(){const seen=new Set(),own=(E.content&&E.content.mat)||{};MAT.forEach(m=>{let c=String(m.col||'#888888').toLowerCase();if(seen.has(c)&&!(own[m.id]&&own[m.id].col)){let[h,s,l]=hex2hsl(c);let n=0;do{h=(h+47)%360;c=hsl2hex(h,Math.max(45,s),Math.min(42,Math.max(30,l)));n++}while(seen.has(c)&&n<8);m.col=c}seen.add(c)})}
const _applyContent0=applyContent;applyContent=function(){_applyContent0.apply(this,arguments);try{distinctCols()}catch(e){}};

/* ---------- 9. RAPPELS ÉCHELONNÉS SUR LA SEMAINE + notification des mises à jour ---------- */
const NDB='ri-notif';
function nIdb(){return new Promise((ok,ko)=>{try{const r=indexedDB.open(NDB,1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)}catch(e){ko(e)}})}
async function nSet(k,v){const db=await nIdb();return new Promise(ok=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>ok();t.onerror=()=>ok()})}
const NTH={1:'srs',2:'old',3:'suj',4:'diff',5:'srs',6:'exam',0:'bilan'};
function nThemeName(t){return{srs:Tx('nt.srs','Révision espacée (flashcards du jour)'),old:Tx('nt.old','Un cours pas revu depuis longtemps'),suj:Tx('nt.suj','Un sujet conseillé à traiter'),diff:Tx('nt.diff','Tes notions difficiles'),exam:Tx('nt.exam','Examen blanc du week-end'),bilan:Tx('nt.bilan','Bilan de la semaine')}[t]}
function nMsg(t){const mats=myMats(),now=Date.now(),seen=S.seen||{};
 if(t==='srs'){let n=0,best=null;mats.forEach(m=>{let c=0;try{cardsOf(m.id).forEach(x=>{const s=S.lt[x.id];if(s&&s.due<=now+864e5)c++})}catch(e){}n+=c;if(c&&(!best||c>best.c))best={m,c}});if(n)return{title:Tx('nm.srs.t','🗂️ {n} flashcard(s) à revoir',{n}),body:Tx('nm.srs.b','C’est le bon moment pour les revoir, surtout en {m}. 5 minutes suffisent !',{m:best.m.short}),url:'?go=flash:'+best.m.id}}
 if(t==='old'||t==='srs'){const o=mats.slice().sort((a,b)=>(seen[a.id]||0)-(seen[b.id]||0))[0];if(o){const d=seen[o.id]?Math.round((now-seen[o.id])/864e5):0;return{title:Tx('nm.old.t','📚 {m} t’attend',{m:o.short}),body:d?Tx('nm.old.b','Tu n’as pas ouvert ce cours depuis {d} jour(s). Un petit tour pour ne pas oublier ?',{d}):Tx('nm.old.b2','Tu n’as pas encore ouvert ce cours : découvre-le aujourd’hui !'),url:'?go=mat:'+o.id}}}
 if(t==='suj'){const c=mats.map(m=>({m,s:mStat(m.id)})).filter(x=>x.s.total).sort((a,b)=>a.s.pct-b.s.pct)[0];if(c)return{title:Tx('nm.suj.t','🎯 Sujet conseillé : {m}',{m:c.m.short}),body:Tx('nm.suj.b','Tu maîtrises {p} % de ce cours. Un sujet aujourd’hui te fera progresser vers la ceinture suivante.',{p:c.s.pct}),url:'?go=suj:'+c.m.id}}
 if(t==='diff'){const n=mats.reduce((s,m)=>s+diffIds(m.id).length,0);if(n)return{title:Tx('nm.diff.t','📌 {n} notion(s) difficile(s)',{n}),body:Tx('nm.diff.b','Revois-les maintenant pour qu’elles deviennent des points forts.'),url:'?go=diff'}}
 if(t==='exam')return{title:Tx('nm.exam.t','⏱️ Examen blanc du week-end'),body:Tx('nm.exam.b','40 questions de tous tes cours en conditions réelles. Prêt(e) ?'),url:'?go=blanc'};
 if(t==='bilan'){const k=rankNow();return{title:Tx('nm.bilan.t','🥋 Ton bilan : {r}',{r:rankName(k.R)}),body:Tx('nm.bilan.b','Série : {s} jour(s) · maîtrise {p} %. Prépare ta semaine de révision !',{s:S.streak.count,p:Math.round(k.M.r*100)}),url:'?go=stats'}}
 return null}
function notifPlan(){const h=S.nh!=null?+S.nh:18,items=[],base=new Date();base.setMinutes(0,0,0);
 for(let d=0;d<8;d++){const t=new Date(base);t.setDate(base.getDate()+d);t.setHours(h,0,0,0);if(t.getTime()<Date.now())continue;let th=NTH[t.getDay()];let m=nMsg(th);if(!m)m=nMsg(th==='srs'?'old':'srs')||nMsg('bilan');if(m)items.push(Object.assign({t:t.getTime(),tag:'ri-'+t.toDateString()},m))}
 [3,7,14].forEach(n=>items.push({t:Date.now()+n*864e5,idle:n,tag:'ri-idle-'+n,title:Tx('nm.idle.t','👋 Tu nous manques !'),body:n>=7?Tx('nm.idle.b2','Cela fait {n} jours… Ce qu’on ne pratique pas s’oublie : reviens garder ta ceinture !',{n}):Tx('nm.idle.b','Ça fait {n} jours. 10 minutes de révision aujourd’hui ?',{n}),url:'./'}));
 return items}
let NSYNC=0;
function notifSync(force){if(!S||!S.notif||RO===false&&EDITMODE)return;if(!force&&Date.now()-NSYNC<6e5)return;NSYNC=Date.now();try{nSet('plan',{items:notifPlan(),last:Date.now(),on:true,icon:'icons/icon-192.png'})}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)notifSync(true)});
async function notifEnable(){if(!('Notification' in window)){toast(Tx('nf.unsup','Les notifications ne sont pas disponibles sur ce navigateur'));return}
 let p=Notification.permission;if(p!=='granted')p=await Notification.requestPermission();if(p!=='granted'){toast(Tx('nf.denied','Notifications refusées : active-les dans les réglages du téléphone'));render();return}
 S.notif=true;S.notifOff=false;save();notifSync(true);let per=false;
 try{const reg=await navigator.serviceWorker.ready;if(reg.periodicSync){try{const st=await navigator.permissions.query({name:'periodic-background-sync'});if(st.state!=='denied'){await reg.periodicSync.register('rappels',{minInterval:12*3600e3});per=true}}catch(e){}}
  await reg.showNotification(Tx('nf.ok.t','🔔 Rappels activés'),{body:Tx('nf.ok.b','Tu recevras au plus un rappel par jour, vers {h} h.',{h:S.nh!=null?S.nh:18}),icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:'ri-on'})}catch(e){}
 S.nper=per;save();render()}
function notifOff(){S.notif=false;S.notifOff=true;save();try{nSet('plan',{items:[],on:false});navigator.serviceWorker.ready.then(r=>r.periodicSync&&r.periodicSync.unregister('rappels'))}catch(e){}render()}
function setNh(v){S.nh=+v;save();notifSync(true);render()}
function icsReminders(){const h=S.nh!=null?+S.nh:18,pad=n=>String(n).padStart(2,'0'),L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Revision INFAS//FR','CALSCALE:GREGORIAN'];const now=new Date();
 const url=location.href.split('?')[0].split('#')[0];
 for(let d=1;d<=7;d++){const t=new Date(now);t.setDate(now.getDate()+d);t.setHours(h,0,0,0);const th=NTH[t.getDay()];const ds=t.getFullYear()+pad(t.getMonth()+1)+pad(t.getDate())+'T'+pad(h)+'0000';
  L.push('BEGIN:VEVENT','UID:ri-'+th+'-'+d+'@revision-infas','DTSTAMP:'+ds,'DTSTART:'+ds,'DURATION:PT15M','RRULE:FREQ=WEEKLY','SUMMARY:Révision INFAS · '+nThemeName(th),'DESCRIPTION:'+(Tx('nf.ics','Ouvre ton appli Révision INFAS')+' '+url).replace(/[,;]/g,' '),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Révision INFAS','TRIGGER:PT0M','END:VALARM','END:VEVENT')}
 L.push('END:VCALENDAR');download('rappels-revision-infas.ics',L.join('\r\n'),'text/calendar')}
B('profile.notif','Rappels & notifications',()=>{const sup='Notification' in window,perm=sup?Notification.permission:'x',on=S.notif&&perm==='granted';const days=[1,2,3,4,5,6,0],dn=['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'];
 return `<div class="card sf"><h3>${T('nf.h','🔔 Rappels & notifications')}</h3>${location.protocol==='file:'?`<div class="nfwarn">${T('nf.file','ℹ️ Les rappels ne peuvent pas s’activer dans un fichier ouvert sur l’appareil : ils fonctionnent dans l’appli installée depuis le lien de l’application.')}</div>`:''}<div class="muted small">${T('nf.sub','Un rappel par jour au maximum, échelonné sur la semaine, selon tes cours et ta progression. Tu es aussi prévenu(e) des nouveautés de l’appli.')}</div>
 ${on?`<div class="nfon">✅ ${T('nf.on','Rappels activés')}${S.nper===false?` <small class="muted">${T('nf.nper','(ton navigateur ne permet pas les rappels en arrière-plan : utilise aussi l’agenda ci-dessous)')}</small>`:''}</div><button class="btn light" onclick="notifOff()">${T('nf.off','Désactiver les rappels')}</button>`:`<button class="btn coral" onclick="notifEnable()">${T('nf.btn','🔔 Activer les rappels sur ce téléphone')}</button>${perm==='denied'?`<div class="muted small">${T('nf.blocked','Les notifications sont bloquées : autorise-les dans les réglages du téléphone (Paramètres › Applications › Chrome › Notifications).')}</div>`:''}`}
 <div class="lbl3">${T('nf.hour','Heure des rappels')}</div><div class="seg">${[7,12,18,20].map(h=>`<button class="${(S.nh!=null?+S.nh:18)===h?'on':''}" onclick="setNh(${h})">${h} h</button>`).join('')}</div>
 <div class="lbl3">${T('nf.week','Ta semaine de rappels')}</div>${days.map(d=>`<div class="nfd"><b>${dn[d]}</b><span>${esc(nThemeName(NTH[d]))}</span></div>`).join('')}
 ${!isStandalone()&&(BIP||isIOS())&&/^https?:$/.test(location.protocol)?`<button class="btn coral" onclick="instDo()" style="margin-top:10px">${T('in.btn','📲 Installer l’application sur ce téléphone')}</button>`:''}<button class="btn light" onclick="icsReminders()" style="margin-top:10px">${T('nf.ics.btn','📅 Ajouter ces rappels à l’agenda du téléphone')}</button><div class="muted small">${T('nf.ics.help','Marche sur tous les téléphones (Android et iPhone), même sans notifications.')}</div></div>`});
/* ouverture depuis une notification : ?go=... */
function goParam(){let g='';try{g=new URLSearchParams(location.search).get('go')||''}catch(e){}if(!g||!S.onb)return;try{history.replaceState(null,'',location.pathname)}catch(e){}
 const[a,b]=g.split(':');if(a==='mat'&&MATI[b])openMat(b);else if(a==='suj'&&MATI[b]){S.lastMat=b;go('sujets',{id:b})}else if(a==='flash'&&MATI[b]){const ids=dueDeck(b);if(ids.length)startFlash(b,ids,Tx('oui.flash.t','Flashcards'));else openMat(b)}else if(a==='diff')startDiff('');else if(a==='blanc')examBlanc(40);else if(a==='stats')tab('stats')}

/* ---------- 10. ÉCRANS : nouvelles rubriques + mise à jour des dispositions déjà personnalisées ---------- */
(function(){const H=SCREENS.home.blocks;const ins=(arr,id,after)=>{if(arr.includes(id))return;const i=arr.indexOf(after);arr.splice(i<0?arr.length:i+1,0,id)};
 ins(H,'home.de','home.resume');ins(H,'home.music','home.mat');if(!H.includes('home.commu'))H.push('home.commu');
 const P=SCREENS.profile.blocks;ins(P,'profile.grade','profile.identity');ins(P,'profile.text','profile.grade');ins(P,'profile.notif','profile.text');ins(P,'profile.commu','profile.notif');
 const St=SCREENS.stats.blocks;if(!St.includes('stats.grade'))St.unshift('stats.grade')})();
const NEWBLK2=[['home','home.commu']];
const NEWBLK=[['home','home.de','home.resume'],['home','home.music','home.mat'],['profile','profile.grade','profile.identity'],['profile','profile.text','profile.grade'],['profile','profile.notif','profile.text'],['profile','profile.commu','profile.notif'],['stats','stats.grade',null]];
function blkMigrate(){if((E.blkv||0)===2&&E.layout){NEWBLK2.forEach(([sc,id])=>{const L=E.layout[sc];if(!Array.isArray(L))return;const i=L.findIndex(b=>b.id===id);if(i>=0){const b=L.splice(i,1)[0];delete b.hidden;L.push(b)}else L.push({id,inst:id})});E.blkv=3;return}if((E.blkv||0)>=2||!E.layout)return;NEWBLK.forEach(([sc,id,after])=>{const L=E.layout[sc];if(!Array.isArray(L)||L.some(b=>b.id===id))return;const i=after?L.findIndex(b=>b.id===after):-1;const nb={id,inst:id};if(BLK[id]&&BLK[id].opt)nb.hidden=true;L.splice(i<0?(after?L.length:0):i+1,0,nb)});E.blkv=3}

/* ---------- après chaque affichage ---------- */
let PLUS0=false;
const _render0=render;render=function(){if(!PLUS0){PLUS0=true;try{blkMigrate()}catch(e){}}syncAvatars();_render0.apply(this,arguments);try{plusAfter()}catch(e){console.error(e)}};
function colorize(){const app=$('#app');if(!app)return;document.body.classList.toggle('nocol',!!E.nocol);if(E.nocol)return;
 $$('#app .li,#side .li,#app .gsi').forEach(el=>{if(el.dataset.lc)return;const oc=el.getAttribute('onclick')||'';const m=oc.match(/(?:openMat|go\('(?:diff|sujets|resumes|matiere)',\{id:)\s*\(?'([^']+)'/);if(m&&MATI[m[1]]){el.dataset.lc=1;el.classList.add('lic');el.style.setProperty('--lc',MATI[m[1]].col)}});
 const mid=(ctx&&ctx.id&&MATI[ctx.id])?ctx.id:(VIEW==='quiz'&&typeof QZ!=='undefined'&&QZ&&MATI[QZ.mid])?QZ.mid:(VIEW==='exam'&&typeof EX!=='undefined'&&EX&&MATI[EX.mid])?EX.mid:(VIEW==='flash'&&typeof FL!=='undefined'&&FL&&MATI[FL.mid])?FL.mid:'';
 app.classList.toggle('matc',!!mid);if(mid)app.style.setProperty('--mcol',MATI[mid].col);else app.style.removeProperty('--mcol')}
function plusAfter(){try{brAfter()}catch(e){}try{multiAfter()}catch(e){console.error(e)}try{prefetchAfter()}catch(e){}try{qiAfter()}catch(e){}try{soonAfter()}catch(e){console.error(e)}try{coverAfter()}catch(e){}try{edAfter()}catch(e){console.error(e)}try{tstyCss()}catch(e){}try{filAfter()}catch(e){console.error(e)}try{addBarAfter()}catch(e){}try{grpEdAfter()}catch(e){}try{pickBtnAfter()}catch(e){}try{pickBarAfter()}catch(e){}try{riStyCss()}catch(e){}try{riTxtApply()}catch(e){}gsSync();boldify($('#app'));try{colorize()}catch(e){}if(ctx&&ctx.id&&MATI[ctx.id]){S.seen=S.seen||{};const o=S.seen[ctx.id]||0;if(Date.now()-o>36e5){S.seen[ctx.id]=Date.now();save()}}
 rankCheck();notifSync()}
(function w(){if(window.PORTAIL_READY){try{goParam()}catch(e){}setTimeout(nfAuto,4000);if(isIOS())setTimeout(()=>instAsk(),3000)}else setTimeout(w,60)})();
/* rappels : activation automatique si déjà autorisés, sinon proposition au bon moment (le téléphone exige l’accord de l’utilisateur) */
function nfAuto(){try{if(!S.onb||EDITMODE||!/^https?:$/.test(location.protocol)||!('Notification' in window)||!('serviceWorker' in navigator))return;const p=Notification.permission;
 if(p==='granted'){if(!S.notif&&!S.notifOff){S.notif=true;save();notifEnable()}return}
 if(p!=='default'||S.notif||S.notifOff)return;if(S.nfAsk&&Date.now()-S.nfAsk<3*864e5)return;if($('#nfAsk')||$('#instAsk')||$('#relNote')||$('#rkup')||$('#updBar')){setTimeout(nfAuto,5000);return}
 S.nfAsk=Date.now();save();const d=document.createElement('div');d.id='nfAsk';d.className='nfask';
 d.innerHTML=`<div class="nfab"><div class="nfai">🔔</div><div><b>${esc(Tx('nfa.t','Recevoir tes rappels de révision ?'))}</b><div class="muted small">${esc(Tx('nfa.s','Un petit rappel par jour au maximum : flashcards à revoir, sujet conseillé, nouveautés de l’appli.'))}</div></div></div><div class="nfab2"><button class="btn coral" id="nfaY">${esc(Tx('nfa.y','Oui, activer'))}</button><button class="btn light" id="nfaN">${esc(Tx('nfa.n','Plus tard'))}</button></div>`;
 document.body.appendChild(d);$('#nfaY',d).onclick=()=>{d.remove();notifEnable()};$('#nfaN',d).onclick=()=>d.remove()}catch(e){}}

/* ---------- 11. CALCULATRICE scientifique (quiz et examens) ---------- */
window.CALC_CONFIG={quizSelector:'[data-bid="quiz.main"],[data-bid="exam.main"]'};
try{if(!localStorage.getItem('infas_calc_fab_v1'))localStorage.setItem('infas_calc_fab_v1',JSON.stringify({x:Math.max(6,innerWidth-190),y:Math.max(120,innerHeight-160)}))}catch(e){}

/* === Calculatrice scientifique flottante — Créé par Daniel Noufe · INFAS ===
   Réglages facultatifs AVANT ce script :
   window.CALC_CONFIG = { quizSelector: '#screen-quiz', always: false }
   (bouton visible seulement quand l'écran du quiz est affiché ; always:true = partout) */
(function () {
  const css = `
.calc-fab{position:fixed;z-index:240;display:none;align-items:center;gap:6px;height:44px;padding:0 10px 0 12px;border-radius:999px;background:var(--card-flat,#13203d);border:1px solid var(--green,#5b9bff);box-shadow:0 8px 24px rgba(0,0,0,.45),0 0 0 3px rgba(var(--g-rgb,91,155,255),.12);color:var(--ink,#eaf1ff);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;}
.calc-fab.on{display:inline-flex;}
.calc-fab .ci{font-size:17px;line-height:1;}
.calc-fab .cl{font-family:var(--sans,'Inter',system-ui,sans-serif);font-size:12.5px;font-weight:700;white-space:nowrap;}
.calc-fab .grip{font-size:13px;color:var(--ink-faint,rgba(234,241,255,.6));margin-left:2px;}
.calc-fab.dragging{cursor:grabbing;box-shadow:0 14px 34px rgba(0,0,0,.55),0 0 0 4px rgba(var(--g-rgb,91,155,255),.25);transform:scale(1.04);}
.calc-fab:focus-visible{outline:2px solid var(--green,#5b9bff);outline-offset:3px;}

.calc-ov{position:fixed;inset:0;z-index:250;pointer-events:none;}
.calc-ov .calc-sheet{pointer-events:auto;}
.calc-ov.hidden{display:none;}
.calc-sheet{--cs:1;position:fixed;left:0;top:0;width:calc(330px * var(--cs));max-width:calc(100vw - 16px);background:var(--card-flat,#13203d);border:1px solid var(--card-border,rgba(255,255,255,.14));border-radius:calc(20px * var(--cs));padding:calc(10px * var(--cs));box-shadow:0 14px 40px rgba(0,0,0,.5);touch-action:manipulation;}
.calc-drag{cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;}
.calc-drag:active{cursor:grabbing;}
.calc-grip{display:block;width:38px;height:4px;border-radius:4px;background:rgba(var(--fg-rgb,234,241,255),.3);margin:0 auto calc(6px * var(--cs));}
.calc-tools{display:flex;align-items:center;gap:calc(5px * var(--cs));}
.calc-tool svg{width:calc(17px * var(--cs));height:calc(17px * var(--cs));display:block;}
.calc-tool{display:inline-flex;align-items:center;justify-content:center;min-width:calc(32px * var(--cs));height:calc(30px * var(--cs));padding:0 calc(6px * var(--cs));border-radius:999px;border:1px solid var(--card-border,rgba(255,255,255,.14));background:transparent;color:var(--ink,#eaf1ff);font-family:var(--sans,'Inter',system-ui,sans-serif);font-weight:700;font-size:calc(12px * var(--cs));cursor:pointer;}
.calc-top{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:calc(8px * var(--cs));}
.calc-title{font-family:var(--display,'Inter',system-ui,sans-serif);font-weight:700;font-size:calc(14px * var(--cs));color:var(--ink,#eaf1ff);white-space:nowrap;}
.calc-x{width:calc(30px * var(--cs));height:calc(30px * var(--cs));border-radius:50%;font-size:calc(13px * var(--cs)) !important;border:1px solid var(--card-border,rgba(255,255,255,.14));background:transparent;color:var(--ink,#eaf1ff);font-size:15px;cursor:pointer;}
.calc-mode{font-family:var(--mono,'IBM Plex Mono',ui-monospace,monospace);font-size:calc(10.5px * var(--cs));padding:calc(5px * var(--cs)) calc(8px * var(--cs));border-radius:999px;border:1px solid var(--card-border,rgba(255,255,255,.14));background:transparent;color:var(--green,#5b9bff);cursor:pointer;margin-right:6px;}
.calc-screen{background:rgba(var(--fg-rgb,234,241,255),0.06);border:1px solid rgba(var(--fg-rgb,234,241,255),0.1);border-radius:calc(12px * var(--cs));padding:calc(8px * var(--cs)) calc(10px * var(--cs));margin-bottom:calc(8px * var(--cs));min-height:calc(64px * var(--cs));display:flex;flex-direction:column;justify-content:flex-end;}
.calc-expr{font-family:var(--mono,'IBM Plex Mono',ui-monospace,monospace);font-size:calc(14px * var(--cs));color:var(--ink-soft,rgba(234,241,255,.7));word-break:break-all;text-align:right;min-height:20px;}
.calc-res{font-family:var(--mono,'IBM Plex Mono',ui-monospace,monospace);font-size:calc(25px * var(--cs));font-weight:600;color:var(--ink,#eaf1ff);text-align:right;word-break:break-all;line-height:1.2;}
.calc-res.err{color:var(--red,#ff6259);font-size:calc(15px * var(--cs));}
.calc-hist{font-family:var(--mono,'IBM Plex Mono',ui-monospace,monospace);font-size:11px;color:var(--ink-faint,rgba(234,241,255,.6));text-align:right;margin-bottom:4px;max-height:34px;overflow:hidden;}
.calc-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:calc(5px * var(--cs));}
.calc-grid button{height:calc(40px * var(--cs));border-radius:calc(10px * var(--cs));padding:0;border:1px solid rgba(var(--fg-rgb,234,241,255),0.1);background:rgba(var(--fg-rgb,234,241,255),0.05);color:var(--ink,#eaf1ff);font-family:var(--sans,'Inter',system-ui,sans-serif);font-size:calc(15px * var(--cs));font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.calc-grid button:active{transform:scale(.95);}
.calc-grid .fn{font-size:calc(12px * var(--cs));color:var(--ink-soft,rgba(234,241,255,.7));}
.calc-grid .op{color:var(--green,#5b9bff);font-size:calc(18px * var(--cs));}
.calc-grid .ac{color:var(--red,#ff6259);}
.calc-grid .eq{background:var(--green,#5b9bff);color:var(--on-green,#000);border-color:transparent;}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  let expr = '', ans = 0, deg = true, last = null, hist = [];
  const KEYS = [
    ['sin', 'sin(', 'fn'], ['cos', 'cos(', 'fn'], ['tan', 'tan(', 'fn'], ['ln', 'ln(', 'fn'], ['log', 'log(', 'fn'],
    ['√', '√(', 'fn'], ['x²', '^2', 'fn'], ['xʸ', '^', 'fn'], ['(', '(', 'fn'], [')', ')', 'fn'],
    ['π', 'π', 'fn'], ['e', 'e', 'fn'], ['n!', '!', 'fn'], ['%', '%', 'fn'], ['Ans', 'Ans', 'fn'],
    ['7', '7'], ['8', '8'], ['9', '9'], ['DEL', 'DEL', 'ac'], ['AC', 'AC', 'ac'],
    ['4', '4'], ['5', '5'], ['6', '6'], ['×', '×', 'op'], ['÷', '÷', 'op'],
    ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+', 'op'], ['−', '−', 'op'],
    ['0', '0'], [',', ','], ['×10ˣ', 'E', 'fn'], ['1/x', '^(−1)', 'fn'], ['=', '=', 'eq']
  ];

  // évaluateur sûr (descente récursive, sans eval)
  function evaluate(src) {
    const s = src.replace(/Ans/g, 'A').replace(/,/g, '.').replace(/\s+/g, '');
    let i = 0;
    const peek = () => s[i];
    const fail = () => { throw new Error('Syntaxe'); };
    function num() {
      let j = i; while (i < s.length && /[0-9.]/.test(s[i])) i++;
      if (s[i] === 'E') { i++; if (s[i] === '+' || s[i] === '−' || s[i] === '-') i++; while (i < s.length && /[0-9]/.test(s[i])) i++; }
      const t = s.slice(j, i).replace('E−', 'E-');
      const v = parseFloat(t); if (isNaN(v) || (t.match(/\./g) || []).length > 1) fail(); return v;
    }
    const FN = { 'sin': x => Math.sin(deg ? x * Math.PI / 180 : x), 'cos': x => Math.cos(deg ? x * Math.PI / 180 : x),
      'tan': x => { const r = deg ? x * Math.PI / 180 : x; if (deg && Math.abs((x % 180) - 90) < 1e-12) throw new Error('Math'); return Math.tan(r); },
      'ln': Math.log, 'log': Math.log10, '√': Math.sqrt };
    function fact(n) { if (n < 0 || n !== Math.floor(n) || n > 170) throw new Error('Math'); let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; }
    function primary() {
      const c = peek();
      if (c === undefined) fail();
      if (/[0-9.]/.test(c)) return num();
      if (c === '(') { i++; const v = add(); if (peek() === ')') i++; return v; }
      if (c === 'π') { i++; return Math.PI; }
      if (c === 'e') { i++; return Math.E; }
      if (c === 'A') { i++; return ans; }
      for (const f of Object.keys(FN)) if (s.startsWith(f, i)) { i += f.length; if (peek() === '(') i++; const v = add(); if (peek() === ')') i++; return FN[f](v); }
      fail();
    }
    function postfix() {
      let v = primary();
      for (;;) {
        if (peek() === '!') { i++; v = fact(v); }
        else if (peek() === '%') { i++; v = v / 100; }
        else if (peek() && /[0-9.(πeA]/.test(peek()) || (peek() && /[sclot√]/.test(peek()))) { v = v * power0(); } // multiplication implicite : 2π, 3(4)
        else break;
      }
      return v;
    }
    function power0() { return primary(); }
    function power() {
      const b = postfix();
      if (peek() === '^') { i++; const e = unary(); return Math.pow(b, e); }
      return b;
    }
    function unary() {
      if (peek() === '−' || peek() === '-') { i++; return -unary(); }
      if (peek() === '+') { i++; return unary(); }
      return power();
    }
    function mul() {
      let v = unary();
      for (;;) {
        if (peek() === '×' || peek() === '*') { i++; v *= unary(); }
        else if (peek() === '÷' || peek() === '/') { i++; const d = unary(); if (d === 0) throw new Error('Division par 0'); v /= d; }
        else return v;
      }
    }
    function add() {
      let v = mul();
      for (;;) {
        if (peek() === '+') { i++; v += mul(); }
        else if (peek() === '−' || peek() === '-') { i++; v -= mul(); }
        else return v;
      }
    }
    // fermer automatiquement les parenthèses ouvertes
    const v = add();
    if (i < s.length) fail();
    if (!isFinite(v)) throw new Error('Math');
    return v;
  }
  function fmt(v) {
    if (Math.abs(v) < 1e-12) v = 0;
    let t = Math.abs(v) >= 1e12 || (Math.abs(v) < 1e-6 && v !== 0) ? v.toExponential(8).replace(/\.?0+e/, 'e') : String(parseFloat(v.toPrecision(12)));
    return t.replace('.', ',');
  }
  function balance(e) { const o = (e.match(/\(/g) || []).length - (e.match(/\)/g) || []).length; return e + ')'.repeat(Math.max(0, o)); }

  let ov, exEl, resEl, hiEl, modeEl;
  function build() {
    ov = document.createElement('div'); ov.className = 'calc-ov hidden'; ov.id = 'calc-ov';
    ov.innerHTML = `<div class="calc-sheet" role="dialog" aria-label="Calculatrice scientifique">
      <div class="calc-drag" id="calc-drag"><span class="calc-grip"></span>
      <div class="calc-top"><span class="calc-title">🧮 Calculatrice</span><span class="calc-tools"><button class="calc-tool" id="calc-smaller" aria-label="Réduire la calculatrice" title="Réduire"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/><path d="M7.5 10.5h6"/></svg></button><button class="calc-tool" id="calc-bigger" aria-label="Agrandir la calculatrice" title="Agrandir"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/><path d="M7.5 10.5h6M10.5 7.5v6"/></svg></button><button class="calc-mode" id="calc-mode">DEG</button><button class="calc-x" id="calc-x" aria-label="Fermer">✕</button></span></div></div>
      <div class="calc-screen"><div class="calc-hist" id="calc-hist"></div><div class="calc-expr" id="calc-expr"></div><div class="calc-res" id="calc-res">0</div></div>
      <div class="calc-grid">${KEYS.map(k => `<button data-k="${k[1]}" class="${k[2] || ''}">${k[0]}</button>`).join('')}</div></div>`;
    document.body.appendChild(ov);
    exEl = ov.querySelector('#calc-expr'); resEl = ov.querySelector('#calc-res'); hiEl = ov.querySelector('#calc-hist'); modeEl = ov.querySelector('#calc-mode');
    ov.querySelector('#calc-x').onclick = close;
    // déplacer (glisser la barre du haut) et taille (loupes) — mémorisés sur l'appareil
    const sh = ov.querySelector('.calc-sheet'), PK = 'infas_calc_pos_v1';
    let P = {}; try { P = JSON.parse(localStorage.getItem(PK) || '{}'); } catch (e) {}
    const save = () => { try { localStorage.setItem(PK, JSON.stringify(P)); } catch (e) {} };
    const SIZES = [0.7, 0.8, 0.9, 1];
    const applyP = () => {
      const cs = SIZES.includes(P.cs) ? P.cs : 1; sh.style.setProperty('--cs', cs);
      const r = sh.getBoundingClientRect(), W = innerWidth, H = innerHeight;
      let x = P.x, y = P.y;
      if (x == null || y == null) { x = (W - r.width) / 2; y = H - r.height - 10; }
      x = Math.max(4, Math.min(W - r.width - 4, x)); y = Math.max(4, Math.min(H - Math.min(r.height, 60) - 4, y));
      sh.style.left = x + 'px'; sh.style.top = y + 'px';
    };
    ov._applyP = applyP;
    ov.querySelector('#calc-smaller').onclick = () => { const i = SIZES.indexOf(SIZES.includes(P.cs) ? P.cs : 1); P.cs = SIZES[Math.max(0, i - 1)]; save(); applyP(); };
    ov.querySelector('#calc-bigger').onclick = () => { const i = SIZES.indexOf(SIZES.includes(P.cs) ? P.cs : 1); P.cs = SIZES[Math.min(SIZES.length - 1, i + 1)]; save(); applyP(); };
    const drag = ov.querySelector('#calc-drag');
    let st = null;
    drag.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      const r = sh.getBoundingClientRect(); st = { dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
      try { drag.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });
    drag.addEventListener('pointermove', e => {
      if (!st || e.pointerId !== st.id) return;
      P.x = e.clientX - st.dx; P.y = e.clientY - st.dy; applyP();
    });
    const end = e => { if (st && e.pointerId === st.id) { st = null; save(); } };
    drag.addEventListener('pointerup', end); drag.addEventListener('pointercancel', end);
    window.addEventListener('resize', () => { if (!ov.classList.contains('hidden')) applyP(); });
    modeEl.onclick = () => { deg = !deg; modeEl.textContent = deg ? 'DEG' : 'RAD'; preview(); };
    ov.querySelector('.calc-grid').addEventListener('click', e => { const b = e.target.closest('button'); if (b) press(b.dataset.k); });
  }
  function preview() {
    exEl.textContent = expr;
    if (!expr) { resEl.textContent = last != null ? fmt(last) : '0'; resEl.classList.remove('err'); return; }
    try { const v = evaluate(balance(expr)); resEl.textContent = '= ' + fmt(v); resEl.classList.remove('err'); } catch (e) { resEl.textContent = ''; }
  }
  function press(k) {
    if (k === 'AC') { expr = ''; last = null; }
    else if (k === 'DEL') { expr = expr.endsWith('Ans') ? expr.slice(0, -3) : expr.slice(0, -1); }
    else if (k === '=') {
      if (!expr) return;
      try {
        const v = evaluate(balance(expr)); hist.unshift(expr + ' = ' + fmt(v)); hist = hist.slice(0, 2);
        hiEl.innerHTML = hist.map(h => String(h).replace(/</g, '&lt;')).join('<br>');
        ans = v; last = v; expr = '';
        exEl.textContent = ''; resEl.textContent = fmt(v); resEl.classList.remove('err'); return;
      } catch (e) { resEl.textContent = e.message === 'Syntaxe' ? 'Erreur de saisie' : (e.message === 'Math' ? 'Erreur mathématique' : e.message); resEl.classList.add('err'); return; }
    } else {
      if (!expr && last != null && /^[×÷+−^!%]/.test(k)) expr = 'Ans';
      if (k === 'E' && !/[0-9]$/.test(expr)) return;
      expr += k;
      last = null;
    }
    preview();
  }
  function open() { if (!ov) build(); ov.classList.remove('hidden'); preview(); requestAnimationFrame(() => ov._applyP && ov._applyP()); }
  function close() { if (ov) ov.classList.add('hidden'); }
  window.openCalculator = open; window.closeCalculator = close;
  // clavier physique
  document.addEventListener('keydown', e => {
    if (!ov || ov.classList.contains('hidden')) return;
    const m = { '*': '×', '/': '÷', '-': '−', '.': ',', 'Enter': '=', '=': '=', 'Backspace': 'DEL', 'Escape': 'X' };
    let k = m[e.key] || e.key;
    if (k === 'X') { close(); return; }
    if (/^[0-9+×÷−(),^!%]$/.test(k) || k === '=' || k === 'DEL') { e.preventDefault(); press(k); }
  });
  // bouton flottant « Calculatrice » : visible pendant le quiz, déplaçable en le glissant, un appui l'ouvre
  const FK = 'infas_calc_fab_v1';
  const fab = document.createElement('div'); fab.className = 'calc-fab'; fab.setAttribute('role', 'button'); fab.setAttribute('aria-label', 'Ouvrir la calculatrice'); fab.tabIndex = 0;
  fab.innerHTML = '<span class="ci">🧮</span><span class="cl">Calculatrice</span><span class="grip" aria-hidden="true">⠿</span>';
  document.body.appendChild(fab);
  let FP = {}; try { FP = JSON.parse(localStorage.getItem(FK) || '{}'); } catch (e) {}
  const placeFab = () => {
    const r = fab.getBoundingClientRect(), W = innerWidth, H = innerHeight;
    let x = FP.x, y = FP.y;
    if (x == null || y == null) { const sc = document.querySelector('#screen-quiz .quiz-score'); const sr = sc ? sc.getBoundingClientRect() : null; x = W - r.width - 14; y = sr && sr.top > 0 ? sr.top + sr.height / 2 - r.height / 2 : 130; }
    x = Math.max(6, Math.min(W - r.width - 6, x)); y = Math.max(6, Math.min(H - r.height - 76, y));
    fab.style.left = x + 'px'; fab.style.top = y + 'px';
  };
  let fd = null;
  fab.addEventListener('pointerdown', e => {
    const r = fab.getBoundingClientRect(); fd = { sx: e.clientX, sy: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId, moved: false };
    try { fab.setPointerCapture(e.pointerId); } catch (_) {}
  });
  fab.addEventListener('pointermove', e => {
    if (!fd || e.pointerId !== fd.id) return;
    if (!fd.moved && Math.hypot(e.clientX - fd.sx, e.clientY - fd.sy) < 8) return;
    fd.moved = true; fab.classList.add('dragging');
    FP.x = e.clientX - fd.dx; FP.y = e.clientY - fd.dy; placeFab(); e.preventDefault();
  });
  const fend = e => {
    if (!fd || e.pointerId !== fd.id) return;
    const moved = fd.moved; fd = null; fab.classList.remove('dragging');
    if (moved) { try { localStorage.setItem(FK, JSON.stringify(FP)); } catch (_) {} }
    else open();
  };
  fab.addEventListener('pointerup', fend);
  fab.addEventListener('pointercancel', e => { if (fd && e.pointerId === fd.id) { fd = null; fab.classList.remove('dragging'); } });
  fab.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  window.addEventListener('resize', placeFab);
  // bouton visible seulement quand l'écran du quiz est affiché
  const CFG = window.CALC_CONFIG || {};
  const quizOn = () => {
    if (CFG.always) return true;
    const q = document.querySelector(CFG.quizSelector || '#screen-quiz');
    return !!(q && !q.classList.contains('hidden') && q.getClientRects().length);
  };
  let wasOn = null;
  const sync = () => { const on = quizOn(); if (on !== wasOn) { wasOn = on; fab.classList.toggle('on', on); if (on) requestAnimationFrame(placeFab); else close(); } };
  new MutationObserver(sync).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style', 'hidden'] });
  setInterval(sync, 800); sync();
  // bouton retour du téléphone : ferme d'abord la calculatrice
  window.addEventListener('popstate', () => { if (ov && !ov.classList.contains('hidden')) { close(); try { history.pushState({ calc: 1 }, ''); } catch (e) {} } });
})();

/* ---------- 12. APPLICATIONS COMPLÈTES : choix de l'interface + grade Révision INFAS à la place des badges ---------- */
function appUiOf(mid){return(S.appUi&&S.appUi[mid])||'ri'}
function setAppUi(mid,v){S.appUi=S.appUi||{};S.appUi[mid]=v;save();render()}
const _appViewHTML0=appViewHTML;appViewHTML=function(){const h=_appViewHTML0.apply(this,arguments),id=ctx.id,u=appUiOf(id);
 const tg=`<div class="apptg"><span>${esc(Tx('apt.l','🎨 Interface'))}</span><button class="${u==='ri'?'on':''}" onclick="setAppUi('${jsq(id)}','ri')">${esc(Tx('apt.ri','Révision INFAS'))}</button><button class="${u==='orig'?'on':''}" onclick="setAppUi('${jsq(id)}','orig')">${esc(Tx('apt.o','Originale'))}</button></div>`;
 return h.replace('<div class="loading"',tg+'<div class="loading"')};
function rgbOf(c){try{return hx(c).join(',')}catch(e){return'0,0,0'}}
function riGradeMini(){const k=rankNow();return `<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:20px;background:var(--card-flat,#fff);border:1px solid var(--card-border,rgba(0,0,0,.1));color:var(--ink,#16231F);font-family:Outfit,system-ui,sans-serif">${beltSvg(k.R.c,64)}<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700;opacity:.75">🥋 ${esc(Tx('apt.g','Mon grade Révision INFAS'))}</div><div style="font-weight:900;font-size:17px;line-height:1.2">${esc(rankName(k.R))}</div><div style="height:8px;border-radius:4px;background:rgba(0,0,0,.12);margin-top:8px;overflow:hidden"><div style="height:100%;width:${Math.round(k.pct)}%;background:${esc(palette().acc)}"></div></div><div style="font-size:12px;opacity:.8;margin-top:4px">${esc(Tx('apt.gs','Commun à tous tes cours · maîtrise {p} %',{p:Math.round(k.M.r*100)}))}</div></div></div>`}
function appExtra(m,src){const ri=appUiOf(m.id)==='ri';let css='',js='';const t=palette(),cs=getComputedStyle(document.documentElement);const v=n=>cs.getPropertyValue(n).trim();
 const ink=v('--ink')||'#16231F',soft=v('--soft')||'#5E6E68',card=v('--card')||'#ffffff',line=v('--line')||'#E1DDD2';
 if(ri){css+='html,body,button,input,select,textarea{font-family:"Outfit",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif!important}';
  if(/--bg0\s*:/.test(src)&&/--green\s*:/.test(src))css+=':root,:root[data-theme],html[data-theme],body[data-theme]{--bg0:'+t.bg+'!important;--bg1:'+t.bg+'!important;--bgA:'+t.bg+'!important;--bgB:'+t.bg+'!important;--bgC:'+t.bg+'!important;--card:'+card+'!important;--card-flat:'+card+'!important;--card-border:'+line+'!important;--line:'+line+'!important;--green:'+t.h2+'!important;--green-2:'+t.h1+'!important;--g-rgb:'+rgbOf(t.h2)+'!important;--green-glow:rgba('+rgbOf(t.h2)+',.25)!important;--green-soft:rgba('+rgbOf(t.h2)+',.12)!important;--orange:'+t.acc+'!important;--o-rgb:'+rgbOf(t.acc)+'!important;--ink:'+ink+'!important;--ink-soft:'+soft+'!important;--ink-faint:'+soft+'!important;--fg-rgb:'+rgbOf(ink)+'!important;--sh-rgb:'+rgbOf(t.h1)+'!important;--display:"Outfit",sans-serif!important;--sans:"Outfit",sans-serif!important;--mono:"Outfit",sans-serif!important;--noise-op:0!important;--on-green:#fff!important;--star-glow:transparent!important}body{background:'+t.bg+'!important;color:'+ink+'!important}';}
 /* badges de l'appli remplacés par le grade Révision INFAS */
 if(/id="pf-badges"|id="gm-badges-strip"|gCheckBadges/.test(src)){
  css+='#pf-badges,#gm-badges-strip{display:none!important}';
  js='<script>(function(){var P=window.parent;function fix(){try{['+"'pf-badges','gm-badges-strip'"+'].forEach(function(i){var e=document.getElementById(i);if(e){var b=e.closest(".blk")||e.parentElement;if(b&&b.dataset.riHid!=="1"){b.dataset.riHid="1";b.style.display="none"}}});var g=document.getElementById("gm-card");if(g&&P&&P.riGradeMini){var h=P.riGradeMini();if(g.dataset.ri!==h){g.dataset.ri=h;g.innerHTML=h}}if(typeof window.gCheckBadges==="function"&&!window.gCheckBadges.__ri){window.gCheckBadges=function(){};window.gCheckBadges.__ri=1}if(typeof window.showToast==="function"&&!window.showToast.__ri){var o=window.showToast;window.showToast=function(m){if(/^(🏅|🎉 Niveau)/.test(String(m)))return;return o.apply(this,arguments)};window.showToast.__ri=1}}catch(e){}}document.addEventListener("DOMContentLoaded",fix);setInterval(fix,700);fix()})();<'+'/script>'}
 const P=appBridge(m,src,ri);css+=P.css;js+=P.js;
 return{css,js}}

/* ---------- 12b. PONT PORTAIL → APPLIS INTÉGRÉES : taille du texte, couleurs, barre du bas ----------
   Toute nouvelle réglage du portail qui doit atteindre les applis intégrées passe par appBridge() :
   il reçoit l'appli (m), sa source (src) et le mode d'interface (ri) et renvoie {css,js} injectés dans l'iframe. */
const BR_ROLE={bg:/^--(bg|bg0|bg1|bg2|bga|bgb|bgc|page|paper)$/i,card:/^--(card|card-flat|card2|white|surface|panel)$/i,ink:/^--(ink|tx|txt|text|fg)$/i,
 soft:/^--(ink2|ink-soft|ink-faint|ink3|tx2|txt-dim|mu|mut|muted|sub)$/i,line:/^--(line|ln|border|bd|card-border|panel-brd)$/i,
 h1:/^--(violet-deep|v950|v900|navy|nuit|b1|sec|s|sd|pri-d)$/i,h2:/^--(violet|violet2|v800|v700|v600|navy2|navy3|nuit2|b2|b3|menthe|fr|prune|chart|txt-h)$/i,
 acc:/^--(a|acc|accent|or|or2|gold|gold2|saf|saf2|orange|amber|amb|am|yellow|btn|pri|p|pd|b)$/i,tint:/^--(lav|lav2|v100|goldt|goldl|soft|mint)$/i};
const BR_TPL=['--h1','--h2','--coral','--coral-d','--turq','--turq-l','--gold','--plum1','--plum2','--mint','--peach','--amber'];
function lumOf(c){try{const[r,g,b]=hx(c).map(x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b}catch(e){return -1}}
function rootVars(src){const o={};const re=/:root\s*\{([^}]*)\}/g;let m;while((m=re.exec(src))){m[1].replace(/(--[\w-]+)\s*:\s*([^;]+)/g,(_,k,v)=>{if(!(k in o))o[k]=v.trim()})}return o}
function appBridge(m,src,ri){let css='',js='';const sc=(E.gts||1)*((S&&S.fz)||1);
 /* 1. taille du texte du portail (A−/A+ et réglage auteur) : toujours appliquée, quel que soit le mode */
 if(Math.abs(sc-1)>.001)css+='html{zoom:'+sc.toFixed(3)+'!important}';
 if(ri){
  /* 2. couleurs de l'interface : chaque variable de couleur de l'appli reçoit son équivalent dans la palette du portail */
  const t=palette(),cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim();
  const R={bg:t.bg,card:v('--card')||'#fff',ink:v('--ink')||'#16231F',soft:v('--soft')||'#5E6E68',line:v('--line')||'#E1DDD2',h1:t.h1,h2:t.h2,acc:t.acc};
  R.tint=mixc(t.h1,/^#/.test(R.card)?R.card:'#ffffff',.9);
  const V=rootVars(src),tpl='--plum1' in V&&'--turq' in V,out=[];
  Object.keys(V).forEach(k=>{const val=V[k];if(!/^#[0-9a-f]{3,8}$/i.test(val))return;
   if(tpl&&BR_TPL.includes(k)){const r=v(k);if(r){out.push(k+':'+r);return}}
   if(k==='--soft'){out.push(k+':'+(lumOf(val)<.35?R.soft:R.tint));return}
   for(const role in BR_ROLE)if(BR_ROLE[role].test(k)){if(role==='card'&&lumOf(val)<.5&&!t.d)return;out.push(k+':'+R[role]);return}});
  if(out.length)css+=':root,:root[data-theme],html[data-theme],body[data-theme],html.dark,body.dark{'+out.map(x=>x+'!important').join(';')+'}';
  /* couleurs écrites « en dur » dans les styles de l'appli (dégradés, bandeaux…) : remplacées par la même correspondance */
  const CM={};out.forEach(x=>{const i=x.indexOf(':'),k=x.slice(0,i),nv=x.slice(i+1),ov=V[k];if(/^#[0-9a-f]{6}$|^#[0-9a-f]{3}$/i.test(ov)&&/^#[0-9a-f]{3,6}$/i.test(nv)&&!/^--(bg|bg0|bg1|bg2|card|card2|white|ink|tx|txt|line|ln)$/i.test(k)){const a=hx(ov).join(', '),b=hx(nv).join(', ');if(a!==b)CM['rgb('+a+')']='rgb('+b+')'}});
  if(Object.keys(CM).length)js+='<script>('+brColors.toString()+')('+JSON.stringify(CM)+')<'+'/script>';
  /* 3. barre du bas : celle du portail ; les rubriques de l'appli passent en onglets sous la barre de titre */
  css+='[data-ri-nav]{position:fixed!important;left:0!important;top:-9999px!important;bottom:auto!important;opacity:0!important;pointer-events:none!important}';
  js+='<script>('+brNav.toString()+')()<'+'/script>';
 }
 return{css,js}}
function brColors(CM){var re=new RegExp(Object.keys(CM).map(function(k){return k.replace(/[()]/g,'\\$&')}).join('|'),'g'),done=new WeakSet();
 function fixSt(st){for(var i=0;i<st.length;i++){var p=st[i];if(p.indexOf('--')===0)continue;var v=st.getPropertyValue(p);if(v&&v.indexOf('rgb(')>-1){re.lastIndex=0;if(re.test(v)){re.lastIndex=0;st.setProperty(p,v.replace(re,function(m){return CM[m]}),st.getPropertyPriority(p))}}}}
 function rules(rs){for(var i=0;i<rs.length;i++){var r=rs[i];if(r.style)fixSt(r.style);if(r.cssRules)rules(r.cssRules)}}
 function run(){try{for(var i=0;i<document.styleSheets.length;i++){var sh=document.styleSheets[i];if(done.has(sh)||(sh.ownerNode&&sh.ownerNode.id==='portail-forms'))continue;try{rules(sh.cssRules);done.add(sh)}catch(e){}}var el=document.querySelectorAll('[style*="rgb"],[style*="#"]');for(var j=0;j<el.length&&j<600;j++)fixSt(el[j].style)}catch(e){}}
 document.addEventListener('DOMContentLoaded',run);setInterval(run,900)}
function brNav(){var P=window.parent,N=null,last='';
 function btns(n){return Array.prototype.filter.call(n.querySelectorAll('button,a,[role=tab],[data-go],[data-v],[data-tab]'),function(b){return!b.parentElement.closest('button,a,[role=tab]')&&(b.textContent||'').trim()})}
 function find(){var c=document.querySelectorAll('nav.nav,nav.bnav,nav.bottomnav,nav#nav,nav.bar,#bnav,.bottom-nav,.tabbar,nav');for(var i=0;i<c.length;i++){var n=c[i],st=getComputedStyle(n);var r=n.getBoundingClientRect();var fixedBottom=(st.position==='fixed'||st.position==='sticky')&&(n.dataset.riNav==='1'||(r.bottom>=innerHeight-40&&r.width>=innerWidth*.55));if(fixedBottom&&btns(n).length>=3)return n}return null}
 function on(b){var c=(b.className||'')+'';return /(^|\s)(on|active|is-active|sel|selected|current|act)(\s|$)/.test(c)||b.getAttribute('aria-current')||b.getAttribute('aria-selected')==='true'}
 function tick(){try{if(!N||!document.contains(N)){N=find();if(N)N.setAttribute('data-ri-nav','1')}var list=[],a=-1;
  if(N&&getComputedStyle(N).display!=='none'){btns(N).forEach(function(b,i){list.push((b.textContent||'').replace(/\s+/g,' ').trim());if(a<0&&on(b))a=i})}
  var k=JSON.stringify([list,a]);if(k!==last&&P&&P.riAppTabs){last=k;P.riAppTabs(list,a)}}catch(e){}}
 window.__riNavReset=function(){last='';tick()};window.__riNav=function(i){var b=N&&btns(N)[i];if(b){b.click();setTimeout(tick,60)}};
 document.addEventListener('DOMContentLoaded',tick);document.addEventListener('click',function(){setTimeout(tick,80)},true);setInterval(tick,600);tick()}
function riAppTabs(list,a){const w=$('.appwrap');if(!w)return;let d=$('#appTabs');if(!list.length){if(d)d.remove();return}
 if(!d){d=document.createElement('div');d.id='appTabs';d.className='apptabs';const f=$('#appFrame');w.insertBefore(d,f&&f.previousElementSibling&&f.previousElementSibling.id==='appLoad'?f.previousElementSibling:f)}
 d.innerHTML=list.map((l,i)=>`<button class="${i===a?'on':''}" onclick="riAppNav(${i})">${esc(l)}</button>`).join('');const o=d.querySelector('.on');if(o)try{o.scrollIntoView({block:'nearest',inline:'center'})}catch(e){}}
function riAppNav(i){const f=$('#appFrame');try{f.contentWindow.__riNav(i)}catch(e){}}
/* la barre du bas du portail reste visible dans l'appli complète */
function brAfter(){const nv=$('#nav'),inApp=VIEW==='appview';document.body.classList.toggle('appnav',inApp);if(inApp&&nv){nv.classList.remove('hide');requestAnimationFrame(()=>{const r=nv.getBoundingClientRect();if(r.height)document.body.style.setProperty('--navH',Math.ceil(innerHeight-r.top+6)+'px')});const m=matOf(ctx.id);const k=m&&m.de?'home':'matieres';$$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===k))}}

/* ---------- 13. FENÊTRE DE CONFIRMATION DE L'APPLI (remplace confirm(), bloqué par certains lecteurs de fichiers et navigateurs intégrés) ---------- */
function askRI(msg,ok,okLbl,noLbl){let o=$('#askRI');if(o)o.remove();o=document.createElement('div');o.id='askRI';o.className='rkup';
 o.innerHTML=`<div class="rkbox" role="dialog" aria-modal="true"><div class="rkn" style="font-size:18px">${esc(msg)}</div><div class="row2" style="width:100%;margin-top:6px"><button class="btn coral" id="askY">${esc(okLbl||Tx('ask.y','Oui'))}</button><button class="btn light" id="askN">${esc(noLbl||Tx('ask.n','Annuler'))}</button></div></div>`;
 document.body.appendChild(o);const close=()=>o.remove();$('#askN',o).onclick=close;o.onclick=e=>{if(e.target===o)close()};$('#askY',o).onclick=()=>{close();try{ok()}catch(e){console.error(e)}};setTimeout(()=>{const y=$('#askY',o);y&&y.focus()},30)}
leaveApp=function(){{const a=$('#askRI');if(a){a.remove();return}}askRI(Tx('app.leave','Voulez-vous revenir au menu principal ?'),()=>{closeApp();VSTACK=[];PANE=false;go('home',{},false)},Tx('app.leave.y','Oui, revenir'),Tx('app.leave.n','Rester ici'))};
/* ---------- 14. QCM À PLUSIEURS RÉPONSES (q.am = indices des bonnes réponses) ---------- */
function isM(q){return!!(q&&q.t==='qcm'&&Array.isArray(q.am)&&q.am.length>1)}
function sameSet(a,b){a=(a||[]).slice().sort();b=(b||[]).slice().sort();return a.length===b.length&&a.every((x,i)=>x===b[i])}
const _correctText0=correctText;correctText=function(q){if(isM(q))return q.am.map(i=>(q.o||[])[i]).join(' · ');return _correctText0(q)};
const _ansQ0=ansQ;ansQ=function(v){const q=curQ();if(!isM(q))return _ansQ0(v);if(QZ.ans[q.id])return;QZ.msel=QZ.msel||{};const s=QZ.msel[q.id]=QZ.msel[q.id]||[];const i=s.indexOf(v);if(i>=0)s.splice(i,1);else s.push(v);render()};
function ansM(){const q=curQ();if(!q||QZ.ans[q.id])return;const s=(QZ.msel&&QZ.msel[q.id])||[];if(!s.length){toast(Tx('qm.none','Coche au moins une réponse'));return}const ok=sameSet(s,q.am);QZ.ans[q.id]={sel:-1,ms:s.slice(),ok};if(ok)QZ.ok++;rec(q,ok);S.cur=QZ;save();render()}
const _exAns0=exAns;exAns=function(v){const q=QI[EX.ids[EX.idx]];if(!isM(q))return _exAns0(v);const s=Array.isArray(EX.ans[q.id])?EX.ans[q.id]:[];const i=s.indexOf(v);if(i>=0)s.splice(i,1);else s.push(v);if(s.length)EX.ans[q.id]=s;else delete EX.ans[q.id];render()};
const _finishExam0=finishExam;finishExam=function(abort){if(!abort&&EX)EX.ids.forEach(id=>{const q=QI[id],v=EX.ans[id];if(isM(q)&&Array.isArray(v))EX.ans[id]=sameSet(v,q.am)?q.a:-1});return _finishExam0.apply(this,arguments)};
function multiAfter(){let q=null,s=[],a=null,fn='';
 if(VIEW==='quiz'&&typeof QZ!=='undefined'&&QZ&&QZ.idx<QZ.ids.length){q=curQ();if(!isM(q))return;a=QZ.ans[q.id];s=(a?a.ms:(QZ.msel||{})[q.id])||[];fn='ansQ'}
 else if(VIEW==='exam'&&typeof EX!=='undefined'&&EX){q=QI[EX.ids[EX.idx]];if(!isM(q))return;s=Array.isArray(EX.ans[q.id])?EX.ans[q.id]:[];fn='exAns'}else return;
 const qq=$('#app .qq');if(qq&&!qq.nextElementSibling.classList.contains('qmhint'))qq.insertAdjacentHTML('afterend',`<div class="qmhint">${T('qm.hint','☑️ Plusieurs bonnes réponses : coche-les toutes.')}</div>`);
 const ops=$$('#app .opt');ops.forEach(b=>{const m=(b.getAttribute('onclick')||'').match(new RegExp(fn+'\\((\\d+)\\)'));if(!m)return;const oi=+m[1];b.classList.add('mopt');b.classList.toggle('sel',s.includes(oi));if(a){b.classList.remove('ok','ko');if(q.am.includes(oi))b.classList.add('ok');else if(s.includes(oi))b.classList.add('ko')}});
 if(fn==='ansQ'&&!a&&ops.length&&!$('#qmGo'))ops[ops.length-1].insertAdjacentHTML('afterend',`<button class="btn" id="qmGo" onclick="ansM()">${T('qm.go','✔ Valider ma réponse ({n} cochée(s))',{n:s.length})}</button>`)}


/* raccourci D.E : un chapitre d'un cours (ex. Exercices corrigés INFAS de Pédiatrie) */
SCREENS.dech={n:'Sujet D.E (chapitre)',ctx:1,hdr:()=>{const m=matOf(ctx.id);return miniHeader(T('dech.small','🎓 Sujets préparation D.E')+' · '+esc(m.short),esc(chName(ctx.id,ctx.c)))},blocks:['dech.main']};
B('dech.main','Lancer le sujet',()=>{const mid=ctx.id,c=ctx.c,ids=(QBM[mid]||[]).filter(q=>q.c===c).map(q=>q.id),lb=chName(mid,c),rv=ids.filter(id=>!S.qs[id]||!S.qs[id].l),st=mStat(mid);
 if(!ids.length)return `<div class="empty">${T('toast.noq','Aucune question ici')}</div>`;
 return `<div class="card sf"><h3>${esc(lb)}</h3><div class="muted small">${T('dech.sub','{n} questions corrigées · {d} déjà réussies',{n:ids.length,d:ids.length-rv.length})}</div></div>
 <button class="btn" onclick="startQuiz('${jsq(mid)}',QBM['${jsq(mid)}'].filter(q=>q.c===${c}).map(q=>q.id),'${jsq(lb)}','chap')">${T('dech.all','▶ Toutes les questions ({n})',{n:ids.length})}</button>
 <button class="btn light" onclick="startQuiz('${jsq(mid)}',shuffle(QBM['${jsq(mid)}'].filter(q=>q.c===${c}).map(q=>q.id)).slice(0,20),'${jsq(lb)}','chap')">${T('dech.rand','🎲 20 questions au hasard')}</button>
 <button class="btn coral" onclick="startTimed('${jsq(mid)}',shuffle(QBM['${jsq(mid)}'].filter(q=>q.c===${c}).map(q=>q.id)).slice(0,40),'${jsq(lb)}')">${T('dech.timed','⏱️ Sujet chronométré · 40 questions')}</button>
 ${rv.length?`<button class="btn light" onclick="startQuiz('${jsq(mid)}',QBM['${jsq(mid)}'].filter(q=>q.c===${c}&&(!S.qs[q.id]||!S.qs[q.id].l)).map(q=>q.id),'${jsq(lb)}','chap')">${T('dech.weak','🔁 Jamais vues ou à revoir ({n})',{n:rv.length})}</button>`:''}
 <button class="btn ghost" onclick="openMat('${jsq(mid)}')">${T('dech.mat','Voir tout le cours de {m}',{m:esc(matOf(mid).short)})}</button>`});


/* ---------- 15. RUBRIQUES DÉDIÉES : certaines « matières » techniques ne s'affichent pas dans la liste des cours ---------- */
const _groups0=groups;groups=function(){const G=_groups0.apply(this,arguments);G.forEach(g=>(g.subs||[]).forEach(s=>s.mats=(s.mats||[]).filter(id=>!(MATI[id]&&MATI[id].rub))));return G.filter(g=>(g.subs||[]).some(s=>s.mats.length))};

/* ---------- 16. OUVERTURE RAPIDE ---------- */
/* une seule copie d'une appli complète en téléchargement, même si on touche plusieurs fois */
if(typeof loadAppFile==='function'){const _laf=loadAppFile,LAFP={};loadAppFile=function(k){return LAFP[k]||(LAFP[k]=_laf(k).then(v=>{if(v==null)delete LAFP[k];return v}))}}
function fastNet(){try{const c=navigator.connection;return!c||(!c.saveData&&!/2g/.test(c.effectiveType||''))}catch(e){return true}}
function prefetchApp(mid){try{const m=MATI[mid];if(m&&m.src&&typeof loadAppFile==='function'&&(window.__APPF||{})[m.src])loadAppFile(m.src)}catch(e){}}
/* on prépare l'appli complète et les données dès que le doigt touche le bouton (avant même le « clic ») */
document.addEventListener('pointerdown',e=>{try{const el=e.target.closest&&e.target.closest('[onclick]');if(!el)return;const oc=el.getAttribute('onclick')||'';const m=oc.match(/(?:openMat|openDE)\('([^']+)'|\{id:'([^']+)'/);const id=m&&(m[1]||m[2]);if(!id)return;if(typeof ensureX==='function')ensureX(id);if(/appview|openDE/.test(oc))prefetchApp(id);if(/'gloss'/.test(oc)&&typeof ensureX==='function')ensureX('__gloss')}catch(x){}},{capture:true,passive:true});
/* sur la fiche d'une matière, l'appli complète se télécharge en arrière-plan (bonne connexion seulement) */
let PFT=null;function prefetchAfter(){if(VIEW==='appview'&&ctx&&ctx.id&&S.lastApp!==ctx.id){S.lastApp=ctx.id;save()}clearTimeout(PFT);if(VIEW==='matiere'&&ctx&&ctx.id&&fastNet()){const id=ctx.id;PFT=setTimeout(()=>{if(VIEW==='matiere'&&ctx.id===id)prefetchApp(id)},1200)}}
(function(){const f=()=>{try{if(S&&S.lastApp&&fastNet())prefetchApp(S.lastApp);if(typeof ensureX!=='function')return;setTimeout(()=>ensureX('__gloss'),3000)}catch(e){}};if('requestIdleCallback'in window)requestIdleCallback(()=>setTimeout(f,1500));else setTimeout(f,4000)})();
/* l'appli s'affiche dès que sa page est prête, sans attendre toutes les images */
window.__riAppReady=function(){const f=$('#appFrame');if(f&&f.classList.contains('hide')){f.classList.remove('hide');const l=$('#appLoad');if(l)l.remove()}};
const _appExtra0=appExtra;appExtra=function(m,src){const r=_appExtra0(m,src);r.js+='<script>document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){try{parent.__riAppReady&&parent.__riAppReady()}catch(e){}},0)})<'+'/script>';return r};

/* ---------- 17. SUJETS TYPE EXAMEN, ORGANISÉS PAR MATIÈRE ---------- */
const SX_SRC=[{mid:'xmvkq4zed',k:'nat',t:'🏛️ Sujets d’examen nationaux (Correction 2025)'},{mid:'xprepade',k:'prep',t:'🎓 Prépa D.E corrigée avec les cours'},{mid:'xmvkq5gqn',k:'exo',rx:/exercices corrig/i,t:'📝 Exercices corrigés des évaluations INFAS'}];
function sxKey(g){const n=nrm(g.n||'');return n.replace(/\b(et|des|de|la|le|les)\b/g,' ').split(' ').filter(w=>w.length>3)}
const SX_ALIAS={pediatrie:['sante infantile','pediatrie'],gyneco:['gyneco','obstetri']};
function sxMatch(kw,c){const n=nrm(c);if(!kw.length)return false;for(const w of kw)if(SX_ALIAS[w])return SX_ALIAS[w].some(a=>n.includes(a));return kw.every(w=>n.includes(w))}
function sxDomains(){const mine=new Set(myMats().map(m=>m.id));return groups().filter(g=>g.id!=='de'&&g.id!=='_autres').map(g=>{const mats=[].concat(...g.subs.map(s=>s.mats)).filter(id=>mine.has(id));const kw=sxKey(g);
  const ex=[];SX_SRC.forEach(s=>{if(!MATI[s.mid])return;const chs=(MATI[s.mid].ch||[]).map((c,i)=>[c,i]).filter(([c])=>s.rx?(s.rx.test(c)&&mats.includes(s.mid)):sxMatch(kw,c));
   chs.forEach(([c,i])=>{const n=(QBM[s.mid]||[]).filter(q=>q.c===i).length;if(n)ex.push({mid:s.mid,c:i,k:s.k,t:s.t,n,name:c})})});
  return{g,mats,ex}}).filter(d=>d.mats.length||d.ex.length)}
function sxRow(x){const st=(QBM[x.mid]||[]).filter(q=>q.c===x.c);const done=st.filter(q=>S.qs[q.id]).length;const nm=String(x.name).replace(/^J DE PRÉPARATION AU D\.E · /,'J · ').replace(/^(Santé infantile|Santé publique) · /,'');
 return `<div class="li" onclick="go('dech',{id:'${jsq(x.mid)}',c:${x.c}})"><span class="em">${x.k==='nat'?'🏛️':x.k==='prep'?'🎓':'📝'}</span><span class="tx"><b>${esc(nm)}</b><small>${T('sx.n','{n} questions · {d} déjà faites',{n:x.n,d:done})}</small></span><span class="go">›</span></div>`}
B('home.sujexam','Sujets type examen (par matière)',()=>{const D=sxDomains();if(!D.length)return'';const n=D.reduce((a,d)=>a+d.ex.length+d.mats.length,0);
 return `<div class="card sf"><h3>${T('sx.h','📝 Sujets type examen')}</h3><div class="muted small">${T('sx.sub','Classés par matière : sujets nationaux, prépa D.E et sujets de chaque cours, avec ou sans chrono.')}</div>
 <div class="glchips">${D.map(d=>`<button style="--lc:${esc(d.g.col||'')}" onclick="go('sujexam',{g:'${jsq(d.g.id)}'})">${esc(d.g.e||'📘')} ${esc(d.g.n)} <small>${d.ex.length+d.mats.length}</small></button>`).join('')}</div></div>`});
SCREENS.sujexam={n:'Sujets type examen',hdr:()=>miniHeader(T('sx.small','📝 Sujets type examen'),T('sx.title','Par matière')),blocks:['sujexam.main']};
B('sujexam.main','Sujets par matière',()=>{const D=sxDomains();if(!D.length)return `<div class="empty">${T('sx.none','Aucun sujet pour ta filière pour le moment.')}</div>`;const sel=ctx.g||D[0].g.id;
 return `<div class="glchips sxtabs">${D.map(d=>`<button class="${d.g.id===sel?'on':''}" style="--lc:${esc(d.g.col||'')}" onclick="ctx.g='${jsq(d.g.id)}';render()">${esc(d.g.e||'📘')} ${esc(d.g.n)}</button>`).join('')}</div>`+D.filter(d=>d.g.id===sel).map(d=>{
  const by={};d.ex.forEach(x=>(by[x.t]=by[x.t]||[]).push(x));
  return Object.keys(by).map(t=>`<div class="secT">${esc(t)}<span class="ln"></span></div><div class="card sf">${by[t].map(sxRow).join('')}</div>`).join('')+
  (d.mats.length?`<div class="secT">${T('sx.cours','📚 Sujets de chaque cours')}<span class="ln"></span></div><div class="card sf">${d.mats.map(id=>{const m=MATI[id],n=sujets(id).length;return `<div class="li" onclick="S.lastMat='${jsq(id)}';save();go('sujets',{id:'${jsq(id)}'})"><span class="em">${esc(m.emo)}</span><span class="tx"><b>${esc(m.title)}</b><small>${T('sx.suj','{s} sujets type examen · {n} questions',{s:n,n:(QBM[id]||[]).length})}</small></span><span class="go">›</span></div>`}).join('')}</div>`:'')}).join('')});

/* ---------- 18. RÉVISER LES FORMULES, PAR MATIÈRE ET PAR CHAPITRE ---------- */
function fmChs(){const m=MATI.xformules;if(!m)return[];return(m.ch||[]).map((c,i)=>{const p=String(c).split(' · ');return{i,mat:p[0],ch:p.slice(1).join(' · ')||p[0],n:(QBM.xformules||[]).filter(q=>q.c===i).length}})}
function fmMats(){const o={};fmChs().forEach(c=>(o[c.mat]=o[c.mat]||[]).push(c));return o}
B('home.formules','Réviser les formules (par matière)',()=>{const F=fmMats(),ks=Object.keys(F);if(!ks.length)return'';const nf=(cardsOf('xformules')||[]).length;
 return `<div class="card sf"><h3>${T('fm.h','🧮 Réviser les formules')}</h3><div class="muted small">${T('fm.sub','{n} formules et scores, classés par matière puis par chapitre, avec exercices corrigés.',{n:nf})}</div>
 <div class="glchips">${ks.map(k=>`<button onclick="go('formules',{m:'${jsq(k)}'})">${esc(k)} <small>${F[k].length} ch.</small></button>`).join('')}</div></div>`});
SCREENS.formules={n:'Réviser les formules',hdr:()=>miniHeader(T('fm.small','🧮 Réviser les formules'),T('fm.title','Par matière et par chapitre')),blocks:['formules.main']};
B('formules.main','Formules par matière',()=>{const F=fmMats(),ks=Object.keys(F);if(!ks.length)return `<div class="empty">${T('fm.none','Bientôt disponible.')}</div>`;const sel=F[ctx.m]?ctx.m:ks[0];
 return `<div class="glchips sxtabs">${ks.map(k=>`<button class="${k===sel?'on':''}" onclick="ctx.m='${jsq(k)}';render()">${esc(k)}</button>`).join('')}</div><div class="card sf">${F[sel].map(c=>`<div class="li" onclick="go('formch',{id:'xformules',c:${c.i},m:'${jsq(sel)}'})"><span class="em">🧮</span><span class="tx"><b>${esc(c.ch)}</b><small>${T('fm.n','{f} formule(s) · {n} exercice(s)',{f:(cardsOf('xformules')||[]).filter(k=>k.c===c.i).length,n:c.n})}</small></span><span class="go">›</span></div>`).join('')}</div>
 <button class="btn coral" onclick="startQuiz('xformules',QBM.xformules.filter(q=>(MATI.xformules.ch[q.c]||'').startsWith('${jsq(sel)} · ')).map(q=>q.id),'${jsq(Tx('fm.all','Formules · {m}',{m:sel}))}','chap')">${T('fm.train','✍️ M’entraîner sur toutes les formules de {m}',{m:esc(sel)})}</button>`});
SCREENS.formch={n:'Formules d’un chapitre',ctx:1,hdr:()=>{const p=String((MATI.xformules.ch||[])[ctx.c]||'').split(' · ');return miniHeader(T('fm.small','🧮 Réviser les formules')+' · '+esc(p[0]),esc(p.slice(1).join(' · ')))},blocks:['formch.main']};
B('formch.main','Formules du chapitre',()=>{const c=ctx.c,h=((DATA.course||{}).xformules||[])[c]||'',ids=(QBM.xformules||[]).filter(q=>q.c===c).map(q=>q.id),lb=chName('xformules',c);
 return `${ids.length?`<button class="btn" onclick="startQuiz('xformules',QBM.xformules.filter(q=>q.c===${c}).map(q=>q.id),'${jsq(lb)}','chap')">${T('fm.go','✍️ M’entraîner : {n} exercice(s) corrigé(s)',{n:ids.length})}</button>`:''}<div class="card sf crtx fmtx">${h||`<div class="empty">${T('fm.load','Chargement…')}</div>`}</div>`});

/* ---------- 19. GLOSSAIRE PAR MATIÈRE, SELON LA FILIÈRE ---------- */
let GLQ='',GLALL=false;
function glossAll(){const x=XD.__gloss;return(x&&x.course&&x.course.gl)||null}
function glossLoad(){if(glossAll())return Promise.resolve(glossAll());const p=(typeof ensureX==='function')?ensureX('__gloss'):Promise.resolve();return p.then(()=>glossAll())}
function glossN(){return(XD.__gloss&&XD.__gloss.n)||{}}
function glossMats(all){const n=glossN();return MAT.filter(m=>n[m.id]&&!m.off&&(all||!S.fil||(m.fil||[]).includes(S.fil)))}
function filName(){const f=FIL&&FIL[S.fil];return f?(f.n||f.name||f.short||S.fil):(S.fil||'')}
B('home.gloss','Glossaire (par matière, selon ta filière)',()=>{const n=glossN(),L=glossMats(false);if(!L.length)return'';const tot=L.reduce((a,m)=>a+n[m.id],0);
 return `<div class="card sf glh"><h3>${T('gl.h','🔤 Glossaire')}</h3><div class="muted small">${T('gl.sub2','{n} termes expliqués · {m} matières de ta filière {f}',{n:tot,m:L.length,f:esc(filName())})}</div>
 <div class="search" onclick="GLQ='';go('gloss',{})" style="margin-top:10px">🔍<input class="srch" readonly placeholder="${esc(Tx('gl.ph','Chercher un mot (ex. : anémie, Glasgow…)'))}"></div>
 <div class="glchips">${L.map(m=>`<button style="--lc:${esc(m.col)}" onclick="GLQ='';go('gloss',{id:'${jsq(m.id)}'})">${esc(m.emo)} ${esc(m.short)} <small>${n[m.id]}</small></button>`).join('')}</div></div>`});
SCREENS.gloss={n:'Glossaire',hdr:()=>{const m=ctx.id&&MATI[ctx.id];return miniHeader(T('gl.small','🔤 Glossaire'),m?esc(m.emo+' '+m.short):(GLALL?T('gl.all','Toutes les filières'):T('gl.fil','Filière {f}',{f:esc(filName())})))},blocks:['gloss.main']};
B('gloss.main','Termes et définitions',()=>`<div class="search glsearch">🔍<input class="srch" id="glIn" placeholder="${esc(Tx('gl.ph','Chercher un mot (ex. : anémie, Glasgow…)'))}" value="${esc(GLQ)}" autocomplete="off"></div>${ctx.id?'':`<div class="seg" style="margin-bottom:10px"><button class="${GLALL?'':'on'}" onclick="GLALL=false;render()">${T('gl.mine2','Ma filière ({f})',{f:esc(S.fil||'')})}</button><button class="${GLALL?'on':''}" onclick="GLALL=true;render()">${T('gl.every','Toutes les filières')}</button></div>`}<div id="glOut"><div class="empty">${T('gl.load','Chargement du glossaire…')}</div></div>`,{after:()=>{const i=$('#glIn');if(i)i.oninput=()=>{GLQ=i.value;glossDraw()};glossLoad().then(glossDraw)}});
function glossDraw(){const o=$('#glOut');if(!o)return;const G=glossAll();if(!G){o.innerHTML=`<div class="empty">${T('gl.err','Glossaire indisponible pour le moment (connexion ?).')}</div>`;return}
 const mid=ctx.id&&G[ctx.id]?ctx.id:'',q=nrm(GLQ||''),n=glossN(),scope=mid?[mid]:glossMats(GLALL).map(m=>m.id);
 if(!mid&&!q){const ids=new Set(scope);o.innerHTML=groups().map(g=>{const L=[].concat(...g.subs.map(s=>s.mats)).filter(id=>ids.has(id));return L.length?`<div class="glgh">${esc((g.e||'')+' '+g.n)}</div><div class="glchips glm">${L.map(id=>{const m=MATI[id];return `<button style="--lc:${esc(m.col)}" onclick="go('gloss',{id:'${jsq(id)}'})">${esc(m.emo)} ${esc(m.short)} <small>${n[id]}</small></button>`}).join('')}</div>`:''}).join('');return}
 let L=[];scope.forEach(k=>(G[k]||[]).forEach(e=>{if(!q||nrm(e[0]).includes(q)||(q.length>3&&nrm(e[1]).includes(q)))L.push([e[0],e[1],k])}));
 const rk=e=>{const t=nrm(e[0]);return t.startsWith(q)?0:t.includes(q)?1:2};if(q)L.sort((a,b)=>rk(a)-rk(b)||a[0].localeCompare(b[0],'fr'));else L.sort((a,b)=>a[0].localeCompare(b[0],'fr'));
 if(!L.length){o.innerHTML=`<div class="empty">${T('gl.none','Aucun terme trouvé.')}</div>`;return}
 const lt=e=>(nrm(e[0])[0]||'#').toUpperCase(),letters=[...new Set(L.map(lt))];let cur='',h='';const max=600;
 L.slice(0,max).forEach(e=>{const l=lt(e);if(!q&&l!==cur){cur=l;h+=`<div class="gll" id="gl-${l}">${l}</div>`}h+=`<div class="gli"><b>${esc(e[0])}</b>${!mid?`<small>${esc((MATI[e[2]]||{}).short||'')}</small>`:''}<span>${esc(e[1])}</span></div>`});
 o.innerHTML=(!q&&letters.length>3?`<div class="glk">${letters.map(l=>`<button onclick="var t=document.getElementById('gl-${l}');t&&t.scrollIntoView({block:'start',behavior:'smooth'})">${l}</button>`).join('')}</div>`:'')+`<div class="muted small" style="margin:4px 2px 8px">${T('gl.count','{n} terme(s)',{n:L.length})}${L.length>max?' · '+T('gl.more','affine ta recherche pour voir la suite'):''}</div><div class="card sf glbox">${h}</div>`}

/* ---------- 20. PLACE DES NOUVELLES RUBRIQUES SUR L'ACCUEIL ---------- */
(function(){const H=SCREENS.home.blocks;const ins=(id,after)=>{if(H.includes(id))return;const i=H.indexOf(after);H.splice(i<0?H.length:i+1,0,id)};ins('home.sujexam','home.de');ins('home.formules','home.sujexam');if(!H.includes('home.gloss')){const i=H.indexOf('home.commu');H.splice(i<0?H.length:i,0,'home.gloss')}})();
const _blkMigrate1=blkMigrate;blkMigrate=function(){_blkMigrate1();if((E.blkv||0)===3&&E.layout){const L=E.layout.home;if(Array.isArray(L)){const ins=(id,after)=>{if(L.some(b=>b.id===id))return;const i=L.findIndex(b=>b.id===after);L.splice(i<0?L.length:i+1,0,{id,inst:id})};ins('home.sujexam','home.de');ins('home.formules','home.sujexam');if(!L.some(b=>b.id==='home.gloss')){const i=L.findIndex(b=>b.id==='home.commu');L.splice(i<0?L.length:i,0,{id:'home.gloss',inst:'home.gloss'})}}E.blkv=4}};

/* ---------- 21. AUCUN ÉDITEUR CHEZ LES ÉTUDIANTS : l'éditeur propre à certaines applis intégrées est retiré ---------- */
function stripAppEditor(t){if(!t)return t;const cut=(s,open,closeRx)=>{const i=s.indexOf(open);if(i<0)return s;closeRx.lastIndex=i+open.length;const m=closeRx.exec(s);return m?s.slice(0,i)+s.slice(m.index+m[0].length):s};
 let o=t;for(let k=0;k<3;k++){const b=o;o=cut(o,'<script id="ed-js">',/<%?\/script>/g);o=cut(o,'<style id="ed-css">',/<%?\/style>/g);if(o===b)break}
 /* ceinture et bretelles : si un éditeur subsiste, il ne peut pas démarrer */
 return o.replace(/<head([^>]*)>/i,'<head$1><script>try{Object.defineProperty(window,"PORTAIL_EDITOR",{get:function(){return undefined},set:function(){},configurable:false})}catch(e){}<'+'/script>')}
const _appSource0=appSource;appSource=async function(m){const h=await _appSource0.apply(this,arguments);return(h&&RO)?stripAppEditor(h):h};

/* ---------- 22. QUESTIONS SUR SCHÉMA : l'image s'affiche avec la question ---------- */
function qiAfter(){let q=null;if(VIEW==='quiz'&&typeof QZ!=='undefined'&&QZ&&QZ.idx<QZ.ids.length)q=curQ();else if(VIEW==='exam'&&typeof EX!=='undefined'&&EX)q=QI[EX.ids[EX.idx]];
 if(!q||!q.qi||q.img==null)return;const qq=$('#app .qq');if(!qq||$('#app .qifig'))return;const src=imgSrc(q.img);if(!src)return;
 qq.insertAdjacentHTML('afterend',`<figure class="xfig qifig"><img src="${src}" alt="" loading="eager" onclick="zoomImg('${jsq(String(q.img))}','')"></figure>`);$$('#app .xbox .xfig').forEach(f=>f.remove())}

/* ---------- 23. FICHE MATIÈRE : ce que l'appli complète propose en plus apparaît sous « Faire les quiz » ---------- */
const FICHE_LINKS=[{mid:'xmvkq5cba',k:'prep',pre:'Santé infantile · '},{mid:'xmvkq66ok',k:'prep',pre:'Santé publique · '},{mid:'xmvkq66ok',k:'form',m:'Santé publique'},{mid:'chir',k:'form',m:'Chirurgie'},{mid:'xmvkq5gqn',k:'chap',rx:/exercices corrig/i}];
function prepChs(pre){const m=MATI.xprepade;return m?(m.ch||[]).map((c,i)=>({c:String(c),i})).filter(x=>x.c.startsWith(pre)):[]}
function ficheLinks(mid){const out=[];FICHE_LINKS.filter(l=>l.mid===mid).forEach(l=>{
 if(l.k==='prep'){const L=prepChs(l.pre);if(!L.length)return;const n=(QBM.xprepade||[]).filter(q=>L.some(x=>x.i===q.c)).length;out.push(actBtn(`go('prepmat',{id:'${jsq(mid)}'})`,'star','🎓',T('fx.prep','Prépa examen D.E'),T('fx.prep.s','{n} questions d’examen corrigées avec le cours · {s} séries',{n,s:L.length})))}
 if(l.k==='form'){const F=fmMats()[l.m];if(!F)return;out.push(actBtn(`go('formules',{m:'${jsq(l.m)}'})`,'calc','🧮',T('fx.form','Réviser les formules'),T('fx.form.s','{n} chapitre(s) · formules, scores et exercices corrigés',{n:F.length})))}
 if(l.k==='chap'){const c=chIdx(mid,l.rx);if(c<0)return;out.push(actBtn(`go('dech',{id:'${jsq(mid)}',c:${c}})`,'edit','📝',esc(chName(mid,c)),T('fx.chap.s','{n} questions corrigées',{n:(QBM[mid]||[]).filter(q=>q.c===c).length})))}});return out}
function actBtn(on,ic,em,t,s){return `<button class="act sf" onclick="${on}"><span class="dot"><span>${ico(ic,em)}</span></span><span><b>${t}</b><small>${s}</small></span><span class="arr">›</span></button>`}
const _matAct1=BLK['matiere.actions'].html;BLK['matiere.actions'].html=function(){const h=_matAct1.apply(this,arguments),mid=ctx.id,add=ficheLinks(mid);if(!add.length)return h;
 const parts=h.split(/(?=<button class="act)/);const i=parts.findIndex(p=>/go\('sujets'/.test(p));parts.splice(i<0?0:i+1,0,...add);return parts.join('')};
SCREENS.prepmat={n:'Prépa examen D.E (matière)',ctx:1,hdr:()=>{const m=matOf(ctx.id);return miniHeader(T('pm.small','🎓 Prépa examen D.E'),esc(m.emo+' '+m.short))},blocks:['prepmat.main']};
B('prepmat.main','Séries de la prépa D.E',()=>{const l=FICHE_LINKS.find(x=>x.mid===ctx.id&&x.k==='prep');const L=l?prepChs(l.pre):[];if(!L.length)return `<div class="empty">${T('fm.none','Bientôt disponible.')}</div>`;
 const ids=(QBM.xprepade||[]).filter(q=>L.some(x=>x.i===q.c)).map(q=>q.id),lb=Tx('pm.lbl','Prépa D.E · {m}',{m:matOf(ctx.id).short});
 return `<div class="card sf"><div class="muted small">${T('pm.sub','{n} questions d’examen, corrigées et justifiées avec le cours.',{n:ids.length})}</div></div>
 <button class="btn coral" onclick="startTimed('xprepade',shuffle(${JSON.stringify(ids).replace(/"/g,'&quot;')}).slice(0,40),'${jsq(lb)}')">${T('pm.blanc','⏱️ Examen blanc · 40 questions')}</button>
 <div class="card sf">${L.map(x=>{const n=(QBM.xprepade||[]).filter(q=>q.c===x.i),d=n.filter(q=>S.qs[q.id]).length;return `<div class="li" onclick="go('dech',{id:'xprepade',c:${x.i}})"><span class="em">🎓</span><span class="tx"><b>${esc(x.c.slice(l.pre.length))}</b><small>${T('sx.n','{n} questions · {d} déjà faites',{n:n.length,d})}</small></span><span class="go">›</span></div>`}).join('')}</div>`});
function chIdx(mid,rx){return((MATI[mid]||{}).ch||[]).findIndex(c=>rx.test(c))}

/* ---------- 24. SUJETS TYPE EXAMEN : totaux par matière et sujets classés par antenne ---------- */
function sxTot(d){const ex=d.ex.length,exq=d.ex.reduce((a,x)=>a+x.n,0),cs=d.mats.reduce((a,id)=>a+sujets(id).length,0),cq=d.mats.reduce((a,id)=>a+(QBM[id]||[]).length,0);return{s:ex+cs,q:exq+cq}}
function sxAnt(x){const nm=String(x.name);if(x.k==='prep')return{a:Tx('sx.a.prep','Prépa D.E corrigée'),l:nm.split(' · ').pop()};if(x.k==='exo')return{a:Tx('sx.a.exo','Évaluations INFAS'),l:nm};
 if(/^J DE PRÉPARATION/i.test(nm)){const p=nm.split(' · ');return{a:Tx('sx.a.j','Préparation D.E (J)'),l:p.slice(1).join(' · ')}}
 const p=nm.split(' · '),h=p[0],ss=h.match(/\(([^)]*)\)/);const a=h.replace(/\s*\([^)]*\)\s*/,'').trim();return{a:a.toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu,(m,s,c)=>s+c.toUpperCase()),l:ss?ss[1]:Tx('sx.s1','Session 1')}}
B('home.sujexam','Sujets type examen (par matière)',()=>{const D=sxDomains();if(!D.length)return'';
 return `<div class="card sf"><h3>${T('sx.h','📝 Sujets type examen')}</h3><div class="muted small">${T('sx.sub2','Classés par matière, puis par antenne.')}</div>
 <div class="sxgrid">${D.map(d=>{const t=sxTot(d);return `<button class="sxm" style="--lc:${esc(d.g.col||'')}" onclick="go('sujexam',{g:'${jsq(d.g.id)}'})"><span class="sxe">${esc(d.g.e||'📘')}</span><b>${esc(d.g.n)}</b><small>${T('sx.tot','{s} sujets · {q} questions',{s:t.s,q:t.q})}</small></button>`}).join('')}</div></div>`});
B('sujexam.main','Sujets par matière',()=>{const D=sxDomains();if(!D.length)return `<div class="empty">${T('sx.none','Aucun sujet pour ta filière pour le moment.')}</div>`;const sel=ctx.g&&D.find(d=>d.g.id===ctx.g)?ctx.g:D[0].g.id,d=D.find(x=>x.g.id===sel),tt=sxTot(d);
 const by={};d.ex.forEach(x=>{const a=sxAnt(x);(by[a.a]=by[a.a]||[]).push(Object.assign({lab:a.l},x))});
 const row=x=>{const st=(QBM[x.mid]||[]).filter(q=>q.c===x.c),dn=st.filter(q=>S.qs[q.id]).length;return `<div class="li" onclick="go('dech',{id:'${jsq(x.mid)}',c:${x.c}})"><span class="em">${x.k==='nat'?'🏛️':x.k==='prep'?'🎓':'📝'}</span><span class="tx"><b>${esc(x.lab)}</b><small>${T('sx.n','{n} questions · {d} déjà faites',{n:x.n,d:dn})}</small></span><span class="go">›</span></div>`};
 return `<div class="glchips sxtabs">${D.map(x=>`<button class="${x.g.id===sel?'on':''}" style="--lc:${esc(x.g.col||'')}" onclick="ctx.g='${jsq(x.g.id)}';render()">${esc(x.g.e||'📘')} ${esc(x.g.n)}</button>`).join('')}</div>
 <div class="card sf sxsum"><b>${esc((d.g.e||'')+' '+d.g.n)}</b><span>${T('sx.tot','{s} sujets · {q} questions',{s:tt.s,q:tt.q})}</span></div>`+
 Object.keys(by).map(a=>{const L=by[a],nq=L.reduce((s,x)=>s+x.n,0);return `<div class="secT">📍 ${esc(a)}<span class="ln"></span><small class="sxc">${T('sx.ant','{s} sujet(s) · {q} questions',{s:L.length,q:nq})}</small></div><div class="card sf${L.every(x=>x.k==='nat')?' sxrow2':''}">${L.map(row).join('')}</div>`}).join('')+
 (d.mats.length?`<div class="secT">${T('sx.cours','📚 Sujets de chaque cours')}<span class="ln"></span></div><div class="card sf">${d.mats.map(id=>{const m=MATI[id],n=sujets(id).length;return `<div class="li" onclick="S.lastMat='${jsq(id)}';save();go('sujets',{id:'${jsq(id)}'})"><span class="em">${esc(m.emo)}</span><span class="tx"><b>${esc(m.title)}</b><small>${T('sx.suj','{s} sujets type examen · {n} questions',{s:n,n:(QBM[id]||[]).length})}</small></span><span class="go">›</span></div>`}).join('')}</div>`:'')});

/* ---------- 25. ACCUEIL : plus de bouton « Examen blanc chronométré » ---------- */
['html','oneui'].forEach(k=>{const f=BLK['home.de']&&BLK['home.de'][k];if(!f)return;BLK['home.de'][k]=function(){return String(f.apply(this,arguments)).replace(/<button[^>]*onclick="examBlanc\(40\)"[\s\S]*?<\/button>/,'')}});

/* ---------- 26. RECHERCHE AUSSI DANS LES APPLICATIONS COMPLÈTES ---------- */
let AXL=null,AXR=[],AXQ='';
function axShow(el,i){const x=AXR[i];if(!x)return;const nx=el.nextElementSibling;if(nx&&nx.classList.contains('gsd')){nx.remove();return}const d=document.createElement('div');d.className='gsd';d.innerHTML=`<div class="ra" style="white-space:pre-line">${esc(x.full)}</div><button class="btn light" onclick="gsClose();axOpen('${jsq(x.mid)}','${jsq(AXQ)}')">${esc(Tx('gs.axgo','📱 Ouvrir l’application complète'))}</button>`;el.after(d)}
function axAll(){const x=XD.__appsx;return(x&&x.course&&x.course.ix)||null}
function axLoad(){if(axAll())return Promise.resolve(axAll());if(typeof ensureX!=='function')return Promise.resolve(null);return AXL||(AXL=ensureX('__appsx').then(()=>axAll()))}
function axSearch(W){const A=axAll();if(!A)return[];const out=[],mine=new Set(myMats().map(m=>m.id));Object.keys(A).forEach(src=>{const m=MAT.find(z=>z.src===src&&!z.rub)||MATI[src];if(!m||!mine.has(m.id))return;let n=0;
 A[src].forEach((t,ti)=>{if(n>=15)return;const k=nrm(t);if(W.every(w=>k.includes(w))){const i=k.indexOf(W[0]),raw=String(t);n++;out.push({mid:m.id,src,ti,full:raw,t:raw.length>220?raw.slice(Math.max(0,Math.round(i*raw.length/Math.max(1,k.length))-80)).slice(0,220)+'…':raw})}})});return out}
const _gsRun0=gsRun;gsRun=function(){_gsRun0.apply(this,arguments);const v=nrm(($('#gsQ')||{}).value||''),box=$('#gsR');if(!box||v.length<3||!(GSK==='all'||GSK==='ch'))return;const W=v.split(' ').filter(Boolean);
 const draw=()=>{if(nrm(($('#gsQ')||{}).value||'')!==v)return;let z=$('#gsAx');if(z)z.remove();const R=axSearch(W);AXR=R;AXQ=v;z=document.createElement('div');z.id='gsAx';
  z.innerHTML=R.length?`<div class="secT" style="margin-top:12px">${T('gs.ax','📱 Dans les applications complètes ({n})',{n:R.length})}<span class="ln"></span></div>`+R.slice(0,40).map((x,i)=>{const m=matOf(x.mid);return `<button class="gsi" onclick="axShow(this,${i})"><span class="gse">📱</span><span class="gst"><small style="color:${esc(m.col)}">${esc(m.emo+' '+m.short)} · ${esc(Tx('gs.axo','appli complète'))}</small><span>${esc(x.t)}</span></span></button>`}).join(''):'';
  if(R.length){const em=box.querySelector('.empty');if(em)em.remove();box.appendChild(z)}};
 if(axAll())draw();else{const w=document.createElement('div');w.id='gsAx';w.className='muted small';w.style.padding='10px 4px';w.textContent=Tx('gs.axl','Recherche dans les applications complètes…');box.appendChild(w);axLoad().then(draw)}};
let axOpen=function(mid,q){window.__axQ=q;VSTACK=[];go('appview',{id:mid})};
/* dans l'appli complète : le mot cherché est surligné et affiché */
const _appExtra1=appExtra;appExtra=function(m,src){const r=_appExtra1(m,src);if(window.__axQ){const q=String(window.__axQ);window.__axQ=null;
 r.js+='<script>(function(Q){var tries=0;function nm(s){return String(s).toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"")}function go(){tries++;var w=document.createTreeWalker(document.body,4),n,q=nm(Q).split(" ")[0];while(n=w.nextNode()){if(n.parentElement&&n.parentElement.offsetParent!==null&&nm(n.nodeValue).indexOf(q)>-1){var p=n.parentElement;p.style.background="#FFE08A";p.style.borderRadius="6px";p.scrollIntoView({block:"center"});return}}if(tries<8)setTimeout(go,500)}document.addEventListener("DOMContentLoaded",function(){setTimeout(go,600)})})('+JSON.stringify(q).replace(/</g,'\\u003c')+')<'+'/script>'}return r};
/* préchargement de l'index quand on ouvre la recherche (bonne connexion) */
const _gsOpen0=gsOpen;gsOpen=function(){_gsOpen0.apply(this,arguments);try{if(fastNet())axLoad()}catch(e){}};

/* ---------- 27. « BIENTÔT DISPONIBLE » (réglé dans l'éditeur) ---------- */
function soonMat(id){const m=MATI[id];return!!(m&&m.soon)}
function soonKey(k){return!!(E.soonk&&E.soonk[k])}
function soonPop(){askRI(Tx('soon.msg','⏳ Bientôt disponible — ce contenu arrive très vite !'),()=>{},Tx('soon.ok','D’accord'),Tx('soon.no','Fermer'))}
function soonBlocked(){return RO||!EDITMODE}
const _openMat0=openMat;openMat=function(id){if(soonMat(id)&&soonBlocked()){soonPop();return}return _openMat0.apply(this,arguments)};
const _go0=go;go=function(v,c){c=c||{};if(soonBlocked()&&c.id&&soonMat(c.id)&&v!=='matiere'){soonPop();return}if(soonBlocked()&&v==='dech'&&c.id!=null&&soonKey('ch:'+c.id+':'+c.c)){soonPop();return}return _go0.apply(this,arguments)};
function soonAfter(){const ed=!RO&&EDITMODE;
 $$('#app [onclick]').forEach(el=>{if(el.closest('.ed-tb,.ed-panel'))return;const oc=el.getAttribute('onclick')||'';let m=oc.match(/(?:openMat|openDE)\('([^']+)'|go\('(?:matiere|sujets|appview|prepmat)',\{id:'([^']+)'/);let on=false;
  if(m&&soonMat(m[1]||m[2]))on=true;const d=oc.match(/go\('dech',\{id:'([^']+)',c:(\d+)/);if(d&&soonKey('ch:'+d[1]+':'+d[2]))on=true;
  el.classList.toggle('soon',on);if(on&&!el.querySelector('.soonb')){const tg=el.querySelector('.tx,.ou-tx,.gst')||el;tg.insertAdjacentHTML('beforeend',`<span class="soonb">${esc(Tx('soon.b','⏳ Bientôt disponible'))}</span>`)}
  if(ed&&d&&!el.querySelector(':scope > .soont'))el.insertAdjacentHTML('beforeend',`<span class="soont" title="Bientôt disponible" onclick="event.stopPropagation();soonToggle('ch:${d[1]}:${d[2]}')">⏳</span>`)});
 /* blocs entiers marqués « bientôt » */
 const sc=SCREENS[VIEW]?VIEW:'home',L=layoutOf(sc);$$('#app section.blk').forEach(sec=>{const b=L.find(x=>x.inst===sec.dataset.inst);const on=!!(b&&b.soon);sec.classList.toggle('soonblk',on);
  if(on&&!sec.querySelector(':scope > .soonov'))sec.insertAdjacentHTML('beforeend',`<div class="soonov"><span>${esc(Tx('soon.b','⏳ Bientôt disponible'))}</span></div>`);
  const tb=sec.querySelector(':scope > .ed-tb');if(ed&&tb&&!tb.querySelector('.ed-soon')){const bt=document.createElement('button');bt.className='ed-soon';bt.title='Bientôt disponible';bt.textContent=on?'⏳✓':'⏳';bt.onclick=e=>{e.stopPropagation();soonBlock(sc,sec.dataset.inst)};tb.appendChild(bt)}})}
document.addEventListener('click',e=>{if(!soonBlocked())return;const s=e.target.closest&&e.target.closest('.soonblk,.soon');if(s&&!e.target.closest('.ed-tb')){e.preventDefault();e.stopPropagation();soonPop()}},true);
function soonToggle(k){E.soonk=E.soonk||{};if(E.soonk[k])delete E.soonk[k];else E.soonk[k]=1;try{window.PORTAIL_EDITOR.commit('Bientôt disponible : '+k)}catch(e){}render()}
function soonBlock(sc,inst){if(!E.layout)E.layout={};if(!Array.isArray(E.layout[sc]))E.layout[sc]=layoutOf(sc).map(b=>Object.assign({},b));const b=E.layout[sc].find(x=>x.inst===inst);if(!b)return;b.soon=!b.soon;if(!b.soon)delete b.soon;try{window.PORTAIL_EDITOR.commit('Bloc bientôt disponible')}catch(e){}render()}
function soonMatToggle(id){E.content=E.content||{};E.content.mat=E.content.mat||{};const o=E.content.mat[id]=E.content.mat[id]||{};o.soon=!o.soon;if(!o.soon)delete o.soon;try{window.PORTAIL_EDITOR.commit('Matière bientôt disponible')}catch(e){}applyContent();render()}

/* ---------- 28. IMAGES DE COUVERTURE (cours, sujets) : compressées dans l'éditeur, publiées en fichiers séparés ---------- */
function coverOf(k){const v=E.covers&&E.covers[k];return v||''}
function coverPick(k){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const W=Math.min(900,im.width),c=document.createElement('canvas');c.width=W;c.height=Math.round(im.height*W/im.width);c.getContext('2d').drawImage(im,0,0,c.width,c.height);let u=c.toDataURL('image/webp',.72);if(!/^data:image\/webp/.test(u))u=c.toDataURL('image/jpeg',.72);
  E.covers=E.covers||{};E.covers[k]=u;try{window.PORTAIL_EDITOR.commit('Image de couverture')}catch(e){}toast(Tx('cv.ok','🖼️ Couverture ajoutée ({n} Ko)',{n:Math.round(u.length*.75/1024)}));render()};im.src=r.result};r.readAsDataURL(f)};i.click()}
function coverDel(k){if(E.covers){delete E.covers[k];try{window.PORTAIL_EDITOR.commit('Couverture retirée')}catch(e){}render()}}
function coverEd(k){if(RO||!EDITMODE)return'';return `<div class="cved"><button onclick="event.stopPropagation();coverPick('${jsq(k)}')">🖼️ ${coverOf(k)?esc(Tx('cv.chg','Changer la couverture')):esc(Tx('cv.add','Ajouter une couverture'))}</button>${coverOf(k)?`<button onclick="event.stopPropagation();coverDel('${jsq(k)}')">✕</button>`:''}</div>`}
/* fiche matière : bannière + réglages de l'éditeur */
const _mBadge0=BLK['matiere.badge'].html;BLK['matiere.badge'].html=function(){const h=_mBadge0.apply(this,arguments),mid=ctx.id,cv=coverOf('mat:'+mid);
 const ed=(!RO&&EDITMODE)?`<div class="cved">${coverEd('mat:'+mid).replace(/^<div class="cved">|<\/div>$/g,'')}<button onclick="soonMatToggle('${jsq(mid)}')">${soonMat(mid)?'⏳✓ '+esc(Tx('soon.on','Bientôt disponible (activé)')):'⏳ '+esc(Tx('soon.set','Marquer « Bientôt disponible »'))}</button></div>`:'';
 return (cv?`<div class="cvban"><img src="${cv}" alt="" loading="lazy"></div>`:'')+ed+h};
/* écran d'un sujet D.E / d'une série : bannière */
const _dech0=BLK['dech.main'].html;BLK['dech.main'].html=function(){const k='ch:'+ctx.id+':'+ctx.c,cv=coverOf(k);return (cv?`<div class="cvban"><img src="${cv}" alt="" loading="lazy"></div>`:'')+coverEd(k)+_dech0.apply(this,arguments)};
/* vignettes dans les listes et les tuiles */
function coverAfter(){$$('#app [onclick]').forEach(el=>{if(el.dataset.cv||el.closest('.ed-tb'))return;const oc=el.getAttribute('onclick')||'';let k='';let m=oc.match(/(?:openMat|openDE)\('([^']+)'/);if(m)k='mat:'+m[1];const d=oc.match(/go\('dech',\{id:'([^']+)',c:(\d+)/);if(d)k='ch:'+d[1]+':'+d[2];const cv=k&&coverOf(k);if(!cv)return;el.dataset.cv=1;
 const em=el.querySelector('.em,.e,.ou-ic,.sxe');if(em){em.classList.add('cvth');em.innerHTML=`<img src="${cv}" alt="" loading="lazy">`}else el.insertAdjacentHTML('afterbegin',`<img class="cvth2" src="${cv}" alt="" loading="lazy">`)})}

/* ---------- 29. CORRECTION NATIONALE : même apparence que Révision INFAS, antennes regroupées, J par matière, sans profil ---------- */
function corrPatch(){var J='j-preparation-de';function city(n){return String(n).replace(/\s*\([^)]*\)\s*/,'').trim()}function sess(n){var m=String(n).match(/session\s*(\d+)/i);return m?+m[1]:1}
 function sortA(){var A=QUIZ_DATA.antennes,first={};A.forEach(function(a,i){var c=city(a.name);if(!(c in first))first[c]=i});A.sort(function(x,y){if(x.slug===J)return -1;if(y.slug===J)return 1;var cx=city(x.name),cy=city(y.name);return cx===cy?sess(x.name)-sess(y.name):first[cx]-first[cy]})}
 try{var _rb=rebuildData;rebuildData=function(){_rb.apply(this,arguments);sortA();buildIndex()};sortA();buildIndex()}catch(e){}
 /* liste des antennes : sessions 1 et 2 d'une même antenne dans la même carte ; J classé par matière */
 function fixList(){var L=document.getElementById('antennes-list');if(!L||L.dataset.ri===String(L.childElementCount))return;var cards=[].slice.call(L.querySelectorAll('.antenne-card'));var byIdx=QUIZ_DATA.antennes;var prev=null,prevA=null;
  cards.forEach(function(card,i){var a=byIdx[i];if(!a)return;var body=card.querySelector('.antenne-body');
   if(a.slug===J){var rows=[].slice.call(body.querySelectorAll('.sujet-row'));var mats=[];a.sujets.forEach(function(s,k){var m=s.matiere||'Autres';if(mats.indexOf(m)<0)mats.push(m)});body.innerHTML='';mats.forEach(function(m){var h=document.createElement('div');h.className='ri-subh';h.textContent='J · '+m;body.appendChild(h);a.sujets.forEach(function(s,k){if((s.matiere||'Autres')===m&&rows[k])body.appendChild(rows[k])})});prev=null;return}
   if(prev&&city(prevA.name)===city(a.name)){var pb=prev.querySelector('.antenne-body');if(!pb.querySelector('.ri-subh')){var h1=document.createElement('div');h1.className='ri-subh';h1.textContent='Session '+sess(prevA.name);pb.insertBefore(h1,pb.firstChild)}
    var h2=document.createElement('div');h2.className='ri-subh';h2.textContent='Session '+sess(a.name);pb.appendChild(h2);[].slice.call(body.children).forEach(function(r){pb.appendChild(r)});
    var nS=prev.__ns=(prev.__ns||prevA.sujets.length)+a.sujets.length,nQ=prev.__nq=(prev.__nq||prevA.count)+a.count;var mt=prev.querySelector('.ant-meta');if(mt)mt.textContent='Sessions 1 et 2 · '+nS+' sujets · '+nQ+' questions';var nm=prev.querySelector('.ant-name');if(nm)nm.textContent=city(prevA.name);card.remove();return}
   prev=card;prevA=a});L.dataset.ri=String(L.childElementCount)}
 /* configuration : une session choisie → toutes ses questions (pas de choix du nombre) ; filtre « non traitées » */
 try{var _gf=getFilteredPool;getFilteredPool=function(){var p=_gf.apply(this,arguments);if(cfgState&&cfgState.unseen)p=p.filter(function(q){return statusOf(q.id)==='unseen'});return p}}catch(e){}
 try{var _rc=renderConfig;renderConfig=function(){if(cfgState)cfgState.allAnt=true;_rc.apply(this,arguments);var $=function(i){return document.getElementById(i)};
  var aw=$('cfg-antennes');if(aw){[].slice.call(aw.querySelectorAll('.chip.more')).forEach(function(c){c.remove()});[].slice.call(aw.children).forEach(function(c){var tn=null;for(var k=0;k<c.childNodes.length;k++)if(c.childNodes[k].nodeType===3&&c.childNodes[k].nodeValue.trim()){tn=c.childNodes[k];break}if(!tn)return;var t=tn.nodeValue.trim();if(t==='Toutes')return;var cty=city(t),ss=sess(t);var nmc=cty.charAt(0)+cty.slice(1).toLowerCase();tn.nodeValue=(/session/i.test(t)?'S'+ss:'S1');c.dataset.city=nmc;c.dataset.s=/session/i.test(t)?ss:1});
   var rows={},order=[];[].slice.call(aw.children).forEach(function(c){if(!c.dataset.city)return;var k=c.dataset.city;if(!rows[k]){rows[k]=document.createElement('div');rows[k].className='ri-antrow';rows[k].innerHTML='<span class="ri-antc">'+k+'</span><span class="ri-ants"></span><span class="ri-ants"></span>';order.push(k)}var slot=rows[k].querySelectorAll('.ri-ants')[(+c.dataset.s===2)?1:0];slot.appendChild(c)});order.forEach(function(k){aw.appendChild(rows[k])})}
  var one=(cfgState.antenneSlug&&cfgState.antenneSlug!=='all'&&cfgState.antenneSlug!==J)||(cfgState.mode==='j'&&cfgState.sujetSlug&&cfgState.sujetSlug!=='all');
  var cc=$('cfg-count-presets');var card=cc&&cc.closest('.config-card');var pool=getFilteredPool();
  if(card)card.style.display=one?'none':'';if(one){cfgState.count=pool.length;cfgState.countAll=true;var s=$('sum-session');if(s)s.textContent=pool.length;var av=$('sum-available');if(av)av.textContent=pool.length}
  var u=$('ri-unseen');if(!u){u=document.createElement('div');u.id='ri-unseen';u.className='config-card';var m=$('cfg-mode');m.parentNode.insertBefore(u,m.nextSibling)}
  var nu=_gf().filter(function(q){return statusOf(q.id)==='unseen'}).length;u.innerHTML='<label class="ri-unseen"><input type="checkbox" '+(cfgState.unseen?'checked':'')+'> 🆕 Seulement les questions pas encore traitées <b>'+nu+'</b></label>';u.querySelector('input').onchange=function(e){cfgState.unseen=e.target.checked;renderConfig()}}}catch(e){}
 var ub=document.getElementById('btn-start-unseen');if(ub){var nb=ub.cloneNode(true);ub.parentNode.replaceChild(nb,ub);nb.addEventListener('click',function(){if(nb.classList.contains('disabled'))return;openConfigWith({});cfgState.unseen=true;renderConfig()})}
 document.querySelectorAll('[id="btn-start-unseen"]').forEach(function(x){if(x!==document.getElementById('btn-start-unseen')){var c=x.cloneNode(true);x.parentNode.replaceChild(c,x);c.addEventListener('click',function(){openConfigWith({});cfgState.unseen=true;renderConfig()})}});
 /* plus de profil dans cette appli (le grade et les couleurs sont ceux de Révision INFAS) */
 function noProfile(){var b=document.querySelector('#bnav button[data-go="profile"]');if(b)b.remove()}
 var st=document.createElement('style');st.textContent='#cfg-antennes{display:flex!important;flex-direction:column!important;gap:5px!important}#cfg-antennes>.chip{align-self:flex-start}.ri-antrow{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) minmax(0,1fr);gap:6px;align-items:center}.ri-ants{min-width:0}.ri-antc{font-weight:800;font-size:13.5px}.ri-ants .chip{width:100%!important;box-sizing:border-box!important;overflow:hidden;display:flex!important;justify-content:space-between!important;gap:4px;padding:6px 8px!important;font-size:12.5px!important;min-height:0!important;margin:0!important;white-space:nowrap}#cfg-antennes .chip-count{font-size:10.5px!important;padding:1px 5px!important}.ri-subh{font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:.4px;margin:12px 4px 4px;opacity:.85}';document.head.appendChild(st);
 noProfile();fixList();setInterval(function(){noProfile();fixList()},500);try{renderHome()}catch(e){}}
function corrCss(){const t=palette(),cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim();const card=v('--card')||'#fff',ink=v('--ink')||'#16231F',soft=v('--soft')||'#5E6E68',line=v('--line')||'#E1DDD2';
 return `.sig.top,.wrap>.sig,body>.sig,.sig-divider{display:none!important}
 body{background:${t.bg}!important}
 .masthead{background:linear-gradient(135deg,${t.h1},${t.h2})!important;border:0!important;border-radius:24px!important;box-shadow:0 10px 26px rgba(0,0,0,.16)!important;padding:20px 18px!important;text-align:left!important;color:#fff!important}
 .masthead svg{display:none!important}.masthead h1,.masthead h1 *{color:#fff!important;font-weight:900!important;letter-spacing:-.4px!important;text-align:left!important;-webkit-text-fill-color:#fff!important}
 .masthead .eyebrow{background:rgba(255,255,255,.16)!important;color:#fff!important;border:0!important}.masthead .sub{color:rgba(255,255,255,.9)!important;text-align:left!important}
 .tile,.global-progress,.config-card,.antenne-card,.q-card,.results-hero,.search-entry,.stat-card,.st-card,.gm-card,.day-card{background:${card}!important;border:1px solid ${line}!important;border-radius:22px!important;box-shadow:0 6px 22px rgba(0,0,0,.06)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
 .tile::before,.tile::after,.antenne-card::before,.config-card::before{display:none!important}
 .scr-title{font-weight:900!important;letter-spacing:-.3px!important;color:${ink}!important}
 .ttl,.ant-name,.sj-name,.mn,.config-label{color:${ink}!important;font-weight:800!important;letter-spacing:normal!important;text-transform:none!important}
 .desc,.ant-meta,.sj-meta,.mc{color:${soft}!important}
 .tile .icon,.ant-icon{background:${t.acc}!important;color:#fff!important;border-radius:16px!important;border:0!important;box-shadow:none!important}
 .btn-primary{background:${t.h1}!important;color:#fff!important;border:0!important;border-radius:18px!important;box-shadow:none!important;font-weight:800!important}
 .mat-tile{border-radius:16px!important;background:${card}!important;border:1px solid ${line}!important}.mat-tile.on,.chip.active,.chip.on,.cfg-mode button.on,.count-presets .on{background:${t.h1}!important;color:#fff!important;border-color:${t.h1}!important}
 .mat-tile.on .mn,.mat-tile.on .mc{color:#fff!important}
 #cfg-antennes{display:flex!important;flex-direction:column!important;gap:5px!important}#cfg-antennes>.chip{align-self:flex-start}.ri-antrow{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) minmax(0,1fr);gap:6px;align-items:center}.ri-ants{min-width:0}.ri-antc{font-weight:800;font-size:13.5px;color:${ink}}.ri-ants .chip{width:100%!important;box-sizing:border-box!important;overflow:hidden;display:flex!important;justify-content:space-between!important;gap:4px;padding:6px 8px!important;font-size:12.5px!important;min-height:0!important;margin:0!important;white-space:nowrap}#cfg-antennes .chip-count{font-size:10.5px!important;padding:1px 5px!important}
 .ri-subh{font-weight:900;font-size:13px;color:${t.h2};text-transform:uppercase;letter-spacing:.4px;margin:12px 4px 4px}
 .ri-unseen{display:flex;gap:10px;align-items:center;font-weight:800;color:${ink}}.ri-unseen input{width:22px;height:22px;accent-color:${t.h1}}.ri-unseen b{margin-left:auto;color:${t.acc}}`}
const _appExtra2=appExtra;appExtra=function(m,src){const r=_appExtra2(m,src);if(/id="antennes-list"/.test(src)&&/function renderConfig/.test(src)){r.js+='<script>document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){('+corrPatch.toString()+')()},0)})<'+'/script>';if(appUiOf(m.id)==='ri')r.css+=corrCss()}return r};

/* ---------- 30. PALETTES « Vert nuit » et « Bleu nuit » (reprises de la Correction nationale) ---------- */
(function(){const add=[{n:'Vert nuit (sombre)',h1:'#0d2216',h2:'#1c8f45',acc:'#ff8a3d',acc2:'#37e066',bg:'#050f09',card:'#0d2216',d:1},{n:'Bleu nuit (sombre)',h1:'#0d1a38',h2:'#2f6fe0',acc:'#ff8a3d',acc2:'#5b9bff',bg:'#060b18',card:'#0d1a38',d:1}];
 [PALETTES_DEF].concat(Array.isArray(META.palettes)&&META.palettes!==PALETTES_DEF?[META.palettes]:[]).forEach(L=>add.forEach(p=>{if(!L.some(x=>x.n===p.n))L.push(p)}))})();

/* ---------- 31. RECHERCHE → l'appli complète s'ouvre sur le passage ----------
   1) recherche de l'appli (route « search », champ de recherche…) ; 2) sinon on retrouve le chapitre qui contient le passage
   dans les données de l'appli et on ouvre sa page de cours ; le passage est surligné. */
function axFind(Q,CTX){var done=false;function nm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ')}
 var W=nm(Q).split(' ').filter(function(w){return w.length>1}),q0=W.slice().sort(function(a,b){return b.length-a.length})[0]||'';
 function G(n){try{return(0,eval)(n)}catch(e){return undefined}}
 function vis(el){return el&&el.offsetParent!==null&&el.getClientRects().length}
 function hl(){var w=document.createTreeWalker(document.body,4),n,best=null;while(n=w.nextNode()){var p=n.parentElement;if(!p||!vis(p)||p.closest('script,style,input,textarea,#ri-axbar'))continue;if(nm(n.nodeValue).indexOf(q0)<0||/[«»]/.test(n.nodeValue)||/^(r(e|é)sultats?|aucun)/.test(nm(n.nodeValue).trim()))continue;var blk=p.closest('p,li,td,div,section,article')||p;if(W.every(function(x){return nm(blk.textContent).indexOf(x)>-1})&&!/aucun r(e|é)sultat|r(e|é)sultats? pour|«/.test(nm(blk.textContent).slice(0,80))&&!p.closest('input,header,.search,.srch,[class*=search]')){best=p;break}}
  if(best){best.style.background='#FFE08A';best.style.borderRadius='6px';best.style.boxShadow='0 0 0 3px #FFE08A';best.scrollIntoView({block:'center'});return best}return null}
 /* chapitre contenant le passage, retrouvé dans les données de l'appli */
 function findCh(){var roots=['DATA','D','__D','QUIZ_DATA','COURSE','PAGES','CH','CHAPTERS','SUMMARIES','PG'].map(function(k){return[k,G(k)]}).filter(function(x){return x[1]&&typeof x[1]==='object'});var seen=0,hit=null;
  function walk(o,stack,d){if(hit||d>7||++seen>400000)return;if(typeof o==='string'){if(o.length>15&&W.every(function(x){return nm(o).indexOf(x)>-1}))hit=stack.slice();return}if(!o||typeof o!=='object')return;
   if(Array.isArray(o)){for(var i=0;i<o.length&&!hit;i++)walk(o[i],stack.concat([[o,i]]),d+1)}else{for(var k in o){if(hit)break;walk(o[k],stack.concat([[o,k]]),d+1)}}}
  roots.forEach(function(r){if(!hit)walk(r[1],[[null,r[0]]],0)});if(!hit)return null;
  for(var i=hit.length-1;i>=0;i--){var o=hit[i][0];if(!o||Array.isArray(o))continue;var v=o.ch!=null?o.ch:o.c!=null?o.c:o.chapter!=null?o.chapter:o.chap!=null?o.chap:null;if(v!=null&&typeof v!=='object')return{ch:v,obj:o}}
  for(var j=hit.length-1;j>=0;j--){var k=hit[j][1];if(typeof k==='string'&&/^[A-Za-z]{0,3}\d+$/.test(k))return{ch:k}}return null}
 function tryRoutes(c){var go=G('go');if(typeof go!=='function')return false;var ch=c.ch,L=[['reader',{ch:ch}],['course',{ch:ch}],['chapter',{id:ch}],['read',{c:ch}],['chapter',{ch:ch}],['cours',{ch:ch}]];var i=0;
  (function next(){if(done)return;if(i>=L.length){return}var r=L[i++];try{go(r[0],r[1])}catch(e){}setTimeout(function(){if(hl()){done=true;return}next()},450)})();return true}
 function search(){var go=G('go'),os=G('openSearch'),rs=G('runSearch');if(typeof os==='function'&&typeof rs==='function'){os();var si=document.getElementById('search-input');if(si)si.value=Q;rs(Q);return}
  if(typeof go==='function'&&/search/.test(String(G('SCREENS')?Object.keys(G('SCREENS')):'')+' '+String(G('V')?Object.keys(G('V')):'')+' '+(document.documentElement.innerHTML.indexOf("go('search'")>-1||document.documentElement.innerHTML.indexOf('go("search"')>-1?'search':''))){try{go('search',{q:Q});return}catch(e){}}
  var ins=[].slice.call(document.querySelectorAll('input')).filter(function(i){return /search/.test(i.type)||/echerch|search|srch|^gs$|^q$|^sq$/i.test((i.placeholder||'')+' '+(i.id||'')+' '+(i.className||''))});var i=ins.filter(vis)[0]||ins[0];if(!i)return;
  i.focus();i.value=Q;['input','keyup','change'].forEach(function(t){i.dispatchEvent(new Event(t,{bubbles:true}))});i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
  var ds=G('doSearch');if(typeof ds==='function'){try{ds(i)}catch(e){try{ds(Q)}catch(e2){}}}}
 function bar(){if(document.getElementById('ri-axbar'))return;var d=document.createElement('div');d.id='ri-axbar';d.style.cssText='position:fixed;left:8px;right:8px;top:8px;z-index:99999;background:#FFE08A;color:#3a2a00;border-radius:14px;padding:9px 12px;font:700 14px system-ui;box-shadow:0 6px 18px rgba(0,0,0,.2);display:flex;gap:8px;align-items:center';d.innerHTML='<span style="flex:1">🔎 « '+String(Q).replace(/[<&]/g,'')+' »</span><button style="border:0;background:#fff;border-radius:10px;padding:6px 10px;font-weight:800">✕</button>';d.querySelector('button').onclick=function(){d.remove()};document.body.appendChild(d);setTimeout(function(){d.remove()},9000)}
 function sheet(){if(done||!CTX||!CTX.t)return;done=true;var e=function(t){return String(t||'').replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})};var d=document.createElement('div');d.id='ri-axsheet';
  d.style.cssText='position:fixed;left:0;right:0;bottom:0;max-height:72vh;overflow:auto;z-index:99998;background:#fff;color:#16231F;border-radius:22px 22px 0 0;box-shadow:0 -10px 30px rgba(0,0,0,.25);padding:16px 16px 22px;font:16px/1.5 system-ui';
  d.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><b style="flex:1">📍 Passage trouvé dans cette application</b><button style="border:0;background:#eef2f0;border-radius:10px;padding:7px 11px;font-weight:800">✕</button></div>'+(CTX.b||[]).map(function(t){return'<p style="opacity:.6;margin:6px 0">'+e(t)+'</p>'}).join('')+'<p style="background:#FFE08A;border-radius:10px;padding:8px 10px;margin:8px 0;font-weight:600">'+e(CTX.t)+'</p>'+(CTX.a||[]).map(function(t){return'<p style="opacity:.6;margin:6px 0">'+e(t)+'</p>'}).join('');
  d.querySelector('button').onclick=function(){d.remove()};document.body.appendChild(d)}
 setTimeout(function(){bar();if(hl()){done=true;return}var c=findCh();if(c&&tryRoutes(c)){setTimeout(function(){if(!done){if(hl())done=true;else sheet()}},3000);return}search();setTimeout(function(){if(hl())done=true;else sheet()},1300)},400)}
const _appExtra3=appExtra;appExtra=function(m,src){const r=_appExtra3(m,src);if(window.__axQ2){const o=window.__axQ2;window.__axQ2=null;r.js+='<script>document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){('+axFind.toString()+')('+JSON.stringify(String(o.q)).replace(/</g,'\\u003c')+','+JSON.stringify(o.ctx||null).replace(/</g,'\\u003c')+')},300)})<'+'/script>'}return r};
axOpen=function(mid,q,ri){const x=AXR[ri],A=axAll();let ctx=null;if(x&&A&&A[x.src]){const L=A[x.src];ctx={b:L.slice(Math.max(0,x.ti-3),x.ti),t:L[x.ti],a:L.slice(x.ti+1,x.ti+4)}}window.__axQ2={q,ctx};window.__axQ=null;VSTACK=[];go('appview',{id:mid})};

/* ---------- 32. ÉDITION LOCALE : questions, flashcards, glossaire depuis l'écran où on les voit ; compte à rebours D.E ---------- */
function edOn(){return!RO&&EDITMODE}
function edCommit(l){try{window.PORTAIL_EDITOR.commit(l)}catch(e){}}
function edBox(title,fields,onOk,extra){let o=$('#riEd');if(o)o.remove();o=document.createElement('div');o.id='riEd';o.className='rkup';
 o.innerHTML=`<div class="rkbox riedbox" role="dialog"><div class="rkn" style="font-size:18px">${esc(title)}</div>${fields.map(f=>`<label class="riedl">${esc(f.l)}${f.t==='date'?`<input type="date" data-k="${f.k}" value="${esc(f.v||'')}">`:f.t==='line'?`<input data-k="${f.k}" value="${esc(f.v||'')}">`:`<textarea data-k="${f.k}" rows="${f.r||3}">${esc(f.v||'')}</textarea>`}</label>`).join('')}
 <div class="row2" style="width:100%;margin-top:6px"><button class="btn coral" id="riEdOk">${esc(Tx('ed.ok','Enregistrer'))}</button><button class="btn light" id="riEdNo">${esc(Tx('ask.n','Annuler'))}</button></div>${extra?`<button class="btn ghost" id="riEdX" style="margin-top:6px">${esc(extra.l)}</button>`:''}</div>`;
 document.body.appendChild(o);$('#riEdNo',o).onclick=()=>o.remove();$('#riEdOk',o).onclick=()=>{const v={};$$('[data-k]',o).forEach(i=>v[i.dataset.k]=i.value.trim());if(onOk(v)!==false)o.remove()};if(extra)$('#riEdX',o).onclick=()=>{o.remove();extra.f()}}
/* questions : bouton sur la question affichée (quiz, examen, notions à revoir) */
function qEdBtn(id){return `<button class="riedbtn" onclick="event.stopPropagation();riQEdit('${jsq(id)}')">✏️ ${esc(Tx('ed.q','Modifier cette question'))}</button>`}
function riQEdit(id){const q=QI[id];if(q&&window.PORTAIL_qForm)window.PORTAIL_qForm(q)}
/* flashcards : modifications, ajouts et suppressions gardés dans les réglages (E.content) */
const _cardsOf0=cardsOf;cardsOf=function(mid){const fresh=!CARDC[mid];const L=_cardsOf0.apply(this,arguments);if(fresh&&!L.__ed){const c=(E.content||{}),ed=c.cardEd||{},del=new Set(c.cardDel||[]),add=(c.cardAdd||{})[mid]||[];
 for(let i=L.length-1;i>=0;i--){const k=L[i];if(del.has(k.id)){L.splice(i,1);continue}if(ed[k.id])Object.assign(k,ed[k.id])}
 add.forEach((k,i)=>{const id=mid+'.a'+(k.k||i);if(!del.has(id))L.push(Object.assign({id,m:mid,c:0},k,ed[id]||{}))});L.__ed=1}return L};
function riCardEdit(id){const c=cardById(id);if(!c)return;edBox(Tx('ed.card','Modifier la flashcard'),[{k:'f',l:Tx('ed.f','Recto (question)'),v:c.f},{k:'b',l:Tx('ed.b','Verso (réponse)'),v:c.b,r:4}],v=>{if(!v.f||!v.b){toast(Tx('ed.empty','Recto et verso obligatoires'));return false}
 E.content.cardEd=E.content.cardEd||{};E.content.cardEd[id]={f:v.f,b:v.b};edCommit('Flashcard modifiée');recalc();render()},{l:'🗑 '+Tx('ed.del','Supprimer cette flashcard'),f:()=>askRI(Tx('ed.delq','Supprimer cette flashcard ?'),()=>{E.content.cardDel=(E.content.cardDel||[]).concat([id]);edCommit('Flashcard supprimée');recalc();render()},Tx('ed.del2','Supprimer'),Tx('ask.n','Annuler'))})}
function riCardAdd(mid,c){edBox(Tx('ed.cadd','Nouvelle flashcard'),[{k:'f',l:Tx('ed.f','Recto (question)')},{k:'b',l:Tx('ed.b','Verso (réponse)'),r:4}],v=>{if(!v.f||!v.b){toast(Tx('ed.empty','Recto et verso obligatoires'));return false}
 E.content.cardAdd=E.content.cardAdd||{};const L=E.content.cardAdd[mid]=E.content.cardAdd[mid]||[];L.push({k:Date.now().toString(36),c:c||0,f:v.f,b:v.b});edCommit('Flashcard ajoutée');recalc();render();toast(Tx('ed.cok','Flashcard ajoutée ✅'))})}
/* glossaire */
const _glossAll0=glossAll;glossAll=function(){const G=_glossAll0();if(!G)return G;const X=(E.content||{}).gl||{};if(G.__k===JSON.stringify(X).length)return G;
 if(!G.__orig){const O={};Object.keys(G).forEach(k=>{if(k.indexOf('__')&&Array.isArray(G[k]))O[k]=G[k].slice()});Object.defineProperty(G,'__orig',{value:O,configurable:true,enumerable:false})}
 Object.keys(G.__orig).concat(Object.keys(X)).forEach(mid=>{const o=G.__orig[mid]||[],x=X[mid]||{},del=new Set(x.del||[]),ed=x.ed||{};G[mid]=o.filter(e=>!del.has(e[0])).map(e=>ed[e[0]]||e).concat(x.add||[]).sort((a,b)=>a[0].localeCompare(b[0],'fr'))});
 Object.defineProperty(G,'__k',{value:JSON.stringify(X).length,configurable:true,enumerable:false});return G};
function glX(mid){E.content.gl=E.content.gl||{};return E.content.gl[mid]=E.content.gl[mid]||{}}
function riGlEdit(mid,t){const G=glossAll(),e=(G[mid]||[]).find(x=>x[0]===t);if(!e)return;edBox(Tx('ed.gl','Modifier le terme'),[{k:'t',l:Tx('ed.gt','Terme'),v:e[0],t:'line'},{k:'d',l:Tx('ed.gd','Définition'),v:e[1],r:4}],v=>{if(!v.t||!v.d)return false;const x=glX(mid);
 const add=(x.add||[]).findIndex(a=>a[0]===t);if(add>=0)x.add[add]=[v.t,v.d];else{x.ed=x.ed||{};x.ed[t]=[v.t,v.d]}edCommit('Glossaire modifié');glossDraw()},{l:'🗑 '+Tx('ed.gdel','Supprimer ce terme'),f:()=>{const x=glX(mid);const ai=(x.add||[]).findIndex(a=>a[0]===t);if(ai>=0)x.add.splice(ai,1);else x.del=(x.del||[]).concat([t]);edCommit('Terme supprimé');glossDraw()}})}
function riGlAdd(mid){edBox(Tx('ed.gadd','Nouveau terme du glossaire'),[{k:'t',l:Tx('ed.gt','Terme'),t:'line'},{k:'d',l:Tx('ed.gd','Définition'),r:4}],v=>{if(!v.t||!v.d)return false;const x=glX(mid);x.add=(x.add||[]).concat([[v.t,v.d]]);edCommit('Terme ajouté');glossDraw()})}
const _glossDraw0=glossDraw;glossDraw=function(){_glossDraw0.apply(this,arguments);if(!edOn())return;const o=$('#glOut');if(!o)return;const mid=ctx.id;
 if(mid&&!$('#glAdd'))o.insertAdjacentHTML('afterbegin',`<button class="btn coral" id="glAdd" onclick="riGlAdd('${jsq(mid)}')">＋ ${esc(Tx('ed.gadd2','Ajouter un terme'))}</button>`);
 if(mid)$$('.gli',o).forEach(el=>{if(el.querySelector('.riedbtn'))return;const t=el.querySelector('b').textContent;const b=document.createElement('button');b.className='riedbtn';b.textContent='✏️';b.onclick=()=>riGlEdit(mid,t);el.appendChild(b)})};
/* compte à rebours avant le D.E (date réglée dans l'éditeur) */
B('home.countdown','Compte à rebours D.E',()=>{const c=(E.content||{}).countdown||{};const ed=edOn();if(!c.d&&!ed)return'';
 if(!c.d)return `<div class="card sf cdwn"><b>⏳ ${esc(Tx('cd.none','Compte à rebours D.E'))}</b><button class="btn light" onclick="riCdEdit()">${esc(Tx('cd.set','Choisir la date de l’examen'))}</button></div>`;
 const d=new Date(c.d+'T08:00:00'),n=Math.ceil((d-Date.now())/864e5);const ds=d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
 return `<div class="card sf cdwn"><div class="cdn">${n>0?'J-'+n:n===0?Tx('cd.today','C’est aujourd’hui !'):'✅'}</div><div><b>${esc(c.t||Tx('cd.t','Avant le D.E'))}</b><small>📅 ${esc(ds)}</small></div>${ed?`<button class="riedbtn" onclick="riCdEdit()">✏️</button>`:''}</div>`});
function riCdEdit(){const c=(E.content||{}).countdown||{};edBox(Tx('cd.h','Compte à rebours'),[{k:'t',l:Tx('cd.tl','Titre'),v:c.t||'Avant le D.E',t:'line'},{k:'d',l:Tx('cd.dl','Date'),v:c.d||'',t:'date'}],v=>{E.content.countdown=v.d?{t:v.t,d:v.d}:null;edCommit('Compte à rebours');render()})}
(function(){const H=SCREENS.home.blocks;if(!H.includes('home.countdown')){const i=H.indexOf('home.hello');H.splice(i<0?0:i+1,0,'home.countdown')}})();
const _blkMigrate2=blkMigrate;blkMigrate=function(){_blkMigrate2();if((E.blkv||0)===4&&E.layout){const L=E.layout.home;if(Array.isArray(L)&&!L.some(b=>b.id==='home.countdown')){const i=L.findIndex(b=>b.id==='home.hello');L.splice(i<0?0:i+1,0,{id:'home.countdown',inst:'home.countdown'})}E.blkv=5}};
/* boutons d'édition placés après l'affichage */
function edAfter(){if(!edOn())return;
 if(VIEW==='quiz'&&typeof QZ!=='undefined'&&QZ&&QZ.idx<QZ.ids.length){const q=curQ(),c=$('#app .qq');if(q&&c&&!$('#app .riedq'))c.insertAdjacentHTML('beforebegin',`<div class="riedq">${qEdBtn(q.id)}</div>`)}
 if(VIEW==='exam'&&typeof EX!=='undefined'&&EX){const q=QI[EX.ids[EX.idx]],c=$('#app .qq');if(q&&c&&!$('#app .riedq'))c.insertAdjacentHTML('beforebegin',`<div class="riedq">${qEdBtn(q.id)}</div>`)}
 if(VIEW==='flash'&&typeof FL!=='undefined'&&FL&&FL.i<FL.deck.length){const c=$('#app .fcard');if(c&&!$('#app .riedq'))c.insertAdjacentHTML('beforebegin',`<div class="riedq"><button class="riedbtn" onclick="riCardEdit('${jsq(FL.deck[FL.i])}')">✏️ ${esc(Tx('ed.card2','Modifier cette flashcard'))}</button><button class="riedbtn" onclick="riCardAdd('${jsq(FL.mid||'')}',(cardById('${jsq(FL.deck[FL.i])}')||{}).c)">＋ ${esc(Tx('ed.cadd2','Nouvelle flashcard'))}</button></div>`)}
 if(VIEW==='flashcfg'&&ctx&&ctx.id&&!$('#app .riedq'))$('#app').insertAdjacentHTML('afterbegin',`<div class="riedq"><button class="riedbtn" onclick="riCardAdd('${jsq(ctx.id)}',0)">＋ ${esc(Tx('ed.cadd2','Nouvelle flashcard'))}</button></div>`);
 if(VIEW==='diff')$$('#app details.dl').forEach(d=>{if(d.querySelector('.riedbtn'))return;const b=d.querySelector('[onclick*="togglePin"]');const m=b&&(b.getAttribute('onclick')||'').match(/togglePin\('([^']+)'/);if(m)d.insertAdjacentHTML('beforeend',qEdBtn(m[1]))})}

/* ---------- 33. PALETTES BLANC & NOIR / NOIR & BLANC + MODE JOUR / MODE NUIT ---------- */
(function(){const add=[{n:'Blanc & noir',h1:'#000000',h2:'#262626',acc:'#111111',acc2:'#6B6B6B',bg:'#FFFFFF',w:1},{n:'Noir & blanc (sombre)',h1:'#000000',h2:'#2A2A2A',acc:'#8A8A8A',acc2:'#E0E0E0',bg:'#000000',card:'#151515',d:1}];
 [PALETTES_DEF].concat(Array.isArray(META.palettes)&&META.palettes!==PALETTES_DEF?[META.palettes]:[]).forEach(L=>add.forEach(p=>{if(!L.some(x=>x.n===p.n))L.push(p)}))})();
const _palette0=palette;palette=function(){const t=_palette0.apply(this,arguments),m=S&&S.night;if(!t||!m)return t;
 if(m==='nuit'&&!t.d)return Object.assign({},t,{bg:mixc(t.h1,'#000000',.82),card:mixc(t.h2,'#121212',.84),d:1,w:0});
 if(m==='jour'&&t.d)return Object.assign({},t,{bg:'#F4F4F2',card:null,d:0,w:0});return t};
function setNight(v){S.night=v||null;save();applyLook();render()}
const _pText0=BLK['profile.text']&&BLK['profile.text'].html;if(_pText0)BLK['profile.text'].html=function(){const h=_pText0.apply(this,arguments),m=S.night||'';
 const seg=`<div class="lbl3">${T('nt.h','🌗 Mode d’affichage')}</div><div class="seg"><button class="${!m?'on':''}" onclick="setNight('')">${T('nt.a','🎨 Couleur choisie')}</button><button class="${m==='jour'?'on':''}" onclick="setNight('jour')">${T('nt.d','☀️ Jour')}</button><button class="${m==='nuit'?'on':''}" onclick="setNight('nuit')">${T('nt.n','🌙 Nuit')}</button></div>`;
 return h.replace(/<\/div>\s*$/,seg+'</div>')};

/* ---------- 34. RETOUR SANS QUESTION ---------- */
leaveApp=function(){{const a=$('#askRI');if(a){a.remove();return}}closeApp();if(VSTACK.length){back();return}VSTACK=[];PANE=false;go('home',{},false)};

/* ---------- 35. SUJETS D.E : « Tous les sujets prépa D.E » et « Réviser les formules » ouvrent leur contenu (plus d'écran vide) ---------- */
openDE=function(id){const m=MATI[id];if(m&&m.rub==='formules'){go('formules',{});return}if(m&&m.rub==='sujexam'){go('prepall',{});return}if(m&&m.src&&(window.__APPF?window.__APPF[m.src]:document.getElementById('app-src-'+m.src))){S.lastMat=id;save();VSTACK=[];go('appview',{id});return}openMat(id)};
SCREENS.prepall={n:'Tous les sujets prépa D.E',hdr:()=>miniHeader(T('pa.small','🎓 Sujets préparation D.E'),T('pa.title','Tous les sujets prépa D.E')),blocks:['prepall.main']};
B('prepall.main','Tous les sujets prépa D.E',()=>{const m=MATI.xprepade;if(!m)return `<div class="empty">${T('fm.none','Bientôt disponible.')}</div>`;const by={};(m.ch||[]).forEach((c,i)=>{const p=String(c).split(' · '),k=p[0];(by[k]=by[k]||[]).push({i,l:p.slice(1).join(' · ')||c})});
 return Object.keys(by).map(k=>{const L=by[k].filter(x=>chFilOk('xprepade',x.i)),ids=(QBM.xprepade||[]).filter(q=>L.some(x=>x.i===q.c)).map(q=>q.id);if(!L.length)return'';
  return `<div class="secT">🎓 ${esc(k)}<span class="ln"></span><small class="sxc">${T('pa.n','{s} séries · {q} questions',{s:L.length,q:ids.length})}</small></div><button class="btn coral" onclick="startTimed('xprepade',shuffle(QBM.xprepade.filter(q=>${JSON.stringify(L.map(x=>x.i))}.includes(q.c)).map(q=>q.id)).slice(0,40),'${jsq('Prépa D.E · '+k)}')">${T('pm.blanc','⏱️ Examen blanc · 40 questions')}</button><div class="card sf">${L.map(x=>{const n=(QBM.xprepade||[]).filter(q=>q.c===x.i);return `<div class="li" onclick="go('dech',{id:'xprepade',c:${x.i}})"><span class="em">🎓</span><span class="tx"><b>${esc(x.l)}</b><small>${T('sx.n','{n} questions · {d} déjà faites',{n:n.length,d:n.filter(q=>S.qs[q.id]).length})}</small></span><span class="go">›</span></div>`}).join('')}</div>`}).join('')});

/* ---------- 36. GLOSSAIRE COMPACT ---------- */
/* (styles dans plus.css : terme et définition sur la même ligne, marges réduites) */

/* ---------- 37. SUJETS ET COURS PAR FILIÈRE (réglable dans l'éditeur) ---------- */
function chFil(mid,c){return((E.content||{}).chFil||{})[mid+':'+c]||null}
function chFilOk(mid,c){const f=chFil(mid,c);return!f||!S.fil||(!RO&&EDITMODE)||f.includes(S.fil)}
function chFilCycle(mid,c){const F=DATA.filieres.filter(f=>!f.like).map(f=>f.id),cur=chFil(mid,c);let nx;if(!cur)nx=[F[0]];else{const i=F.indexOf(cur[0]);nx=cur.length===1&&i+1<F.length?[F[i+1]]:null}
 E.content.chFil=E.content.chFil||{};if(nx)E.content.chFil[mid+':'+c]=nx;else delete E.content.chFil[mid+':'+c];edCommit('Filière du sujet');render()}
function chFilLab(mid,c){const f=chFil(mid,c);return f?f.join('/'):Tx('cf.all','Toutes filières')}
const _sxDomains1=sxDomains;sxDomains=function(){return _sxDomains1().map(d=>Object.assign({},d,{ex:d.ex.filter(x=>chFilOk(x.mid,x.c))})).filter(d=>d.mats.length||d.ex.length)};
const _go1=go;go=function(v,c){c=c||{};if(v==='dech'&&c.id!=null&&!chFilOk(c.id,c.c)){toast(Tx('cf.no','Ce sujet n’est pas proposé pour ta filière.'));return}return _go1.apply(this,arguments)};
function filAfter(){if(!edOn())return;$$('#app [onclick*="go(\'dech\'"]').forEach(el=>{if(el.querySelector('.rifil'))return;const d=(el.getAttribute('onclick')||'').match(/go\('dech',\{id:'([^']+)',c:(\d+)/);if(!d)return;const s=document.createElement('span');s.className='rifil';s.textContent='🎓 '+chFilLab(d[1],+d[2]);s.onclick=e=>{e.stopPropagation();chFilCycle(d[1],+d[2])};(el.querySelector('.tx')||el).appendChild(s)});
 if(VIEW==='matiere'&&ctx.id&&!$('#app .rimatfil')){const m=MATI[ctx.id],F=DATA.filieres.filter(f=>!f.like);const h=`<div class="cved rimatfil">${F.map(f=>`<button onclick="matFilToggle('${jsq(ctx.id)}','${jsq(f.id)}')">${(m.fil||[]).includes(f.id)?'✅':'⬜'} ${esc(f.e||'')} ${esc(f.id)}</button>`).join('')}<span class="muted small">${esc(Tx('cf.mat','Filières qui voient ce cours'))}</span></div>`;const b=$('#app [data-bid="matiere.badge"]');if(b)b.insertAdjacentHTML('afterbegin',h)}}
function matFilToggle(id,f){const m=MATI[id];let L=(m.fil||[]).slice();if(L.includes(f))L=L.filter(x=>x!==f);else L.push(f);if(!L.length){toast(Tx('cf.one','Garde au moins une filière'));return}E.content.mat=E.content.mat||{};E.content.mat[id]=Object.assign(E.content.mat[id]||{},{fil:L});edCommit('Filières du cours');applyContent();render()}

/* ---------- 38. MODIFIER N'IMPORTE QUEL TEXTE EN UN CLIC : texte, taille, gras, italique, souligné, couleur, police ---------- */
function tstyCss(){const M=(E.content||{}).tsty||{};let c='';Object.keys(M).forEach(k=>{const s=M[k],r=[];if(s.s&&s.s!==1)r.push('font-size:'+(s.s*100).toFixed(0)+'%!important');if(s.b!=null)r.push('font-weight:'+(s.b?900:400)+'!important');if(s.i!=null)r.push('font-style:'+(s.i?'italic':'normal')+'!important');if(s.u)r.push('text-decoration:underline!important');if(s.c)r.push('color:'+s.c+'!important');if(s.f)r.push('font-family:"'+String(s.f).replace(/["\\]/g,'')+'",system-ui,sans-serif!important');
 if(r.length)c+='[data-t="'+String(k).replace(/["\\]/g,'')+'"]{'+r.join(';')+'}'});let st=$('#ri-tsty');if(!st){st=document.createElement('style');st.id='ri-tsty';document.head.appendChild(st)}if(st.textContent!==c)st.textContent=c}
const RI_FONTS=['','Outfit','Poppins','Nunito','Montserrat','Lora','Merriweather','Georgia','Arial','Comic Sans MS','Courier New'];
function riText(k){const d=(TREG[k]||{}).d||'',cur=tget(k,d),M=((E.content||{}).tsty||{})[k]||{};let o=$('#riEd');if(o)o.remove();o=document.createElement('div');o.id='riEd';o.className='rkup';
 o.innerHTML=`<div class="rkbox riedbox"><div class="rkn" style="font-size:17px">✏️ ${esc(Tx('tx.h','Modifier le texte'))}</div><textarea id="rtT" rows="3">${esc(cur)}</textarea>
 <div class="rtrow"><button data-a="s-">A−</button><b id="rtS">${Math.round((M.s||1)*100)} %</b><button data-a="s+">A+</button><button data-a="b" class="${M.b?'on':''}"><b>G</b></button><button data-a="i" class="${M.i?'on':''}"><i>I</i></button><button data-a="u" class="${M.u?'on':''}"><u>S</u></button><input type="color" id="rtC" value="${esc(M.c||'#16231F')}" title="Couleur"></div>
 <select id="rtF">${RI_FONTS.map(f=>`<option value="${esc(f)}" ${(M.f||'')===f?'selected':''}>${esc(f||Tx('tx.f0','Police : celle de l’application'))}</option>`).join('')}</select>
 <div class="muted small" style="text-align:left">${esc(Tx('tx.o','Texte d’origine :'))} <i>${esc(d)}</i></div>
 <div class="row2" style="width:100%"><button class="btn coral" id="rtOk">${esc(Tx('ed.ok','Enregistrer'))}</button><button class="btn light" id="rtNo">${esc(Tx('ask.n','Annuler'))}</button></div><button class="btn ghost" id="rtRst">${esc(Tx('tx.rst','Rétablir l’original'))}</button>${window.PORTAIL_EDITOR?`<button class="btn ghost" id="rtAdv">${esc(Tx('tx.adv','Valeurs automatiques… (éditeur complet)'))}</button>`:''}</div>`;
 document.body.appendChild(o);const st=Object.assign({},M);let cset=!!M.c;
 $$('.rtrow button',o).forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='s-')st.s=Math.max(.5,Math.round(((st.s||1)-.1)*10)/10);if(a==='s+')st.s=Math.min(3,Math.round(((st.s||1)+.1)*10)/10);if(a==='b'){st.b=!st.b;b.classList.toggle('on',st.b)}if(a==='i'){st.i=!st.i;b.classList.toggle('on',st.i)}if(a==='u'){st.u=!st.u;b.classList.toggle('on',st.u)}$('#rtS',o).textContent=Math.round((st.s||1)*100)+' %'});
 $('#rtC',o).oninput=()=>{cset=true};$('#rtNo',o).onclick=()=>o.remove();
 $('#rtOk',o).onclick=()=>{const v=$('#rtT',o).value;E.texts=E.texts||{};if(v===d)delete E.texts[k];else E.texts[k]=v;st.c=cset?$('#rtC',o).value:null;st.f=$('#rtF',o).value||null;Object.keys(st).forEach(x=>{if(st[x]==null||st[x]===false||(x==='s'&&st[x]===1))delete st[x]});E.content.tsty=E.content.tsty||{};if(Object.keys(st).length)E.content.tsty[k]=st;else delete E.content.tsty[k];edCommit('Texte « '+k+' » modifié');o.remove();render()};
 $('#rtRst',o).onclick=()=>{if(E.texts)delete E.texts[k];if(E.content.tsty)delete E.content.tsty[k];edCommit('Texte rétabli');o.remove();render()};
 const adv=$('#rtAdv',o);if(adv)adv.onclick=()=>{o.remove();try{window.PORTAIL_EDITOR.textModal&&window.PORTAIL_EDITOR.textModal(k)}catch(e){}}}
document.addEventListener('click',e=>{if(!edOn()||(typeof RIPICK!=='undefined'&&RIPICK))return;const t=e.target.closest&&e.target.closest('[data-t]');if(!t||t.closest('.ed-panel,.ed-ov,.ed-bar,.ed-tb,.ed-tt,#riEd,#askRI'))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();riText(t.dataset.t)},true);

/* ---------- 39. VOLETS « LIENS » (YouTube, WhatsApp, Telegram, Facebook, site) et raccourcis vers une appli complète ---------- */
const LKIC={yt:'▶️',wa:'💬',tg:'✈️',fb:'📘',tt:'🎵',url:'🔗',app:'📱',mat:'📚'};
const _custHTML0=custHTML;custHTML=function(c,k){if(c.type!=='links')return _custHTML0.apply(this,arguments);const L=c.items||[];
 return `<div class="card sf">${c.title?`<h3>${esc((c.emo?c.emo+' ':'')+c.title)}</h3>`:''}${L.length?L.map((x,i)=>`<button class="li rilk" onclick="riLinkGo('${jsq(k)}',${i})"><span class="em">${LKIC[x.k]||'🔗'}</span><span class="tx"><b>${esc(x.l||x.u)}</b>${x.s?`<small>${esc(x.s)}</small>`:''}</span><span class="go">›</span></button>`).join(''):`<div class="empty">${T('lk.none','Aucun lien pour le moment.')}</div>`}${edOn()?`<button class="btn light" onclick="riLinksModal('${jsq(k)}')">✏️ ${esc(Tx('lk.ed','Modifier les liens'))}</button>`:''}</div>`};
function riLinkGo(k,i){const x=(((E.custom||{})[k]||{}).items||[])[i];if(!x)return;if(edOn()){riLinksModal(k);return}if(x.k==='app'){openDE(x.u);return}if(x.k==='mat'){openMat(x.u);return}if(x.k==='yt'&&typeof playYt==='function'){if(playYt(x.u,x.l||'')===false)return}window.open(x.u,'_blank','noopener')}
const _custGo0=custGo;custGo=function(k){const c=(E.custom||{})[k];if(c&&String(c.go||'').startsWith('app:')){openDE(c.go.slice(4));return}return _custGo0.apply(this,arguments)};
function riLinksModal(k){const isNew=!k||!(E.custom||{})[k];const c=isNew?{type:'links',title:Tx('lk.t0','Liens utiles'),emo:'🔗',items:[]}:clone(E.custom[k]);let o=$('#riEd');if(o)o.remove();o=document.createElement('div');o.id='riEd';o.className='rkup';
 const apps=MAT.filter(m=>m.src&&!m.rub),opt=(x)=>[['yt','▶️ YouTube'],['wa','💬 WhatsApp (chaîne ou groupe)'],['tg','✈️ Telegram'],['fb','📘 Facebook'],['tt','🎵 TikTok'],['url','🔗 Autre site'],['app','📱 Application complète'],['mat','📚 Cours du portail']].map(t=>`<option value="${t[0]}" ${x.k===t[0]?'selected':''}>${t[1]}</option>`).join('');
 const row=(x,i)=>`<div class="rilkr" data-i="${i}"><select data-f="k">${opt(x)}</select><input data-f="l" placeholder="${esc(Tx('lk.l','Titre affiché'))}" value="${esc(x.l||'')}"><input data-f="u" placeholder="${esc(Tx('lk.u','Adresse https://… (ou choisis un cours / une appli)'))}" value="${esc(x.u||'')}" list="rilkd"><input data-f="s" placeholder="${esc(Tx('lk.s','Petite description (facultatif)'))}" value="${esc(x.s||'')}"><div class="rtrow"><button data-m="-1">↑</button><button data-m="1">↓</button><button data-d="1">🗑</button></div></div>`;
 const draw=()=>{o.innerHTML=`<div class="rkbox riedbox"><div class="rkn" style="font-size:17px">🔗 ${esc(Tx('lk.h','Volet de liens'))}</div><label class="riedl">${esc(Tx('lk.ti','Titre du volet'))}<input id="lkT" value="${esc(c.title||'')}"></label>
  <datalist id="rilkd">${apps.map(m=>`<option value="${esc(m.id)}">📱 ${esc(m.short)}</option>`).join('')}${MAT.map(m=>`<option value="${esc(m.id)}">📚 ${esc(m.short)}</option>`).join('')}</datalist>
  <div id="lkL">${c.items.map(row).join('')}</div><button class="btn light" id="lkAdd">＋ ${esc(Tx('lk.add','Ajouter un lien'))}</button>
  <div class="row2" style="width:100%"><button class="btn coral" id="lkOk">${esc(Tx('ed.ok','Enregistrer'))}</button><button class="btn light" id="lkNo">${esc(Tx('ask.n','Annuler'))}</button></div>${isNew?'':`<button class="btn ghost" id="lkDel">🗑 ${esc(Tx('lk.del','Supprimer ce volet'))}</button>`}</div>`;
  const sync=()=>{c.title=$('#lkT',o).value;$$('.rilkr',o).forEach(r=>{const i=+r.dataset.i;$$('[data-f]',r).forEach(f=>c.items[i][f.dataset.f]=f.value.trim())})};
  $('#lkAdd',o).onclick=()=>{sync();c.items.push({k:'yt',l:'',u:''});draw()};$('#lkNo',o).onclick=()=>o.remove();
  $$('.rilkr',o).forEach(r=>{const i=+r.dataset.i;$$('[data-m]',r).forEach(b=>b.onclick=()=>{sync();const j=i+(+b.dataset.m);if(j<0||j>=c.items.length)return;[c.items[i],c.items[j]]=[c.items[j],c.items[i]];draw()});$('[data-d]',r).onclick=()=>{sync();c.items.splice(i,1);draw()}});
  $('#lkOk',o).onclick=()=>{sync();c.items=c.items.filter(x=>x.u);const bad=c.items.find(x=>!['app','mat'].includes(x.k)&&!/^(https?:|mailto:|tel:)/.test(x.u));if(bad){toast(Tx('lk.bad','Adresse invalide : elle doit commencer par https://'));return}
   const key=isNew?Date.now().toString(36):k;E.custom=E.custom||{};E.custom[key]=c;if(isNew){if(!E.layout)E.layout={};const sc=SCREENS[VIEW]&&!SCREENS[VIEW].ctx?VIEW:'home';if(!Array.isArray(E.layout[sc]))E.layout[sc]=layoutOf(sc).map(b=>Object.assign({},b));E.layout[sc].push({id:'cust.'+key,inst:'cust.'+key})}edCommit(isNew?'Volet de liens ajouté':'Liens modifiés');o.remove();render()};
  const dl=$('#lkDel',o);if(dl)dl.onclick=()=>askRI(Tx('lk.delq','Supprimer ce volet de liens ?'),()=>{delete E.custom[k];Object.keys(E.layout||{}).forEach(sc=>{if(Array.isArray(E.layout[sc]))E.layout[sc]=E.layout[sc].filter(b=>b.id!=='cust.'+k)});edCommit('Volet supprimé');o.remove();render()},Tx('ed.del2','Supprimer'),Tx('ask.n','Annuler'))};
 document.body.appendChild(o);draw()}
/* barre d'ajout rapide sur chaque écran en mode édition */
function addBarAfter(){if(!edOn()||$('#app .riaddbar'))return;const sp=SCREENS[VIEW];if(!sp||sp.raw||sp.onb)return;$('#app').insertAdjacentHTML('beforeend',`<div class="riaddbar"><button onclick="riLinksModal()">🔗 ${esc(Tx('ad.l','Ajouter des liens (YouTube, WhatsApp…)'))}</button>${window.PORTAIL_custModal?`<button onclick="PORTAIL_custModal()">🧩 ${esc(Tx('ad.v','Ajouter un volet (texte, image, bouton)'))}</button>`:''}<button onclick="riMoveMat()">🗂️ ${esc(Tx('ad.g','Déplacer / dupliquer un cours'))}</button></div>`)}

/* ---------- 40. DÉPLACER OU DUPLIQUER UN GROUPE, UN SOUS-GROUPE OU UN COURS ---------- */
function G0e(){if(!Array.isArray(E.content.groups)||!E.content.groups.length)E.content.groups=clone(DATA0.groups||[]);return E.content.groups}
function riMoveMat(mid){const G=G0e(),m=mid?MATI[mid]:null;let o=$('#riEd');if(o)o.remove();o=document.createElement('div');o.id='riEd';o.className='rkup';
 const dest=G.map((g,gi)=>g.subs.map((s,si)=>`<option value="${gi}|${si}">${esc(g.n+(s.n?' › '+s.n:''))}</option>`).join('')).join('');
 o.innerHTML=`<div class="rkbox riedbox"><div class="rkn" style="font-size:17px">🗂️ ${esc(Tx('mv.h','Ranger les cours'))}</div>
 <label class="riedl">${esc(Tx('mv.c','Cours'))}<select id="mvC">${MAT.filter(x=>!x.rub).map(x=>`<option value="${esc(x.id)}" ${m&&m.id===x.id?'selected':''}>${esc(x.emo+' '+x.short)}</option>`).join('')}</select></label>
 <label class="riedl">${esc(Tx('mv.d','Vers'))}<select id="mvD">${dest}<option value="new">＋ ${esc(Tx('mv.new','Nouveau groupe…'))}</option></select></label><input id="mvN" placeholder="${esc(Tx('mv.nn','Nom du nouveau groupe'))}" style="display:none">
 <div class="row2" style="width:100%"><button class="btn coral" id="mvMove">⇄ ${esc(Tx('mv.mv','Déplacer'))}</button><button class="btn light" id="mvDup">⧉ ${esc(Tx('mv.dup','Dupliquer ici aussi'))}</button></div>
 <div class="rkn" style="font-size:15px;margin-top:10px">${esc(Tx('mv.go','Ordre des groupes'))}</div><div id="mvG">${G.map((g,gi)=>`<div class="rilkr" style="display:flex;align-items:center;gap:6px"><b style="flex:1;text-align:left">${esc((g.e||'')+' '+g.n)}</b><button data-gi="${gi}" data-m="-1">↑</button><button data-gi="${gi}" data-m="1">↓</button><button data-gd="${gi}" title="Dupliquer le groupe">⧉</button></div>`).join('')}</div>
 <button class="btn light" id="mvX">${esc(Tx('ask.close','Fermer'))}</button></div>`;
 document.body.appendChild(o);const D=$('#mvD',o),N=$('#mvN',o);D.onchange=()=>{N.style.display=D.value==='new'?'':'none'};$('#mvX',o).onclick=()=>o.remove();
 const target=()=>{if(D.value==='new'){const n=N.value.trim();if(!n){toast(Tx('mv.nn','Nom du nouveau groupe'));return null}G.push({id:'g'+Date.now().toString(36),n:n.toUpperCase(),e:'📁',col:'#6B7B76',subs:[{id:'s'+Date.now().toString(36),n:'',mats:[]}]});return G[G.length-1].subs[0]}const[gi,si]=D.value.split('|').map(Number);return G[gi].subs[si]};
 $('#mvMove',o).onclick=()=>{const id=$('#mvC',o).value,t=target();if(!t)return;G.forEach(g=>g.subs.forEach(s=>s.mats=s.mats.filter(x=>x!==id)));t.mats.push(id);E.content.matDup=(E.content.matDup||[]).filter(d=>d.id!==id);edCommit('Cours déplacé');o.remove();render();toast('⇄ '+Tx('mv.ok','Cours déplacé'))};
 $('#mvDup',o).onclick=()=>{const id=$('#mvC',o).value,t=target();if(!t)return;E.content.matDup=(E.content.matDup||[]).concat([{id,s:t.id}]);edCommit('Cours dupliqué');o.remove();render();toast('⧉ '+Tx('mv.dok','Cours ajouté aussi dans ce groupe'))};
 $$('[data-gi]',o).forEach(b=>b.onclick=()=>{const i=+b.dataset.gi,j=i+(+b.dataset.m);if(j<0||j>=G.length)return;[G[i],G[j]]=[G[j],G[i]];edCommit('Ordre des groupes');o.remove();render();riMoveMat(mid)});
 $$('[data-gd]',o).forEach(b=>b.onclick=()=>{const g=clone(G[+b.dataset.gd]);g.id='g'+Date.now().toString(36);g.n=g.n+' (copie)';g.subs.forEach(s=>s.id='s'+Math.random().toString(36).slice(2,8));G.splice(+b.dataset.gd+1,0,g);
  g.subs.forEach(s=>{s.mats.forEach(id=>E.content.matDup=(E.content.matDup||[]).concat([{id,s:s.id}]));s.mats=[]});edCommit('Groupe dupliqué');o.remove();render();riMoveMat(mid)})}
/* un cours dupliqué apparaît aussi dans le sous-groupe choisi */
const _groups2=groups;groups=function(){const G=_groups2.apply(this,arguments);const D=(E.content||{}).matDup||[];const RAW=(E.content&&Array.isArray(E.content.groups))?E.content.groups:[];
 D.forEach(d=>{if(!MATI[d.id])return;let hit=false;G.forEach(g=>(g.subs||[]).forEach(s=>{if(s.id===d.s){hit=true;if(!s.mats.includes(d.id))s.mats.push(d.id)}}));
  if(!hit){const ri=RAW.findIndex(g=>(g.subs||[]).some(s=>s.id===d.s));if(ri<0)return;let g=G.find(x=>x.id===RAW[ri].id);if(!g){g=clone(RAW[ri]);g.subs.forEach(s=>s.mats=[]);let pos=0;for(let i=0;i<ri;i++){const j=G.findIndex(x=>x.id===RAW[i].id);if(j>=0)pos=j+1}G.splice(pos,0,g)}const s=g.subs.find(x=>x.id===d.s);if(s&&!s.mats.includes(d.id))s.mats.push(d.id)}});return G};
function grpEdAfter(){if(!edOn()||VIEW!=='matieres')return;$$('#app [onclick*="openMat("]').forEach(el=>{if(el.querySelector('.rimv'))return;const m=(el.getAttribute('onclick')||'').match(/openMat\('([^']+)'/);if(!m)return;const b=document.createElement('span');b.className='rimv';b.textContent='🗂️';b.title='Déplacer / dupliquer';b.onclick=e=>{e.stopPropagation();riMoveMat(m[1])};el.appendChild(b)})}

/* ---------- 41. APPLICATIONS COMPLÈTES : modifier, masquer, styliser n'importe quel élément ; copier un passage sur l'accueil ---------- */
function appStyCss(mid){const M=(((E.content||{}).appSty||{})[mid])||{};let c='';Object.keys(M).forEach(sel=>{const s=M[sel],r=[];if(s.h)r.push('display:none!important');if(s.s&&s.s!==1)r.push('font-size:'+(s.s*100).toFixed(0)+'%!important');if(s.b!=null)r.push('font-weight:'+(s.b?900:400)+'!important');if(s.i!=null)r.push('font-style:'+(s.i?'italic':'normal')+'!important');if(s.c)r.push('color:'+s.c+'!important');if(s.f)r.push('font-family:"'+String(s.f).replace(/["\\]/g,'')+'",system-ui!important');if(r.length)c+=sel+'{'+r.join(';')+'}'});return c}
const _appExtra4=appExtra;appExtra=function(m,src){const r=_appExtra4(m,src);r.css+=appStyCss(m.id);if(!RO)r.js+='<script>('+appElPick.toString()+')()<'+'/script>';return r};
function appElPick(){var on=false;window.__riPick=function(v){on=v;document.documentElement.classList.toggle('ri-pick',v)};
 function path(el){var p=[];while(el&&el.nodeType===1&&el!==document.body){var s=el.tagName.toLowerCase();if(el.id&&!/\d{3,}/.test(el.id)){p.unshift('#'+CSS.escape(el.id));break}var cl=[].slice.call(el.classList).filter(function(c){return!/^(on|active|open|hidden|show|sel|ri-)/.test(c)}).slice(0,2);if(cl.length)s+='.'+cl.map(CSS.escape).join('.');var i=1,x=el;while(x=x.previousElementSibling)if(x.tagName===el.tagName)i++;s+=':nth-of-type('+i+')';p.unshift(s);el=el.parentElement}return(p[0]&&p[0][0]==='#'?'':'body>')+p.join('>')}
 var st=document.createElement('style');st.textContent='.ri-pick body *:hover{outline:2px dashed #E8772E!important;outline-offset:1px;cursor:pointer}';document.head.appendChild(st);
 document.addEventListener('click',function(e){if(!on)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();var el=e.target;try{parent.riAppPicked(path(el),el.innerText.slice(0,400),el.innerHTML.length<20000?el.innerHTML:'')}catch(x){}},true)}
let APPPICK=false;
function riAppPickToggle(){const f=$('#appFrame')||$('#appKeep');APPPICK=!APPPICK;try{f.contentWindow.__riPick(APPPICK)}catch(e){}const b=$('#riPickBtn');if(b){b.classList.toggle('on',APPPICK);b.textContent=APPPICK?'✔ '+Tx('pk.end','Terminer'):'🧩 '+Tx('pk.b','Éléments')}toast(APPPICK?Tx('pk.t','Touche un élément de l’application : le modifier, le masquer, l’agrandir…'):Tx('pk.done','Modifications enregistrées'),3000)}
function riAppPicked(sel,txt,html){const mid=ctx.id;const A=E.content.appSty=E.content.appSty||{},M=A[mid]=A[mid]||{},s=Object.assign({},M[sel]||{});let o=$('#riEd');if(o)o.remove();o=document.createElement('div');o.id='riEd';o.className='rkup';
 o.innerHTML=`<div class="rkbox riedbox"><div class="rkn" style="font-size:17px">🧩 ${esc(Tx('pk.h','Élément de l’application'))}</div><div class="muted small" style="text-align:left;max-height:90px;overflow:auto">${esc(txt||'(sans texte)')}</div>
 <div class="rtrow"><button data-a="s-">A−</button><b id="pkS">${Math.round((s.s||1)*100)} %</b><button data-a="s+">A+</button><button data-a="b" class="${s.b?'on':''}"><b>G</b></button><button data-a="i" class="${s.i?'on':''}"><i>I</i></button><input type="color" id="pkC" value="${esc(s.c||'#16231F')}"></div>
 <select id="pkF">${RI_FONTS.map(f=>`<option value="${esc(f)}" ${(s.f||'')===f?'selected':''}>${esc(f||Tx('tx.f0','Police : celle de l’application'))}</option>`).join('')}</select>
 <div class="row2" style="width:100%"><button class="btn coral" id="pkOk">${esc(Tx('ed.ok','Enregistrer'))}</button><button class="btn light" id="pkNo">${esc(Tx('ask.n','Annuler'))}</button></div>
 <button class="btn light" id="pkHide">${s.h?'👁 '+esc(Tx('pk.show','Réafficher cet élément')):'🙈 '+esc(Tx('pk.hide','Masquer / supprimer cet élément'))}</button>
 <button class="btn light" id="pkCopy">📋 ${esc(Tx('pk.copy','Copier sur l’accueil de Révision INFAS'))}</button><button class="btn ghost" id="pkTxt">✏️ ${esc(Tx('pk.txt','Modifier le texte (mode ✏️ Modifier)'))}</button><button class="btn ghost" id="pkRst">${esc(Tx('tx.rst','Rétablir l’original'))}</button></div>`;
 document.body.appendChild(o);let cset=!!s.c;
 $$('.rtrow button',o).forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='s-')s.s=Math.max(.4,Math.round(((s.s||1)-.1)*10)/10);if(a==='s+')s.s=Math.min(3,Math.round(((s.s||1)+.1)*10)/10);if(a==='b'){s.b=!s.b;b.classList.toggle('on',s.b)}if(a==='i'){s.i=!s.i;b.classList.toggle('on',s.i)}$('#pkS',o).textContent=Math.round((s.s||1)*100)+' %'});
 $('#pkC',o).oninput=()=>{cset=true};const put=x=>{Object.keys(x).forEach(k=>{if(x[k]==null||x[k]===false||(k==='s'&&x[k]===1))delete x[k]});if(Object.keys(x).length)M[sel]=x;else delete M[sel];edCommit('Appli complète : élément modifié');o.remove();riAppRestyle()};
 $('#pkOk',o).onclick=()=>{s.c=cset?$('#pkC',o).value:null;s.f=$('#pkF',o).value||null;put(s)};$('#pkNo',o).onclick=()=>o.remove();$('#pkHide',o).onclick=()=>{s.h=!s.h;put(s)};$('#pkRst',o).onclick=()=>put({});
 $('#pkTxt',o).onclick=()=>{o.remove();if(APPPICK)riAppPickToggle();try{window.PORTAIL_EDITOR.appEdit()}catch(e){}};
 $('#pkCopy',o).onclick=()=>{const key=Date.now().toString(36);E.custom=E.custom||{};const clean=String(html||esc(txt)).replace(/<script[\s\S]*?<\/script>/gi,'').replace(/\son\w+="[^"]*"/gi,'');E.custom[key]={type:'note',title:matOf(mid).short,emo:matOf(mid).emo,col:matOf(mid).col,html:clean};if(!E.layout)E.layout={};if(!Array.isArray(E.layout.home))E.layout.home=layoutOf('home').map(b=>Object.assign({},b));E.layout.home.splice(1,0,{id:'cust.'+key,inst:'cust.'+key});edCommit('Contenu copié sur l’accueil');o.remove();toast(Tx('pk.cok','📋 Copié sur l’accueil (déplaçable avec les outils du bloc)'))}}
function riAppRestyle(){const f=$('#appFrame')||$('#appKeep');try{const d=f.contentDocument;let st=d.getElementById('ri-appsty');if(!st){st=d.createElement('style');st.id='ri-appsty';d.head.appendChild(st)}st.textContent=appStyCss(ctx.id)}catch(e){}}
function pickBtnAfter(){if(!edOn()||VIEW!=='appview')return;const bar=$('.appbar');if(bar&&!$('#riPickBtn')){const b=document.createElement('button');b.id='riPickBtn';b.className='appedit';b.textContent='🧩 '+Tx('pk.b','Éléments');b.onclick=riAppPickToggle;const eb=$('#appEditBtn');(eb?eb.parentNode:bar).insertBefore(b,eb||null);APPPICK=false}}

/* ---------- 42. CORRECTION NATIONALE (et dernière appli ouverte) : ouverture instantanée ----------
   L'appli est préparée en arrière-plan dans un cadre gardé en mémoire ; à l'ouverture on l'affiche directement,
   et on la retrouve là où on l'avait laissée. */
const KEEP_IDS=['xmvkq4zed'];let KEEP=null;/* {mid,sig,el,ready} */
function keepSig(mid){try{return JSON.stringify([palette(),S.fz||1,E.gts||1,appUiOf(mid),S.night||'',(E.content||{}).appSty&&E.content.appSty[mid]||0,((E.content||{}).appTxt||{})[mid]||0,RO,EDITMODE])}catch(e){return''}}
function keepEl(){let f=$('#appKeep');if(!f){f=document.createElement('iframe');f.id='appKeep';f.className='appkeep';f.title='app';document.body.appendChild(f)}return f}
function keepPrepare(mid){if(!MATI[mid]||VIEW==='appview')return;const sig=keepSig(mid);if(KEEP&&KEEP.mid===mid&&KEEP.sig===sig)return;
 const f=keepEl();f.classList.remove('on');KEEP={mid,sig,el:f,ready:false};const oc=ctx;ctx={id:mid};f.id='appFrame';const ld=document.createElement('div');ld.id='appLoad';ld.style.display='none';document.body.appendChild(ld);
 try{appViewAfter()}catch(e){}ctx=oc;let n=0;const t=setInterval(()=>{n++;if(f.getAttribute('srcdoc')||n>400){clearInterval(t);f.id='appKeep';const l=$('#appLoad');if(l&&l.parentNode===document.body)l.remove();f.onload=()=>{if(KEEP&&KEEP.el===f)KEEP.ready=true};if(f.getAttribute('srcdoc'))setTimeout(()=>{if(KEEP&&KEEP.el===f)KEEP.ready=true},4000)}},25)}
function keepPlace(){const f=KEEP&&KEEP.el,w=$('.appwrap');if(!f||!w)return;const r=w.getBoundingClientRect();let top=r.top;$$('.appwrap > *').forEach(x=>{if(x.id==='appFrame'||x.id==='appLoad'||x.classList.contains('appframe'))return;const b=x.getBoundingClientRect();if(b.height&&b.bottom>top)top=b.bottom});
 f.style.top=top+'px';f.style.left=r.left+'px';f.style.width=r.width+'px';f.style.height=Math.max(100,r.bottom-top)+'px'}
/* à l'ouverture d'une appli gardée : on affiche le cadre déjà prêt au lieu de recharger */
const _render9=render;render=function(){const was=VIEW==='appview'&&KEEP&&KEEP.mid===(ctx&&ctx.id);_render9.apply(this,arguments);
 if(VIEW==='appview'&&ctx&&ctx.id&&KEEP&&KEEP.mid===ctx.id&&KEEP.sig===keepSig(ctx.id)&&!edOn()&&!window.__axQ2){const nf=$('#appFrame');if(nf&&nf!==KEEP.el)nf.remove();const l=$('#appLoad');if(l)l.remove();KEEP.el.classList.add('on');try{KEEP.el.contentWindow.__riNavReset&&KEEP.el.contentWindow.__riNavReset()}catch(e){}keepPlace();requestAnimationFrame(keepPlace);setTimeout(keepPlace,120)}
 else if(KEEP&&KEEP.el){KEEP.el.classList.remove('on')}};
window.addEventListener('resize',()=>{if(KEEP&&KEEP.el&&KEEP.el.classList.contains('on'))keepPlace()});
/* l'appli gardée reçoit les onglets et l'outil d'édition comme une appli normale */
const _riAppNav0=riAppNav;riAppNav=function(i){if(KEEP&&KEEP.el&&KEEP.el.classList.contains('on')&&VIEW==='appview'){try{KEEP.el.contentWindow.__riNav(i)}catch(e){}return}return _riAppNav0.apply(this,arguments)};
/* fermer l'appli ne la vide pas si elle est gardée */
const _closeApp0=closeApp;closeApp=function(){const f=$('#appFrame');if(f&&KEEP&&f===KEEP.el)return;if(KEEP&&KEEP.el)KEEP.el.classList.remove('on');return _closeApp0.apply(this,arguments)};
/* préparation en arrière-plan : Correction nationale dès le démarrage (bonne connexion), puis à chaque changement de réglage */
(function(){const run=()=>{try{if(VIEW!=='appview'&&S.onb&&fastNet())KEEP_IDS.forEach(keepPrepare)}catch(e){}};if('requestIdleCallback'in window)requestIdleCallback(()=>setTimeout(run,2500));else setTimeout(run,4000);setInterval(()=>{if(VIEW!=='appview'&&KEEP&&KEEP.sig!==keepSig(KEEP.mid))run()},5000)})();

/* ---------- 43. ÉDITION PARTOUT : actions des fiches (quiz, résumés, flashcards, appli…) une par une ; n'importe quel élément ou texte ---------- */
function actKey(p){const m=p.match(/(?:go\('(\w+)'|openMat\('(\w+)'|openDE\('(\w+)')/);return m?(m[1]||('mat:'+(m[2]||m[3]))):''}
function actCfg(){return(E.content||{}).actCfg||{}}
function actHidden(mid,k){const C=actCfg(),g=(C._||{}).hide||[],l=((C[mid]||{}).hide)||[];return g.includes(k)||l.includes(k)}
const _matAct9=BLK['matiere.actions'].html;BLK['matiere.actions'].html=function(){const h=_matAct9.apply(this,arguments),mid=ctx.id,ed=edOn();const C=actCfg(),ord=((C._||{}).order)||[];
 let parts=h.split(/(?=<button class="act)/).filter(Boolean);parts=parts.map(p=>({p,k:actKey(p)}));
 if(ord.length)parts.sort((a,b)=>{const i=ord.indexOf(a.k),j=ord.indexOf(b.k);return(i<0?99:i)-(j<0?99:j)});
 return parts.map((x,i)=>{const hid=x.k&&actHidden(mid,x.k);if(hid&&!ed)return'';if(!ed||!x.k)return x.p;
  const tb=`<span class="riacttb"><span onclick="event.stopPropagation();actMove('${jsq(x.k)}',-1)">↑</span><span onclick="event.stopPropagation();actMove('${jsq(x.k)}',1)">↓</span><span onclick="event.stopPropagation();actHide('${jsq(mid)}','${jsq(x.k)}',0)">${actHidden(mid,x.k)&&((C[mid]||{}).hide||[]).includes(x.k)?'👁 ce cours':'🙈 ce cours'}</span><span onclick="event.stopPropagation();actHide('${jsq(mid)}','${jsq(x.k)}',1)">${((C._||{}).hide||[]).includes(x.k)?'👁 partout':'🙈 partout'}</span></span>`;
  return x.p.replace(/<button class="act/,'<button class="act'+(hid?' acthid':'')).replace(/<\/button>\s*$/,tb+'</button>')}).join('')};
function actHide(mid,k,all){E.content.actCfg=E.content.actCfg||{};const key=all?'_':mid,o=E.content.actCfg[key]=E.content.actCfg[key]||{};o.hide=o.hide||[];if(o.hide.includes(k))o.hide=o.hide.filter(x=>x!==k);else o.hide.push(k);edCommit('Action de la fiche '+(o.hide.includes(k)?'masquée':'réaffichée'));render()}
function actMove(k,d){E.content.actCfg=E.content.actCfg||{};const o=E.content.actCfg._=E.content.actCfg._||{};const cur=$$('#app [data-bid="matiere.actions"] .act').map(b=>actKey(b.getAttribute('onclick')||'')).filter(Boolean);const L=(o.order&&o.order.length?o.order.filter(x=>cur.includes(x)).concat(cur.filter(x=>!o.order.includes(x))):cur).slice();const i=L.indexOf(k),j=i+d;if(i<0||j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]];o.order=L;edCommit('Ordre des actions');render()}

/* textes de n'importe où : remplacement d'un texte affiché par un autre (appliqué après chaque affichage) */
function riTxtApply(){const R=(E.content||{}).riTxt;if(!R||!Object.keys(R).length)return;['#app','#side','#nav'].forEach(sel=>{const root=$(sel);if(!root)return;const w=document.createTreeWalker(root,4);let n;while(n=w.nextNode()){const v=n.nodeValue,k=v.trim();if(k&&R[k]!=null&&!n.parentElement.closest('.ed-tb,#riEd,textarea,input')){n.__o=n.__o||k;n.nodeValue=v.replace(k,R[k])}}})}
/* styles par élément (masquer, taille, gras, italique, couleur, police) */
function riStyCss(){const M=(E.content||{}).riSty||{};let c='';Object.keys(M).forEach(sel=>{const s=M[sel],r=[];if(s.h)r.push('display:none!important');if(s.s&&s.s!==1)r.push('font-size:'+(s.s*100).toFixed(0)+'%!important');if(s.b!=null)r.push('font-weight:'+(s.b?900:400)+'!important');if(s.i!=null)r.push('font-style:'+(s.i?'italic':'normal')+'!important');if(s.c)r.push('color:'+s.c+'!important');if(s.bg)r.push('background:'+s.bg+'!important');if(s.f)r.push('font-family:"'+String(s.f).replace(/["\\]/g,'')+'",system-ui!important');
 if(r.length)c+=(s.h&&edOn()?sel+'{opacity:.35!important;outline:2px dashed #d33!important}':sel+'{'+r.join(';')+'}')});let st=$('#ri-sty');if(!st){st=document.createElement('style');st.id='ri-sty';document.head.appendChild(st)}const out=edOn()?c.replace(/display:none!important;?/g,''):c;if(st.textContent!==out)st.textContent=out}
function riPath(el,all){const sec=el.closest('section[data-inst]');let p=[];let x=el;while(x&&x!==sec&&x.nodeType===1&&x.id!=='app'){let s=x.tagName.toLowerCase();const cl=[].slice.call(x.classList).filter(c=>!/^(on|active|open|sel|ri|soon|lic|cv|acthid|hide)/.test(c)).slice(0,2);if(cl.length)s+='.'+cl.map(CSS.escape).join('.');let i=1,y=x;while(y=y.previousElementSibling)if(y.tagName===x.tagName&&!y.matches('.ed-tb,.ed-tt,.rimatfil,.cved,.riedq,.riaddbar,.riacttb,.soonov,.rifil,.rimv'))i++;s+=':nth-of-type('+i+')';p.unshift(s);x=x.parentElement}
 const q=v=>String(v).replace(/["\\]/g,'\\$&');const base='body[data-view="'+q(VIEW)+'"]'+(!all&&ctx&&ctx.id?'[data-ctx="'+q(ctx.id)+'"]':'')+' '+(sec?'section[data-inst="'+q(sec.dataset.inst)+'"]':'#app');return base+(p.length?'>'+p.join('>'):'')}
let RIPICK=false;
function riPickToggle(){RIPICK=!RIPICK;document.body.classList.toggle('ri-pick',RIPICK);const b=$('#edPick');if(b){b.classList.toggle('on',RIPICK);b.textContent=RIPICK?'✔ 🧩':'🧩'}toast(RIPICK?Tx('pk.t2','🧩 Touche n’importe quel élément : le masquer, changer son texte, sa taille, sa couleur…'):Tx('pk.done','Modifications enregistrées'),3500)}
document.addEventListener('click',e=>{if(!RIPICK||!edOn())return;const el=e.target;if(el.closest('.ed-bar,.ed-panel,.ed-ov,#riEd,#askRI,.ed-tb,#nav .ed-x'))return;if(!el.closest('#app,#side'))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();riElEdit(el)},true);
function riElEdit(el){let tn=null;const w=document.createTreeWalker(el,4);let n;while(n=w.nextNode()){if(n.nodeValue.trim()){tn=n;break}}const orig=tn?(tn.__o||tn.nodeValue.trim()):'';const R=(E.content.riTxt=E.content.riTxt||{});
 let o=$('#riEd');if(o)o.remove();o=document.createElement('div');o.id='riEd';o.className='rkup';const selOne=riPath(el,false),selAll=riPath(el,true),M=(E.content.riSty=E.content.riSty||{});let s=Object.assign({},M[selOne]||M[selAll]||{});
 o.innerHTML=`<div class="rkbox riedbox"><div class="rkn" style="font-size:17px">🧩 ${esc(Tx('pk.h2','Élément'))}</div>${tn?`<label class="riedl">${esc(Tx('pk.tx','Texte'))}<textarea id="peT" rows="2">${esc(R[orig]!=null?R[orig]:orig)}</textarea></label>`:''}
 <div class="rtrow"><button data-a="s-">A−</button><b id="peS">${Math.round((s.s||1)*100)} %</b><button data-a="s+">A+</button><button data-a="b" class="${s.b?'on':''}"><b>G</b></button><button data-a="i" class="${s.i?'on':''}"><i>I</i></button><input type="color" id="peC" value="${esc(s.c||'#16231F')}"></div>
 <select id="peF">${RI_FONTS.map(f=>`<option value="${esc(f)}" ${(s.f||'')===f?'selected':''}>${esc(f||Tx('tx.f0','Police : celle de l’application'))}</option>`).join('')}</select>
 ${ctx&&ctx.id?`<label class="riedl" style="font-weight:600"><input type="checkbox" id="peAll" style="width:auto;display:inline"> ${esc(Tx('pk.all','Appliquer à toutes les matières (même écran)'))}</label>`:''}
 <div class="row2" style="width:100%"><button class="btn coral" id="peOk">${esc(Tx('ed.ok','Enregistrer'))}</button><button class="btn light" id="peNo">${esc(Tx('ask.n','Annuler'))}</button></div>
 ${(()=>{const big=el.parentElement&&el.parentElement.closest('.li,.act,.tile,.card,button,.chip,.sxm,.gsi,.ou-pill,.ou-tile,.glchips>button,.lic,section>*');return big&&big!==el&&!big.matches('section')?'<button class="btn light" id="peUp">⬆ '+esc(Tx('pk.up','Prendre l’élément entier (ligne, carte, bouton)'))+'</button>':''})()}
 <button class="btn light" id="peHide">${s.h?'👁 '+esc(Tx('pk.show','Réafficher cet élément')):'🙈 '+esc(Tx('pk.hide','Masquer / supprimer cet élément'))}</button><button class="btn ghost" id="peRst">${esc(Tx('tx.rst','Rétablir l’original'))}</button></div>`;
 document.body.appendChild(o);let cset=!!s.c;
 $$('.rtrow button',o).forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='s-')s.s=Math.max(.4,Math.round(((s.s||1)-.1)*10)/10);if(a==='s+')s.s=Math.min(3,Math.round(((s.s||1)+.1)*10)/10);if(a==='b'){s.b=!s.b;b.classList.toggle('on',s.b)}if(a==='i'){s.i=!s.i;b.classList.toggle('on',s.i)}$('#peS',o).textContent=Math.round((s.s||1)*100)+' %'});
 $('#peC',o).oninput=()=>{cset=true};$('#peNo',o).onclick=()=>o.remove();
 const sel=()=>{const a=$('#peAll',o);return a&&a.checked?selAll:selOne};
 const put=x=>{Object.keys(x).forEach(k=>{if(x[k]==null||x[k]===false||(k==='s'&&x[k]===1))delete x[k]});delete M[selOne];delete M[selAll];if(Object.keys(x).length)M[sel()]=x;edCommit('Élément modifié');o.remove();render()};
 $('#peOk',o).onclick=()=>{if(tn){const v=$('#peT',o).value.trim();if(v&&v!==orig)R[orig]=v;else delete R[orig]}s.c=cset?$('#peC',o).value:null;s.f=$('#peF',o).value||null;put(s)};
 $('#peHide',o).onclick=()=>{s.h=!s.h;put(s)};const up=$('#peUp',o);if(up)up.onclick=()=>{const big=el.parentElement.closest('.li,.act,.tile,.card,button,.chip,.sxm,.gsi,.ou-pill,.ou-tile,.glchips>button,.lic,section>*');o.remove();if(big)riElEdit(big)};$('#peRst',o).onclick=()=>{if(orig)delete R[orig];put({})}}
function pickBarAfter(){const bar=$('#edBar');document.body.dataset.view=VIEW;document.body.dataset.ctx=(ctx&&ctx.id)||'';if(!bar||$('#edPick'))return;const b=document.createElement('button');b.id='edPick';b.textContent='🧩';b.title='Éléments : modifier ou masquer n’importe quoi';b.onclick=e=>{e.stopPropagation();riPickToggle()};const sv=$('#edSave');bar.insertBefore(b,sv||null)}

/* ---------- 44. Apparence par défaut : en mode édition, on voit toujours la palette choisie pour les étudiants ---------- */
const _palE44=palette;palette=function(){if(typeof EDITMODE!=='undefined'&&EDITMODE&&!RO)return authorPalette();return _palE44.apply(this,arguments)};
let LOOKEM=null;const _render44=render;render=function(){if(LOOKEM!==EDITMODE){LOOKEM=EDITMODE;try{applyLook()}catch(e){}}_render44.apply(this,arguments)};

/* ---------- 45. Palette imposée par l'auteur : remplace une fois le choix personnel des étudiants ---------- */
function palForce(){const v=E&&E.palv;if(!v||(typeof EDITMODE!=='undefined'&&EDITMODE))return;if(S.palv===v)return;S.palv=v;S.theme=null;S.night=null;save();try{applyLook()}catch(e){}}
const _render45=render;render=function(){try{palForce()}catch(e){}_render45.apply(this,arguments)};


/* ======================= DÉMARRAGE ======================= */
const SHELL=()=>`<div class="layout" id="layout"><aside class="side" id="side"></aside><div class="app" id="app"></div></div><nav class="nav" id="nav"></nav><div class="toast" id="toast"></div><input type="file" id="imp" accept=".json,application/json" class="hide">`;
function bindStatic(){$('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||typeof d!=='object')throw 0;S=Object.assign(load(),d);save();applyLook();toast(Tx('toast.imported','Progression importée ✅'));render()}catch(x){toast(Tx('toast.badfile','Fichier invalide'))}};r.readAsText(f);e.target.value=''}}
function boot(){RO=!window.PORTAIL_EDITOR;S=load();E=normE(EMB);loadXDom();
 if(!RO){let loc=null;try{loc=JSON.parse(localStorage.getItem(EKEY)||'null')}catch(e){}if(loc&&(loc.base||0)>=(EMB.rev||0)){const ff=E.fontFiles;E=normE(loc);if((!E.fontFiles||!E.fontFiles.length)&&ff.length)E.fontFiles=ff}E.base=EMB.rev||0}
 try{const _f=E.studio&&+E.studio.format;if(_f>FORMAT_MAX)console.warn('Révision INFAS : configuration au format '+_f+', ce moteur (version '+MOTEUR_VERSION+') lit jusqu’au format '+FORMAT_MAX+' : réglages inconnus ignorés')}catch(e){}applyContent();document.body.insertAdjacentHTML('afterbegin',SHELL());iconSprite();buildNav();bindStatic();applyLook();touchStreak();VIEW=S.onb?'home':'welcome';render();
 if(!RO)window.PORTAIL_EDITOR.init();window.PORTAIL_READY=true;loadXIdb()}
async function loadXIdb(){const miss=((E.content||{}).newMat||[]).filter(m=>!XD[m.id]);if(!miss.length)return;let n=0;for(const m of miss){try{const x=await idbGet(m.src+':x');if(x){const im=await idbGet(m.src+':img');if(im)Object.assign(IMGR,im);regX(m.id,x);n++}}catch(e){}}if(n){Object.keys(CARDC).forEach(k=>delete CARDC[k]);PLANC=null;applyContent();render()}}
/* ---------- Sujets en entier, dans l'ordre d'origine ; matières « Sujets d'examen » ; sujets sur l'accueil ; cours sur plusieurs années ----------
   · un sujet s'affiche EN ENTIER (toutes ses questions, on défile) ; la correction apparaît sous la question dès la réponse ;
   · ordre d'origine : les sujets suivent les chapitres, les questions d'un même énoncé restent ensemble et dans l'ordre ;
   · matière m.vue==='sujets' : ses chapitres SONT ses sujets (ex. Correction nationale 2025) ; la fiche matière les liste ;
   · m.accueil : ses sujets apparaissent dans la rubrique « 📝 Sujets » de l'accueil ;
   · m.nivs : années du cours (ex. L1, L2, L3) ; m.niv reste la première, pour la compatibilité. */
const vueSuj=m=>!!(m&&m.vue==='sujets');
function nivsOf(m){const L=(Array.isArray(m&&m.nivs)&&m.nivs.length?m.nivs:[m&&m.niv]).filter(n=>nivIdx(n)>=0);return L.length?L:[m&&m.niv]}
function nivLbl(m){return nivsOf(m).join(' · ')}
const _nivMinSuj=nivMin;nivMin=function(m){let b=_nivMinSuj(m);nivsOf(m).forEach(n=>{const k=nivIdx(n);if(k>=0&&k<b)b=k});return b};
SCREENS.matiere.hdr=()=>{const m=matOf(ctx.id);return miniHeader(esc((m.fil||[]).join(' · '))+' · '+esc(nivLbl(m)),esc(m.emo+' '+m.short))};
function blocsEnonce(qs){const L=[];qs.forEach(q=>{const d=L[L.length-1];if(d&&q.s&&d[0].s===q.s)d.push(q);else L.push([q])});return L}
sujets=function(mid){const m=MATI[mid],Q=QBM[mid]||[];
 if(vueSuj(m)){const by={};Q.forEach(q=>(by[q.c]=by[q.c]||[]).push(q.id));return Object.keys(by).map(Number).sort((a,b)=>a-b).map(c=>{const L=by[c];L.c=c;return L})}
 const qs=Q.slice().sort((a,b)=>a.c-b.c),n=Math.max(1,Math.ceil(qs.length/sujSize())),cible=Math.ceil(qs.length/n),out=[[]];
 blocsEnonce(qs).forEach(b=>{let cur=out[out.length-1];if(cur.length&&cur.length+b.length>cible&&out.length<n){cur=[];out.push(cur)}b.forEach(q=>cur.push(q.id))});return out};
function sujTitre(mid,k){const L=sujets(mid)[k]||[];return vueSuj(MATI[mid])?chName(mid,L.c):Tx('quiz.lbl.suj','Sujet {k}',{k:k+1})}
let FILS=null;
function startFil(mid,ids,label,mode,k){ids=ids.filter(id=>QI[id]);if(!ids.length){toast(Tx('toast.noq','Aucune question ici'));return}
 FILS={mid,ids,label,mode:mode||'suj',k,ans:{},ms:{},ok:0,fin:false};S.lastMat=mid;go('fil',{id:mid})}
startSujet=function(mid,k){const L=sujets(mid)[k];if(!L)return;const lab=sujTitre(mid,k);if(S.timed&&!vueSuj(MATI[mid])){startTimed(mid,L,lab,k);return}startFil(mid,L,lab,'suj',k)};
startChap=function(mid,i){startFil(mid,(QBM[mid]||[]).filter(q=>q.c===i).map(q=>q.id),Tx('quiz.lbl.ch','Chapitre {k}',{k:i+1})+' · '+chName(mid,i),'ch')};
function quitFil(){if(VSTACK.length)back();else go('matiere',{id:FILS?FILS.mid:''},false)}
function filCorrect(q){const L='ABCDEFGH';if(q.t==='qcm'){if(isM(q))return q.am.map(i=>L[i]+'. '+(q.o||[])[i]).join(' ; ');return L[q.a]+'. '+((q.o||[])[q.a]||'')}return correctText(q)}
function filCarte(q,i){const a=FILS.ans[q.id],L='ABCDEFGH',jid=jsq(q.id),prev=QI[FILS.ids[i-1]],meme=!!(prev&&q.s&&prev.s===q.s);let body='';
 if(q.t==='qcm'){const multi=isM(q),s=FILS.ms[q.id]||[];
  body=(multi&&!a?`<div class="qmhint">${T('qm.hint','☑️ Plusieurs bonnes réponses : coche-les toutes.')}</div>`:'')+(q.o||[]).map((o,oi)=>{let c=multi?'mopt':'';
   if(a){const bon=multi?q.am.includes(oi):oi===q.a,pris=multi?(a.ms||[]).includes(oi):oi===a.sel;if(bon)c+=' ok';else if(pris)c+=' ko'}else if(multi&&s.includes(oi))c+=' sel';
   return `<button class="opt ${c}" ${a?'disabled':''} onclick="filQ('${jid}',${oi})"><span class="k">${L[oi]}</span><span>${esc(o)}</span></button>`}).join('')+
   (multi&&!a?`<button class="btn" onclick="filValider('${jid}')">${T('qm.go','✔ Valider ma réponse ({n} cochée(s))',{n:s.length})}</button>`:'')}
 else if(q.t==='vf')body=`<div class="vfrow">${[[1,Tx('quiz.true','Vrai')],[0,Tx('quiz.false','Faux')]].map(([v,l])=>{let c='';if(a){if(v===q.v)c='ok';else if(v===a.sel)c='ko'}return `<button class="opt ${c}" ${a?'disabled':''} onclick="filQ('${jid}',${v})">${esc(l)}</button>`}).join('')}</div>`;
 else body=a?`<div class="fb neu"><b>${T('quiz.yours','Ta réponse :')}</b> ${esc(a.txt||'—')}</div>`:`<textarea class="tin" id="fo-${esc(q.id)}" rows="3" placeholder="${esc(Tx('quiz.open.ph','Écris ta réponse…'))}"></textarea><button class="btn" style="margin-top:10px" onclick="filOpen('${jid}')">${T('quiz.open.show','Voir la réponse')}</button>`;
 let fb='';if(a){fb=`<div class="fb ${a.pending?'neu':a.ok?'good':'bad'}"><div class="h">${a.pending?T('quiz.selfq','Avais-tu la bonne réponse ?'):a.ok?T('quiz.good','Bonne réponse ✅'):T('quiz.bad','Réponse incorrecte ❌')}</div><div><b>${T('quiz.answer','Réponse :')}</b> ${esc(filCorrect(q))}</div>${q.x?`<div class="ex">💡 ${esc(q.x)}</div>`:''}</div>${extrasHTML(q)}`;
  if(a.pending)fb+=`<div class="row2"><button class="btn" style="background:var(--green)" onclick="filSelf('${jid}',1)">${T('quiz.knew','✅ Je savais')}</button><button class="btn" style="background:var(--red)" onclick="filSelf('${jid}',0)">${T('quiz.didnt','❌ À revoir')}</button></div>`}
 const qc=meme?Object.assign({},q,{s:''}):q;
 return `<div class="filq" id="fq-${esc(q.id)}" style="margin-bottom:18px">${edOn()?`<div class="riedq">${qEdBtn(q.id)}</div>`:''}${qCard(qc,`${meme?`<div class="muted small">${T('fil.meme','↑ Même énoncé que la question précédente')}</div>`:''}<div class="muted small" style="margin:2px 0 6px">${T('fil.num','Question {i}/{n}',{i:i+1,n:FILS.ids.length})}</div>`+body)}${fb}</div>`}
function filTopHTML(){const n=FILS.ids.length,r=Object.keys(FILS.ans).filter(id=>!FILS.ans[id].pending).length;return `<span>${T('fil.prog','{r}/{n} répondues · ✅ {ok}',{r,n,ok:FILS.ok})}</span><span>${esc(FILS.label||'')}</span>`}
function filBilanHTML(){const n=FILS.ids.length,r=Object.keys(FILS.ans).filter(id=>!FILS.ans[id].pending).length;if(r<n)return `<div class="muted small center">${T('fil.reste','Encore {k} question(s) à faire dans ce sujet.',{k:n-r})}</div>`;
 const sc=Math.round(FILS.ok/n*200)/10;return `<div class="card sf center"><h3>${T('fil.fini','🏁 Sujet terminé')}</h3><div style="font-size:28px;font-weight:800">${sc}/20</div><div class="muted">${T('fil.score','{ok} bonne(s) réponse(s) sur {n}',{ok:FILS.ok,n})}</div><div class="row2" style="margin-top:10px"><button class="btn light" onclick="filRecommencer()">${T('fil.again','🔁 Recommencer')}</button><button class="btn coral" onclick="quitFil()">${T('fil.retour','← Retour')}</button></div></div>`}
function filFin(){const n=FILS.ids.length,r=Object.keys(FILS.ans).filter(id=>!FILS.ans[id].pending).length;if(FILS.fin||r<n)return;FILS.fin=true;const sc=Math.round(FILS.ok/n*200)/10;if(FILS.mode==='suj')logDone(FILS.mid,FILS.k,sc);S.xp+=20;save()}
function filMaj(id){const q=QI[id],i=FILS.ids.indexOf(id),el=document.getElementById('fq-'+id);if(el&&q)el.outerHTML=filCarte(q,i);filFin();const t=document.getElementById('filTop');if(t)t.innerHTML=filTopHTML();const b=document.getElementById('filBilan');if(b)b.innerHTML=filBilanHTML()}
function filRep(q,ok,x){FILS.ans[q.id]=Object.assign({ok:!!ok},x||{});if(ok)FILS.ok++;rec(q,!!ok);filMaj(q.id)}
function filQ(id,v){const q=QI[id];if(!FILS||!q||FILS.ans[id])return;if(isM(q)){const s=FILS.ms[id]=FILS.ms[id]||[],i=s.indexOf(v);if(i>=0)s.splice(i,1);else s.push(v);filMaj(id);return}filRep(q,q.t==='vf'?v===q.v:v===q.a,{sel:v})}
function filValider(id){const q=QI[id],s=FILS.ms[id]||[];if(!s.length){toast(Tx('qm.none','Coche au moins une réponse'));return}filRep(q,sameSet(s,q.am),{sel:-1,ms:s.slice()})}
function filOpen(id){const q=QI[id];if(!FILS||!q||FILS.ans[id])return;const t=(document.getElementById('fo-'+id)||{}).value||'';const acc=(q.acc||[q.r]).map(nrm).filter(x=>x&&x.length>1),n=nrm(t);
 const auto=n&&acc.some(x=>n.includes(x)||(x.includes(n)&&n.length>=Math.max(4,x.length*.6)));if(auto)filRep(q,true,{txt:t});else{FILS.ans[id]={txt:t,pending:1};filMaj(id)}}
function filSelf(id,ok){const q=QI[id],a=FILS&&FILS.ans[id];if(!a||!a.pending)return;a.pending=0;a.ok=!!ok;if(ok)FILS.ok++;rec(q,!!ok);filMaj(id)}
function filRecommencer(){FILS.ans={};FILS.ms={};FILS.ok=0;FILS.fin=false;render();window.scrollTo(0,0)}
SCREENS.fil={n:'Sujet (toutes les questions)',ctx:1,nonav:1,hdr:()=>{const m=matOf(FILS?FILS.mid:ctx.id);return miniHeader(esc(m.emo+' '+m.short),esc(FILS?FILS.label:''),`<button class="back" onclick="quitFil()">${Tx('quiz.quit','✕ Quitter')}</button>`)},blocks:['fil.main']};
B('fil.main','Sujet : toutes les questions',()=>{if(!FILS)return'';return `<div class="qtop" id="filTop">${filTopHTML()}</div>`+FILS.ids.map((id,i)=>QI[id]?filCarte(QI[id],i):'').join('')+`<div id="filBilan">${filBilanHTML()}</div>`});
/* liste des sujets d'une matière (fiche matière « Sujets d'examen » et rubrique de l'accueil) */
function sujListeHTML(m){const L=sujets(m.id);if(!L.length)return `<div class="empty">${T('toast.noq','Aucune question ici')}</div>`;
 return L.map((ids,k)=>{let seen=0,ok=0;ids.forEach(id=>{const s=S.qs[id];if(s){seen++;if(s.l)ok++}});const done=(S.done||[]).some(x=>x.mid===m.id&&x.k===k);
  return `<div class="suj sf ${done?'done':''}" onclick="startSujet('${jsq(m.id)}',${k})"><div class="no"><small>${esc(Tx('sujets.no','SUJET'))}</small>${k+1}</div><div class="tx"><b>${esc(sujTitre(m.id,k))}</b><small>${T('hsuj.s','{n} questions · {seen} faites · ✅ {ok}',{n:ids.length,seen,ok})}</small></div></div>`}).join('')}
const _matActSuj=BLK['matiere.actions'].html;BLK['matiere.actions'].html=function(){const m=matOf(ctx.id);if(!vueSuj(m))return _matActSuj.apply(this,arguments);
 return `<div class="secT">${T('msuj.h','📝 Sujets')}<span class="ln"></span></div><div class="muted small" style="margin-bottom:8px">${T('msuj.help','Touche un sujet : toutes ses questions s’affichent, dans l’ordre, avec la correction dès que tu réponds.')}</div>`+sujListeHTML(m)};
B('home.sujets','Sujets (accueil)',()=>{const L=myMats().filter(m=>m.accueil&&(QBM[m.id]||[]).length);
 if(!L.length)return EDITMODE?`<div class="card sf"><h3>${T('hsuj.h','📝 Sujets')}</h3><div class="empty">${esc('Coche « 📝 Sujets sur l’accueil » sur une matière (Éditeur → 📚 Contenu → Matières) : ses sujets apparaîtront ici.')}</div></div>`:'';
 return `<div class="secT">${T('hsuj.h','📝 Sujets')}<span class="ln"></span></div>`+L.map((m,i)=>`<details class="card sf hsuj" ${i===0?'open':''}><summary style="cursor:pointer"><b>${esc(m.emo+' '+m.title)}</b> <small class="muted">· ${sujets(m.id).length} ${esc(Tx('hsuj.n','sujets'))}</small></summary><div style="margin-top:8px">${sujListeHTML(m)}</div></details>`).join('')});
(function(){const H=SCREENS.home.blocks;if(!H.includes('home.sujets')){const i=H.indexOf('home.mat');H.splice(i<0?H.length:i,0,'home.sujets')}})();
/* une mise en page de l'accueil enregistrée avant cette version reçoit la rubrique, sans modifier la configuration */
const _layoutOfSuj=layoutOf;layoutOf=function(sc){const L=_layoutOfSuj(sc);if(sc!=='home'||!Array.isArray(L)||L.some(b=>b.id==='home.sujets'))return L;const C=L.slice(),i=C.findIndex(b=>b.id==='home.mat');C.splice(i<0?C.length:i,0,{id:'home.sujets',inst:'home.sujets'});return C};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
