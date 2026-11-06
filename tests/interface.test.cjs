// These isolated application-state checks use a minimal DOM stub.
// They verify rendering decisions and event handlers, not browser layout or accessibility.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');

function setup(){
  const nodes=new Map(), listeners=new Map(), downloads=[];
  class Element {
    constructor(id){this.id=id;this.value=['owner','stage','period','activity-period'].includes(id)?'all':'';this.listeners={};this.attrs={};this.textContent='';this.disabled=false;this.open=false;this.html='';this.classList={add(){},remove(){}};}
    set innerHTML(value){this.html=value;if(this.id==='detail-stage')this.value=(value.match(/<option selected>([^<]+)/)||[])[1]||'Discovery';}
    get innerHTML(){return this.html;}
    addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
    setAttribute(name,value){this.attrs[name]=String(value);}
    emit(type,event={}){for(const fn of this.listeners[type]||[])fn({preventDefault(){},...event});}
    showModal(){this.open=true;}
    close(){this.open=false;this.emit('close');}
    reset(){for(const id of ['search','owner','stage','period'])get(id).value=id==='search'?'':'all';}
    click(){downloads.push({download:this.download,href:this.href});}
  }
  const get=id=>{if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id);};
  const document={getElementById:get,addEventListener(type,fn){listeners.set(type,fn);},createElement(){return new Element('created-link');}};
  const context={document,window:null,Intl,Blob,setTimeout(){return 1;},clearTimeout(){},URL:{createObjectURL(){return 'blob:synthetic';},revokeObjectURL(){}}};context.window=context;
  vm.createContext(context);
  for(const name of ['data','metrics','app'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets',name+'.js'),'utf8'),context);
  return {get,downloads,open(id){listeners.get('click')({target:{closest(){return {dataset:{open:id}};}}});},change(id,value){get(id).value=value;get(id).emit(id==='search'?'input':'change');},click(id){get(id).emit('click');},save(){get('detail-form').emit('submit');}};
}
test('initial render contains baseline totals and all twelve opportunities',()=>{const app=setup();assert.match(app.get('metrics').innerHTML,/\$350k/);assert.match(app.get('metrics').innerHTML,/\$200.6k/);assert.equal((app.get('pipeline-content').innerHTML.match(/<tr>/g)||[]).length,13);});
test('filters render an empty state and disable export; clear restores rows',()=>{const app=setup();app.change('search','no such account');assert.match(app.get('pipeline-content').innerHTML,/No opportunities match/);assert.equal(app.get('export').disabled,true);app.click('clear');assert.match(app.get('filter-summary').textContent,/Showing 12 of 12/);assert.equal(app.get('export').disabled,false);});
test('card/list toggles preserve the same filtered opportunities',()=>{const app=setup();app.change('owner','Avery');app.click('card-view');assert.equal((app.get('pipeline-content').innerHTML.match(/opportunity-card/g)||[]).length,4);assert.equal(app.get('card-view').attrs['aria-pressed'],'true');app.click('table-view');assert.equal((app.get('pipeline-content').innerHTML.match(/<tr>/g)||[]).length,5);});
test('cancelled changes do not alter the opportunity',()=>{const app=setup();app.open('D01');app.get('detail-next').value='A discarded draft';app.click('cancel-detail');assert.equal(app.get('detail').open,false);app.open('D01');assert.equal(app.get('detail-next').value,'Confirm evaluation criteria');});
test('incomplete followup rejects save, and edited markup is safely escaped',()=>{const app=setup();app.open('D01');app.get('detail-next').value='';app.save();assert.match(app.get('detail-error').textContent,/both/);assert.equal(app.get('detail').open,true);app.get('detail-next').value='<img src=x onerror=alert(1)>';app.get('detail-due').value='2026-11-06';app.save();assert.equal(app.get('detail').open,false);assert.match(app.get('pipeline-content').innerHTML,/&lt;img src=x onerror=alert\(1\)&gt;/);assert.doesNotMatch(app.get('pipeline-content').innerHTML,/<img/);assert.match(app.get('activity-feed').innerHTML,/Updated the demo follow-up plan/);});
test('closing an opportunity updates metrics and clears next steps',()=>{const app=setup();app.open('D01');app.change('detail-stage','Won');assert.equal(app.get('detail-next').disabled,true);app.save();assert.match(app.get('metrics').innerHTML,/\$308k/);assert.match(app.get('metrics').innerHTML,/\$122k/);app.open('D01');assert.equal(app.get('detail-next').value,'');assert.equal(app.get('detail-due').value,'');});
test('reset is cancellable and confirmed reset restores original state',()=>{const app=setup();app.open('D01');app.change('detail-stage','Won');app.save();app.click('reset');assert.equal(app.get('reset-dialog').open,true);app.click('cancel-reset');assert.match(app.get('metrics').innerHTML,/\$308k/);app.click('reset');app.click('confirm-reset');assert.match(app.get('metrics').innerHTML,/\$350k/);assert.equal(app.get('reset-dialog').open,false);app.click('export');assert.equal(app.downloads[0].download,'synthetic-sales-pipeline.csv');});
