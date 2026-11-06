(function () {
  'use strict';
  const D = window.DemoData, M = window.DemoMetrics, $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));
  let opportunities = clone(D.opportunities), activities = clone(D.activities), view = 'table', selectedId = null, activityCounter = 0, toastTimer;
  const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
  const shortMoney = n => n >= 1000 ? '$' + (n/1000).toLocaleString('en-US',{maximumFractionDigits:1}) + 'k' : money(n);
  const date = value => value ? new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z')) : 'Not set';
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const filters = () => ({query:$('search').value,owner:$('owner').value,stage:$('stage').value,period:$('period').value});
  function badge(row) { if (!M.isOpen(row)) return '<span class="badge closed">Closed</span>'; if (M.isOverdue(row)) return '<span class="badge overdue">Overdue · '+date(row.dueDate)+'</span>'; if (M.isMissing(row)) return '<span class="badge missing">Next step needed</span>'; if (row.dueDate===D.today) return '<span class="badge today">Due today</span>'; return '<span class="badge">'+date(row.dueDate)+'</span>'; }
  const action = row => '<button class="link-button" data-open="'+row.id+'">'+escape(row.account)+'</button>';
  function announce(message) { clearTimeout(toastTimer); $('status').textContent=message; $('status').classList.add('visible'); toastTimer=setTimeout(()=>$('status').classList.remove('visible'),4500); }
  function render() {
    const rows=M.filter(opportunities,filters()), s=M.summary(rows);
    $('filter-summary').textContent=`Showing ${rows.length} of ${opportunities.length} fictional opportunities. Metrics, pipeline and priorities follow these filters.`;
    $('metrics').innerHTML=[['Open pipeline',shortMoney(s.openValue),`${s.openCount} open opportunities`,'featured'],['Weighted pipeline',shortMoney(s.weightedValue),'Open value × demo probability',''],['Overdue next steps',String(s.overdue),`${s.missing} open opportunities missing a next step`,''],['Closed-won value',shortMoney(s.wonValue),'Within the current opportunity filters','']].map(([label,value,detail,cls])=>`<div class="metric ${cls}"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-detail">${detail}</div></div>`).join('');
    const totals=D.stages.filter(stage=>!['Won','Lost'].includes(stage)).map(stage=>({stage,value:rows.filter(r=>r.stage===stage).reduce((sum,r)=>sum+r.amount,0)})), max=Math.max(...totals.map(t=>t.value),1);
    $('stage-chart').innerHTML=totals.map(t=>`<div class="stage-row"><span>${t.stage}</span><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${100*t.value/max}%"></div></div><span class="stage-value">${money(t.value)}</span></div>`).join('');
    const priorities=M.priority(rows).filter(r=>M.isOverdue(r)||M.isMissing(r)||r.dueDate===D.today);
    $('priority-count').textContent=priorities.length;
    $('priorities').innerHTML=priorities.length?priorities.slice(0,5).map((r,i)=>`<div class="priority-item"><span class="priority-number">${i+1}</span><div class="priority-main">${action(r)}<p>${escape(r.nextStep||'Add an action and due date')}</p></div>${badge(r)}</div>`).join('')+(priorities.length>5?`<p class="caption">${priorities.length-5} more in the pipeline below.</p>`:''):'<div class="empty">No overdue, missing or due-today actions in this view.</div>';
    $('export').disabled=!rows.length;
    if (!rows.length) $('pipeline-content').innerHTML='<div class="empty">No opportunities match. Try clearing the filters.</div>';
    else if(view==='table') $('pipeline-content').innerHTML=`<div class="table-wrap"><table><caption class="sr-only">Filtered fictional sales opportunities</caption><thead><tr><th scope="col">Account / opportunity</th><th scope="col">Owner</th><th scope="col">Stage</th><th scope="col">Value · USD</th><th scope="col">Expected close</th><th scope="col">Next action</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${action(r)}<span class="subline">${escape(r.name)}</span></td><td><span class="owner-avatar" aria-hidden="true">${r.owner[0]}</span>${r.owner}</td><td><span class="stage-tag">${r.stage}</span><span class="subline">${Math.round(D.probabilities[r.stage]*100)}% demo weight</span></td><td class="amount">${money(r.amount)}</td><td><time datetime="${r.closeDate}">${date(r.closeDate)}, ${r.closeDate.slice(0,4)}</time></td><td>${badge(r)}<span class="subline">${escape(r.nextStep||'—')}</span></td></tr>`).join('')}</tbody></table></div>`;
    else $('pipeline-content').innerHTML=`<div class="card-grid">${rows.map(r=>`<article class="opportunity-card"><div class="card-top"><span class="stage-tag">${r.stage}</span><span class="amount">${money(r.amount)}</span></div><h3>${action(r)}</h3><p>${escape(r.name)}</p><p>${r.owner} · ${r.source} · Closes ${date(r.closeDate)}, ${r.closeDate.slice(0,4)}</p><div class="card-bottom">${badge(r)}<span class="muted">${Math.round(D.probabilities[r.stage]*100)}% weight</span></div></article>`).join('')}</div>`;
    const ids=new Set(rows.map(r=>r.id));
    const events=activities.filter(a=>ids.has(a.opportunityId)&&M.inPeriod(a.date,$('activity-period').value)).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
    $('activity-feed').innerHTML=`<p class="activity-summary">${events.length} demo activities</p>`+(events.length?events.map(a=>{const r=opportunities.find(o=>o.id===a.opportunityId);return `<div class="activity-row"><span class="activity-symbol" aria-hidden="true">${a.type.slice(0,2)}</span><div class="activity-main"><p>${escape(a.note)}</p><small>${escape(r.account)} · ${r.owner} · ${a.type}</small></div><time datetime="${a.date}">${date(a.date)}, ${a.date.slice(0,4)}</time></div>`;}).join(''):'<div class="empty">No activities match these filters.</div>');
    $('table-view').setAttribute('aria-pressed',view==='table');$('card-view').setAttribute('aria-pressed',view==='cards');
  }
  function openDetail(id) {
    const row=opportunities.find(r=>r.id===id); if(!row) return;
    selectedId=id;$('detail-account').textContent=row.account+' · FICTIONAL';$('detail-title').textContent=row.name;
    $('detail-summary').textContent=`${money(row.amount)} · ${row.owner} · ${row.source} · Expected close ${date(row.closeDate)}, ${row.closeDate.slice(0,4)}`;
    $('detail-stage').innerHTML=D.stages.map(stage=>`<option${stage===row.stage?' selected':''}>${stage}</option>`).join('');
    $('detail-next').value=row.nextStep;$('detail-due').value=row.dueDate;$('detail-error').textContent='';syncClosed();$('detail').showModal();
  }
  function syncClosed() { const closed=['Won','Lost'].includes($('detail-stage').value);$('detail-next').disabled=closed;$('detail-due').disabled=closed; }
  const closeDetail=()=>{$('detail').close();selectedId=null;};
  $('filters').addEventListener('submit',e=>e.preventDefault());
  for(const id of ['search','owner','stage','period','activity-period']) $(id).addEventListener(id==='search'?'input':'change',render);
  function clearFilters(){ $('filters').reset();$('activity-period').value='all'; }
  $('clear').addEventListener('click',()=>{clearFilters();render();});
  $('table-view').addEventListener('click',()=>{view='table';render();});$('card-view').addEventListener('click',()=>{view='cards';render();});
  document.addEventListener('click',event=>{const trigger=event.target.closest('[data-open]');if(trigger)openDetail(trigger.dataset.open);});
  $('detail-stage').addEventListener('change',syncClosed);$('close-detail').addEventListener('click',closeDetail);$('cancel-detail').addEventListener('click',closeDetail);
  $('detail').addEventListener('close',()=>{selectedId=null;});
  $('detail-form').addEventListener('submit',event=>{
    event.preventDefault(); const row=opportunities.find(r=>r.id===selectedId);if(!row)return;
    const stage=$('detail-stage').value, closed=['Won','Lost'].includes(stage), nextStep=closed?'':$('detail-next').value.trim(), dueDate=closed?'':$('detail-due').value;
    if(Boolean(nextStep)!==Boolean(dueDate)){$('detail-error').textContent='Add both a next step and due date, or clear both.';return;}
    const changed=stage!==row.stage||nextStep!==row.nextStep||dueDate!==row.dueDate;
    if(changed){const oldStage=row.stage;Object.assign(row,{stage,nextStep,dueDate});activities.unshift({id:'Z'+String(++activityCounter).padStart(4,'0'),opportunityId:row.id,date:D.today,type:'Update',note:oldStage!==stage?`Changed demo stage from ${oldStage} to ${stage}`:'Updated the demo follow-up plan'});}
    closeDetail();render();announce(changed?'Demo changes saved for this session only.':'No changes to save.');
  });
  $('reset').addEventListener('click',()=>$('reset-dialog').showModal());$('cancel-reset').addEventListener('click',()=>$('reset-dialog').close());
  $('confirm-reset').addEventListener('click',()=>{opportunities=clone(D.opportunities);activities=clone(D.activities);activityCounter=0;view='table';clearFilters();$('reset-dialog').close();render();announce('Original fictional data restored.');});
  $('export').addEventListener('click',()=>{const csv=M.toCsv(M.filter(opportunities,filters()));const blob=new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='synthetic-sales-pipeline.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Exported the filtered fictional pipeline.');});
  render();
})();
