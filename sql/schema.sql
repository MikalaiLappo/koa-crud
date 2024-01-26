DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
SET search_path = public;

CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');

CREATE TABLE users (
    id serial PRIMARY KEY,
    createdAt        timestamp NOT NULL DEFAULT NOW(),
    updatedAt        timestamp NOT NULL DEFAULT NOW(),

    username varchar(256) UNIQUE NOT NULL,
    email varchar(256) UNIQUE NOT NULL,

    password varchar(256) NOT NULL,
    role user_role NOT NULL
);