import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const repo=fileURLToPath(new URL('../../',import.meta.url));
const root=fs.mkdtempSync(path.join(os.tmpdir(),'math140-v2-test-'));
fs.mkdirSync(path.join(root,'scripts'),{recursive:true});fs.mkdirSync(path.join(root,'production/v2'),{recursive:true});
for(const f of ['voice.mjs','lib.mjs'])fs.copyFileSync(path.join(repo,'scripts',f),path.join(root,'scripts',f));
const source=JSON.parse(fs.readFileSync(path.join(repo,'production/v2/script.json'),'utf8'));
source.scenes=[{...source.scenes[0],lines:[source.scenes[0].lines[0]]}];
fs.writeFileSync(path.join(root,'production/v2/script.json'),JSON.stringify(source));
const tone=path.join(root,'tone.wav');execFileSync('ffmpeg',['-y','-v','error','-f','lavfi','-i','sine=frequency=440:duration=0.5','-ar','48000',tone]);
let speechCalls=0;let lastBody;let profiles=['kj-a','prof-b','bot-c','kj-d'];
const server=http.createServer(async(req,res)=>{
 if(req.url==='/v1/audio/voices'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({voices:profiles.map(voice_id=>({voice_id,type:'profile'}))}));}
 if(req.url==='/v1/audio/speech'){let chunks=[];for await(const chunk of req)chunks.push(chunk);lastBody=JSON.parse(Buffer.concat(chunks));speechCalls++;res.setHeader('Content-Type','audio/wav');return res.end(fs.readFileSync(tone));}
 res.statusCode=404;res.end();
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/v1`;
const env={...process.env,MATH140_EDITION:'v2',TTS_PROVIDER:'voicestudio',VOICESTUDIO_BASE_URL:base,VOICESTUDIO_MODEL:'omnivoice',VOICESTUDIO_VOICE_KJ:'kj-a',VOICESTUDIO_VOICE_PROF:'prof-b',VOICESTUDIO_VOICE_BOT:'bot-c'};
async function run(extra={}){return new Promise(resolve=>{const c=spawn(process.execPath,[path.join(root,'scripts/voice.mjs')],{env:{...env,...extra}});let output='';c.stdout.on('data',b=>output+=b);c.stderr.on('data',b=>output+=b);c.on('exit',code=>resolve({code,output}));});}
try{
 assert.equal((await run()).code,0);assert.equal(speechCalls,1);assert.equal(lastBody.voice,'kj-a');assert.equal(lastBody.response_format,'wav');
 assert.equal((await run()).code,0);assert.equal(speechCalls,1,'unchanged speech should be cached');
 assert.equal((await run({VOICESTUDIO_VOICE_KJ:'kj-d'})).code,0);assert.equal(speechCalls,2,'new profile must invalidate raw cache');
 const missing=await run({VOICESTUDIO_VOICE_KJ:'alloy'});assert.notEqual(missing.code,0);assert.match(missing.output,/saved profile ID/);
 const same=await run({VOICESTUDIO_VOICE_BOT:'kj-a'});assert.notEqual(same.code,0);assert.match(same.output,/different saved/);
 console.log('PASS: saved profiles, WAV output, profile cache invalidation, alias rejection, and distinct cast enforcement.');
}finally{await new Promise(resolve=>server.close(resolve));fs.rmSync(root,{recursive:true,force:true});}
