CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE gender AS ENUM ('male', 'female');
CREATE TABLE IF NOT EXISTS persons (
  id integer PRIMARY KEY generated always as identity,
  name VARCHAR NOT NULL,
  surname VARCHAR NOT NULL,
  middlename VARCHAR,
  birth_date DATE,
  sex gender
);

CREATE TABLE IF NOT EXISTS users (
  id integer PRIMARY KEY generated always as identity,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  salt VARCHAR NOT NULL,
  phone VARCHAR UNIQUE,
  person INTEGER UNIQUE REFERENCES persons(id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id integer PRIMARY KEY generated always as identity,
  token VARCHAR NOT NULL,
  user_id integer REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ip varchar NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expired_at TIMESTAMP NOT NULL
);

