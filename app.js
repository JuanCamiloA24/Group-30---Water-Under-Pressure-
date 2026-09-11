const pages=[...document.querySelectorAll('.page')],name=document.querySelector('#page-name');
const labels={dashboard:'OVERVIEW',assets:'HOSPITAL SETUP',risks:'RISK REGISTER',monitoring:'MONITORING',report:'COMPLIANCE REPORT',plan:'PSA DOCUMENT'};
function go(id){pages.forEach(p=>p.classList.toggle('active',p.id===id));document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===id));if(name)name.textContent=labels[id]||'OVERVIEW';window.scrollTo(0,0)}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
document.querySelectorAll('[data-page-target]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.pageTarget)));
