/* global window */
// Local visual/keyboard regression with fixture sessions and notices. External hosts are blocked.
const assert=require('node:assert/strict');
async function inView(locator){const b=await locator.boundingBox(),v=locator.page().viewportSize();assert(b&&b.x>=0&&b.y>=0&&b.x+b.width<=v.width+1&&b.y+b.height<=v.height+1);}
const{chromium}=require('../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/node_modules/@playwright/test');
const fs=require('node:fs/promises');
const settings={displayName:'',alternateEmail:'',notifyDeadlines:true,notifyHomologacoes:true,notifyEditais:false,weeklyDigest:true,density:'confortavel',deadlineAlertDays:7,sessionTimeoutMinutes:30};
(async()=>{await fs.mkdir('reports/notices-ui',{recursive:true});const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const results=[];try{
 let notices=[{id:'reviews-project',label:'Projeto teste: 1 relatório(s) aguardando parecer.',href:'/tracking?id=project'},{id:'weekly',label:'Resumo dos últimos 7 dias: 1 projeto(s) com atualizações.',href:'/tracking'}];
 const context=await browser.newContext();const page=await context.newPage();
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(!['127.0.0.1','localhost'].includes(u.hostname))return route.abort();
  if(u.pathname==='/src/contexts/SessionContext.jsx')return route.fulfill({contentType:'application/javascript',body:`const session={profile:'gestor',isAuthenticated:true,restoring:false,loading:false,error:null,user:{id:'fixture',name:'Gestora local'},logout:async()=>true};export function SessionProvider({children}){return children;}export function useSession(){return session;}`});
  if(u.pathname==='/src/services/portalApi.js'){const r=await route.fetch();let body=await r.text();body=body.replace(/import\s*\{\s*auth\s*\}\s*from\s*['"][^'"]*firebase(?:\.js)?['"];?/, 'const auth={currentUser:{getIdToken:async()=>"fixture-only"}};');return route.fulfill({response:r,body,contentType:'application/javascript'});}
  if(u.pathname.startsWith('/api/'))return route.fulfill({contentType:'application/json',body:JSON.stringify({settings,notices,items:[],syncedAt:null})});
  return route.continue();
 });
 await page.goto('http://127.0.0.1:5173/dashboard');await page.getByRole('button',{name:/^Avisos/}).click();const dialog=page.getByRole('dialog',{name:'Avisos da sua conta'});await dialog.getByRole('status').filter({hasText:'2 avisos disponíveis'}).waitFor();
 for(const[width,height]of [[1365,900],[768,900],[390,844],[320,720]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>window.requestAnimationFrame(()=>window.requestAnimationFrame(r))));
  const box=await dialog.boundingBox();if(box.x<0||box.y<0||box.x+box.width>width+1||box.y+box.height>height+1)throw new Error('Modal fora da tela em '+width);
  await inView(dialog.getByRole('heading',{name:'Avisos da sua conta'}));await inView(dialog.getByRole('button',{name:'Fechar',exact:true}));await inView(dialog.getByRole('button',{name:'Fechar avisos'}));
  if(await page.evaluate(()=>window.document.documentElement.scrollWidth>window.innerWidth))throw new Error('Overflow horizontal');
  await page.screenshot({path:`reports/notices-ui/avisos-${width}.png`});results.push({width,height,box,pass:true});
 }
 notices=Array.from({length:30},(_,i)=>({id:'reviews-'+i,label:`Projeto de teste ${i+1}: 1 relatório(s) aguardando parecer.`,href:'/tracking?id='+i}));await dialog.getByRole('button',{name:'Atualizar avisos'}).click();await dialog.getByRole('status').filter({hasText:'30 avisos disponíveis'}).waitFor();await inView(dialog.getByRole('button',{name:'Fechar avisos'}));const scrolls=await dialog.locator('[aria-busy]').evaluate(n=>n.scrollHeight>n.clientHeight);if(!scrolls)throw new Error('Lista longa não tem rolagem interna');
 await dialog.getByRole('button',{name:'Fechar avisos'}).focus();await page.keyboard.press('Tab');assert(await dialog.getByRole('button',{name:'Fechar',exact:true}).evaluate(n=>n===window.document.activeElement));await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});assert(await page.getByRole('button',{name:/^Avisos/}).evaluate(n=>n===window.document.activeElement));results.push({keyboard:'Tab cycle, Escape, trigger focus restored',longList:30,internalScroll:true,pass:true});
 await fs.writeFile('reports/notices-ui/browser-results.json',JSON.stringify(results,null,2));console.log('PASS: janela em 4 larguras, lista com 30 avisos, Tab, Escape e restauração de foco.');
 await context.close();
 const loginContext=await browser.newContext();const loginPage=await loginContext.newPage();await loginPage.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
 await loginPage.goto('http://127.0.0.1:5173/');const student=loginPage.getByRole('button',{name:/^Estudante \/ Comunidade/});await student.waitFor();assert.equal(await loginPage.getByRole('button',{name:'Reenviar confirmação de e-mail'}).count(),0);assert.equal(await student.locator('svg').count(),1);await student.screenshot({path:'reports/notices-ui/student-icon.png'});await loginContext.close();console.log('PASS: ícone SVG do aluno e ausência do botão de reenvio no login.');

}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
