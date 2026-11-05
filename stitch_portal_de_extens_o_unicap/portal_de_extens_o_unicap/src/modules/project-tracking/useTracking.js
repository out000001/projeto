import {useCallback,useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {portalRequest} from '../../services/portalApi';
export default function useTracking() {
 const [params,setParams]=useSearchParams();const id=params.get('id')||'';
 const [items,setItems]=useState([]),[data,setData]=useState(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const activeId=useRef(id);activeId.current=id;
 const inFlight=useRef(false);const generation=useRef(0);
 useEffect(()=>{let active=true;portalRequest('/api/tracking').then(result=>{if(!active)return;setItems(result.items);if(!id&&result.items.length)setParams({id:result.items[0].id},{replace:true});else if(!result.items.length)setLoading(false);}).catch(err=>{if(active){setError(err.message);setLoading(false);}});return()=>{active=false;};},[id,setParams]);
 const reload=useCallback(async()=>{
  if(!id)return;
  const current=++generation.current;setLoading(true);setError('');
  try{const result=await portalRequest(`/api/tracking?id=${encodeURIComponent(id)}`);if(current===generation.current)setData(result);}
  catch(err){if(current===generation.current){setData(null);setError(err.message);}}
  finally{if(current===generation.current)setLoading(false);}
 },[id]);
 const invalidate=useCallback(()=>{generation.current++;},[]);
 useEffect(()=>{setData(null);reload();return invalidate;},[reload,invalidate]);
 const action=useCallback(async payload=>{
  if(inFlight.current||!data||activeId.current!==id)return false;
  inFlight.current=true;setBusy(true);setError('');const current=generation.current;
  try{const result=await portalRequest('/api/tracking','POST',{...payload,id,revision:data.tracking.revision});if(current===generation.current&&activeId.current===id)setData(result);return true;}
  catch(err){if(current===generation.current)setError(err.message);return false;}
  finally{inFlight.current=false;setBusy(false);}
 },[id,data]);
 return{items,id,setId:value=>setParams({id:value}),data,loading,busy,error,reload,action};
}
