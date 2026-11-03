(function(){
 const form=document.getElementById('lead-form');if(!form)return;
 const status=document.getElementById('lead-status'),success=document.querySelector('.modal .success'),button=form.querySelector('[type=submit]');
 let submissionId=null,submitted=false,busy=false,lastPayload='';
 form.addEventListener('reset',()=>{submissionId=null;submitted=false;lastPayload='';status.textContent='';button.disabled=false;button.textContent="Senden Sie eine Anfrage";});
 form.onsubmit=async e=>{
  e.preventDefault();if(busy||submitted||!form.reportValidity())return;
  const data=new FormData(form),payload={form_type:data.get('service'),name:data.get('name'),email:data.get('email'),phone:data.get('phone'),city:data.get('city'),details:data.get('message'),website:data.get('website'),consent:data.get('consent')==='on'};
  const serialized=JSON.stringify(payload);
  if(lastPayload&&serialized!==lastPayload){status.textContent="Die vorherige Einreichung konnte noch nicht bestätigt werden. Kontaktieren Sie uns unter info@live-in.international.";return;}
  submissionId ||= crypto.randomUUID();payload.submission_id=submissionId;lastPayload=serialized;
  busy=true;button.disabled=true;button.textContent='Wird gesendet…';status.textContent='';
  try{
   const response=await fetch('https://147439.eu11.myftpupload.com/wp-json/livein-web/v1/enquiry-v2',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(25000)});
   const result=await response.json();
   if(!response.ok||result.success!==true){status.textContent="Die Anfrage konnte nicht bestätigt werden. Schreiben Sie uns an info@live-in.international.";if([400,403,413,429,503].includes(response.status)){lastPayload='';submissionId=null;}return;}
   submitted=true;window.dispatchEvent(new Event('livein-lead-success'));form.hidden=true;success.hidden=false;success.textContent="Danke schön. Ihre Anfrage wurde zur Bearbeitung angenommen. Wir werden Sie unter der angegebenen Kontaktadresse kontaktieren.";
  }catch(err){status.textContent="Die Annahme konnte nicht bestätigt werden. Versuchen Sie, die gleiche Sendung zu überprüfen, oder senden Sie uns eine E-Mail an info@live-in.international.";}
  finally{busy=false;button.disabled=submitted;button.textContent=lastPayload&&!submitted?"Übermittlung überprüfen":"Senden Sie eine Anfrage";}
 };
})();
