const state = {
  reportGenerated: false,
  reportId: null,
  risks: [
    { id: 1, level: 'high', title: 'Control térmico insuficiente en retorno de ACS', area: 'Depósito ACS · Planta técnica', score: '16 / 25', owner: 'Mantenimiento', measure: 'Verificar ajuste de recirculación y registrar temperatura de retorno durante 7 días.' },
    { id: 2, level: 'high', title: 'Variación de conductividad en punto UCI-03', area: 'UCI · Grifo 03', score: '15 / 25', owner: 'Calidad', measure: 'Realizar toma de contraste y revisar el historial de mantenimiento del punto.' },
    { id: 3, level: 'medium', title: 'Muestreo de Legionella próximo a vencimiento', area: 'Hospitalización · Planta 2', score: '10 / 25', owner: 'Prevención', measure: 'Confirmar toma externa programada y adjuntar resultado al registro.' },
    { id: 4, level: 'low', title: 'Trazabilidad parcial de purgas semanales', area: 'Ala este · Planta 3', score: '6 / 25', owner: 'Mantenimiento', measure: 'Completar la plantilla semanal y asociar responsable de turno.' }
  ],
  readings: [
    { point: 'Depósito ACS', parameter: 'Temperatura retorno', value: '51.8 °C', reference: '≥ 50 °C', date: '10 sept · 09:42', status: 'Conforme', kind: 'ok' },
    { point: 'UCI — grifo 03', parameter: 'Conductividad', value: '864 µS/cm', reference: '≤ 800 µS/cm', date: '10 sept · 09:37', status: 'Revisar', kind: 'watch' },
    { point: 'Planta 2', parameter: 'Cloro libre', value: '0.48 mg/L', reference: '0.2–1.0 mg/L', date: '10 sept · 09:31', status: 'Conforme', kind: 'ok' },
    { point: 'Acometida', parameter: 'pH', value: '7.36', reference: '6.5–9.5', date: '10 sept · 09:25', status: 'Conforme', kind: 'ok' },
    { point: 'Laboratorio', parameter: 'Temperatura fría', value: '18.1 °C', reference: '≤ 20 °C', date: '10 sept · 08:54', status: 'Conforme', kind: 'ok' }
  ],
  alerts: [
    { id: 1, title: 'Conductividad fuera de referencia', source: 'UCI — grifo 03 · 864 µS/cm', action: 'Solicitar una muestra de contraste y revisar el pretratamiento del punto.', owner: 'María R.', due: 'Hoy · antes de 17:00', resolved: false },
    { id: 2, title: 'Temperatura de retorno en seguimiento', source: 'Depósito ACS · 51.8 °C', action: 'Mantener seguimiento diario hasta confirmar estabilidad durante una semana.', owner: 'Carlos M.', due: '12 sept · 12:00', resolved: false }
  ],
  selectedAlert: 1
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const titles = { dashboard: 'Vista general', setup: 'Configuración del hospital', monitoring: 'Monitorización automatizada', risks: 'Registro de riesgos', actions: 'Alertas y acciones', report: 'Informe de inspección', psa: 'Plan Sanitario del Agua' };

function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function navigate(view) {
  if (view === 'psa' && !state.reportGenerated) showToast('Genera primero el informe para habilitar el PSA.');
  $$('.view').forEach(v => v.classList.toggle('active', v.id === view));
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  $('#page-title').textContent = titles[view];
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderReadings() {
  $('#readings-body').innerHTML = state.readings.map(r => `<tr><td><strong>${r.point}</strong></td><td>${r.parameter}</td><td><strong>${r.value}</strong></td><td>${r.reference}</td><td>${r.date}</td><td><span class="state ${r.kind}">${r.status}</span></td></tr>`).join('');
}

function renderRisks() {
  $('#risk-list').innerHTML = state.risks.map(r => `<article class="risk-item ${r.level}"><span class="risk-stripe"></span><div><h3>${r.title}</h3><p>${r.area}</p></div><div class="risk-meta"><label>RESPONSABLE</label><b>${r.owner}</b></div><div class="risk-meta"><label>PUNTUACIÓN</label><b class="score">${r.score}</b></div><button class="risk-control" data-risk="${r.id}">Ver controles</button></article>`).join('');
  $('#risk-count').textContent = state.risks.length;
  $('#priority-risks').innerHTML = state.risks.slice(0, 3).map(r => `<div class="priority-row"><span class="bar ${r.level}"></span><div><strong>${r.title}</strong><p>${r.area} · Responsable: ${r.owner}</p></div><small class="tag-${r.level}">${r.level === 'high' ? 'ALTO' : r.level === 'medium' ? 'MEDIO' : 'BAJO'}</small></div>`).join('');
}

function renderAlerts() {
  const open = state.alerts.filter(a => !a.resolved).length;
  $('#alert-count').textContent = open;
  $('#action-badge').textContent = open;
  $('#monitor-badge').textContent = open;
  $('#open-alert-title').textContent = `${open} alerta${open === 1 ? '' : 's'} pendiente${open === 1 ? '' : 's'}`;
  $('#alerts-list').innerHTML = state.alerts.map(a => `<div class="alert-item ${a.id === state.selectedAlert ? 'selected' : ''} ${a.resolved ? 'resolved' : ''}" data-alert="${a.id}"><div class="alert-top"><strong>${a.title}</strong><span class="alert-status">${a.resolved ? 'RESUELTA' : 'ABIERTA'}</span></div><p>${a.source}</p></div>`).join('');
  const alert = state.alerts.find(a => a.id === state.selectedAlert) || state.alerts[0];
  $('#action-detail-content').innerHTML = `<h3>${alert.title}</h3><p>${alert.action}</p><div class="detail-link"><span>↗</span><div>Lectura asociada<br /><b>${alert.source}</b></div></div><p><strong>Fecha objetivo:</strong> ${alert.due}</p><div class="owner-row"><span class="avatar">${alert.owner.split(' ').map(w => w[0]).join('')}</span><div><strong>${alert.owner}</strong><small>Responsable asignado</small></div></div><button class="primary" id="resolve-selected" style="margin-top:20px">${alert.resolved ? 'Reabrir acción' : 'Marcar como resuelta'}</button>`;
}

function generateReport() {
  state.reportGenerated = true;
  state.reportId = `HSL-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const open = state.alerts.filter(a => !a.resolved).length;
  $('#report-status').textContent = 'GENERADO'; $('#report-status').className = 'generated';
  $('#report-actions').textContent = open; $('#psa-report-ref').textContent = `Informe ${state.reportId}`;
  $('#psa-locked').classList.add('hidden'); $('#psa-editor').classList.remove('hidden');
  $('.nav-item[data-view="psa"]').classList.remove('locked');
  $('#readiness-score').textContent = open ? '72' : '86';
  $('#preview-score').textContent = open ? '72 / 100' : '86 / 100';
  $('#readiness-label').textContent = open ? 'Atención requerida' : 'Preparado para revisión';
  $('#readiness-copy').textContent = open ? `${open} acciones abiertas requieren seguimiento.` : 'No quedan acciones abiertas en la demo.';
  renderPsaMeasures();
  showToast(`Informe ${state.reportId} generado con los registros actuales.`);
}

function renderPsaMeasures() {
  $('#psa-measures').innerHTML = state.risks.slice(0, 3).map(r => `<div class="psa-measure"><i>◆</i><span><strong>${r.title}</strong><br />${r.measure}</span></div>`).join('');
}

function addReading() {
  state.readings.unshift({ point: 'Sala de diálisis', parameter: 'Conductividad', value: '672 µS/cm', reference: '≤ 800 µS/cm', date: '10 sept · ahora', status: 'Conforme', kind: 'ok' });
  renderReadings(); showToast('Lectura demo añadida al registro.');
}

function addRisk() {
  const id = Date.now(); state.risks.push({ id, level: 'medium', title: 'Nuevo riesgo de demostración', area: 'Ubicación pendiente de completar', score: '8 / 25', owner: 'Sin asignar', measure: 'Definir medida de control y responsable antes de la siguiente revisión.' });
  renderRisks(); renderPsaMeasures(); showToast('Riesgo demo añadido al registro.');
}

function init() {
  renderReadings(); renderRisks(); renderAlerts();
  $$('.nav-item').forEach(button => button.addEventListener('click', () => navigate(button.dataset.view)));
  $$('[data-view-link]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.viewLink)));
  $('.save-setup').addEventListener('click', () => showToast('Configuración guardada en esta sesión de demo.'));
  $('#add-reading').addEventListener('click', addReading);
  $('#add-risk').addEventListener('click', addRisk);
  $('#generate-report').addEventListener('click', generateReport);
  $('#save-psa').addEventListener('click', () => showToast('PSA demo guardado en esta sesión.'));
  $('#export-psa').addEventListener('click', () => showToast('Vista de exportación preparada (demo sin archivo).'));
  $('#risk-list').addEventListener('click', e => { const btn = e.target.closest('.risk-control'); if (btn) showToast('Controles asociados: revisión disponible en el futuro PSA.'); });
  $('#alerts-list').addEventListener('click', e => { const row = e.target.closest('.alert-item'); if (row) { state.selectedAlert = Number(row.dataset.alert); renderAlerts(); } });
  $('.action-detail').addEventListener('click', e => { if (e.target.id === 'resolve-selected') { const a = state.alerts.find(x => x.id === state.selectedAlert); a.resolved = !a.resolved; renderAlerts(); showToast(a.resolved ? 'Acción marcada como resuelta.' : 'Acción reabierta.'); } });
  $('#resolve-all').addEventListener('click', () => { state.alerts.forEach(a => a.resolved = true); renderAlerts(); showToast('Las alertas demo se han marcado como revisadas.'); });
}
init();
