import {useCallback,useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {portalRequest} from '../../services/portalApi';

export default function useTracking() {
  const [params,setParams] = useSearchParams();
  const id = params.get('id') || '';
  const [items,setItems] = useState([]), [data,setData] = useState(null);
  const [loading,setLoading] = useState(Boolean(id)), [busy,setBusy] = useState(false), [error,setError] = useState('');
  const [listLoading,setListLoading] = useState(true), [listError,setListError] = useState('');
  const activeId = useRef(id); activeId.current = id;
  const inFlight = useRef(false), generation = useRef(0), listGeneration = useRef(0);
  const reloadList = useCallback(async()=>{
    const current = ++listGeneration.current;
    setListLoading(true); setListError('');
    try {const result=await portalRequest('/api/tracking');if(current===listGeneration.current)setItems(result.items);}
    catch(err) {if(current===listGeneration.current)setListError(err.message);}
    finally {if(current===listGeneration.current)setListLoading(false);}
  },[]);
  const invalidateList=useCallback(()=>{listGeneration.current++;},[]);
  useEffect(()=>{reloadList();return invalidateList;},[reloadList,invalidateList]);
  const reloadProject = useCallback(async()=>{
    const current = ++generation.current;
    if(!id){setData(null);setError('');setLoading(false);return;}
    setLoading(true);setError('');
    try{const result=await portalRequest(`/api/tracking?id=${encodeURIComponent(id)}`);if(current===generation.current)setData(result);}
    catch(err){if(current===generation.current){setData(null);setError(err.message);}}
    finally{if(current===generation.current)setLoading(false);}
  },[id]);
  const invalidateProject=useCallback(()=>{generation.current++;},[]);
  useEffect(()=>{setData(null);reloadProject();return invalidateProject;},[reloadProject,invalidateProject]);
  const reload = useCallback(()=>Promise.all([reloadProject(),reloadList()]),[reloadProject,reloadList]);
  const action = useCallback(async payload=>{
    if(inFlight.current||!data||data.project.id!==id||activeId.current!==id)return false;
    inFlight.current=true;setBusy(true);setError('');const current=generation.current;
    try{const result=await portalRequest('/api/tracking','POST',{...payload,id,revision:data.tracking.revision});if(current===generation.current&&activeId.current===id){setData(result);setItems(previous=>previous.map(item=>item.id!==id?item:{...item,startDate:result.tracking.config.startDate,endDate:result.tracking.config.endDate,pendingReports:result.tracking.reports.filter(report=>['pending','changes_requested'].includes(report.status)).length,awaitingReview:result.tracking.reports.filter(report=>report.status==='received').length}));}return true;}
    catch(err){if(current===generation.current)setError(err.message);return false;}
    finally{inFlight.current=false;setBusy(false);}
  },[id,data]);
  const setId = useCallback(value=>setParams(current=>{
    const next=new window.URLSearchParams(current);
    if(value)next.set('id',value);else next.delete('id');
    return next;
  }),[setParams]);
  return {items,id,setId,data,loading,busy,error,listLoading,listError,reload,action};
}
