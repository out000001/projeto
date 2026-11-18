import {services} from '../server/firebase-admin.mjs';
import {createEditaisHandler} from '../server/editais.mjs';
export default async function editais(req,res){res.setHeader('Cache-Control','no-store');try{return await createEditaisHandler(services())(req,res);}catch{return res.status(503).json({error:'Editais indisponíveis. Tente novamente.'});}}
