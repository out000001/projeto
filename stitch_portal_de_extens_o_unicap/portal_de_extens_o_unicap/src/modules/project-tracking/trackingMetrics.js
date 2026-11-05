export function currentMonth() {
  return new Date().toLocaleDateString('en-CA', {timeZone: 'America/Sao_Paulo'}).slice(0, 7);
}

export function validMonth(month, config) {
  const start = config.startDate?.slice(0, 7);
  const end = config.endDate?.slice(0, 7);
  return start && month < start ? start : end && month > end ? end : month;
}

export function trackingMonths(tracking) {
  const {startDate, endDate} = tracking.config;
  if (!startDate || !endDate) return [...new Set([...Object.keys(tracking.frequency), currentMonth()])].sort();
  const result = [];
  const date = new Date(`${startDate.slice(0, 7)}-01T12:00:00Z`);
  const end = endDate.slice(0, 7);
  while (date.toISOString().slice(0, 7) <= end && result.length < 132) {
    result.push(date.toISOString().slice(0, 7));
    date.setUTCMonth(date.getUTCMonth() + 1);
  }
  return result;
}

export function participantHours(tracking, participantId) {
  return Object.values(tracking.frequency).reduce((totals, sheet) => {
    const record = sheet[participantId];
    totals.registered += record?.hours || 0;
    totals.approved += record?.status === 'homologada' ? record.hours : 0;
    return totals;
  }, {registered: 0, approved: 0});
}

export function frequencySummary(tracking, month) {
  const active = tracking.participants.filter(p => p.active);
  const sheet = tracking.frequency[month] || {};
  const approved = active.filter(p => sheet[p.id]?.status === 'homologada').length;
  return {total: active.length, approved, pending: active.length - approved,
    percent: active.length ? Math.round(approved / active.length * 100) : 0};
}

export function executionSummary(tracking) {
  const active = tracking.participants.filter(p => p.active);
  const approved = active.reduce((sum, p) => sum + participantHours(tracking, p.id).approved, 0);
  const planned = tracking.config.totalHours * active.length;
  return {approved, planned, percent: planned ? Math.round(approved / planned * 100) : null};
}

export const monthLabel = month => new Date(`${month}-15T12:00:00`).toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'});
