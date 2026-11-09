import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(path.join(root,'stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/package.json'));
const {ESLint}=require('eslint'),globals=require('globals'),recommended=require('@eslint/js').configs.recommended;
const paths=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).split('\n').filter(file=>/^(api|server)\/.+\.(mjs|cjs)$/.test(file)&&existsSync(path.join(root,file)));
const eslint=new ESLint({cwd:root,overrideConfigFile:true,overrideConfig:[recommended,
 {files:['**/*.{mjs,cjs}'],languageOptions:{ecmaVersion:'latest',globals:globals.node},rules:{'no-unused-vars':['error',{argsIgnorePattern:'^_'}]}},
 {files:['**/*.browser.mjs','**/layout-audit.mjs','**/playwright/*.cjs'],languageOptions:{globals:globals.browser}},
 // Playwright requires a fixture destructuring parameter, even when no fixtures are used.
 {files:['**/*.spec.cjs'],rules:{'no-empty-pattern':'off'}}]});
const results=await eslint.lintFiles(paths);
const summary={files:paths.length,errors:results.reduce((sum,item)=>sum+item.errorCount,0),warnings:results.reduce((sum,item)=>sum+item.warningCount,0),results:results.filter(item=>item.messages.length).map(({filePath,messages})=>({file:path.relative(root,filePath),messages}))};
mkdirSync(path.join(root,'reports/quality'),{recursive:true});writeFileSync(path.join(root,'reports/quality/server-eslint.json'),JSON.stringify(summary,null,2));
console.log((await eslint.loadFormatter('stylish')).format(results));console.log(JSON.stringify(summary));if(summary.errors||summary.warnings)process.exitCode=1;
