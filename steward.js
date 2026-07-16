/* steward.js: the back room reel. Wires the working-file check demo inside #backroom.
   Self-contained; touches nothing outside ids that start with bkr. */
(function(){
  'use strict';

  /* the example working file: synthetic quarterly state beer data, five planted problems */
  var EXAMPLE={
    name:'beer-Q1-working-file-EXAMPLE.csv',
    header:['Period','State','Brewers Reporting','Production (bbl)','Removals Taxpaid (bbl)','Removals Without Tax (bbl)','Stocks End of Period (bbl)'],
    rows:[
      ['2026Q1','California',912, 4182000, 3722000, 261000, 612000],
      ['2026Q1','Colorado',438, 2870000, 2571000, 168000, 402000],
      ['2026Q1','Texas',372, 3095000, 2762000, 214000, 455000],
      ['2026Q1','Ohio',341, 2418000, 2183000, 141000, 331000],
      ['2026Q1','Pennsylvania',356, 1902000, 1710000, 118000, 274000],
      ['2026Q1','New York',461, 1266000, 1131000, 84000, 187000],
      ['2026Q1','Wisconsin',218, 1187000, 1042000, 79000, 171000],
      ['2026Q1','Georgia',146, 1054000, 948000, 61000, 149000],
      ['2026Q1','Virginia',312, 621000, 552000, 39000, 92000],
      ['2026Q1','North Carolina',392, 588000, 522000, 37000, 88000],
      ['2026Q1','Michigan',401, 512000, 458000, 31000, -74000],
      ['2026Q1','',188, 397000, 351000, 25000, 58000],
      ['2026Q1','Oregon',309, 386000, 344000, 23000, 57000],
      ['2026Q1','Washington',428, 371000, 329000, 22000, 55000],
      ['2026Q1','Missouri',142, 2609000, 802000, 47000, 121000],
      ['2026Q1','Colorado',438, 2870000, 2571000, 168000, 402000],
      ['2026Q1','Delaware',2, 214000, 191000, 13000, 30000],
      ['2026Q1','Montana',96, 118000, 104000, 8000, 17000]
    ],
    prior:{ 'california':3648000,'colorado':2494000,'texas':2688000,'ohio':2122000,'pennsylvania':1671000,'new york':1099000,'wisconsin':1013000,'georgia':921000,'virginia':539000,'north carolina':506000,'michigan':447000,'oregon':336000,'washington':321000,'missouri':1994000,'delaware':186000,'montana':101000 }
  };

  function esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function num(v){var n=parseFloat(String(v).replace(/,/g,''));return isNaN(n)?null:n;}
  function fmt(n){return n==null?'':Number(n).toLocaleString('en-US');}

  function runChecks(wb){
    var f=[]; var H=wb.header;
    var iPer=0,iSt=1,iBr=2,iProd=3,iTax=4,iNoTax=5,iStock=6;
    f.push({rule:'STR-01', sev:'ok', text:'All 7 expected columns are present with the published header names.'});
    var seen={}, dupes=[], blanks=[], negs=[], bal=[], yoy=[], disc=[];
    wb.rows.forEach(function(r,i){
      var st=String(r[iSt]||'').trim(), per=String(r[iPer]||'').trim();
      if(!st||!per){ blanks.push(i); return; }
      var key=(st+'|'+per).toLowerCase();
      if(seen[key]!=null) dupes.push({i:i, st:st}); else seen[key]=i;
      [iProd,iTax,iNoTax,iStock].forEach(function(c){ var v=num(r[c]); if(v!=null&&v<0) negs.push({i:i, st:st, col:H[c], v:v}); });
      var prod=num(r[iProd])||0, tax=num(r[iTax])||0, nt=num(r[iNoTax])||0, stk=num(r[iStock])||0;
      if(prod>0){ var resid=prod-(tax+nt+stk); if(Math.abs(resid)/prod>0.25) bal.push({i:i, st:st, resid:resid}); }
      var pv=EXAMPLE.prior[st.toLowerCase()];
      if(pv!=null&&num(r[iTax])!=null){ var chg=(num(r[iTax])-pv)/pv*100; if(Math.abs(chg)>40) yoy.push({i:i, st:st, chg:chg}); }
      var br=num(r[iBr]); if(br!=null&&br>0&&br<3) disc.push({i:i, st:st, br:br});
    });
    f.push(blanks.length?{rule:'STR-02',sev:'err',rows:blanks,text:blanks.length+' row(s) with a blank state or period (row '+blanks.map(function(i){return i+2;}).join(', ')+'). These rows cannot be published.'}:{rule:'STR-02',sev:'ok',text:'Every row names a state and a period.'});
    f.push(dupes.length?{rule:'STR-03',sev:'err',rows:dupes.map(function(d){return d.i;}),text:dupes.length+' duplicate state-and-period row(s): '+dupes.map(function(d){return d.st;}).join(', ')+'. The national total would double-count.'}:{rule:'STR-03',sev:'ok',text:'No duplicate state and period rows.'});
    f.push(negs.length?{rule:'VAL-01',sev:'err',rows:negs.map(function(d){return d.i;}),text:negs.map(function(d){return d.st+' reports '+fmt(d.v)+' for '+d.col;}).join('; ')+'. Quantities cannot be negative.'}:{rule:'VAL-01',sev:'ok',text:'No negative quantities.'});
    f.push(bal.length?{rule:'VAL-02',sev:'warn',rows:bal.map(function(d){return d.i;}),text:bal.map(function(d){return d.st+' has a residual of '+fmt(Math.round(d.resid))+' bbl between production and removals plus stocks';}).join('; ')+'. Check for a unit or keying error.'}:{rule:'VAL-02',sev:'ok',text:'Inventory balances are within tolerance.'});
    f.push(yoy.length?{rule:'VAL-03',sev:'warn',rows:yoy.map(function(d){return d.i;}),text:yoy.map(function(d){return d.st+' taxable removals are '+(d.chg>0?'up ':'down ')+Math.abs(d.chg).toFixed(1)+'% versus the same period last year';}).join('; ')+'. Confirm with the reported filings before release.'}:{rule:'VAL-03',sev:'ok',text:'No state moved more than 40 percent year over year.'});
    f.push(disc.length?{rule:'DIS-01',sev:'warn',rows:disc.map(function(d){return d.i;}),text:disc.map(function(d){return d.st+' reflects only '+d.br+' reporting brewer(s)';}).join('; ')+'. Review whether this cell must be combined into "Other states" before publication (26 U.S.C. 6103).'}:{rule:'DIS-01',sev:'ok',text:'No state cell reflects fewer than 3 reporting brewers.'});
    return f;
  }

  var findings=null;

  function flaggedRows(){ var out={}; (findings||[]).forEach(function(fd){ (fd.rows||[]).forEach(function(i){ out[i]=fd.sev==='err'?'err':(out[i]||'warn'); }); }); return out; }

  function renderBench(){
    var box=document.getElementById('bkrOut'); if(!box) return;
    if(!findings){ box.innerHTML=''; return; }
    var errs=findings.filter(function(x){return x.sev==='err';}).length;
    var warns=findings.filter(function(x){return x.sev==='warn';}).length;
    var h='<div class="bkr-verdict"><span>'+errs+' error(s), '+warns+' warning(s)</span>'
      +'<button type="button" class="bkr-link" id="bkrCsv">Export the findings (CSV)</button></div>';
    h+=findings.map(function(fd){
      var cls=fd.sev==='err'?'err':(fd.sev==='warn'?'warn':'ok');
      var lbl=fd.sev==='err'?'Error':(fd.sev==='warn'?'Review':'Pass');
      return '<div class="bkr-finding"><span class="bkr-sev '+cls+'">'+lbl+'</span><span><b>'+fd.rule+'.</b> '+esc(fd.text)+'</span></div>';
    }).join('');
    var fr=flaggedRows();
    h+='<div class="bkr-grid"><table><tr>'+EXAMPLE.header.map(function(x){return '<th>'+esc(x)+'</th>';}).join('')+'</tr>'
      +EXAMPLE.rows.map(function(r,i){
        var cls=fr[i]==='err'?' class="bad"':(fr[i]==='warn'?' class="warnrow"':'');
        return '<tr'+cls+'>'+r.map(function(c,ci){return '<td>'+(ci>=2?fmt(num(c)):esc(c))+'</td>';}).join('')+'</tr>';
      }).join('')+'</table></div>';
    h+='<p class="fig-source"><b>Source:</b> the file is a made-up example for this demonstration. Real working files come from the aggregated Brewer&#39;s Report of Operations (TTB F 5130.9) and stay confidential until released in aggregate.</p>';
    box.innerHTML=h;
    var csv=document.getElementById('bkrCsv');
    if(csv) csv.addEventListener('click', function(){
      var lines=[['Rule','Severity','Finding'].join(',')];
      findings.forEach(function(fd){ lines.push([fd.rule, fd.sev==='err'?'Error':(fd.sev==='warn'?'Warning':'Pass'), '"'+fd.text.replace(/"/g,'""')+'"'].join(',')); });
      var blob=new Blob(['﻿'+lines.join('\n')],{type:'text/csv;charset=utf-8'});
      var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ttb-back-room-findings.csv';
      document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},400);
    });
  }

  var btn=document.getElementById('bkrLoad');
  if(btn) btn.addEventListener('click', function(){
    findings=runChecks(EXAMPLE);
    btn.textContent='Check it again';
    var note=document.getElementById('bkrLoaded');
    if(note) note.textContent='Loaded '+EXAMPLE.name+' ('+EXAMPLE.rows.length+' rows).';
    renderBench();
  });
})();
