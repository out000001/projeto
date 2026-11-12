import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {generateKeyPairSync,sign,verify} from 'node:crypto';
import jwks from 'jwks-rsa';

test('Firebase Admin imports when require of ESM is disabled as on Vercel',()=>{
 const result=execFileSync(process.execPath,['--no-experimental-require-module','--input-type=module','-e',"await import('firebase-admin/auth');await import('firebase-admin/firestore');console.log('compatible')"],{encoding:'utf8'});
 assert.match(result,/compatible/);
});
test('JWKS resolves an RSA public key that verifies a signature without network access',async()=>{
 const{publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
 const key={...publicKey.export({format:'jwk'}),kid:'local-runtime-test',use:'sig',alg:'RS256'};
 const client=jwks({jwksUri:'https://example.invalid/keys',cache:false,fetcher:async()=>({keys:[key]})});
 const keys=await client.getSigningKeys();
 assert.equal(keys.length,1);assert.equal(keys[0].kid,key.kid);
 const message=Buffer.from('local Firebase signing-key compatibility check');
 const signature=sign('RSA-SHA256',message,privateKey);
 assert.equal(verify('RSA-SHA256',message,keys[0].getPublicKey(),signature),true);
 assert.equal(verify('RSA-SHA256',Buffer.from('modified'),keys[0].getPublicKey(),signature),false);
});
