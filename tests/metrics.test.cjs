const {test}=require('node:test');
const assert=require('node:assert/strict');
const D=require('../assets/data.js');
const M=require('../assets/metrics.js');
test('sample identities are unique and all enum and amount values are valid',()=>{
  assert.equal(new Set(D.opportunities.map(r=>r.id)).size,12);
  for(const r of D.opportunities){assert.ok(D.stages.includes(r.stage));assert.ok(Number.isFinite(r.amount)&&r.amount>=0);assert.match(r.account,/^Account \d{2}$/);assert.match(r.closeDate,/^\d{4}-\d{2}-\d{2}$/);}
  for(const a of D.activities)assert.ok(D.opportunities.some(r=>r.id===a.opportunityId));
});
test('baseline metrics agree with hand-calculated expected results',()=>{
  assert.deepEqual(M.summary(D.opportunities),{count:12,openCount:9,openValue:350000,weightedValue:200600,overdue:3,missing:1,wonValue:80000});
});
test('closed-won and lost deals are excluded from open metrics and followups',()=>{
  assert.deepEqual(M.summary(D.opportunities.filter(r=>['Won','Lost'].includes(r.stage))),{count:3,openCount:0,openValue:0,weightedValue:0,overdue:0,missing:0,wonValue:80000});
  assert.equal(M.priority(D.opportunities).length,9);
});
test('empty results have zero metrics, not NaN',()=>{assert.deepEqual(M.summary([]),{count:0,openCount:0,openValue:0,weightedValue:0,overdue:0,missing:0,wonValue:0});});
test('owner, stage, search and period filters compose',()=>{
  assert.equal(M.filter(D.opportunities,{owner:'Avery'}).length,4);
  assert.equal(M.filter(D.opportunities,{owner:'Morgan',stage:'Negotiation',query:'partner',period:'week'})[0].id,'D12');
  assert.equal(M.filter(D.opportunities,{query:' NO MATCH '}).length,0);
  assert.equal(M.filter(D.opportunities,{query:' LOGISTICS '}).length,3);
});
test('week is Monday to Sunday and dates are timezone independent',()=>{
  assert.deepEqual(M.periodBounds('week'),['2026-11-02','2026-11-08']);
  assert.deepEqual(M.periodBounds('week','2026-11-01'),['2026-10-26','2026-11-01']);
  assert.ok(M.inPeriod('2026-11-02','week'));assert.ok(M.inPeriod('2026-11-08','week'));assert.ok(!M.inPeriod('2026-11-09','week'));
});
test('month, quarter and year bounds handle calendar boundaries',()=>{
  assert.deepEqual(M.periodBounds('month','2024-02-10'),['2024-02-01','2024-02-29']);
  assert.deepEqual(M.periodBounds('quarter'),['2026-10-01','2026-12-31']);
  assert.deepEqual(M.periodBounds('year'),['2026-01-01','2026-12-31']);
});
test('due today is not overdue, and missing next steps are distinct',()=>{
  assert.ok(!M.isOverdue(D.opportunities.find(r=>r.id==='D12')));
  assert.ok(M.isOverdue(D.opportunities.find(r=>r.id==='D01')));
  assert.ok(M.isMissing(D.opportunities.find(r=>r.id==='D11')));
  assert.equal(M.priority(D.opportunities)[0].id,'D08');
});
test('weighted values use explicitly defined illustrative stage weights',()=>{assert.equal(M.weighted(D.opportunities[0]),25200);assert.equal(M.weighted({...D.opportunities[0],stage:'Lost'}),0);});
test('CSV escapes quotes, commas, newlines and formula-like strings',()=>{
  assert.equal(M.csvCell('a,"b"'),'"a,""b"""');
  assert.equal(M.csvCell('=1+1'),'"\'=1+1"');
  assert.equal(M.csvCell('  @SUM(A1)'),'"\'  @SUM(A1)"');
  assert.equal(M.csvCell('line\nbreak'),'"line\nbreak"');
  assert.ok(M.toCsv(D.opportunities).includes('SYNTHETIC'));
  assert.equal(M.toCsv(D.opportunities).split('\r\n').length,13);
});
