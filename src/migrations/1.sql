CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT uuid_generate_v4(),
  login VARCHAR UNIQUE NOT NULL ,
  password VARCHAR NOT NULL,
  salt VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR UNIQUE,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id serial PRIMARY KEY,
  refresh_token VARCHAR DEFAULT uuid_generate_v4(),
  token VARCHAR NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT now(),
  expired_at TIMESTAMP NOT NULL
)