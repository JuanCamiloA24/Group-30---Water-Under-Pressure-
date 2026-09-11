const assets = [
  ['◒', 'Cold-water tanks', '2 tanks · 8,000 L total', 'Monthly inspection'],
  ['◉', 'Dialysis unit', 'Renal floor · 14 stations', 'Daily quality control'],
  ['▧', 'CSSD sterilisation', 'Basement level · 3 devices', 'Weekly maintenance'],
  ['≋', 'Cooling system', 'East wing · 2 towers', 'Legionella programme'],
];
let risks = [
  ['Legionella exposure', 'Cooling system · East wing', 'High', 'Temperature control and sampling', 'LM', 'Laura Martín', '18 Sep'],
  ['Stagnant water', 'Unused outlets · Ward 3', 'Medium', 'Weekly flushing programme', 'JR', 'Javier Ruiz', '14 Sep'],
  ['Water-quality interruption', 'Municipal supply', 'Medium', 'Supplier alert and contingency protocol', 'AG', 'Ana Gómez', '22 Sep'],
];
let checks = [
  {day:'10', mon:'Sep', title:'Cooling tower temperature below threshold', detail:'East wing · Sensor CT-04 · Automatic alert', state:'Overdue'},
  {day:'10', mon:'Sep', title:'Ward 3 flushing cycle not confirmed', detail:'12 outlets · Smart-valve feed · Automatic alert', state:'Overdue'},
  {day:'12', mon:'Sep', title:'Dialysis water-quality sample due', detail:'Renal floor · Laboratory feed expected', state:'Scheduled'},
  {day:'14', mon:'Sep', title:'Cold-water tank inspection due', detail:'Roof plant room · Facilities confirmation needed', state:'Scheduled'},
];
const $ = (s) => document.querySelector(s);
const pageNames = {dashboard:'OVERVIEW',assets:'HOSPITAL SETUP',risks:'RISK REGISTER',monitoring:'MONITORING',report:'COMPLIANCE REPORT',plan:'PSA DOCUMENT'};
function badge(level){ return `<span class="badge ${level === 'High' || level === 'Overdue' ? 'high' : level === 'Medium' ? 'medium' : 'low'}">${level}</span>`; }
function renderAssets(){ $('#asset-grid').innerHTML = assets.map(a=>`<article class="asset"><span>${a[0]}</span><h3>${a[1]}</h3><p>${a[2]}</p><small>${a[3]}</small></article>`).join(''); }
function renderRisks(){ $('#risk-table').innerHTML = risks.map(r=>`<tr><td><strong>${r[0]}</strong><small>${r[1]}</small></td><td>${badge(r[2])}</td><td>${r[3]}</td><td><div class="owner"><span class="avatar">${r[4]}</span>${r[5]}</div></td><td>${r[6]}</td></tr>`).join(''); $('#risk-count').textContent = risks.filter(r=>r[2] !== 'Low').length; }
function renderChecks(){ $('#monitoring-list').innerHTML = checks.map((c,i)=>`<div class="monitoring-row"><div class="date-pill"><strong>${c.day}</strong><span>${c.mon}</span></div><div><h3>${c.title}</h3><p>${c.detail}</p></div>${badge(c.state)}${c.state==='Overdue'?`<button class="check-button" data-check="${i}">Complete</button>`:''}</div>`).join(''); const overdue=checks.filter(c=>c.state==='Overdue'); $('#overdue-total').textContent=overdue.length; $('#monitor-count').textContent=overdue.length; $('#attention-list').innerHTML=overdue.map((c,i)=>`<div class="attention-item"><span class="attention-symbol amber">!</span><div><strong>${c.title}</strong><small>${c.detail}</small></div><button data-page-target="monitoring">Complete →</button></div>`).join('') || '<p class="lead">Everything is up to date. Nice work.</p>'; document.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{checks[Number(b.dataset.check)].state='Complete'; renderChecks(); toast('Check recorded in the audit trail.');}); }
function showPage(id){ document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id)); document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===id)); $('#page-name').textContent=pageNames[id]; window.scrollTo({top:0,behavior:'smooth'}); }
document.querySelectorAll('[data-page], [data-page-target]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page || b.dataset.pageTarget)));
let entryType=''; const dialog=$('#entry-dialog');
function openDialog(type){entryType=type; $('#dialog-kicker').textContent=type.toUpperCase(); $('#dialog-title').textContent=type==='risk'?'Add a risk':'Add a reading'; $('#record-title').placeholder=type==='risk'?'e.g. Legionella exposure':'e.g. Tank temperature reading'; $('#record-detail').placeholder=type==='risk'?'e.g. East-wing cooling tower':'e.g. Sensor CT-04'; dialog.showModal();}
$('#add-risk').onclick=()=>openDialog('risk'); $('#add-check').onclick=()=>openDialog('check'); $('#add-asset').onclick=()=>toast('Asset creation is available in the full workflow.');
$('#save-record').onclick=(e)=>{ if(!$('#record-title').checkValidity()||!$('#record-detail').checkValidity()) return; const title=$('#record-title').value, detail=$('#record-detail').value; if(entryType==='risk'){risks.push([title,detail,'Medium','Control measure to be defined','SM','Safety Manager','Review due']); renderRisks();} else {checks.unshift({day:'10',mon:'Sep',title,detail,state:'Scheduled'});renderChecks();} $('#record-title').value='';$('#record-detail').value='';toast('Record saved successfully.');};
$('#export-plan').onclick=()=>toast('Your PSA export is being prepared.');
$('#export-report').onclick=()=>toast('Your compliance report export is being prepared.');
function toast(message){const el=$('#toast');el.textContent=message;el.className='show';setTimeout(()=>el.className='',2800);}
renderAssets();renderRisks();renderChecks();
