CREATE TYPE gender AS ENUM ('male', 'female');
CREATE TABLE IF NOT EXISTS persons (
  id INTEGER PRIMARY KEY generated always as identity,
  user_id INTEGER UNIQUE REFERENCES users(id),
  name VARCHAR NOT NULL,
  surname VARCHAR NOT NULL,
  middlename VARCHAR,
  birth_date DATE,
  sex gender,
  email VARCHAR,
  phone VARCHAR[]
);