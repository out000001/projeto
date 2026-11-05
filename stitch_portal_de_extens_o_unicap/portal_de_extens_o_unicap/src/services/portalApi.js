import {auth} from './firebase';
export async function portalRequest(path,method='GET',body,{anonymous=false}={}) {
 const headers=body?{'Content-Type':'application/json'}:{};
 if(!anonymous) {
  if(!auth.currentUser)throw new Error('Entre na sua conta para continuar.');
  headers.Authorization=`Bearer ${await auth.currentUser.getIdToken()}`;
 }
 const response=await fetch(path,{method,headers,...(body?{body:JSON.stringify(body)}:{})});
 const result=await response.json().catch(()=>null);
 if(!response.ok||!result)throw Object.assign(new Error(result?.error||'Não foi possível conectar ao portal. Tente novamente.'),{status:response.status});
 return result;
}
export const getAccount=(notifications=false)=>portalRequest(`/api/portal?resource=account${notifications?'&notifications=1':''}`);
export const saveAccount=(settings,reset=false)=>portalRequest('/api/portal?resource=account','POST',{settings,reset});
export const enrollProject=(projectId,action='enroll')=>portalRequest('/api/portal?resource=enrollments','POST',{projectId,action});
export const getEnrollments=(projectId='')=>portalRequest(`/api/portal?resource=enrollments${projectId?'&projectId='+encodeURIComponent(projectId):''}`);
export const promoteEnrollment=(projectId,userId)=>portalRequest('/api/portal?resource=enrollments','POST',{projectId,userId,action:'promote'});
export const submitPartnership=body=>portalRequest('/api/portal?resource=partnerships','POST',body,{anonymous:true});
export const getPartnerships=()=>portalRequest('/api/portal?resource=partnerships');
export const updatePartnership=body=>portalRequest('/api/portal?resource=partnerships','PATCH',body);
