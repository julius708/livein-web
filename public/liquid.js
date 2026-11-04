/* LIVE-IN liquid glass: svetelný odlesk na sklených kartách sleduje kurzor (len myš, bez reduced motion, bez vypnutého pohybu). */
(()=>{'use strict';
if(!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const SEL='.story-paths article,.journal-card,.stats-journey-chart,.calc-home-promo,.story-price,.editorial-panel,.heritage-grid>div,.lspol-main,.story-care-description,.stats-band span:not(.stats-sep)';
let t=0;const mark=()=>{t=0;document.querySelectorAll(SEL).forEach(el=>el.classList.add('lg-sheen'))};
mark();new MutationObserver(()=>{if(!t)t=setTimeout(mark,120)}).observe(document.body,{childList:true,subtree:true});
let raf=0,last=null;
document.addEventListener('pointermove',e=>{const el=e.target&&e.target.closest&&e.target.closest('.lg-sheen');if(!el)return;last=[el,e.clientX,e.clientY];if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const [n,x,y]=last,r=n.getBoundingClientRect();if(!r.width)return;n.style.setProperty('--mx',((x-r.left)/r.width*100).toFixed(1)+'%');n.style.setProperty('--my',((y-r.top)/r.height*100).toFixed(1)+'%')})},{passive:true});
})();
