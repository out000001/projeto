import { useCallback, useEffect, useState } from 'react';
import { fetchManagerProjects } from '../../services/projectApi';
export default function useManagerProjects() {
  const [state,setState]=useState({items:[],loading:true,error:null});
  const reload=useCallback(async()=>{
    setState(current=>({...current,loading:true,error:null}));
    try { const result=await fetchManagerProjects(); setState({items:result.items,loading:false,error:null}); }
    catch(error) { setState(current=>({...current,loading:false,error:error.message})); }
  },[]);
  useEffect(()=>{reload();},[reload]);
  return {...state,reload};
}
