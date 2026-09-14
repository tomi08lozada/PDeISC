import { useState } from 'react'
import type { ReactNode } from 'react'

/** Conserva el espacio y muestra el diseño alternativo si el enlace falla. */
export function PortfolioImage({ src, alt, className, fallback, eager = false }: {
  src: string; alt: string; className: string; fallback: ReactNode; eager?: boolean
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  if (!src || failedSource === src) return <>{fallback}</>
  return <img src={src} alt={alt} className={className}
    loading={eager ? 'eager' : 'lazy'} decoding="async"
    onError={() => setFailedSource(src)} />
}
