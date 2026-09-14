-- Ejecutar una sola vez en Supabase → SQL Editor.
-- Agrega campos opcionales; conserva el contenido existente y no cambia permisos.
update public.portfolio
set content = jsonb_set(
  content,
  '{profile}',
  jsonb_build_object(
    'phone', '',
    'github', 'https://github.com/tomi08lozada',
    'photo', '',
    'photoAlt', ''
  ) || coalesce(content->'profile', '{}'::jsonb)
)
where id = 1;

update public.portfolio
set content = content || jsonb_build_object('education', '[]'::jsonb)
where id = 1 and not (content ? 'education');

update public.portfolio
set content = jsonb_set(content, '{projects}', coalesce((
  select jsonb_agg(
    jsonb_build_object('image', '', 'imageAlt', '', 'repository', '') || project
    order by position
  )
  from jsonb_array_elements(content->'projects') with ordinality as items(project, position)
), '[]'::jsonb))
where id = 1 and jsonb_typeof(content->'projects') = 'array';
