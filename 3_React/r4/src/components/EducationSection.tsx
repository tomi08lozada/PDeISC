import { motion } from 'motion/react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useMemo, useState } from 'react'
import { ArrowUpRight, GraduationCap } from 'lucide-react'
import type { Portfolio } from '../data/portfolio'

export function EducationSection({ education }: { education: Portfolio['education'] }) {
  const [order, setOrder] = useState('desc')
  const sorted = useMemo(() => [...education].sort((a,b) =>
    a.startYear === null && b.startYear === null ? (order === 'asc' ? a.institution.localeCompare(b.institution) : b.institution.localeCompare(a.institution)) : a.startYear === null ? 1 : b.startYear === null ? -1 : order === 'asc' ? a.startYear - b.startYear : b.startYear - a.startYear), [education, order])
  const reveal = useScrollReveal()
  return <motion.section {...reveal} id="estudios" className="section-block">
    <div className="section-heading">
      <div><p className="eyebrow">04 / FORMACIÓN</p><h2>Donde empieza<br />el conocimiento.</h2></div>
      {education.length > 0 && <label className="sort-label">Ordenar formación
        <select className="form-select" value={order} onChange={event => setOrder(event.target.value)}>
          <option value="desc">Descendente</option><option value="asc">Ascendente</option>
        </select>
      </label>}
    </div>
    {sorted.length ? <div className="row g-4">{sorted.map(item => <div className="col-md-6" key={item.id}>
      <article className="education-card">
        <GraduationCap size={28} aria-hidden="true" />
        <p className="eyebrow">{item.startYear !== null ? `${item.startYear} — ${item.endYear ?? 'Actualidad'}` : item.endYear ?? item.status}</p>
        <h3>{item.degree}</h3><p className="institution">{item.institution}</p>
        {item.description && <p className="muted">{item.description}</p>}
        {item.url && <a href={item.url} target="_blank" rel="noreferrer">Ver institución <ArrowUpRight size={16} aria-hidden="true" /></a>}
      </article>
    </div>)}</div> : <p className="muted">Formación por completar.</p>}
  </motion.section>
}

