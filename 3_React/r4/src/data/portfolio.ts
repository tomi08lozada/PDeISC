import { z } from 'zod'

// Los campos nuevos son opcionales para mantener los contenidos ya guardados.
const optionalHttps = z.union([
  z.literal(''),
  z.url().refine(value => new URL(value).protocol === 'https:', 'Usá un enlace HTTPS'),
]).default('')

export const schema = z.object({
  profile: z.object({
    name: z.string(), initials: z.string(), role: z.string(),
    intro: z.string(), about: z.string(), location: z.string(),
    email: z.union([z.literal(''), z.email()]),
    phone: z.string().default('').refine(value => value === '' || (
      /^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 7 &&
      value.replace(/\D/g, '').length <= 15
    ), 'Usá un teléfono con código de país'),
    github: optionalHttps.default('https://github.com/tomi08lozada'),
    photo: optionalHttps,
    photoAlt: z.string().default(''),
    headline: z.array(z.string()).min(1).max(4).default(['Ideas claras.', 'Código con', 'personalidad.']),
    highlights: z.array(z.string()).default(['Diseño', 'Desarrollo', 'Curiosidad']),
    additionalInformation: z.string().default(''),
  }),
  skills: z.array(z.object({ name: z.string(), description: z.string() })),
  projects: z.array(z.object({
    id: z.string(), title: z.string(), category: z.string(), year: z.number().int().nullable().default(null),
    status: z.string().default(''),
    description: z.string(), tags: z.array(z.string()),
    tone: z.enum(['lime', 'violet', 'blue', 'orange']),
    url: optionalHttps, repository: optionalHttps,
    image: optionalHttps, imageAlt: z.string().default(''),
  })).refine(items => new Set(items.map(item => item.id)).size === items.length,
    'Cada proyecto necesita un id diferente'),
  experiences: z.array(z.object({
    year: z.number().nullable().default(null), type: z.string(), title: z.string(), description: z.string(),
  })),
  education: z.array(z.object({
    id: z.string(), institution: z.string(), degree: z.string(),
    startYear: z.number().int().nullable().default(null), status: z.string().default('En curso'), endYear: z.number().int().nullable().default(null),
    description: z.string().default(''), url: optionalHttps,
  }).refine(item => item.startYear === null || item.endYear === null || item.endYear >= item.startYear,
    'El año de finalización no puede ser anterior al inicio')).default([]),
})

export type Portfolio = z.infer<typeof schema>
// Contenido ficticio; Supabase reemplaza este conjunto completo al conectarse.
export const demo = schema.parse({
profile:{name:'Alex Morgan',initials:'AM',role:'Desarrollo web & diseño digital',intro:'Transformo ideas en experiencias digitales simples, útiles y con identidad.',about:'Me interesa el punto de encuentro entre la lógica y la creatividad. Desarrollo interfaces que se sienten naturales, cuido los pequeños detalles y aprendo algo nuevo en cada proyecto.',location:'Buenos Aires, Argentina',email:''},
skills:[{name:'React',description:'Interfaces dinámicas y componentes reutilizables.'},{name:'TypeScript',description:'Código claro, organizado y tipado.'},{name:'Bootstrap',description:'Diseño adaptable a cada pantalla.'},{name:'Supabase',description:'Información conectada y persistente.'}],
projects:[{id:'1',title:'Forma Studio',category:'DISEÑO & DESARROLLO',year:2026,description:'Concepto de portfolio para un estudio creativo, con foco en la tipografía y la navegación.',tags:['React','Motion','CSS'],tone:'lime',url:''},{id:'2',title:'Órbita',category:'APLICACIÓN WEB',year:2026,description:'Prototipo de una herramienta para organizar proyectos y visualizar el progreso de un equipo.',tags:['TypeScript','React'],tone:'violet',url:''},{id:'3',title:'Archivo digital',category:'EXPERIENCIA EDITORIAL',year:2025,description:'Exploración de una biblioteca digital con una lectura clara y contenido organizado.',tags:['Bootstrap','UX/UI'],tone:'blue',url:''},{id:'4',title:'Punto de partida',category:'PROYECTO ACADÉMICO',year:2024,description:'Primer proyecto de desarrollo web: estructura semántica, interacción y diseño responsivo.',tags:['HTML','CSS','JavaScript'],tone:'orange',url:''}],
experiences:[{year:2026,type:'EXPERIENCIA · EJEMPLO',title:'Desarrollo de proyectos personales',description:'Diseño y construcción de interfaces con React, integrando componentes, hooks y servicios de datos.'},{year:2025,type:'LOGRO · EJEMPLO',title:'Primera aplicación de principio a fin',description:'Desarrollo de una propuesta completa, desde la idea y el diseño hasta su implementación.'},{year:2024,type:'FORMACIÓN · EJEMPLO',title:'Fundamentos del desarrollo web',description:'Aprendizaje de HTML, CSS, JavaScript y buenas prácticas de accesibilidad.'}]})

