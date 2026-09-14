import { AnimationContext, useScrollReveal } from './hooks/useScrollReveal'
import { ProfileCard } from './components/ProfileCard'
import { ContactSection } from './components/ContactSection'
import { EducationSection } from './components/EducationSection'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Fragment,useMemo,useState } from 'react'
import { ArrowDown,Menu,Moon,Sun,X } from 'lucide-react'
import { motion,MotionConfig } from 'motion/react'
import { usePortfolio,useTheme,useDate } from './hooks/usePortfolio'
import { ProjectCard } from './components/ProjectCard'
export default function App(){
 // Activadas al cargar, según la preferencia explícita del dueño del portfolio.
 const [enabled,setEnabled]=useState(true)
 function toggleAnimations(){setEnabled(value=>!value)}
 return <AnimationContext.Provider value={enabled}><MotionConfig reducedMotion={enabled?'never':'always'}><PortfolioPage key={String(enabled)} enabled={enabled} toggleAnimations={toggleAnimations}/></MotionConfig></AnimationContext.Provider>
}
function PortfolioPage({enabled,toggleAnimations}:{enabled:boolean;toggleAnimations:()=>void}){
 const {data,status,reload}=usePortfolio()
 const {theme,toggle}=useTheme()
 const reveal=useScrollReveal()
 const date=useDate()
 const [menu,setMenu]=useState(false)
 const [order,setOrder]=useState('desc')
 const [experienceOrder,setExperienceOrder]=useState('desc')
 const [skillOrder,setSkillOrder]=useState('asc')
 const projects=useMemo(()=>[...data.projects].sort((a,b)=>a.year===null&&b.year===null?(order==='asc'?a.title.localeCompare(b.title):b.title.localeCompare(a.title)):a.year===null?1:b.year===null?-1:order==='asc'?a.year-b.year||a.title.localeCompare(b.title):b.year-a.year||b.title.localeCompare(a.title)),[data.projects,order])
 return <div className="site-shell" data-animations={enabled?'on':'off'}>
 <a className="skip-link" href="#contenido">Saltar al contenido</a>
 <header className="site-header"><div className="container d-flex align-items-center justify-content-between gap-3"><a className="brand" href="#inicio" aria-label="Volver al inicio">Portafolio</a><nav aria-label="Navegación principal" className={menu?'main-nav open':'main-nav'}>{[['sobre-mi','Sobre mí'],['proyectos','Proyectos'],['recorrido','Recorrido'],['estudios','Estudios'],['contacto','Contacto']].map(([id,label])=><a key={id} href={'#'+id} onClick={()=>setMenu(false)}>{label}</a>)}</nav><div className="d-flex gap-2"><button className="icon-button" onClick={toggle} aria-label={theme==='dark'?'Activar modo día':'Activar modo noche'}>{theme==='dark'?<Sun size={20}/>:<Moon size={20}/>}</button><button className="icon-button menu-button" aria-label="Abrir o cerrar menú" aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div></div></header>
 <div className="container animation-toolbar"><button className="animation-toggle" onClick={toggleAnimations} aria-pressed={enabled}>Animaciones: {enabled?'activadas':'desactivadas'}</button></div>
 <main id="contenido" className="container"><div className="topline"><span>PORTFOLIO / EDICIÓN {date.getFullYear()}</span><time dateTime={`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}>{date.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</time></div><p className="data-notice" role="status">{status==='profile'?'Portafolio personal':status==='loading'?'Cargando portfolio…':status==='error'?<>No se pudo actualizar el contenido. Se muestra la información disponible. <button onClick={reload}>Reintentar</button></>:'Portfolio actualizado'}</p>
 <motion.section {...reveal} id="inicio" className="hero row align-items-center g-4"><motion.div className="col-lg-8" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.65}}><p className="eyebrow"><span className="small-line"/>{data.profile.role}</p><h1>{data.profile.headline.map((line,index) => index === data.profile.headline.length-1 ? <span key={index}>{line}</span> : <Fragment key={index}>{line}<br/></Fragment>)}</h1><p className="hero-copy">Soy {data.profile.name}. {data.profile.intro}</p><a className="accent-button" href="#proyectos">Explorar proyectos <ArrowDown size={18}/></a></motion.div><motion.div className="col-lg-4" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.8,delay:.15}}><ProfileCard profile={data.profile} /></motion.div></motion.section>
 <div className="skill-strip" aria-label="Áreas de trabajo">{data.skills.slice(0,4).map(s=><span key={s.name}>{s.name}<span className="strip-star" aria-hidden="true">✳</span></span>)}</div>
 <motion.section {...reveal} id="sobre-mi" className="section-block row g-4"><div className="col-lg-4"><p className="eyebrow">01 / SOBRE MÍ</p><h2>Detrás de<br/>cada detalle.</h2><label className="sort-label mt-4">Ordenar habilidades<select className="form-select" value={skillOrder} onChange={e=>setSkillOrder(e.target.value)}><option value="asc">Nombre · A a Z</option><option value="desc">Nombre · Z a A</option></select></label></div><div className="col-lg-8"><p className="about-text">{data.profile.about}</p>{data.profile.additionalInformation && <p className="availability-note">{data.profile.additionalInformation}</p>}<div className="row g-3 mt-3">{[...data.skills].sort((a,b)=>skillOrder==='asc'?a.name.localeCompare(b.name):b.name.localeCompare(a.name)).map(s=><div className="col-sm-6" key={s.name}><div className="skill-item"><strong>{s.name}</strong><span>{s.description}</span></div></div>)}</div></div></motion.section>
 <motion.section {...reveal} id="proyectos" className="section-block"><div className="section-heading"><div><p className="eyebrow">02 / TRABAJO SELECCIONADO</p><h2>Del concepto<br/>a la pantalla<span className="accent-text">.</span></h2></div><label className="sort-label">Ordenar proyectos<select className="form-select" value={order} onChange={e=>setOrder(e.target.value)}><option value="desc">Descendente · año / nombre</option><option value="asc">Ascendente · año / nombre</option></select></label></div>{projects.length?<div className="row g-4">{projects.map((p,i)=><div className="col-md-6" key={p.id}><ProjectCard project={p} index={i}/></div>)}</div>:<p>Próximamente compartiré mis proyectos en este espacio.</p>}</motion.section>
 <motion.section {...reveal} id="recorrido" className="section-block row g-4 g-lg-5"><div className="col-lg-5"><p className="eyebrow">03 / EXPERIENCIA</p><h2>Aprender.<br/>Crear. Evolucionar.</h2><p className="muted mt-4">Cada experiencia es una nueva forma de mirar y resolver problemas.</p><label className="sort-label">Ordenar experiencias<select className="form-select" value={experienceOrder} onChange={e=>setExperienceOrder(e.target.value)}><option value="desc">Descendente</option><option value="asc">Ascendente</option></select></label></div><div className="col-lg-7">{[...data.experiences].sort((a,b)=>a.year === null && b.year === null ? (experienceOrder==='asc'?a.title.localeCompare(b.title):b.title.localeCompare(a.title)) : a.year === null ? 1 : b.year === null ? -1 : experienceOrder==='asc'?a.year-b.year:b.year-a.year).map(e=><article className="timeline-item" key={e.title}>{e.year !== null && <span className="timeline-year">{e.year}</span>}<div><span className="eyebrow">{e.type}</span><h3>{e.title}</h3><p>{e.description}</p></div></article>)}</div></motion.section>
 <EducationSection education={data.education} /><ContactSection profile={data.profile} /></main><footer className="container footer"><span>© {date.getFullYear()} {data.profile.name}</span><span>Diseñado con intención. Construido con React.</span><a href="#inicio">Volver arriba ↑</a></footer>
 </div>
}






