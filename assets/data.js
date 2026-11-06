(function (root) {
  'use strict';
  const stages = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const probabilities = { Discovery: 0.15, Qualified: 0.35, Proposal: 0.6, Negotiation: 0.8, Won: 1, Lost: 0 };
  // All records are invented. No source-system exports are used.
  const rows = [
    ['D01','Account 01','Workflow rollout','Software','Avery','Proposal',42000,'2026-11-23','2026-11-03','Confirm evaluation criteria','Partner'],
    ['D02','Account 02','Analytics pilot','Professional services','Morgan','Discovery',18000,'2026-12-15','2026-11-05','Schedule discovery session','Outbound'],
    ['D03','Account 03','Regional expansion','Logistics','Avery','Negotiation',72000,'2026-11-06','2026-11-04','Review implementation scope','Partner'],
    ['D04','Account 04','Team enablement','Software','Jordan','Qualified',28000,'2026-11-27','2026-11-09','Map buying committee','Inbound'],
    ['D05','Account 05','Operations assessment','Manufacturing','Morgan','Proposal',36000,'2026-12-04','2026-11-06','Walk through proposal','Outbound'],
    ['D06','Account 06','Partner launch','Professional services','Jordan','Won',48000,'2026-11-02','','','Partner'],
    ['D07','Account 07','Data consolidation','Logistics','Avery','Lost',22000,'2026-10-22','','','Inbound'],
    ['D08','Account 08','Service expansion','Manufacturing','Morgan','Qualified',54000,'2026-12-18','2026-11-02','Validate budget and timing','Partner'],
    ['D09','Account 09','Process review','Professional services','Jordan','Discovery',16000,'2027-01-22','2026-11-11','Confirm problem statement','Outbound'],
    ['D10','Account 10','Reporting upgrade','Software','Avery','Won',32000,'2026-10-29','','','Inbound'],
    ['D11','Account 11','Enablement package','Manufacturing','Jordan','Proposal',24000,'2026-11-20','','','Inbound'],
    ['D12','Account 12','Partner-led pilot','Logistics','Morgan','Negotiation',60000,'2026-11-06','2026-11-05','Confirm mutual action plan','Partner']
  ];
  const opportunities = rows.map(([id,account,name,industry,owner,stage,amount,closeDate,dueDate,nextStep,source]) => ({id,account,name,industry,owner,stage,amount,closeDate,dueDate,nextStep,source}));
  const activities = [
    ['A01','D01','2026-11-02','Meeting','Reviewed evaluation plan'],
    ['A02','D03','2026-11-03','Call','Discussed scope and implementation timing'],
    ['A03','D06','2026-11-02','Milestone','Demo opportunity marked won'],
    ['A04','D02','2026-11-04','Email','Shared a discovery agenda'],
    ['A05','D12','2026-11-05','Meeting','Reviewed mutual action plan'],
    ['A06','D08','2026-10-30','Call','Discussed budget ownership'],
    ['A07','D05','2026-11-04','Email','Sent a sample proposal outline'],
    ['A08','D10','2026-10-29','Milestone','Demo opportunity marked won'],
    ['A09','D04','2026-11-05','Call','Identified evaluation stakeholders'],
    ['A10','D07','2026-10-22','Milestone','Demo opportunity marked lost']
  ].map(([id,opportunityId,date,type,note]) => ({id,opportunityId,date,type,note}));
  const api = { today: '2026-11-05', stages, probabilities, opportunities, activities };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DemoData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
