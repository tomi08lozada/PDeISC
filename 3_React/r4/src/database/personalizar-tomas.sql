-- Sincronizar el CV de Tomás con Supabase. Ejecutar en SQL Editor.
-- Actualiza solo la fila del portfolio. No modifica permisos ni otras tablas.
-- Conserva los proyectos reales y retira únicamente los cuatro ejemplos iniciales.
begin;
update public.portfolio
set content = content ||$perfil${
  "profile": {
    "name": "Tomás Alejandro Lozada",
    "initials": "TL",
    "role": "Estudiante de Informática · 7.º año",
    "headline": [
      "Formación técnica.",
      "Ganas de aprender."
    ],
    "intro": "Estoy en búsqueda de mi primera experiencia laboral formal, con formación técnica y experiencia en trabajos independientes y pasantías.",
    "about": "Soy estudiante de 7.º año de escuela técnica. Me considero responsable, organizado y sociable, con buena predisposición para aprender. Cuento con experiencia en trabajos independientes, tareas prácticas, pasantías y herramientas digitales. Me adapto a diferentes tareas y entornos de trabajo, y disfruto colaborar en equipo y resolver problemas.",
    "location": "Mar del Plata, Argentina",
    "email": "tomastal960@gmail.com",
    "phone": "(223) 525-4190",
    "github": "https://github.com/tomi08lozada",
    "photo": "https://r4-portfolio-estudio-2026.t0z4xx8.chatgpt.site/assets/tomas-lozada-MRF6Y-8a.jpeg",
    "photoAlt": "Retrato de Tomás Alejandro Lozada",
    "highlights": [
      "Responsabilidad",
      "Organización",
      "Aprendizaje"
    ],
    "additionalInformation": "Disponibilidad horaria hasta las 16:00 por cursada escolar. Actualmente estoy aprendiendo a conducir y en proceso de obtener la licencia de conducir."
  },
  "skills": [
    {
      "name": "Desarrollo web",
      "description": "Desarrollo de páginas web y soluciones informáticas para familiares y conocidos, adaptadas a sus necesidades."
    },
    {
      "name": "Excel",
      "description": "Creación y organización de planillas de cálculo para distintas necesidades."
    },
    {
      "name": "Programación",
      "description": "Formación técnica en programación y experiencia en proyectos prácticos individuales y grupales."
    },
    {
      "name": "Inteligencia artificial",
      "description": "Manejo de herramientas de inteligencia artificial como parte de mis habilidades informáticas."
    },
    {
      "name": "Bases de datos",
      "description": "Conocimientos adquiridos durante mi formación técnica en Informática."
    },
    {
      "name": "Redes y sistemas operativos",
      "description": "Formación técnica en redes, sistemas operativos y herramientas informáticas."
    },
    {
      "name": "Trabajo en equipo",
      "description": "Facilidad para comunicarme, colaborar y adaptarme a diferentes equipos y tareas."
    },
    {
      "name": "Organización y autonomía",
      "description": "Responsabilidad para gestionar trabajos independientes, organizar tareas y resolver problemas."
    }
  ],
  "projects": [
    {
      "id": "intema-sension378",
      "title": "sensION378 Monitor",
      "description": "Proyecto realizado en INTEMA. Aplicación de escritorio para seguir mediciones de pH, conductividad, oxígeno disuelto y temperatura del Hach sensION378. La conexión serial permite ver gráficos en tiempo real, identificar sesiones y guardar los registros en CSV.",
      "tags": [
        "Electron",
        "JavaScript",
        "Chart.js"
      ],
      "category": "INTEMA",
      "year": null,
      "status": "",
      "tone": "lime",
      "url": "",
      "repository": "",
      "image": "",
      "imageAlt": ""
    },
    {
      "id": "intema-posgrados",
      "title": "Portal de posgrados",
      "description": "Proyecto realizado en INTEMA. Sitio dedicado a la oferta de posgrados de la Facultad de Ingeniería, que reúne la información académica y permite mantener sus contenidos actualizados.",
      "tags": [
        "JavaScript",
        "Node.js",
        "React",
        "HTML",
        "CSS"
      ],
      "category": "INTEMA",
      "year": null,
      "status": "",
      "tone": "violet",
      "url": "",
      "repository": "",
      "image": "",
      "imageAlt": ""
    },
    {
      "id": "intema-electroquimica",
      "title": "Web de Electroquímica · INTEMA",
      "description": "Proyecto realizado en INTEMA. Espacio web para presentar el trabajo del grupo de Electroquímica de INTEMA. Organiza información e imágenes y permite que los profesionales publiquen sus propios proyectos.",
      "tags": [
        "JavaScript",
        "Node.js",
        "React",
        "HTML",
        "CSS"
      ],
      "category": "INTEMA",
      "year": null,
      "status": "",
      "tone": "blue",
      "url": "",
      "repository": "",
      "image": "",
      "imageAlt": ""
    },
    {
      "id": "intema-ivium",
      "title": "Constructor de secuencias Ivium",
      "description": "Proyecto realizado en INTEMA. Herramienta web para armar y combinar instrucciones destinadas al equipo Ivium, simplificando la preparación de secuencias que se realizaba manualmente.",
      "tags": [
        "JavaScript",
        "Node.js"
      ],
      "category": "INTEMA",
      "year": null,
      "status": "",
      "tone": "orange",
      "url": "",
      "repository": "",
      "image": "",
      "imageAlt": ""
    },
    {
      "id": "intema-gamry-secuencias",
      "title": "Generador de secuencias Gamry",
      "description": "Proyecto realizado en INTEMA. Aplicación web que ayuda a preparar y unir secuencias de comandos para equipos Gamry, agilizando una tarea que requería armado manual.",
      "tags": [
        "JavaScript",
        "Node.js"
      ],
      "category": "INTEMA",
      "year": null,
      "status": "",
      "tone": "lime",
      "url": "",
      "repository": "",
      "image": "",
      "imageAlt": ""
    },
    {
      "id": "intema-gamry-conversor",
      "title": "Conversor Gamry · .dta a .dat",
      "description": "Proyecto realizado en INTEMA. Conversión por lotes de archivos .dta de Gamry al formato .dat de tres columnas numéricas, para utilizar los resultados en ZView.",
      "tags": [
        "JavaScript",
        "Node.js"
      ],
      "category": "INTEMA",
      "year": null,
      "status": "",
      "tone": "violet",
      "url": "",
      "repository": "",
      "image": "",
      "imageAlt": ""
    },
    {
      "id": "jarvis",
      "title": "JARVIS",
      "description": "Proyecto personal en el que estoy trabajando actualmente.",
      "tags": [],
      "category": "PROYECTO PERSONAL",
      "year": null,
      "status": "En desarrollo",
      "tone": "blue",
      "url": "",
      "repository": "",
      "image": "",
      "imageAlt": ""
    }
  ],
  "experiences": [
    {
      "year": null,
      "type": "TRABAJO INDEPENDIENTE",
      "title": "Desarrollo y soluciones informáticas",
      "description": "Desarrollo de páginas web, creación y organización de planillas de Excel y soluciones informáticas para familiares y conocidos, adaptadas a diferentes necesidades."
    },
    {
      "year": null,
      "type": "PASANTÍAS",
      "title": "INTEMA",
      "description": "Participación en un entorno técnico y profesional, colaborando con equipos de trabajo y desarrollando tareas asignadas con responsabilidad, organización y capacidad de aprendizaje."
    },
    {
      "year": null,
      "type": "TRABAJO INDEPENDIENTE",
      "title": "Servicios de limpieza y mantenimiento de patios",
      "description": "Realización de tareas de limpieza, mantenimiento y organización de patios y espacios exteriores, gestionando el trabajo de forma autónoma y responsable."
    },
    {
      "year": null,
      "type": "TRABAJO PARTICULAR",
      "title": "Ayudante de construcción",
      "description": "Colaboración en tareas de construcción y mantenimiento, preparación de materiales, manejo de herramientas y organización del espacio de trabajo."
    }
  ],
  "education": [
    {
      "id": "eest5-informatica",
      "institution": "Escuela de Educación Secundaria Técnica N.º 5 · Mar del Plata",
      "degree": "Tecnicatura en Informática · 7.º año",
      "startYear": null,
      "endYear": null,
      "status": "En curso",
      "description": "Formación técnica orientada a programación, desarrollo web, bases de datos, redes, sistemas operativos y herramientas informáticas. Experiencia en proyectos prácticos individuales y grupales.",
      "url": ""
    }
  ]
}$perfil$::jsonb || jsonb_build_object('projects', $proyectos$[{"id":"intema-sension378","title":"sensION378 Monitor","description":"Proyecto realizado en INTEMA. Aplicación de escritorio para seguir mediciones de pH, conductividad, oxígeno disuelto y temperatura del Hach sensION378. La conexión serial permite ver gráficos en tiempo real, identificar sesiones y guardar los registros en CSV.","tags":["Electron","JavaScript","Chart.js"],"category":"INTEMA","year":null,"status":"","tone":"lime","url":"","repository":"","image":"","imageAlt":""},{"id":"intema-posgrados","title":"Portal de posgrados","description":"Proyecto realizado en INTEMA. Sitio dedicado a la oferta de posgrados de la Facultad de Ingeniería, que reúne la información académica y permite mantener sus contenidos actualizados.","tags":["JavaScript","Node.js","React","HTML","CSS"],"category":"INTEMA","year":null,"status":"","tone":"violet","url":"","repository":"","image":"","imageAlt":""},{"id":"intema-electroquimica","title":"Web de Electroquímica · INTEMA","description":"Proyecto realizado en INTEMA. Espacio web para presentar el trabajo del grupo de Electroquímica de INTEMA. Organiza información e imágenes y permite que los profesionales publiquen sus propios proyectos.","tags":["JavaScript","Node.js","React","HTML","CSS"],"category":"INTEMA","year":null,"status":"","tone":"blue","url":"","repository":"","image":"","imageAlt":""},{"id":"intema-ivium","title":"Constructor de secuencias Ivium","description":"Proyecto realizado en INTEMA. Herramienta web para armar y combinar instrucciones destinadas al equipo Ivium, simplificando la preparación de secuencias que se realizaba manualmente.","tags":["JavaScript","Node.js"],"category":"INTEMA","year":null,"status":"","tone":"orange","url":"","repository":"","image":"","imageAlt":""},{"id":"intema-gamry-secuencias","title":"Generador de secuencias Gamry","description":"Proyecto realizado en INTEMA. Aplicación web que ayuda a preparar y unir secuencias de comandos para equipos Gamry, agilizando una tarea que requería armado manual.","tags":["JavaScript","Node.js"],"category":"INTEMA","year":null,"status":"","tone":"lime","url":"","repository":"","image":"","imageAlt":""},{"id":"intema-gamry-conversor","title":"Conversor Gamry · .dta a .dat","description":"Proyecto realizado en INTEMA. Conversión por lotes de archivos .dta de Gamry al formato .dat de tres columnas numéricas, para utilizar los resultados en ZView.","tags":["JavaScript","Node.js"],"category":"INTEMA","year":null,"status":"","tone":"violet","url":"","repository":"","image":"","imageAlt":""},{"id":"jarvis","title":"JARVIS","description":"Proyecto personal en el que estoy trabajando actualmente.","tags":[],"category":"PROYECTO PERSONAL","year":null,"status":"En desarrollo","tone":"blue","url":"","repository":"","image":"","imageAlt":""}]$proyectos$::jsonb || coalesce((
 select jsonb_agg(project order by position)
 from jsonb_array_elements(coalesce(content->'projects','[]'::jsonb)) with ordinality as items(project, position)
 where project->>'id' not in ('intema-sension378','intema-posgrados','intema-electroquimica','intema-ivium','intema-gamry-secuencias','intema-gamry-conversor','jarvis') and not (
   (project->>'id' = '1' and project->>'title' = 'Forma Studio') or
   (project->>'id' = '2' and project->>'title' = 'Órbita') or
   (project->>'id' = '3' and project->>'title' = 'Archivo digital') or
   (project->>'id' = '4' and project->>'title' = 'Punto de partida')
 )
), '[]'::jsonb))
where id = 1;
commit;
select id, content->'profile'->>'name' as nombre from public.portfolio where id = 1;
