CREATE TABLE IF NOT EXISTS companies (
  id integer PRIMARY KEY generated always as identity,
  name VARCHAR NOT NULL,
  fullname VARCHAR,
  shortname VARCHAR,
  inn VARCHAR(12),
  kpp VARCHAR(9),
  ogrn VARCHAR(13),
  address VARCHAR,
  UNIQUE (inn, kpp)
);