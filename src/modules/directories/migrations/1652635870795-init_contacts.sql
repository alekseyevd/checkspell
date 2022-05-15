CREATE TABLE IF NOT EXISTS contacts (
  person_id INTEGER NOT NULL REFERENCES persons(id),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  PRIMARY KEY(person_id, company_id)
)