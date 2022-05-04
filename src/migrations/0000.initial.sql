CREATE TABLE migrations (
    id integer PRIMARY KEY generated always as identity,
    filename VARCHAR NOT NULL,
    version VARCHAR
)