(function(){
 const form=document.getElementById('lead-form');if(!form)return;
 const status=document.getElementById('lead-status'),success=document.querySelector('.modal .success'),button=form.querySelector('[type=submit]');
 let submissionId=null,submitted=false,busy=false,lastPayload='';
 form.addEventListener('reset',()=>{submissionId=null;submitted=false;lastPayload='';status.textContent='';button.disabled=false;button.textContent="Odeslat poptávku";});
 form.onsubmit=async e=>{
  e.preventDefault();if(busy||submitted||!form.reportValidity())return;
  const data=new FormData(form),payload={form_type:data.get('service'),name:data.get('name'),email:data.get('email'),phone:data.get('phone'),city:data.get('city'),details:data.get('message'),website:data.get('website'),consent:data.get('consent')==='on'};
  const serialized=JSON.stringify(payload);
  if(lastPayload&&serialized!==lastPayload){status.textContent="Předchozí odeslání se ještě nepodařilo potvrdit. Kontaktujte nás na info@live-in.international.";return;}
  submissionId ||= crypto.randomUUID();payload.submission_id=submissionId;lastPayload=serialized;
  busy=true;button.disabled=true;button.textContent="Odesílání…";status.textContent='';
  try{
   const response=await fetch('https://147439.eu11.myftpupload.com/wp-json/livein-web/v1/enquiry-v2',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(25000)});
   const result=await response.json();
   if(!response.ok||result.success!==true){status.textContent="Poptávku se nepodařilo potvrdit. Napište nám na info@live-in.international.";if([400,403,413,429,503].includes(response.status)){lastPayload='';submissionId=null;}return;}
   submitted=true;window.dispatchEvent(new Event('livein-lead-success'));form.hidden=true;success.hidden=false;success.textContent="Děkujeme. Vaše poptávka byla přijata ke zpracování. Ozveme se vám na uvedený kontakt.";
  }catch(err){status.textContent="Přijetí se nepodařilo potvrdit. Zkuste ověřit stejné odeslání nebo nám napište na info@live-in.international.";}
  finally{busy=false;button.disabled=submitted;button.textContent=lastPayload&&!submitted?"Ověřit odeslání":"Odeslat poptávku";}
 };
})();
