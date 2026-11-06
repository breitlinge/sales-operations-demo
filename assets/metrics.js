(function (root) {
  'use strict';
  const data = typeof module !== 'undefined' && module.exports ? require('./data.js') : root.DemoData;
  const isOpen = row => !['Won','Lost'].includes(row.stage);
  const isOverdue = (row, today = data.today) => isOpen(row) && Boolean(row.dueDate) && row.dueDate < today;
  const isMissing = row => isOpen(row) && (!row.nextStep.trim() || !row.dueDate);
  const weighted = row => Math.round(row.amount * data.probabilities[row.stage]);
  function periodBounds(period, today = data.today) {
    const d = new Date(today + 'T12:00:00Z');
    const iso = date => date.toISOString().slice(0,10);
    const year = d.getUTCFullYear(), month = d.getUTCMonth();
    if (period === 'week') { const start = new Date(d); start.setUTCDate(d.getUTCDate() - (d.getUTCDay()+6)%7); const end = new Date(start); end.setUTCDate(start.getUTCDate()+6); return [iso(start),iso(end)]; }
    if (period === 'month') return [iso(new Date(Date.UTC(year,month,1))),iso(new Date(Date.UTC(year,month+1,0)))];
    if (period === 'quarter') { const q = Math.floor(month/3)*3; return [iso(new Date(Date.UTC(year,q,1))),iso(new Date(Date.UTC(year,q+3,0)))]; }
    if (period === 'year') return [`${year}-01-01`,`${year}-12-31`];
    return null;
  }
  const inPeriod = (date,period,today) => {const bounds = periodBounds(period,today); return !bounds || (date >= bounds[0] && date <= bounds[1]);};
  function filter(rows, {query='',owner='all',stage='all',period='all'} = {}) {
    const q = query.trim().toLowerCase();
    return rows.filter(row => (owner === 'all' || row.owner === owner) && (stage === 'all' || row.stage === stage) && inPeriod(row.closeDate,period) && [row.account,row.name,row.industry,row.source].join(' ').toLowerCase().includes(q));
  }
  function summary(rows) {
    const open = rows.filter(isOpen);
    return { count: rows.length, openCount: open.length, openValue: open.reduce((s,r)=>s+r.amount,0), weightedValue: open.reduce((s,r)=>s+weighted(r),0), overdue: open.filter(r=>isOverdue(r)).length, missing: open.filter(isMissing).length, wonValue: rows.filter(r=>r.stage==='Won').reduce((s,r)=>s+r.amount,0) };
  }
  function priority(rows) { return rows.filter(isOpen).sort((a,b) => { const rank = r => isOverdue(r) ? 0 : isMissing(r) ? 1 : r.dueDate === data.today ? 2 : 3; return rank(a)-rank(b) || (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || b.amount-a.amount; }); }
  function csvCell(value) { let s = String(value ?? ''); if (/^[\s]*[=+@-]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g,'""') + '"'; }
  function toCsv(rows) {
    const headers = ['Demo ID','Fictional account','Opportunity','Fictional owner','Stage','Amount USD','Illustrative probability','Weighted USD','Expected close','Next step due','Next step','Source','Data status'];
    return [headers,...rows.map(r=>[r.id,r.account,r.name,r.owner,r.stage,r.amount,data.probabilities[r.stage],weighted(r),r.closeDate,r.dueDate,r.nextStep,r.source,'SYNTHETIC'])].map(r=>r.map(csvCell).join(',')).join('\r\n');
  }
  const api = { isOpen,isOverdue,isMissing,weighted,periodBounds,inPeriod,filter,summary,priority,csvCell,toCsv };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DemoMetrics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
