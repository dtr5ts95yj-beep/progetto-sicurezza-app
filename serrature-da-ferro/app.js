"use strict";
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let step=0;
let S={impiego:'',tipo:'ns',mandate:'ns',lato:'ns',forma:'ns',entrata:'ns',interasse:'ns',frontale:'ns'};
const STEPS=[
 {id:'impiego',nome:'Dove va installata'},
 {id:'tipo',nome:'Tipo di serratura'},
 {id:'mandate',nome:'Mandate'},
 {id:'lato',nome:'Lato'},
 {id:'forma',nome:'Forma del cilindro'},
 {id:'entrata',nome:'Entrata'},
 {id:'interasse',nome:'Interasse'},
 {id:'frontale',nome:'Frontale'},
 {id:'risultati',nome:'Risultati'}
];
function items(){return window.SERRATURE_FERRO||[];}
function opt(sel,inner,act,dis){return '<button class="opt'+(sel?' sel':'')+(dis?' dis':'')+'" data-act="'+esc(act)+'"'+(dis?' disabled':'')+'>'+inner+'<span class="radio"></span></button>';}
function pageImpiego(){
  const o=[
   ['cancelli','Cancello o inferriata','Serrature per cancelli, cancellotti e inferriate.'],
   ['serrande','Serranda o persiana','Serrature centrali e laterali per serrande.'],
   ['fascia','Fascia o basculante','Serrature per fasce e porte basculanti.'],
   ['montanti','Montante','Serrature per montanti e chiusure laterali.'],
   ['tagliafuoco','Porta tagliafuoco','Serrature per porte tagliafuoco.'],
   ['casseforti','Cassaforte','Serrature di ricambio per casseforti.'],
   ['altro','Altro','Altre serrature per ferro.']
  ];
  return '<h2>Dove va installata?</h2><div class="page">'+o.map(x=>opt(S.impiego===x[0],'<div><b>'+x[1]+'</b><p>'+x[2]+'</p></div>','impiego:'+x[0])).join('')+'</div>';
}
function pageTipo(){
  const o=[['infilare','Da infilare','La serratura va dentro lo spessore della porta.'],['applicare','Da applicare','La serratura resta visibile sulla porta.'],['casseforti','Per cassaforte','Serrature di ricambio per casseforti.'],['ns','Non so','Proseguo senza questa informazione.']];
  return '<h2>Che tipo di serratura?</h2><div class="page">'+o.map(x=>opt(S.tipo===x[0],'<div><b>'+x[1]+'</b><p>'+x[2]+'</p></div>','tipo:'+x[0])).join('')+'</div>';
}
function pageMandate(){
  const o=[['1','1 mandata'],['2','2 mandate'],['3','3 mandate'],['4','4 mandate'],['ns','Non so']];
  return '<h2>Quante mandate?</h2><div class="page">'+o.map(x=>opt(S.mandate===x[0],'<div><b>'+x[1]+'</b></div>','mandate:'+x[0])).join('')+'</div>';
}
function pageLato(){
  const o=[['dx','Destra'],['sx','Sinistra'],['rev','Reversibile'],['ns','Non so']];
  return '<h2>Che lato?</h2><div class="page">'+o.map(x=>opt(S.lato===x[0],'<div><b>'+x[1]+'</b></div>','lato:'+x[0])).join('')+'</div>';
}
function pageForma(){
  const o=[['tondo','Cilindro tondo'],['sagomato','Cilindro sagomato'],['ovale','Cilindro ovale'],['mappa','Doppia mappa'],['ns','Non so']];
  return '<h2>Che forma ha il cilindro?</h2><div class="page">'+o.map(x=>opt(S.forma===x[0],'<div><b>'+x[1]+'</b></div>','forma:'+x[0])).join('')+'</div>';
}
function pageMisura(id,label,help){
  const v=S[id];
  return '<h2>'+label+'</h2><div class="page"><div class="field"><input id="'+id+'" type="number" inputmode="decimal" min="0" step="0.5" placeholder="mm" value="'+(v==='ns'?'':v)+'"><span>mm</span></div><div class="note">'+help+'</div><button class="opt'+(v==='ns'?' sel':'')+'" data-act="'+id+':ns"><div><b>Non so</b><p>Proseguo senza questa misura.</p></div><span class="radio"></span></button></div>';
}
function pageRisultati(){
  const {esatti,daVer}=filtra();
  let h='<h2>Risultati</h2>';
  h+='<p class="copy">Corrispondenze esatte: '+esatti.length+' · Da verificare per misure mancanti: '+daVer.length+'</p>';
  h+='<div class="page">';
  h+=esatti.map(card).join('');
  if(daVer.length) h+='<div class="note">Questi articoli corrispondono alle scelte note, ma nell’archivio non ci sono ancora entrata, interasse o frontale. Verifica la scheda prima di ordinarli.</div>'+daVer.map(card).join('');
  if(!esatti.length&&!daVer.length) h+='<p class="copy">Nessuna corrispondenza con le scelte fatte.</p>';
  return h+'</div>';
}
function card(x){
  return '<article class="res" data-code="'+esc(x.codice)+'"><div><div class="code">'+esc(x.codice)+'</div><div class="desc">'+esc(x.descrizione)+'</div><div class="meta"><span class="pill">'+esc(x.marca)+'</span><span class="pill">'+esc(x.impiego)+'</span><span class="pill '+(x.giacenza>0?'ok':'zero')+'">'+(x.giacenza>0?'Giacenza '+x.giacenza:'Giacenza 0')+'</span></div></div></article>';
}
function filtra(){
  const esatti=[],daVer=[];
  for(const x of items()){
    let ok=true,needCheck=false;
    if(S.impiego && x.impiego!==S.impiego) continue;
    if(S.tipo!=='ns' && x.tipo!==S.tipo) continue;
    if(S.mandate!=='ns' && String(x.mandate||'')!==S.mandate) continue;
    if(S.lato!=='ns' && String(x.lato||'')!==S.lato) continue;
    if(S.forma!=='ns' && String(x.forma||'')!==S.forma) continue;
    for(const k of ['entrata','interasse','frontale']){
      if(S[k]!=='ns'){
        if(x[k]==null){needCheck=true;}
        else if(Number(x[k])!==Number(S[k])){ok=false;break;}
      }
    }
    if(!ok) continue;
    (needCheck?daVer:esatti).push(x);
  }
  return {esatti,daVer};
}
function render(){
  const st=STEPS[step];
  $('titolo').textContent=st.id==='risultati'?'Risultati':st.nome;
  $('sotto').textContent=st.id==='risultati'?'Questi sono gli articoli che corrispondono alle risposte.':'Rispondi per restringere la ricerca.';
  $('bar').style.width=((step+1)/STEPS.length*100)+'%';
  $('page').innerHTML=st.id==='impiego'?pageImpiego():st.id==='tipo'?pageTipo():st.id==='mandate'?pageMandate():st.id==='lato'?pageLato():st.id==='forma'?pageForma():st.id==='entrata'?pageMisura('entrata','Entrata','Misura dal bordo della porta al centro del foro chiave/cilindro.'):st.id==='interasse'?pageMisura('interasse','Interasse','Distanza tra centro quadro maniglia e riferimento del foro chiave/cilindro.'):st.id==='frontale'?pageMisura('frontale','Frontale','Larghezza del frontale della serratura.'):pageRisultati();
  $('back').disabled=step===0;
  $('next').disabled=st.id==='risultati';
}
function go(i){if(i<0||i>=STEPS.length)return;step=i;render();}
document.addEventListener('click',e=>{
  const o=e.target.closest('.opt');
  if(o){
    const [k,v]=o.dataset.act.split(':');
    if(k==='entrata'||k==='interasse'||k==='frontale'){S[k]='ns';render();return;}
    S[k]=v;render();return;
  }
  const r=e.target.closest('.res');
  if(r){openSheet(r.dataset.code);return;}
});
$('next').onclick=()=>{const st=STEPS[step];if(st.id==='entrata'||st.id==='interasse'||st.id==='frontale'){const v=document.getElementById(st.id);if(v&&v.value!=='')S[st.id]=v.value;}go(step+1);};
$('back').onclick=()=>go(step-1);
$('close').onclick=()=>{$('sheet').hidden=true;};
$('sheet').addEventListener('click',e=>{if(e.target===$('sheet'))$('sheet').hidden=true;});
function openSheet(code){
  const x=items().find(y=>y.codice===code);
  if(!x)return;
  $('body').innerHTML='<p class="eyebrow">'+esc(x.marca)+' · '+esc(x.impiego)+'</p><h2>'+esc(x.codice)+'</h2><p class="desc">'+esc(x.descrizione)+'</p><div class="kv"><div><b>GIACENZA</b><span>'+x.giacenza+'</span></div><div><b>TIPO</b><span>'+esc(x.tipo)+'</span></div><div><b>MANDATE</b><span>'+(x.mandate||'—')+'</span></div><div><b>LATO</b><span>'+(x.lato?x.lato.toUpperCase():'—')+'</span></div><div><b>FORMA</b><span>'+(x.forma||'—')+'</span></div><div><b>ENTRATA</b><span>'+(x.entrata||'—')+'</span></div><div><b>INTERASSE</b><span>'+(x.interasse||'—')+'</span></div><div><b>FRONTALE</b><span>'+(x.frontale||'—')+'</span></div></div><div class="note">Le misure non presenti nell’archivio vanno verificate sul catalogo del produttore prima dell’ordine.</div><div class="actions"><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=shop&q='+encodeURIComponent(x.codice)+'">Cerca online</a><button class="btn alt" id="sheet-close">Chiudi</button></div>';
  $('sheet').hidden=false;
  $('sheet-close').onclick=()=>{$('sheet').hidden=true;};
}
render();