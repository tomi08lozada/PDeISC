import personalData from './tomas.json'
import { demo, schema } from './portfolio'

export const personalPortfolio = schema.parse(personalData)

// Mientras la base conserva exactamente la semilla de ejemplo, usamos el perfil
// confirmado del CV. Una edición real en Supabase siempre tiene prioridad.
export function resolvePortfolio(raw: unknown) {
  const remote = schema.parse(raw)
  const legacy = JSON.stringify(remote) === JSON.stringify(demo)
  return { data: legacy ? personalPortfolio : remote, source: legacy ? 'profile' as const : 'ready' as const }
}
