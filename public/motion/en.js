/* LIVE-IN web – pohyb a animácie (prenesené zo starého webu, en) */
(function(){
const main=document.querySelector('main');
const icon='';
const portfolioPhotos=[{src:'/assets/thirring/skypark-spalna-mesto.webp',caption:"Light and space · living room",source:"Photo · thirring.sk for LIVE-IN"},{src:'/assets/thirring/moskovska-obyvacka.webp',caption:"Urban interior · living room",source:"Photo · thirring.sk for LIVE-IN"},{src:'/assets/archive-petrzalka-3-1600.webp',caption:"Prepared bedroom · detail of the space",source:"Original from LIVE-IN archive on Drive"},{src:'/assets/thirring/eurovea-obyvacka.webp',caption:"Prepared dining · kitchen",source:"Photo · thirring.sk for LIVE-IN"},{src:'/assets/thirring/skypark4-obyvacka.webp',caption:"Interior · another view",source:"Photo · thirring.sk for LIVE-IN"},{src:'/assets/thirring/skypark1-spalna-vyhlad.webp',caption:"Living area · perspective",source:"Photo · thirring.sk for LIVE-IN"}];
portfolioPhotos.push(...[{"src": "/assets/autumn-skypark-living-1600.webp", "thumb": "/assets/autumn-skypark-living-800.webp", "caption": "Living room with view · Sky Park", "source": "Archive LIVE-IN · Thirring / Google Drive"}, {"src": "/assets/autumn-skypark-lounge-1600.webp", "thumb": "/assets/autumn-skypark-lounge-800.webp", "caption": "Rest area · Sky Park", "source": "Archive LIVE-IN · Thirring / Google Drive"}, {"src": "/assets/autumn-skypark-dining-1600.webp", "thumb": "/assets/autumn-skypark-dining-800.webp", "caption": "Dining and kitchen · Sky Park", "source": "Archive LIVE-IN · Thirring / Google Drive"}, {"src": "/assets/autumn-skypark-view-1600.webp", "thumb": "/assets/autumn-skypark-view-800.webp", "caption": "City view · Sky Park", "source": "Archive LIVE-IN · Thirring / Google Drive"}, {"src": "/assets/autumn-design-living-1600.webp", "thumb": "/assets/autumn-design-living-800.webp", "caption": "Kitchen and living room · LIVE-IN", "source": "Archive LIVE-IN · Higgsfield"}, {"src": "/assets/autumn-design-table-1600.webp", "thumb": "/assets/autumn-design-table-800.webp", "caption": "Dining detail · LIVE-IN", "source": "Archive LIVE-IN · Higgsfield"}, {"src": "/assets/autumn-design-bedroom-1600.webp", "thumb": "/assets/autumn-design-bedroom-800.webp", "caption": "Bedroom in blue tones · LIVE-IN", "source": "Archive LIVE-IN · Higgsfield"}, {"src": "/assets/autumn-design-terrace-1600.webp", "thumb": "/assets/autumn-design-terrace-800.webp", "caption": "Green terrace · LIVE-IN", "source": "Archive LIVE-IN · Higgsfield"}, {"src": "/assets/autumn-design-dining-1600.webp", "thumb": "/assets/autumn-design-dining-800.webp", "caption": "Dining area · LIVE-IN", "source": "Archive LIVE-IN · Higgsfield"}, {"src": "/assets/autumn-design-detail-1600.webp", "thumb": "/assets/autumn-design-detail-800.webp", "caption": "Interior detail · LIVE-IN", "source": "Archive LIVE-IN · Higgsfield"}, {"src": "/assets/autumn-design-bed-1600.webp", "thumb": "/assets/autumn-design-bed-800.webp", "caption": "Prepared bedroom · LIVE-IN", "source": "Archive LIVE-IN · Higgsfield"}, {"src": "/assets/autumn-design-balcony-1600.webp", "thumb": "/assets/autumn-design-balcony-800.webp", "caption": "Terrace view · LIVE-IN", "source": "Archive LIVE-IN · Higgsfield"}]);
portfolioPhotos.push(...[1,2,4,6].map(i=>({src:'/assets/office-approved-'+i+'.webp',caption:"Visualization of the LIVE-IN office · view "+i,source:"Visualization of the upcoming LIVE-IN office"})));

const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled=!motionQuery.matches;
let reveals=null, scrollFrame=0;

function setMotion(enabled){motionEnabled=enabled&&!motionQuery.matches;document.body.classList.toggle('motion-off',!motionEnabled);const control=document.querySelector('.motion-control');control.textContent=motionEnabled?"Turn off animations":"Turn on animations";control.setAttribute('aria-pressed',String(!motionEnabled));if(!motionEnabled){main.querySelectorAll('video').forEach(v=>{v.pause();v.classList.remove('playing')});const filmButton=main.querySelector('.film-control');if(filmButton){filmButton.textContent="Play animated shot ▷";filmButton.setAttribute('aria-pressed','false');const filmLabel=main.querySelector('.film-label');if(filmLabel)filmLabel.textContent="Photo from the LIVE-IN archive"}reveals?.disconnect();main.querySelectorAll('.waiting').forEach(e=>{e.classList.remove('waiting');e.classList.add('in')})}else installReveals();updateScroll();syncAmbient()}
function installReveals(){reveals?.disconnect();if(!motionEnabled||!('IntersectionObserver' in window))return;reveals=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('waiting');entry.target.classList.add('in');reveals.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -35px 0px'});main.querySelectorAll('.office-heading,.office-approved-grid,.office-film,.office-details,.journal-card,.journal-heading,.heritage-grid>div,.subpage-photos,.soft-interlude,.section-head,.service,.feature>div,.step,.price-box,.estate-block>div,.faq>div,.article,.cta,.chapter-intro,.chapter-photo,.operations-flow article,.result-composition,.content-page>h3,.content-page>p,.decision-layout>div,.portfolio-photo,.editorial-pair figure,.story-detail-heading,.story-selection-heading,.story-care-heading,.story-detail-stage,.story-care-stage,.story-paths article,.story-estate-grid,.story-final').forEach((el,i)=>{el.classList.add('reveal');if(el.getBoundingClientRect().top>window.innerHeight){el.classList.add('waiting');el.style.setProperty('--delay',`${Math.min(i%3,2)*65}ms`)}else el.classList.add('in');reveals.observe(el)})}
function installDynamics(id){document.querySelectorAll('.navlink').forEach(el=>{if(el.dataset.route===id)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});const hero=main.querySelector('.hero');if(hero&&motionEnabled){[...hero.querySelector(':scope>div').children].forEach((el,i)=>{el.classList.add('hero-enter');el.style.setProperty('--delay',`${i*100}ms`)});hero.querySelector('.hero-media').classList.add('hero-image-enter')}installReveals();bindGoals();setupStory();setupCinema();setupSoftMotion()}
const goals={kratke:{text:"For a furnished apartment for short stays. We will go through the presentation, reservations and coordination of care according to your goal.",label:"Explore short-term rental management",route:'kratkodoba'},dlhe:{text:"For owners who prefer a longer rental relationship. We will help with the rental and the agreed interim management.",label:"Explore long-term rental management",route:'dlhodoba'},predaj:{text:"Sales is a separate real estate service. We will review your property, presentation and plan for next steps.",label:"Go to real estate services",route:'reality'}};
function selectGoal(tab){const result=main.querySelector('#goal-result');main.querySelectorAll('[data-goal]').forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});const data=goals[tab.dataset.goal];result.setAttribute('aria-labelledby',tab.id);result.classList.remove('swap');result.innerHTML=`<p>${data.text}</p><button class="text-btn" data-route="${data.route}">${data.label} ${icon}</button>`;result.querySelector('button').onclick=()=>route(data.route);if(motionEnabled){void result.offsetWidth;result.classList.add('swap')}}
function bindGoals(){main.querySelectorAll('[data-goal]').forEach(tab=>{tab.onclick=()=>selectGoal(tab);tab.onkeydown=e=>{const tabs=[...main.querySelectorAll('[data-goal]')],i=tabs.indexOf(tab);let next;if(e.key==='ArrowRight')next=tabs[(i+1)%tabs.length];if(e.key==='ArrowLeft')next=tabs[(i+tabs.length-1)%tabs.length];if(e.key==='Home')next=tabs[0];if(e.key==='End')next=tabs[tabs.length-1];if(next){e.preventDefault();next.focus();selectGoal(next)}}})}
function updateScroll(){scrollFrame=0;updateStory();const y=window.scrollY,range=document.documentElement.scrollHeight-window.innerHeight;document.querySelector('.scroll-progress').style.transform=`scaleX(${range>0?Math.min(1,y/range):0})`;document.querySelector('.top').classList.toggle('scrolled',y>24);const img=main.querySelector('.cinema-bg,.hero-media img');if(img&&motionEnabled&&window.innerWidth>1050&&window.matchMedia('(pointer:fine)').matches&&y<850){img.style.transform=`translateY(${Math.min(y*.035,18)}px) scale(1.035)`}else if(img)img.style.transform='none'}
window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll)},{passive:true});window.addEventListener('resize',updateScroll,{passive:true});
document.querySelector('.motion-control').onclick=()=>{setMotion(!motionEnabled);try{localStorage.setItem('livein-motion',motionEnabled?'on':'off')}catch(e){}};
motionQuery.addEventListener?.('change',()=>setMotion(!motionQuery.matches));

function setupFilm(){}
let photoIndex=0,photoFocus=null;
const viewer=document.querySelector('.photo-viewer');
function showPhoto(index){photoIndex=(index+portfolioPhotos.length)%portfolioPhotos.length;const p=portfolioPhotos[photoIndex],img=viewer.querySelector('img');img.src=p.src;img.alt=p.caption;viewer.querySelector('#viewer-caption').textContent=p.caption;viewer.querySelector('.viewer-source').textContent=p.source;viewer.querySelector('#viewer-count').textContent=`· ${photoIndex+1} / ${portfolioPhotos.length}`}
function bindPhotos(){setupFilm();main.querySelectorAll('[data-photo]').forEach(button=>button.onclick=()=>{photoFocus=button;showPhoto(Number(button.dataset.photo));viewer.showModal();document.body.style.overflow='hidden'});main.querySelectorAll('[data-scroll]').forEach(button=>button.onclick=()=>main.querySelector('.portfolio-section')?.scrollIntoView({behavior:motionEnabled?'smooth':'instant'}))}
viewer.querySelector('[data-view-close]').onclick=()=>viewer.close();viewer.querySelector('[data-view-prev]').onclick=()=>showPhoto(photoIndex-1);viewer.querySelector('[data-view-next]').onclick=()=>showPhoto(photoIndex+1);viewer.addEventListener('close',()=>{document.body.style.overflow='';photoFocus?.focus()});viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex-1)}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+1)}});

async function swapStoryImage(img,data,fit){
 const token=String(Number(img.dataset.swapToken||0)+1);img.dataset.swapToken=token;
 const next=new Image();next.src=data.src;
 try{await next.decode()}catch(e){if(img.dataset.swapToken===token){const status=img.closest('.story-home')?.querySelector('[data-detail-source]');if(status)status.textContent="The photo could not be loaded. Try a different detail."}return}
 if(!img.isConnected||img.dataset.swapToken!==token)return;
 img.src=data.src;img.alt=data.alt;img.style.objectFit=fit;
 if(motionEnabled){img.classList.remove('story-changing');void img.offsetWidth;img.classList.add('story-changing')}
}

function setupStory(){
 const root=main.querySelector('.story-home');if(!root)return;
 root.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>root.querySelector('.'+b.dataset.chapter)?.scrollIntoView({behavior:motionEnabled?'smooth':'instant',block:'start'}));
 const warmPhotos=()=>['/assets/archive-petrzalka-3-1600.webp','/assets/thirring/eurovea-obyvacka.webp','/assets/thirring/skypark4-obyvacka.webp'].forEach(src=>{const im=new Image();im.src=src});
 root.querySelector('.story-detail-choices')?.addEventListener('pointerenter',warmPhotos,{once:true});
 root.querySelector('.story-detail-choices')?.addEventListener('focusin',warmPhotos,{once:true});
 for(const selector of ['[data-story-detail]','[data-story-care]']){const group=[...root.querySelectorAll(selector)];group.forEach((b,i)=>b.onkeydown=e=>{let n;if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%group.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i+group.length-1)%group.length;if(e.key==='Home')n=0;if(e.key==='End')n=group.length-1;if(n!==undefined){e.preventDefault();group[n].focus();group[n].click()}})}

 const details=[
  {src:'/assets/thirring/moskovska-obyvacka.webp',alt:"Living room from the LIVE-IN archive",source:"Living room · Photo · thirring.sk for LIVE-IN"},
  {src:'/assets/archive-petrzalka-3-1600.webp',alt:"Ready bedroom from the LIVE-IN photo archive",source:"Ready bedroom · original from LIVE-IN archive on Drive"},
  {src:'/assets/thirring/eurovea-obyvacka.webp',alt:"Dining and kitchen from the LIVE-IN archive",source:"Dining and kitchen · Photo · thirring.sk for LIVE-IN"}
 ];
 root.querySelectorAll('[data-story-detail]').forEach(b=>b.onclick=()=>{
  const index=Number(b.dataset.storyDetail),data=details[index];if(!data||!root.isConnected)return;
  root.querySelectorAll('[data-story-detail]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  const img=root.querySelector('[data-detail-image]');swapStoryImage(img,data,'cover');root.querySelector('.story-detail-image').dataset.photo=String([1,2,3][index]);
  root.querySelector('[data-detail-number]').textContent=String(index+1).padStart(2,'0');root.querySelector('[data-detail-source]').textContent=data.source;
 });
 const care=[
  {src:'/assets/thirring/eurovea-obyvacka.webp',alt:"Dining and kitchen from the LIVE-IN archive",caption:"Photo · thirring.sk for LIVE-IN",eyebrow:"BEFORE LAUNCHING",title:"An apartment with a clear plan.",copy:"We will go over the condition, equipment and suitable rental model. We will agree on the scope and prepare a true presentation."},
  {src:'/assets/thirring/skypark4-obyvacka.webp',alt:"Living room from the LIVE-IN archive",caption:"Photo · thirring.sk for LIVE-IN",eyebrow:"DURING THE RENTAL",title:"Everyday life has its own system.",copy:"Communication with guests, reservations and coordination of care between stays. Responsibilities and costs according to the agreed scope."},
  {src:'/assets/thirring/skypark1-spalna-vyhlad.webp',alt:"Living room from the LIVE-IN archive",caption:"Photo · thirring.sk for LIVE-IN",eyebrow:"FOR THE OWNER",title:"Overview instead of assumptions.",copy:"In the statement, we distinguish income, costs and the amount for the owner. We will explain the recommendations according to the specific property."}
 ];
 root.querySelectorAll('[data-story-care]').forEach(b=>b.onclick=()=>{
  const data=care[Number(b.dataset.storyCare)];if(!data||!root.isConnected)return;
  root.querySelectorAll('[data-story-care]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  const img=root.querySelector('[data-care-image]');swapStoryImage(img,data,'cover');
  root.querySelector('[data-care-caption]').textContent=data.caption;root.querySelector('[data-care-eyebrow]').textContent=data.eyebrow;
  root.querySelector('[data-care-title]').textContent=data.title;root.querySelector('[data-care-copy]').textContent=data.copy;
  if(motionEnabled){const text=root.querySelector('.story-care-description');text.classList.remove('story-changing');void text.offsetWidth;text.classList.add('story-changing')}
 });
 updateStory();
}
function updateStory(){updateCinema()}

/* Scenario model: confirmed management 17%, accommodation VAT 5%, software EUR 50.
 * Payment and platform fees are entered monthly amounts, held constant in sensitivity.
 * No network, storage, market defaults, or personal data. */

const subpagePhotos={
 sprava:['thirring/skypark4-obyvacka.webp','thirring/skypark1-spalna-vyhlad.webp'],kratkodoba:['thirring/eurovea-obyvacka.webp','thirring/triveze-spalna.webp'],dlhodoba:['thirring/moskovska-obyvacka.webp','thirring/moskovska-spalna.webp'],postup:['thirring/skypark-spalna-mesto.webp','thirring/kupelna.webp'],onas:['autumn-skypark-dining-1600.webp','autumn-design-detail-1600.webp'],kontakt:['autumn-design-dining-1600.webp','autumn-design-balcony-1600.webp'],predaj:['thirring-loft-wide.jpg','thirring-moscow-2.jpg'],ponuky:['thirring-sky-living.jpg','thirring-loft-1.jpg'],hostia:['thirring/skypark4-spalna.webp','thirring/skypark1-loggia.webp'],ceny:['thirring/skypark4-spalna.webp','thirring/kupelna.webp'],faq:['thirring/moskovska-spalna.webp','thirring/skypark1-loggia.webp'],poradna:['thirring/skypark1-spalna.webp','thirring/petrzalka-spalna.webp']
};
function subpageMedia(id){if(['onas','kontakt'].includes(id)||!subpagePhotos[id])return '';return `<div class="subpage-photos" aria-label="Photos of LIVE-IN apartments">${subpagePhotos[id].map((photo,i)=>`<div class="subpage-photo subpage-photo-${i}"><img src="/assets/${photo}" alt="Photo of the apartment from the LIVE-IN portfolio" loading="lazy" decoding="async"></div>`).join('')}</div>`}


const filmScenes=[
 {title:["Your apartment.","Its next story."],label:"01 / Every space has its own story",copy:"You gave it form. We will help him find a place in the everyday life of the guests."},
 {title:["The place where","remains."],label:"02 / It depends on the feeling",copy:"Light. Peace of mind. Thoughtful details. Own LIVE-IN interiors, ready for your next stay."},
 {title:["You own it.","We care."],label:"03 / Behind the scene",copy:"Lease management from preparation to billing. With the range that we agree for your apartment."}
];
function setFilmScene(index){const stage=main.querySelector('.film-stage');if(!stage||stage.dataset.scene===String(index))return;stage.dataset.scene=String(index);const data=filmScenes[index];stage.querySelectorAll('.film-still').forEach((img,i)=>{img.classList.toggle('is-active',i===index);img.setAttribute('aria-hidden',String(i!==index))});stage.querySelector('.film-title').replaceChildren(...data.title.map(t=>{const s=document.createElement('span');s.textContent=t;return s}));stage.querySelector('.film-label-small').textContent=data.label;stage.querySelector('.film-subtitle').textContent=data.copy;stage.querySelectorAll('[data-film-scene]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.filmScene)===index)));const copy=stage.querySelector('.film-center');copy.classList.remove('film-scene-change');if(motionEnabled){void copy.offsetWidth;copy.classList.add('film-scene-change')}stage.querySelector('.film-controls').hidden=index!==0;syncAmbient();}
function setupCinema(){const root=main.querySelector('.film-journey');if(!root)return;
 const stage=root.querySelector('.film-stage'),first=stage.querySelector('video');
 stage.dataset.displayedScene='0';
 first.dataset.filmClip='0';
 // Keep each decoder/source alive; never replace src during a scene transition.
 first.preload=motionEnabled&&!navigator.connection?.saveData?'auto':'none';
 [['film/sky-bedroom.mp4','thirring/skypark1-spalna-vyhlad.webp'],['film/eurovea.mp4','thirring/eurovea-obyvacka.webp']].forEach((clip,i)=>{
  const v=first.cloneNode(false);v.dataset.filmClip=String(i+1);v.poster='/assets/'+clip[1];v.src='/assets/'+clip[0];v.classList.remove('playing');v.setAttribute('aria-hidden','true');first.before(v);
 });
 root.querySelectorAll('[data-film-scene]').forEach(b=>b.onclick=()=>{const index=Number(b.dataset.filmScene);if(!motionEnabled||window.matchMedia('(max-height:780px),(max-width:700px)').matches){setFilmScene(index);return}const stage=root.querySelector('.film-stage'),top=parseFloat(getComputedStyle(stage).top)||0;const range=Math.max(1,root.offsetHeight-stage.offsetHeight);const progress=[0,.46,.91][index];window.scrollTo({top:window.scrollY+root.getBoundingClientRect().top-top+range*progress,behavior:'smooth'})});setFilmScene(0)}
function updateCinema(){const root=main.querySelector('.film-journey');if(!root||!motionEnabled||window.matchMedia('(max-height:780px),(max-width:700px)').matches)return;const stage=root.querySelector('.film-stage');const top=parseFloat(getComputedStyle(stage).top)||0;const range=Math.max(1,root.offsetHeight-stage.offsetHeight);const progress=Math.max(0,Math.min(1,(top-root.getBoundingClientRect().top)/range));setFilmScene(Math.min(2,Math.floor(progress*3)));stage.style.setProperty('--film-scale',String(1.015+progress*.05))}

let ambientObserver=null;
function ambientButton(v){return v.closest('[data-ambient-panel]')?.querySelector('[data-ambient-toggle]')}
function ambientAllowed(v){const stage=v.closest('.film-stage');return (!stage||v.dataset.filmClip===stage.dataset.scene||v.dataset.filmClip===stage.dataset.displayedScene)&&motionEnabled&&!document.hidden&&v.isConnected&&v.dataset.visible==='true'&&v.dataset.userPaused!=='true'&&v.dataset.autoplayBlocked!=='true'&&(!navigator.connection?.saveData||v.dataset.manual==='true')}
function ambientLabel(v,playing){const b=ambientButton(v);if(b){b.textContent=playing?"Pause shot Ⅱ":"Play shot ▷";b.setAttribute('aria-pressed',String(playing))}const label=v.closest('.film-stage')?.querySelector('.film-label');if(label)label.textContent="Animated photo · Higgsfield"}
function revealAmbient(v,ticket){
 const reveal=()=>{
  if(v.dataset.playTicket!==ticket||!ambientAllowed(v))return;
  const stage=v.closest('.film-stage');
  if(stage){
   if(v.dataset.filmClip!==stage.dataset.scene)return;
   const old=stage.querySelector('[data-film-clip="'+stage.dataset.displayedScene+'"]');
   stage.dataset.displayedScene=v.dataset.filmClip;
   v.style.zIndex='-2';v.classList.add('playing');
   // Fade in decoded frames over the outgoing shot; pause it after the dissolve.
   if(old&&old!==v){old.style.zIndex='-3';old.classList.remove('playing');
    setTimeout(()=>{if(old.isConnected&&old.dataset.filmClip!==stage.dataset.scene&&old.dataset.filmClip!==stage.dataset.displayedScene)old.pause()},1000);
   }
  }else v.classList.add('playing');
  ambientLabel(v,true);
 };
 if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(reveal);
 else if(v.readyState>=2)requestAnimationFrame(reveal);
 else v.addEventListener('loadeddata',reveal,{once:true});
}
function syncAmbient(){main.querySelectorAll('video[data-ambient]').forEach(v=>{
 if(!ambientAllowed(v)){
  v.dataset.playTicket=String(Number(v.dataset.playTicket||0)+1);
  const stage=v.closest('.film-stage');
  if(!stage||!motionEnabled||document.hidden||v.dataset.visible!=='true'){v.pause();v.classList.remove('playing')}
  else if(!v.classList.contains('playing'))v.pause();
  ambientLabel(v,false);return;
 }
 if(!v.paused||v.dataset.playPending==='true'){
  if(!v.paused&&!v.classList.contains('playing'))revealAmbient(v,v.dataset.playTicket);
  return;
 }
 const ticket=String(Number(v.dataset.playTicket||0)+1);v.dataset.playTicket=ticket;v.dataset.playPending='true';
 v.play().then(()=>{if(v.dataset.playTicket!==ticket||!ambientAllowed(v)){v.pause()}else revealAmbient(v,ticket)})
 .catch(()=>{if(v.dataset.playTicket===ticket&&ambientAllowed(v))v.dataset.autoplayBlocked='true';v.classList.remove('playing')})
 .finally(()=>{v.dataset.playPending='false';if(v.dataset.playTicket!==ticket&&ambientAllowed(v))syncAmbient()});
})}
function setupSoftMotion(){ambientObserver?.disconnect();const videos=main.querySelectorAll('video[data-ambient]');if(!videos.length)return;
 videos.forEach(v=>{v.muted=true;v.loop=true;v.playbackRate=.8;v.dataset.visible='false';v.onended=null;v.ontimeupdate=()=>{if(v.closest('.film-stage'))return;const edge=Math.min(v.currentTime,Math.max(0,v.duration-v.currentTime));v.style.setProperty('--ambient-opacity',String(Number.isFinite(edge)?Math.min(1,.35+edge*1.7):1))};const b=ambientButton(v);if(b)b.onclick=()=>{if(!motionEnabled){b.textContent="Animations are disabled";return}const stop=!v.paused||v.dataset.playPending==='true';v.dataset.userPaused=String(stop);if(!stop){v.dataset.manual='true';v.dataset.userPaused='false';v.dataset.autoplayBlocked='false'}syncAmbient()};
 if(!('IntersectionObserver' in window)){const r=v.closest('[data-ambient-panel]').getBoundingClientRect();v.dataset.visible=String(r.bottom>0&&r.top<innerHeight)}
 });
 if('IntersectionObserver' in window){ambientObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{entry.target.querySelectorAll('video[data-ambient]').forEach(v=>v.dataset.visible=String(entry.isIntersecting));entry.target.dataset.visible=String(entry.isIntersecting)});syncAmbient()},{threshold:0,rootMargin:'0px'});videos.forEach(v=>ambientObserver.observe(v.closest('[data-ambient-panel]')))}syncAmbient();
}
document.addEventListener('visibilitychange',syncAmbient);


window.__liveinMotion={page:function(id){try{installDynamics(id||'home');bindPhotos();updateScroll()}catch(e){console.warn('motion',e)}},setMotion:setMotion,syncAmbient:syncAmbient};
if(window.__liveinMotionPending){window.__liveinMotion.page(window.__liveinMotionPending)}
})();
