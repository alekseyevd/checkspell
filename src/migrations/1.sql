CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id integer PRIMARY KEY generated always as identity,
  login VARCHAR UNIQUE NOT NULL ,
  password VARCHAR NOT NULL,
  salt VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR UNIQUE
);

CREATE TABLE IF NOT EXISTS sessions (
  id integer PRIMARY KEY generated always as identity,
  token VARCHAR NOT NULL,
  user_id integer REFERENCES users(id) ON DELETE CASCADE,
  ip varchar NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expired_at TIMESTAMP NOT NULL
);