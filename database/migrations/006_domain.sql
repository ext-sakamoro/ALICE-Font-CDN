-- Font CDN domain tables
create table if not exists public.fonts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    family_name text not null,
    style text not null default 'normal',
    weight integer not null default 400,
    format text not null default 'woff2',
    glyph_count integer,
    original_size_bytes bigint,
    optimized_size_bytes bigint,
    unicode_ranges text[],
    is_public boolean default false,
    cdn_url text,
    created_at timestamptz default now()
);
create table if not exists public.subset_cache (
    id uuid primary key default gen_random_uuid(),
    font_id uuid references public.fonts(id) on delete cascade,
    unicode_range text not null,
    subset_size_bytes bigint,
    hit_count bigint default 0,
    created_at timestamptz default now()
);
create index idx_fonts_user on public.fonts(user_id);
create index idx_fonts_family on public.fonts(family_name);
create index idx_subset_cache_font on public.subset_cache(font_id);
