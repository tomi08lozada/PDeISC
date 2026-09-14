-- Ejecutar una vez en SQL Editor de Supabase. Solo contiene datos públicos.
create table if not exists public.portfolio (
 id integer primary key check (id = 1),
 content jsonb not null,
 published boolean not null default true
);
alter table public.portfolio enable row level security;
revoke all on public.portfolio from anon, authenticated;
grant select on public.portfolio to anon, authenticated;
drop policy if exists "Lectura de portfolio publicado" on public.portfolio;
create policy "Lectura de portfolio publicado" on public.portfolio for select to anon, authenticated using (published = true);

-- Función invoker: respeta RLS y no concede permisos para editar.
create or replace function public.read_portfolio()
returns jsonb language sql stable security invoker set search_path = ''
as $$ select content from public.portfolio where id = 1 and published = true; $$;
revoke execute on function public.read_portfolio() from public;
grant execute on function public.read_portfolio() to anon, authenticated;

-- La semilla no sobrescribe contenido existente.
insert into public.portfolio (id, content) values (1, $portfolio${
  "profile": {
    "name": "Alex Morgan",
    "initials": "AM",
    "role": "Desarrollo web & diseño digital",
    "intro": "Transformo ideas en experiencias digitales simples, útiles y con identidad.",
    "about": "Me interesa el punto de encuentro entre la lógica y la creatividad. Desarrollo interfaces que se sienten naturales, cuido los pequeños detalles y aprendo algo nuevo en cada proyecto.",
    "location": "Buenos Aires, Argentina",
    "email": ""
  },
  "skills": [
    {
      "name": "React",
      "description": "Interfaces dinámicas y componentes reutilizables."
    },
    {
      "name": "TypeScript",
      "description": "Código claro, organizado y tipado."
    },
    {
      "name": "Bootstrap",
      "description": "Diseño adaptable a cada pantalla."
    },
    {
      "name": "Supabase",
      "description": "Información conectada y persistente."
    }
  ],
  "projects": [
    {
      "id": "1",
      "title": "Forma Studio",
      "category": "DISEÑO & DESARROLLO",
      "year": 2026,
      "description": "Concepto de portfolio para un estudio creativo, con foco en la tipografía y la navegación.",
      "tags": [
        "React",
        "Motion",
        "CSS"
      ],
      "tone": "lime",
      "url": ""
    },
    {
      "id": "2",
      "title": "Órbita",
      "category": "APLICACIÓN WEB",
      "year": 2026,
      "description": "Prototipo de una herramienta para organizar proyectos y visualizar el progreso de un equipo.",
      "tags": [
        "TypeScript",
        "React"
      ],
      "tone": "violet",
      "url": ""
    },
    {
      "id": "3",
      "title": "Archivo digital",
      "category": "EXPERIENCIA EDITORIAL",
      "year": 2025,
      "description": "Exploración de una biblioteca digital con una lectura clara y contenido organizado.",
      "tags": [
        "Bootstrap",
        "UX/UI"
      ],
      "tone": "blue",
      "url": ""
    },
    {
      "id": "4",
      "title": "Punto de partida",
      "category": "PROYECTO ACADÉMICO",
      "year": 2024,
      "description": "Primer proyecto de desarrollo web: estructura semántica, interacción y diseño responsivo.",
      "tags": [
        "HTML",
        "CSS",
        "JavaScript"
      ],
      "tone": "orange",
      "url": ""
    }
  ],
  "experiences": [
    {
      "year": 2026,
      "type": "EXPERIENCIA · EJEMPLO",
      "title": "Desarrollo de proyectos personales",
      "description": "Diseño y construcción de interfaces con React, integrando componentes, hooks y servicios de datos."
    },
    {
      "year": 2025,
      "type": "LOGRO · EJEMPLO",
      "title": "Primera aplicación de principio a fin",
      "description": "Desarrollo de una propuesta completa, desde la idea y el diseño hasta su implementación."
    },
    {
      "year": 2024,
      "type": "FORMACIÓN · EJEMPLO",
      "title": "Fundamentos del desarrollo web",
      "description": "Aprendizaje de HTML, CSS, JavaScript y buenas prácticas de accesibilidad."
    }
  ]
}$portfolio$::jsonb) on conflict (id) do nothing;
