import {createRequire} from 'node:module';
import {auditLayout,verifyLayoutResults} from './layout-audit.mjs';
const require=createRequire(new URL('../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const browser=await chromium.launch({args:['--no-sandbox']});
try {
 const page=await browser.newPage();
 await page.route('**/src/services/api.js',route=>route.fulfill({contentType:'application/javascript',body:`export const observeSession=cb=>{queueMicrotask(()=>cb(null));return()=>{};};export const logoutRequest=async()=>{};export const loginRequest=async()=>{};export const fetchProjects=async()=>({items:[]});`}));
 await page.route('**/src/services/firebase.js',route=>route.fulfill({contentType:'application/javascript',body:'export const auth={currentUser:null};'}));
 const results=[];
 await page.goto('http://127.0.0.1:5173/');await page.getByLabel('Login Institucional (e-mail)').waitFor();await auditLayout(page,'login',results);
 await page.getByRole('button',{name:'Não tenho conta — Criar cadastro'}).click();await page.getByRole('heading',{name:/Criar.*conta/}).waitFor();await page.getByLabel('Senha',{exact:true}).fill('senha-local-de-teste');await page.getByLabel('Confirmar senha',{exact:true}).fill('senha-local-de-teste');
 await page.getByRole('button',{name:'Mostrar senha',exact:true}).focus();await page.keyboard.press('Space');if(await page.getByLabel('Senha',{exact:true}).getAttribute('type')!=='text')throw new Error('Password toggle failed');await page.getByRole('button',{name:'Ocultar senha',exact:true}).click();
 await page.getByRole('button',{name:'Mostrar confirmação de senha'}).click();if(await page.getByLabel('Confirmar senha',{exact:true}).getAttribute('type')!=='text')throw new Error('Confirmation toggle failed');await page.getByRole('button',{name:'Ocultar confirmação de senha'}).click();
 await auditLayout(page,'registration',results);verifyLayoutResults(results);
 console.log('Public layout audit complete');
}finally{await browser.close();}
