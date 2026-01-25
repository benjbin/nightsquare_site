-- ============================================================
-- Night Square - Table "Nos insights & actus" (Supabase)
-- À exécuter dans l’éditeur SQL de ton projet Supabase
-- ============================================================

-- Table des articles / insights / actus
create table if not exists public.insights_actus (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  image_url text,
  tag text not null default 'Insights',
  title_fr text not null,
  title_en text,
  excerpt_fr text not null,
  excerpt_en text,
  author text not null default 'Night Square',
  published_at timestamptz not null default now(),
  link_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index pour les requêtes courantes (liste publiée, tri par date)
create index if not exists idx_insights_actus_published_order
  on public.insights_actus (is_published, published_at desc);

create index if not exists idx_insights_actus_sort
  on public.insights_actus (sort_order, published_at desc);

-- Trigger pour mettre à jour updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists insights_actus_updated_at on public.insights_actus;
create trigger insights_actus_updated_at
  before update on public.insights_actus
  for each row execute function public.set_updated_at();

-- RLS : lecture publique pour les articles publiés uniquement
alter table public.insights_actus enable row level security;

drop policy if exists "Public read published insights_actus" on public.insights_actus;
create policy "Public read published insights_actus"
  on public.insights_actus for select
  using (is_published = true);

-- Exemple : policy pour insérer/mettre à jour (à restreindre aux admins en prod)
-- Ici tu peux ajouter une policy avec auth.role() = 'authenticated' ou un service role.

-- Données d’exemple (optionnel)
insert into public.insights_actus (
  slug, image_url, tag, title_fr, title_en, excerpt_fr, excerpt_en, author, published_at, link_url, sort_order
) values
  (
    'comment-booster-reservations-tables',
    'https://nightsquare.com/src/IMG_9247.PNG',
    'Insights',
    'Comment booster les réservations tables',
    'How to boost table reservations',
    'Des tactiques concrètes pour augmenter vos réservations sans dégrader l''expérience client.',
    'Concrete tactics to increase your reservations without degrading the customer experience.',
    'Night Square',
    '2026-01-07 10:00:00+00',
    null,
    0
  ),
  (
    'nightlife-premium-tendances-2026',
    'https://nightsquare.com/src/IMG_9248.PNG',
    'Actus',
    'Nightlife premium : les tendances 2026',
    'Premium nightlife: 2026 trends',
    'Ce qui change dans l''expérience VIP : data, parcours client et nouvelles attentes.',
    'What''s changing in the VIP experience: data, customer journey and new expectations.',
    'Night Square',
    '2026-01-05 10:00:00+00',
    null,
    1
  ),
  (
    'organisateurs-mieux-piloter-soir-j',
    'https://nightsquare.com/src/IMG_9249.PNG',
    'Organisateurs',
    'Organisateurs : mieux piloter le soir J',
    'Organizers: better control on the big night',
    'Des KPI simples et une exécution terrain plus fluide grâce à une plateforme unique.',
    'Simple KPIs and smoother on-the-ground execution with a single platform.',
    'Night Square',
    '2026-01-02 10:00:00+00',
    null,
    2
  )
on conflict (slug) do update set
  image_url = excluded.image_url,
  tag = excluded.tag,
  title_fr = excluded.title_fr,
  title_en = excluded.title_en,
  excerpt_fr = excluded.excerpt_fr,
  excerpt_en = excluded.excerpt_en,
  author = excluded.author,
  published_at = excluded.published_at,
  link_url = excluded.link_url,
  sort_order = excluded.sort_order,
  updated_at = now();
