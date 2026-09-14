import { supabaseConfig } from '../config/supabase'
import favicon from '../assets/favicon.svg'
import { useEffect,useState } from 'react'
import { personalPortfolio, resolvePortfolio } from '../data/resolvePortfolio'
export function usePortfolio(){
 const [data,setData]=useState(personalPortfolio)
 const [status,setStatus]=useState<'loading'|'ready'|'profile'|'error'>('loading')
 const [attempt,setAttempt]=useState(0)
 useEffect(()=>{
  const controller=new AbortController()
  const url=supabaseConfig.url
  const key=supabaseConfig.publishableKey
  if(!url&&!key){setStatus('profile');return}
  if(!url||!key){setStatus('error');return}
  setStatus('loading')
  // RPC de solo lectura pública. Nunca incluir una clave service_role en el cliente.
  fetch(`${url.replace(/\/$/,'')}/rest/v1/rpc/read_portfolio`,{method:'POST',headers:{'Content-Type':'application/json',apikey:key},body:JSON.stringify({}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])})
   .then(async response=>{if(!response.ok)throw new Error('Portfolio no disponible');const result=resolvePortfolio(await response.json());setData(result.data);setStatus(result.source)})
   .catch(()=>{if(!controller.signal.aborted)setStatus('error')})
  return ()=>controller.abort()
 },[attempt])
 return {data,status,reload:()=>setAttempt(v=>v+1)}
}
export function useTheme(){
 const [theme,setTheme]=useState<'light'|'dark'>(()=>{try{return localStorage.getItem('r4-theme')==='light'?'light':'dark'}catch{return 'dark'}})
 useEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.bsTheme=theme;try{localStorage.setItem('r4-theme',theme)}catch{/* Preferencia opcional: no bloquea la página. */}},[theme])
 return {theme,toggle:()=>setTheme(t=>t==='dark'?'light':'dark')}
}
export function useDate(){
 const [date,setDate]=useState(()=>new Date())
 useEffect(()=>{document.documentElement.lang='es';document.title='Tomás Lozada · Portafolio';const icon=document.querySelector<HTMLLinkElement>('link[rel=icon]');if(icon)icon.href=favicon;const timer=setInterval(()=>setDate(new Date()),60000);return ()=>clearInterval(timer)},[])
 return date
}



