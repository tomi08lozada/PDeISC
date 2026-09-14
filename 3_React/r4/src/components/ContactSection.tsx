import { motion } from 'motion/react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { ArrowUpRight, Code2, Mail, Phone } from 'lucide-react'
import type { Portfolio } from '../data/portfolio'

export function ContactSection({ profile }: { profile: Portfolio['profile'] }) {
  const phoneHref = profile.phone.replace(/[^+\d]/g, '')
  const reveal = useScrollReveal()
  return <motion.section {...reveal} id="contacto" className="contact-section">
    <p className="eyebrow">05 / PRÓXIMO PASO</p>
    <h2>¿Creamos algo<br /><span>que valga la pena?</span></h2>
    <p>Las buenas ideas empiezan con una conversación.</p>
    <div className="contact-links">
      {profile.phone && <a className="contact-link" href={`tel:${phoneHref}`}>
        <Phone size={22} aria-hidden="true" /><span><small>Teléfono</small>{profile.phone}</span><ArrowUpRight size={18} aria-hidden="true" />
      </a>}
      {profile.email && <a className="contact-link" href={`mailto:${profile.email}`}>
        <Mail size={22} aria-hidden="true" /><span><small>Email</small>{profile.email}</span><ArrowUpRight size={18} aria-hidden="true" />
      </a>}
      {profile.github && <a className="contact-link" href={profile.github} target="_blank" rel="noreferrer">
        <Code2 size={22} aria-hidden="true" /><span><small>GitHub</small>Ver mi perfil</span><ArrowUpRight size={18} aria-hidden="true" />
      </a>}
      {!profile.phone && !profile.email && !profile.github && <span className="contact-placeholder">Contacto por completar</span>}
    </div>
  </motion.section>
}

