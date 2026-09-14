import { AnimationContext, useScrollReveal } from '../hooks/useScrollReveal'
import { useContext, useState } from 'react'
import { Plus, ArrowUpRight, Code2 } from 'lucide-react'
import { motion } from 'motion/react'
import type { Portfolio } from '../data/portfolio'
import { PortfolioImage } from './PortfolioImage'

export function ProjectCard({ project, index }: { project: Portfolio['projects'][number]; index: number }) {
  const enabled = useContext(AnimationContext)
  const reveal = useScrollReveal()
  const [expanded, setExpanded] = useState(false)
  const typography = <div className={'project-art ' + project.tone}>
    <div className="art-top"><span>PROYECTO</span><span>/{String(index + 1).padStart(2, '0')}</span></div>
    <span className="project-wordmark">{project.title}</span>
    <div className="art-bottom"><span>{project.category}</span><span>{project.year}</span></div>
  </div>
  return <motion.article className="project-card" {...reveal}>
    <PortfolioImage src={project.image} alt={project.imageAlt || `Vista del proyecto ${project.title}`}
      className="project-photo" fallback={typography} />
    <div className="project-info">
      <div className="d-flex justify-content-between gap-3">
        <div><p className="eyebrow">{project.category}{project.year !== null && ` / ${project.year}`}</p><h3>{project.title}</h3></div>
        <button className="icon-button" aria-label={(expanded ? 'Ocultar' : 'Ver') + ' detalles de ' + project.title}
          aria-expanded={expanded} aria-controls={'details-' + project.id} onClick={() => setExpanded(!expanded)}>
          <motion.span animate={{ rotate: expanded ? 45 : 0 }} transition={{ duration: enabled ? .35 : 0 }}><Plus /></motion.span>
        </button>
      </div>
      {project.status && <p className="project-status">{project.status}</p>}
      <div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <motion.div id={'details-' + project.id} initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: enabled ? .65 : 0, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }} aria-hidden={!expanded} inert={!expanded}>
        <motion.p className="project-description" animate={{ y: expanded ? 0 : -18 }} transition={{ duration: enabled ? .55 : 0 }}>{project.description}</motion.p>
      </motion.div>
      {(project.url || project.repository) && <div className="project-links">
        {project.url && <a href={project.url} target="_blank" rel="noreferrer">Ver proyecto <ArrowUpRight size={16} aria-hidden="true" /></a>}
        {project.repository && <a href={project.repository} target="_blank" rel="noreferrer"><Code2 size={16} aria-hidden="true" /> Código</a>}
      </div>}
    </div>
  </motion.article>
}

