import {services} from '../server/firebase-admin.mjs';
import {createTrackingHandler} from '../server/tracking.mjs';
export default async function tracking(req,res){res.setHeader('Cache-Control','no-store');try{return await createTrackingHandler(services())(req,res);}catch{return res.status(503).json({error:'Acompanhamento indisponível. Tente novamente.'});}}
