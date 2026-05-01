create table users(
    user_id bigserial primary key,
    username varchar(50) not null unique,
    email varchar(255) not null unique,
    password_hash text not null,
    bio text,
    profile_pic text,
    is_private boolean default false,
    created_at timestamptz default current_timestamp
);

create table posts(
    post_id bigserial primary key,
    user_id bigint references users(user_id) on delete cascade,
    caption text,
    created_at timestamptz default current_timestamp
);

create type follower_status as enum ('pending', 'accepted', 'rejected');
create table followers(
    follower_id bigint references users(user_id) on delete cascade,
    following_id bigint references users(user_id) on delete cascade,
    status follower_status not null default 'pending',
    created_at timestamptz default current_timestamp,
    primary key (follower_id, following_id)
);

create table likes(
    user_id bigint references users(user_id) on delete cascade,
    post_id bigint references posts(post_id) on delete cascade,
    created_at timestamptz default current_timestamp,
    primary key (user_id, post_id)
);

create table comments(
    comment_id bigserial primary key,
    user_id bigint references users(user_id) on delete cascade,
    post_id bigint references posts(post_id) on delete cascade,
    content text,
    created_at timestamptz default current_timestamp
);

create table feed(
    user_id bigint references users(user_id) on delete cascade,
    post_id bigint references posts(post_id) on delete cascade,
    created_at timestamptz default current_timestamp,
    primary key (user_id, post_id)
);

create index idx_feed_user_created on feed(user_id, created_at desc);
