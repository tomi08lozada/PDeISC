import personalData from '../data/tomas.json'
import personalPhoto from '../assets/tomas-lozada.jpeg'
import { Code2 } from 'lucide-react'
import type { Portfolio } from '../data/portfolio'
import { PortfolioImage } from './PortfolioImage'

export function ProfileCard({ profile }: { profile: Portfolio['profile'] }) {
  return <div className="identity-card">
    <div className="d-flex justify-content-between gap-2">
      <Code2 size={26} aria-hidden="true" /><span>{profile.role}</span>
    </div>
    <PortfolioImage src={profile.photo === personalData.profile.photo ? personalPhoto : profile.photo || (profile.name === 'Tomás Alejandro Lozada' ? personalPhoto : '')} alt={profile.photoAlt || `Retrato de ${profile.name}`}
      className="profile-photo" eager fallback={
        <div className="monogram" aria-hidden="true">{profile.initials}<sup>®</sup></div>
      } />
    <div className="identity-bottom"><strong>{profile.name}</strong><span>{profile.location}</span></div>
    <div className="identity-tags">{profile.highlights.map(tag => <span key={tag}>{tag}</span>)}</div>
  </div>
}


