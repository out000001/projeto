import {services} from '../server/firebase-admin.mjs';
import {createPortalHandler} from '../server/portal.mjs';
export default async function portal(req,res){res.setHeader('Cache-Control','no-store');try{return await createPortalHandler(services())(req,res);}catch{return res.status(503).json({error:'Serviço indisponível. Tente novamente.'});}}
