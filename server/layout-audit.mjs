import {mkdir,writeFile} from 'node:fs/promises';

export async function auditLayout(page,name,results,{widths=[320,390,768,1024,1440],zoom=true}={}) {
 await mkdir('/tmp/portal-layout-audit',{recursive:true});
 for(const width of widths) {
  await page.setViewportSize({width,height:900});
  await page.evaluate(()=>{document.documentElement.style.fontSize='';document.documentElement.dir='ltr';window.scrollTo({top:0,left:0,behavior:'instant'});});
  await page.evaluate(()=>new Promise(resolve=>window.requestAnimationFrame(()=>window.requestAnimationFrame(resolve))));
  results.push({name,width,...await inspect(page)});
  if(width===320||width===1440)await page.screenshot({path:`/tmp/portal-layout-audit/${name}-${width}.png`,fullPage:!(await page.getByRole('dialog').count())});
 }
 if(zoom){
  await page.setViewportSize({width:720,height:600});await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
  results.push({name,width:720,textSize:'200%',...await inspect(page)});
  await page.screenshot({path:`/tmp/portal-layout-audit/${name}-text200.png`,fullPage:!(await page.getByRole('dialog').count())});
  await page.evaluate(()=>{document.documentElement.style.fontSize='';});
 }
 await page.setViewportSize({width:320,height:600});
 await page.evaluate(()=>{document.documentElement.dir='rtl';});
 results.push({name,width:320,direction:'rtl',...await inspect(page)});
 await page.evaluate(()=>{document.documentElement.dir='ltr';});
 await writeFile(`/tmp/portal-layout-audit/${results[0]?.name==='login'?'public-results':'results'}.json`,JSON.stringify(results,null,2));
}
async function inspect(page) {
 return page.evaluate(()=>{
  const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
  const describe=el=>({tag:el.tagName,text:(el.getAttribute('aria-label')||el.innerText||'').trim().slice(0,100),class:el.className});
  const scope=document.querySelector('[role=dialog]')||document;
  const overflowing=[...scope.querySelectorAll('*')].filter(el=>visible(el)&&el.getBoundingClientRect().right>innerWidth+2&&![...ancestors(el)].some(p=>['auto','scroll'].includes(getComputedStyle(p).overflowX))).slice(0,12).map(describe);
  function* ancestors(el){for(let p=el.parentElement;p;p=p.parentElement)yield p;}
  const clipped=[...scope.querySelectorAll('button,a,label,h1,h2,h3,p,summary')].filter(el=>visible(el)&&el.scrollWidth>el.clientWidth+3&&['hidden','clip'].includes(getComputedStyle(el).overflowX)).map(describe);
  const hiddenControls=[...scope.querySelectorAll('button,a,input,select,textarea')].filter(el=>visible(el)&&[...ancestors(el)].some(p=>{const r=el.getBoundingClientRect(),a=p.getBoundingClientRect(),s=getComputedStyle(p);return p!==document.body&&p!==document.documentElement&&(['hidden','clip'].includes(s.overflowX)&&(r.left<a.left-2||r.right>a.right+2)||['hidden','clip'].includes(s.overflowY)&&(r.top<a.top-2||r.bottom>a.bottom+2));})).slice(0,12).map(describe);
  const narrow=[...scope.querySelectorAll('h1,h2,h3')].filter(el=>visible(el)&&el.textContent.trim().length>15&&el.getBoundingClientRect().width<100).map(describe);
  const dialogs=[...document.querySelectorAll('[role=dialog]')].filter(visible).map(el=>({text:el.getAttribute('aria-label'),height:el.getBoundingClientRect().height,screen:innerHeight,scroll:el.scrollHeight,client:el.clientHeight}));
  return{overflow:document.documentElement.scrollWidth>innerWidth+2,overflowing,clipped,hiddenControls,narrow,dialogs};
 });
}

export function verifyLayoutResults(results) {
 const failures=results.filter(row=>row.overflow||row.clipped.length||row.hiddenControls.length||row.narrow.length||row.overflowing.length);
 if(failures.length)throw new Error(`Layout failures: ${failures.map(row=>`${row.name}/${row.width}/${row.textSize||row.direction||'normal'}`).join(', ')}; inspect /tmp/portal-layout-audit`);
}
