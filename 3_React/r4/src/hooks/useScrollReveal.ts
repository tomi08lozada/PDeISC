import { createContext, useContext } from 'react'

export const AnimationContext = createContext(true)

// Se repite al volver a entrar en pantalla. El control del sitio decide el movimiento.
export function useScrollReveal() {
  const enabled = useContext(AnimationContext)
  return {
    initial: enabled ? { opacity: 0, y: 60 } : false as const,
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.01 },
    transition: { duration: enabled ? 0.85 : 0 },
  }
}
