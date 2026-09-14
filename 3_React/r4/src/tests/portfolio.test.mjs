import assert from 'node:assert/strict'
import test from 'node:test'
import { schema, demo } from '../data/portfolio.ts'

test('contenido anterior sigue siendo compatible sin los campos nuevos', () => {
  const legacy = structuredClone(demo)
  delete legacy.education
  for (const field of ['photo', 'photoAlt', 'phone', 'github']) delete legacy.profile[field]
  for (const project of legacy.projects) {
    for (const field of ['image', 'imageAlt', 'repository']) delete project[field]
  }
  const parsed = schema.parse(legacy)
  assert.equal(parsed.projects[0].image, '')
  assert.equal(parsed.profile.github, 'https://github.com/tomi08lozada')
  assert.deepEqual(parsed.education, [])
})

test('admite fotos, contacto y estudios válidos', () => {
  const content = structuredClone(demo)
  content.profile.phone = '+1 202 555 0123'
  content.profile.email = 'portfolio@example.com'
  content.profile.photo = 'https://example.com/photo.jpg'
  content.projects[0].image = 'https://example.com/project.webp'
  content.projects[0].repository = 'https://github.com/example/project'
  content.education = [{ id: 'edu-1', institution: 'Institución de prueba', degree: 'Curso', startYear: 2024, endYear: null }]
  assert.equal(schema.parse(content).education[0].endYear, null)
})

test('rechaza enlaces ejecutables y datos incoherentes', () => {
  const invalidUrl = structuredClone(demo)
  invalidUrl.profile.photo = 'javascript:alert(1)'
  assert.equal(schema.safeParse(invalidUrl).success, false)
  const duplicate = structuredClone(demo)
  duplicate.projects.push(duplicate.projects[0])
  assert.equal(schema.safeParse(duplicate).success, false)
  const invalidYears = structuredClone(demo)
  invalidYears.education = [{ id:'edu-1', institution:'Prueba', degree:'Prueba', startYear:2026, endYear:2024 }]
  assert.equal(schema.safeParse(invalidYears).success, false)
})
