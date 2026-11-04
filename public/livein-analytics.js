/* LIVE-IN analytics: Google Analytics 4 (G-RLBPF8E1RY) s Consent Mode v2.
   gtag.js sa načíta na každej stránke; analytics_storage aj ad_storage sú predvolene "denied"
   a na "granted" (iba analytics_storage) sa zmenia až po súhlase v cookie lište. Žiadne hodnoty z formulárov, žiadne query stringy. */
(()=>{'use strict';
if(window.liveinAnalyticsInstalled)return;window.liveinAnalyticsInstalled=true;
if(!['live-in.international','www.live-in.international'].includes(location.hostname))return;
const ID='G-RLBPF8E1RY',KEY='livein-analytics-consent-v2',TTL=180*86400000;
const translations={"sk": ["Pomôžete nám zlepšovať LIVE-IN?", "S vaším súhlasom používame Google Analytics na meranie návštev a používania kalkulačky. Kontaktné údaje ani obsah formulárov do Analytics neposielame. Voľbu môžete kedykoľvek zmeniť.", "Prijať", "Odmietnuť", "Nastavenia súkromia"], "en": ["Help us improve LIVE-IN?", "With your permission, we use Google Analytics to measure visits and calculator usage. We do not send contact details or form contents to Analytics. You can change your choice at any time.", "Accept", "Reject", "Privacy settings"], "de": ["Helfen Sie uns, LIVE-IN zu verbessern?", "Mit Ihrer Zustimmung nutzen wir Google Analytics, um Besuche und die Nutzung des Rechners zu messen. Kontaktdaten und Formularinhalte senden wir nicht an Analytics. Sie können Ihre Auswahl jederzeit ändern.", "Akzeptieren", "Ablehnen", "Datenschutzeinstellungen"], "es": ["¿Nos ayudas a mejorar LIVE-IN?", "Con tu permiso usamos Google Analytics para medir visitas y el uso de la calculadora. No enviamos datos de contacto ni el contenido de formularios a Analytics. Puedes cambiar tu elección en cualquier momento.", "Aceptar", "Rechazar", "Privacidad"], "pl": ["Pomożesz nam ulepszać LIVE-IN?", "Za Twoją zgodą korzystamy z Google Analytics do pomiaru odwiedzin i użycia kalkulatora. Nie wysyłamy danych kontaktowych ani treści formularzy do Analytics. Wybór możesz zmienić w każdej chwili.", "Akceptuję", "Odrzuć", "Ustawienia prywatności"], "cs": ["Pomůžete nám zlepšovat LIVE-IN?", "S vaším souhlasem používáme Google Analytics k měření návštěv a používání kalkulačky. Kontaktní údaje ani obsah formulářů do Analytics neposíláme. Volbu můžete kdykoliv změnit.", "Přijmout", "Odmítnout", "Nastavení soukromí"]};
const lang=()=>document.documentElement.lang.slice(0,2);const t=translations[lang()]||translations.en;
let lastPage='',changeTimer;
window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}window.gtag=window.gtag||gtag;
// 1) Consent Mode v2: predvolene všetko zamietnuté (musí byť pred načítaním gtag.js)
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'denied',personalization_storage:'denied',security_storage:'granted',wait_for_update:500});
// 2) gtag.js na každej stránke, bez automatického page_view (posielame ho sami aj pri navigácii v rámci aplikácie)
gtag('js',new Date());
gtag('config',ID,{send_page_view:false,anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:15552000,cookie_flags:'SameSite=Lax;Secure'});
const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.append(s);
const safePath=()=>location.pathname.replace(/\/livein-release-20261013\//,'/');
const pageURL=()=>location.origin+safePath();
function referrer(){try{return new URL(document.referrer).origin+'/';}catch{return '';}}
function event(name,params={}){gtag('event',name,{page_location:pageURL(),page_referrer:referrer(),language:lang(),...params});}
function page(){const url=pageURL();if(lastPage===url)return;lastPage=url;event('page_view',{page_title:document.title});}
// 3) súhlas: uložený 180 dní, zmena cez „Nastavenia súkromia“ v pätičke
function clearCookies(){for(const c of document.cookie.split(';')){const name=c.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;for(const domain of ['',location.hostname,'.live-in.international'])document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'');}}
function apply(yes){gtag('consent','update',{analytics_storage:yes?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});if(!yes)clearCookies();}
function choose(yes){try{localStorage.setItem(KEY,JSON.stringify({yes,at:Date.now()}));}catch{}apply(yes);panel.hidden=true;settings.focus({preventScroll:true});}
const css=document.createElement('style');css.textContent=`#li-consent{position:fixed;z-index:2147483000;bottom:22px;left:22px;box-sizing:border-box;max-width:470px;width:calc(100% - 44px);padding:24px;background:#faf8f2;color:#173e2c;border:1px solid #b6c4b7;border-radius:22px;box-shadow:0 12px 48px #132d2630;font:15px/1.5 system-ui,sans-serif}#li-consent[hidden]{display:none!important}#li-consent strong{display:block;font-size:19px;color:#173e2c}#li-consent p{margin:10px 0 18px;color:#43564b;font-size:14px}#li-consent .li-buttons{display:flex;gap:10px;flex-wrap:wrap}#li-consent button{flex:1;padding:12px 16px;border:1px solid #173e2c;border-radius:30px;background:#173e2c;color:#fff;font:600 14px system-ui;cursor:pointer}#li-consent button:last-child{background:#faf8f2;color:#173e2c}#li-privacy{position:relative;display:inline-block;margin:0;padding:7px 12px;background:#f7f5ee;color:#173e2c;border:1px solid #b6c4b7;border-radius:20px;font:13px system-ui;cursor:pointer}#li-consent button:focus-visible,#li-privacy:focus-visible{outline:3px solid #de7c22;outline-offset:3px}@media(max-width:480px){#li-consent{bottom:12px;left:12px;width:calc(100% - 24px);padding:18px}}`;
document.head.append(css);const panel=document.createElement('section');panel.id='li-consent';panel.setAttribute('role','region');panel.setAttribute('aria-label',t[4]);panel.innerHTML='<strong></strong><p></p><div class="li-buttons"><button type="button"></button><button type="button"></button></div>';
panel.querySelector('strong').textContent=t[0];panel.querySelector('p').textContent=t[1];const buttons=panel.querySelectorAll('button');buttons[0].textContent=t[2];buttons[1].textContent=t[3];buttons[0].onclick=()=>choose(true);buttons[1].onclick=()=>choose(false);
const settings=document.createElement('button');settings.type='button';settings.id='li-privacy';settings.textContent=t[4];settings.onclick=()=>{panel.hidden=false;buttons[0].focus();};document.body.append(panel);(document.querySelector('.footer-bottom')||document.body).append(settings);
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&typeof saved.yes==='boolean'&&Date.now()-saved.at<TTL){panel.hidden=true;apply(saved.yes);}}catch{}
page();
// 4) page_view aj pri navigácii v rámci aplikácie (Next.js používa pushState)
const push=history.pushState.bind(history);history.pushState=function(){const r=push.apply(this,arguments);setTimeout(page,250);return r;};
window.addEventListener('popstate',()=>setTimeout(page,250));
// 5) udalosti: telefón, e-mail, kalkulačka, sociálne siete, dopyt
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href],button[data-route]');if(!a)return;
 const h=(a.getAttribute('href')||'').trim(),route=a.getAttribute('data-route')||'';
 if(h.startsWith('tel:'))event('click_phone',{link_url:h});
 else if(h.startsWith('mailto:'))event('click_email',{link_url:h});
 else if(/instagram\.com/i.test(h))event('click_instagram',{link_url:h});
 else if(/facebook\.com/i.test(h))event('click_facebook',{link_url:h});
 else if(route==='kalkulacka'||/\/kalkulacka$/.test(h.replace(/[?#].*$/,'')))event('click_calculator',{link_url:h||route});
});
if(/\/kalkulacka$/.test(location.pathname)&&!sessionStorage.getItem('livein-calc-open')){try{sessionStorage.setItem('livein-calc-open','1');}catch{}event('click_calculator',{link_url:'direct'});}
const profile=document.getElementById('profile');if(profile)profile.addEventListener('submit',()=>setTimeout(()=>{const n=document.getElementById('numbers');if(n&&!n.hidden)event('calculator_result');},0));
for(const id of ['controls','costControls'])document.getElementById(id)?.addEventListener('change',()=>{clearTimeout(changeTimer);changeTimer=setTimeout(()=>event('calculator_adjust'),600);});
window.addEventListener('livein-lead-success',()=>event('generate_lead',{form_id:'lead-form'}));
window.addEventListener('livein-report-download',()=>event('file_download',{file_name:'LIVE-IN-report.pdf',file_extension:'pdf'}));
})();
