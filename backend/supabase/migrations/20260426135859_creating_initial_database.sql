create table public.players (
    users_uid uuid primary key,
    display_name varchar(100) not null,
    discord_username text,
    pubg_username text,
    phone_number text,
    profile_picture_url text,
    created_at timestamp with time zone default now()
    );