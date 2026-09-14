import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { schema, demo } from '../data/portfolio.ts'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { ContactSection } = await server.ssrLoadModule('/src/components/ContactSection.tsx')
  const { ProjectCard } = await server.ssrLoadModule('/src/components/ProjectCard.tsx')
  const { ProfileCard } = await server.ssrLoadModule('/src/components/ProfileCard.tsx')
  const { EducationSection } = await server.ssrLoadModule('/src/components/EducationSection.tsx')
  const content = schema.parse({ ...demo, profile: { ...demo.profile, phone: '+1 (202) 555-0123', email: 'portfolio@example.com', photo: 'https://example.com/me.jpg' } })
  const contact = renderToStaticMarkup(createElement(ContactSection, { profile: content.profile }))
  assert(contact.includes('href="tel:+12025550123"'))
  assert(contact.includes('href="mailto:portfolio@example.com"'))
  assert(contact.includes('href="https://github.com/tomi08lozada"'))
  const profile = renderToStaticMarkup(createElement(ProfileCard, { profile: content.profile }))
  assert(profile.includes('src="https://example.com/me.jpg"'))
  assert(profile.includes('alt="Retrato de Alex Morgan"'))
  const project = renderToStaticMarkup(createElement(ProjectCard, { project: { ...demo.projects[0], image: 'https://example.com/project.jpg', imageAlt: 'Captura de prueba', repository: 'https://github.com/example/project' }, index: 0 }))
  assert(project.includes('alt="Captura de prueba"'))
  assert(project.includes('loading="lazy"'))
  assert(project.includes('href="https://github.com/example/project"'))
  const education = renderToStaticMarkup(createElement(EducationSection, { education: [{ id:'test', institution:'Institución de prueba', degree:'Curso de prueba', startYear:2024, endYear:null, description:'', url:'' }] }))
  assert(education.includes('Institución de prueba'))
  assert(education.includes('Actualidad'))
  const { resolvePortfolio, personalPortfolio } = await server.ssrLoadModule('/src/data/resolvePortfolio.ts')
  assert.equal(resolvePortfolio(demo).source, 'profile')
  assert.equal(resolvePortfolio(demo).data.profile.name, 'Tomás Alejandro Lozada')
  const edited = structuredClone(demo)
  edited.profile.name = 'Nombre editado en Supabase'
  assert.equal(resolvePortfolio(edited).data.profile.name, edited.profile.name)
  assert.equal(resolvePortfolio(edited).source, 'ready')
  assert.equal(personalPortfolio.projects.length, 7)
  assert.equal(personalPortfolio.projects.find(item => item.id === 'jarvis').status, 'En desarrollo')
  assert(personalPortfolio.projects.every(item => item.year === null))
  assert(personalPortfolio.experiences.every(item => item.year === null))
  const realPhoto = renderToStaticMarkup(createElement(ProfileCard, { profile: personalPortfolio.profile }))
  assert(realPhoto.includes('tomas-lozada'))
  const undated = renderToStaticMarkup(createElement(EducationSection, { education: personalPortfolio.education }))
  assert(undated.includes('En curso'))
  assert(!undated.includes('undefined'))
  console.log('Contactos, fotos, estudios sin fechas y prioridad de Supabase: correctos.')
} finally {
  await server.close()
}

