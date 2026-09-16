const assets = [
  ['◒', 'Cold-water tanks', '2 tanks · 8,000 L total', 'Monthly inspection'],
  ['◉', 'Dialysis unit', 'Renal floor · 14 stations', 'Daily quality control'],
  ['▧', 'CSSD sterilisation', 'Basement level · 3 devices', 'Weekly maintenance'],
  ['≋', 'Cooling system', 'East wing · 2 towers', 'Legionella programme'],
];
const defaultRisks = [
  ['Legionella exposure', 'Cooling system · East wing', 'High', 'Temperature control and sampling', 'LM', 'Laura Martín', '18 Sep'],
  ['Stagnant water', 'Unused outlets · Ward 3', 'Medium', 'Weekly flushing programme', 'JR', 'Javier Ruiz', '14 Sep'],
  ['Water-quality interruption', 'Municipal supply', 'Medium', 'Supplier alert and contingency protocol', 'AG', 'Ana Gómez', '22 Sep'],
];
const defaultChecks = [
  {day:'10', mon:'Sep', title:'Cooling tower temperature below threshold', detail:'East wing · Sensor CT-04 · Automatic alert', state:'Overdue'},
  {day:'10', mon:'Sep', title:'Ward 3 flushing cycle not confirmed', detail:'12 outlets · Smart-valve feed · Automatic alert', state:'Overdue'},
  {day:'12', mon:'Sep', title:'Dialysis water-quality sample due', detail:'Renal floor · Laboratory feed expected', state:'Scheduled'},
  {day:'14', mon:'Sep', title:'Cold-water tank inspection due', detail:'Roof plant room · Facilities confirmation needed', state:'Scheduled'},
];
const $ = (s) => document.querySelector(s);
let actions=[{id:1,title:'Cooling tower temperature below threshold',area:'Punto de muestreo CT-04 · East wing',severity:'Critical',due:'10 Sep · 12:00',owner:'Laura Martín',initials:'LM',escalation:'Infection control notified',status:'Open',reading:'19.2 °C',threshold:'Expected operating range: 20–25 °C',consequence:'Potential Legionella growth risk affecting nearby clinical areas.',recommendation:'Isolate tower, verify sensor, take confirmatory sample, and document the acción correctiva.',history:'10 Sep 08:12 · Automatic alert created'},{id:2,title:'Ward 3 flushing cycle not confirmed',area:'Punto de muestreo · 12 unused outlets',severity:'High',due:'10 Sep · 16:00',owner:'Javier Ruiz',initials:'JR',escalation:'Facilities lead notified',status:'Open',reading:'No confirmation received',threshold:'Weekly flush confirmation required',consequence:'Stagnation may affect water quality at re-opening.',recommendation:'Complete flushing programme and attach maintenance record.',history:'10 Sep 07:30 · Reminder sent'},{id:3,title:'Dialysis water-quality sample due',area:'Punto de muestreo · Renal floor',severity:'Medium',due:'10 Sep · 18:00',owner:'Ana Gómez',initials:'AG',escalation:'Not escalated',status:'Awaiting evidence',reading:'Sample pending',threshold:'Laboratory result required before sign-off',consequence:'Dialysis service may require release hold until result is reviewed.',recommendation:'Collect sample and upload laboratory result.',history:'09 Sep 16:45 · Sampling task assigned'},{id:4,title:'Cold-water tank inspection evidence',area:'Roof plant room · Tank CW-02',severity:'Low',due:'09 Sep · 17:00',owner:'Sergio Molina',initials:'SM',escalation:'Facilities lead notified',status:'Overdue',reading:'Inspection completed; record missing',threshold:'Monthly inspection record required',consequence:'Inspection readiness gap; no immediate clinical impact identified.',recommendation:'Upload maintenance record and close the evidence gap.',history:'09 Sep 17:10 · Marked awaiting evidence'}];
const pageNames = {dashboard:'OVERVIEW',onboarding:'QUICK START',assets:'HOSPITAL SETUP',risks:'RISK REGISTER',monitoring:'MONITORING',report:'COMPLIANCE REPORT',plan:'PSA DOCUMENT'};
const hospitals = {
  santa: {name:'Santa Marina Hospital', short:'Santa Marina Hospital', initials:'SM', meta:'Madrid · 284 beds', city:'Madrid', beds:'284', user:'Laura Martín', score:'91%', readings:'26'},
  norte: {name:'Hospital del Norte', short:'Hospital del Norte', initials:'HN', meta:'Barcelona · 196 beds', city:'Barcelona', beds:'196', user:'Marc Vidal', score:'94%', readings:'31'},
  costa: {name:'Costa Salud Medical Centre', short:'Costa Salud', initials:'CS', meta:'Valencia · 118 beds', city:'Valencia', beds:'118', user:'Elena Torres', score:'88%', readings:'19'},
};
let activeHospital = localStorage.getItem('aquaguard-hospital') || 'santa';
function readData(key, fallback){try{return JSON.parse(localStorage.getItem(`aquaguard-${activeHospital}-${key}`)) ?? fallback;}catch{return fallback;}}
function saveData(key, value){localStorage.setItem(`aquaguard-${activeHospital}-${key}`, JSON.stringify(value));}
function loadHospitalData(){risks=readData('risks', defaultRisks); checks=readData('checks', defaultChecks); actions=readData('actions', actions);}
function persistAll(){saveData('risks',risks);saveData('checks',checks);saveData('actions',actions);}
function renderHospital(){
  const hospital = hospitals[activeHospital];
  $('#hospital-avatar').textContent = hospital.initials;
  $('#hospital-name').innerHTML = `${hospital.name}<small>${hospital.meta}</small>`;
  $('#welcome-hospital').textContent = hospital.short;
  $('#profile-switch').innerHTML = `${hospital.user.split(' ').map(n=>n[0]).join('')} <span>⌄</span>`;
  document.title = `AquaGuard | ${hospital.name}`;
  const setupHospital = document.querySelector('.setup-summary article strong');
  if(setupHospital) setupHospital.textContent = hospital.name;
  document.querySelectorAll('.paper-head h2').forEach(el => el.textContent = hospital.name);
  const stats = document.querySelectorAll('.stats article strong');
  stats[0].textContent = hospital.score;
  stats[3].textContent = hospital.readings;
  loadHospitalData();
  renderOnboarding();
}
let onboardingStep = 0;
function onboardingData(){ return JSON.parse(localStorage.getItem(`aquaguard-onboarding-${activeHospital}`) || '{}'); }
function saveOnboarding(data){ localStorage.setItem(`aquaguard-onboarding-${activeHospital}`, JSON.stringify(data)); }
function renderOnboarding(){
  const hospital = hospitals[activeHospital], data = onboardingData(), done = data.complete ? 4 : (data._step || 0);
  $('#onboarding-hospital-tag').textContent = hospital.name.toUpperCase();
  $('#onboarding-count').textContent = data.complete ? '✓' : `${Math.max(1, 4-done)}`;
  const labels = ['Site profile', 'Water system', 'Critical services', 'Safety team'];
  $('#onboarding-steps').innerHTML = labels.map((label,i)=>`<button class="onboarding-step ${i===onboardingStep?'active':''} ${i<done||data.complete?'done':''}" data-onboarding-step="${i}"><span>${i<done||data.complete?'✓':i+1}</span>${label}</button>`).join('');
  const panels = [
    `<p class="eyebrow">STEP 1 OF 4 · SITE PROFILE</p><h2>Tell us about ${hospital.short}.</h2><p class="lead">We use this to tailor site labels, reporting headers, and the starting compliance scope.</p><div class="onboarding-fields"><label>Hospital or clinic name<input data-onboarding="name" value="${data.name || hospital.name}" /></label><label>City<input data-onboarding="city" value="${data.city || hospital.city}" /></label><label>Number of beds / chairs<input data-onboarding="capacity" type="number" min="1" value="${data.capacity || hospital.beds}" /></label></div>`,
    `<p class="eyebrow">STEP 2 OF 4 · WATER SYSTEM</p><h2>Map the essential infrastructure.</h2><p class="lead">A simple starting map is enough. You can add detail later with your facilities team.</p><div class="onboarding-fields"><label>Primary water source<select data-onboarding="source"><option ${data.source==='Municipal supply'?'selected':''}>Municipal supply</option><option ${data.source==='Private borehole'?'selected':''}>Private borehole</option><option ${data.source==='Mixed supply'?'selected':''}>Mixed supply</option></select></label><label>Number of water-storage tanks<input data-onboarding="tanks" type="number" min="0" value="${data.tanks ?? 0}" /></label><label>Buildings or clinical areas<input data-onboarding="areas" value="${data.areas || 'Main building'}" /></label></div>`,
    `<p class="eyebrow">STEP 3 OF 4 · CRITICAL SERVICES</p><h2>Identify priority water uses.</h2><p class="lead">We will suggest relevant monitoring points and controls for the services you select.</p><div class="service-options">${['Dialysis','ICU / critical care','Sterilisation (CSSD)','Dental care','Cooling towers'].map(service=>`<label><input data-service="${service}" type="checkbox" ${(data.services || []).includes(service)?'checked':''} />${service}</label>`).join('')}</div>`,
    `<p class="eyebrow">STEP 4 OF 4 · SAFETY TEAM</p><h2>Choose the accountable lead.</h2><p class="lead">Invite the rest of the team later. This person receives the first monitoring and review reminders.</p><div class="onboarding-fields"><label>Water-safety lead<input data-onboarding="lead" value="${data.lead || hospital.user}" /></label><label>Lead email<input data-onboarding="leadEmail" type="email" value="${data.leadEmail || ''}" placeholder="name@hospital.org" /></label></div>`
  ];
  $('#onboarding-content').innerHTML = `<div class="onboarding-panel">${panels[onboardingStep]}<div class="dialog-actions"><button class="secondary" id="onboarding-back" ${onboardingStep===0?'disabled':''}>Back</button><button class="primary" id="onboarding-next">${onboardingStep===3?'Finish setup':'Continue'} <span>→</span></button></div></div>`;
  const source = data.source || 'Municipal supply', areas = data.areas || 'Main building', tanks = Number(data.tanks || 0), services = data.services?.length ? data.services : ['Critical clinical units'];
  const tankLabel = tanks ? `${tanks} storage tank${tanks === 1 ? '' : 's'}` : 'Direct distribution';
  $('#map-status').textContent = data.complete ? 'BASELINE READY' : 'DRAFT MAP';
  $('#onboarding-map').innerHTML = `<div class="map-node source"><span>◉</span><strong>${source}</strong><small>Water source</small></div><div class="map-connector"><i>→</i></div><div class="map-node site"><span>⌂</span><strong>${areas}</strong><small>${data.capacity || hospital.beds} beds / chairs</small></div><div class="map-branch"><div class="map-connector"><i>↓</i></div><div class="map-node storage"><span>▣</span><strong>${tankLabel}</strong><small>Storage & distribution</small></div><div class="map-connector"><i>→</i></div><div class="map-node critical"><span>✚</span><strong>${services.join(' · ')}</strong><small>Critical units</small></div></div>`;
  document.querySelectorAll('[data-onboarding-step]').forEach(button=>button.onclick=()=>{onboardingStep=Number(button.dataset.onboardingStep);renderOnboarding();});
  $('#onboarding-back').onclick=()=>{if(onboardingStep){onboardingStep--;renderOnboarding();}};
  $('#onboarding-next').onclick=()=>{
    const next = onboardingData();
    document.querySelectorAll('[data-onboarding]').forEach(input=>next[input.dataset.onboarding]=input.value);
    if(onboardingStep===2) next.services=[...document.querySelectorAll('[data-service]:checked')].map(input=>input.dataset.service);
    next._step = Math.max(next._step || 0, onboardingStep + 1);
    if(onboardingStep===3){ next.complete=true; saveOnboarding(next); renderOnboarding(); toast(`${hospital.name} is ready for monitoring.`); showPage('dashboard'); return; }
    saveOnboarding(next); onboardingStep++; renderOnboarding();
  };
}
function openLogin(){
  $('#hospital-select').innerHTML = Object.entries(hospitals).map(([id,h])=>`<option value="${id}" ${id===activeHospital?'selected':''}>${h.name} — ${h.meta}</option>`).join('');
  $('#login-email').value = '';
  $('#login-password').value = '';
  $('#hospital-login').showModal();
  $('#login-email').focus();
}
$('#hospital-switcher').onclick = openLogin;
$('#profile-switch').onclick = openLogin;
$('#login-form').addEventListener('submit', event => {
  if(!$('#login-email').checkValidity() || !$('#login-password').checkValidity()) { event.preventDefault(); return; }
  activeHospital = $('#hospital-select').value;
  localStorage.setItem('aquaguard-hospital', activeHospital);
  renderHospital();
  toast(`Connected to ${hospitals[activeHospital].name}.`);
});
function badge(level){ return `<span class="badge ${level === 'High' || level === 'Overdue' ? 'high' : level === 'Medium' ? 'medium' : 'low'}">${level}</span>`; }
function renderAssets(){ $('#asset-grid').innerHTML = assets.map(a=>`<article class="asset"><span>${a[0]}</span><h3>${a[1]}</h3><p>${a[2]}</p><small>${a[3]}</small></article>`).join(''); }
function renderRisks(){ $('#risk-table').innerHTML = risks.map(r=>`<tr><td><strong>${r[0]}</strong><small>${r[1]}</small></td><td>${badge(r[2])}</td><td>${r[3]}</td><td><div class="owner"><span class="avatar">${r[4]}</span>${r[5]}</div></td><td>${r[6]}</td></tr>`).join(''); $('#risk-count').textContent = risks.filter(r=>r[2] !== 'Low').length; }
function renderChecks(){ $('#monitoring-list').innerHTML = checks.map((c,i)=>`<div class="monitoring-row"><div class="date-pill"><strong>${c.day}</strong><span>${c.mon}</span></div><div><h3>${c.title}</h3><p>${c.detail}</p></div>${badge(c.state)}${c.state==='Overdue'?`<button class="check-button" data-check="${i}">Complete</button>`:''}</div>`).join(''); const overdue=checks.filter(c=>c.state==='Overdue'); $('#overdue-total').textContent=overdue.length; $('#monitor-count').textContent=overdue.length; $('#attention-list').innerHTML=overdue.map(c=>`<div class="attention-item"><span class="attention-symbol amber">!</span><div><strong>${c.title}</strong><small>${c.detail}</small></div><button data-page-target="monitoring">Complete →</button></div>`).join('') || '<p class="lead">Everything is up to date. Nice work.</p>'; document.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{checks[Number(b.dataset.check)].state='Complete'; persistAll(); renderChecks(); toast('Check recorded in the audit trail.');}); }
function showPage(id){ document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id)); document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===id)); $('#page-name').textContent=pageNames[id]; window.scrollTo({top:0,behavior:'smooth'}); }
document.querySelectorAll('[data-page], [data-page-target]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page || b.dataset.pageTarget)));
let entryType=''; const dialog=$('#entry-dialog');
function openDialog(type){entryType=type; $('#dialog-kicker').textContent=type.toUpperCase(); $('#dialog-title').textContent=type==='risk'?'Add a risk':'Add a reading'; $('#record-title').placeholder=type==='risk'?'e.g. Legionella exposure':'e.g. Tank temperature reading'; $('#record-detail').placeholder=type==='risk'?'e.g. East-wing cooling tower':'e.g. Sensor CT-04'; dialog.showModal();}
$('#add-risk').onclick=()=>openDialog('risk'); $('#add-check').onclick=()=>openDialog('check'); $('#add-asset').onclick=()=>toast('Asset creation is available in the full workflow.');
$('#save-record').onclick=()=>{ if(!$('#record-title').checkValidity()||!$('#record-detail').checkValidity()) return; const title=$('#record-title').value.trim(), detail=$('#record-detail').value.trim(); if(entryType==='risk'){risks.push([title,detail,'Medium','Control measure to be defined','SM','Safety Manager','Review due']); renderRisks();} else {checks.unshift({day:'10',mon:'Sep',title,detail,state:'Scheduled'});renderChecks();} persistAll(); $('#entry-dialog').close(); $('#record-title').value='';$('#record-detail').value='';toast('Record saved successfully.');};
$('#export-plan').onclick=()=>toast('Your PSA export is being prepared.');
$('#export-report').onclick=()=>{const open=actions.filter(a=>a.status!=='Resolved'),complete=checks.filter(c=>c.state==='Complete').length;const text=`AquaGuard compliance report\n${hospitals[activeHospital].name}\nGenerated: ${new Date().toLocaleString()}\n\nMonitoring checks complete: ${complete}/${checks.length}\nOpen corrective actions: ${open.length}\n\nOpen actions:\n${open.map(a=>`- ${a.title} (${a.severity}) — ${a.owner}`).join('\n')||'- None'}`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain'})),link=document.createElement('a');link.href=url;link.download=`aquaguard-${activeHospital}-compliance-report.txt`;link.click();URL.revokeObjectURL(url);};
function buildPdf(lines){const esc=s=>String(s).replace(/\\/g,'\\\\').replace(/\\(/g,'\\(').replace(/\\)/g,'\\)');const content=['BT','/F1 14 Tf','50 770 Td',...lines.flatMap((line,i)=>[i?'0 -22 Td':'',`(${esc(line)}) Tj`]),'ET'].join('\\n');const objects=[`1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj`,`2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj`,`3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>endobj`,`4 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj`,`5 0 obj<< /Length ${content.length} >>stream\\n${content}\\nendstream\\nendobj`];let pdf='%PDF-1.4\\n',offsets=[0];for(const object of objects){offsets.push(pdf.length);pdf+=object+'\\n';}const xref=pdf.length;pdf+=`xref\\n0 ${objects.length+1}\\n0000000000 65535 f \\n${offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \\n').join('')}trailer<< /Size ${objects.length+1} /Root 1 0 R >>\\nstartxref\\n${xref}\\n%%EOF`;return new Blob([pdf],{type:'application/pdf'});}
$('#export-report').onclick=()=>{const open=actions.filter(a=>a.status!=='Resolved'),complete=checks.filter(c=>c.state==='Complete').length;const lines=['AquaGuard compliance report',hospitals[activeHospital].name,`Generated: ${new Date().toLocaleString()}`,'',`Monitoring checks complete: ${complete}/${checks.length}`,`Open corrective actions: ${open.length}`,'','Open actions:',...open.map(a=>`- ${a.title} (${a.severity}) - ${a.owner}`)];const url=URL.createObjectURL(buildPdf(lines)),link=document.createElement('a');link.href=url;link.download=`aquaguard-${activeHospital}-compliance-report.pdf`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function toast(message){const el=$('#toast');el.textContent=message;el.className='show';setTimeout(()=>el.className='',2800);}
function renderActions(){const open=actions.filter(a=>a.status!=='Resolved');$('#action-summary').innerHTML=`<button><strong>${open.filter(a=>a.severity==='Critical').length}</strong><span>critical actions</span></button><button><strong>${open.filter(a=>a.due.includes('10 Sep')).length}</strong><span>due today</span></button><button><strong>${open.filter(a=>a.status==='Overdue').length}</strong><span>overdue</span></button><button><strong>${open.filter(a=>a.status==='Awaiting evidence').length}</strong><span>awaiting evidence</span></button>`;$('#attention-list').innerHTML=open.map(a=>`<article class="action-row ${a.severity.toLowerCase()}"><div class="action-priority">${a.severity[0]}</div><div class="action-main"><strong>${a.title}</strong><small>${a.area}</small><div class="action-meta">${badge(a.severity)} <span>Due ${a.due}</span><span class="owner"><span class="avatar">${a.initials}</span>${a.owner}</span></div></div><div class="action-state"><span>${a.status}</span><small>${a.escalation}</small></div><button class="text-button open-action" data-action="${a.id}">Open →</button></article>`).join('');document.querySelectorAll('.open-action').forEach(b=>b.onclick=()=>openAction(+b.dataset.action));}
let selectedAction;function openAction(id){selectedAction=actions.find(a=>a.id===id);$('#action-title').textContent=selectedAction.title;$('#action-detail').innerHTML=`<div class="detail-grid"><p><b>Área / punto de muestreo</b>${selectedAction.area}</p><p><b>Lectura / observación</b>${selectedAction.reading}<br>${selectedAction.threshold}</p><p><b>Fecha y hora</b>10 Sep 2026 · 08:12 CET</p><p><b>Consecuencia operativa</b>${selectedAction.consequence}</p><p><b>Acción correctiva recomendada</b>${selectedAction.recommendation}</p><p><b>Persona responsable · deadline</b>${selectedAction.owner} · ${selectedAction.due}</p><p><b>Escalación</b>${selectedAction.escalation}</p><p><b>Historial de actividad</b>${selectedAction.history}</p></div>`;$('#action-dialog').showModal();}$('#resolve-action').onclick=()=>{$('#action-dialog').close();$('#resolve-dialog').showModal()};$('#save-resolution').onclick=()=>{if(!$('#resolution-notes').checkValidity()||!$('#resolution-owner').checkValidity())return;selectedAction.status='Resolved';selectedAction.history+=` · Resuelto por ${$('#resolution-owner').value}, 10 Sep 2026 · 09:05 CET`;selectedAction.evidence=$('#evidence-file').files[0]?.name||'Nota de acción registrada';saveData('actions',actions);$('#resolve-dialog').close();renderActions();toast('Action resolved and preserved in the audit trail.');};
const publicDataCard=document.createElement('section');publicDataCard.className='card public-data-card';publicDataCard.innerHTML='<p class="eyebrow">PUBLIC DATA · EUROSTAT</p><h2>European water-use context</h2><p class="lead">Live public data adds context to the hospital demo.</p><strong id="eurostat-value">Loading…</strong><p id="eurostat-label">Fetching Spain water data</p><small>Source: Eurostat API · env_wat_abs · Spain</small>';document.querySelector('.context-grid').after(publicDataCard);
async function loadEurostatWaterData(){const value=$('#eurostat-value'),label=$('#eurostat-label');try{const response=await fetch('https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_wat_abs?geo=ES&lang=en');if(!response.ok)throw new Error(response.status);const data=await response.json();const values=Object.values(data.value||{}).filter(Number.isFinite);if(!values.length)throw new Error('No data');value.textContent=new Intl.NumberFormat('en-GB',{maximumFractionDigits:1}).format(values[values.length-1]);label.textContent='Latest reported water-abstraction value';}catch(error){value.textContent='Unavailable';label.textContent='Eurostat is temporarily unavailable';console.warn('Eurostat unavailable',error);}}
renderHospital();renderAssets();renderRisks();renderChecks();renderActions();loadEurostatWaterData();
