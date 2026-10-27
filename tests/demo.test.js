import test from 'node:test';
import assert from 'node:assert/strict';
import {seedData} from '../src/services/demo.js';
import {applyChange} from '../src/domain/inventory.js';
test('demonstração permite retirada e devolução sem alterar a origem',()=>{
const data=seedData();
const next=applyChange(data,'checkout',null,{eid:'eq-0',person:'Visitante fictício',destination:'Destino exemplo'},{uuid:()=> 'teste',now:()=>new Date().toISOString()});
assert.equal(data.moves.length,3);
assert.equal(next.moves.length,4);
const returned=applyChange(next,'return','teste',{receiver:'Recebedor exemplo',condition:'Em bom estado'});
assert.ok(returned.moves.find(m=>m.id==='teste').returned);
});
test('API local persiste e detecta revisão conflitante',async()=>{
const values=new Map();
globalThis.localStorage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
const {api}=await import('../src/services/api.js');
const state=await api.load();
const saved=await api.save(state.data,state.revision);
assert.equal(saved.revision,state.revision+1);
await assert.rejects(()=>api.save(state.data,state.revision));
assert.equal(values.size,1);
});
