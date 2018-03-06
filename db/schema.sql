BEGIN;

CREATE TABLE cbusiness
(
  id SERIAL PRIMARY KEY,
  org_name VARCHAR(100) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  uploadedFileCloudinaryUrl VARCHAR(200),
  hash_pwd VARCHAR(64) NOT NULL,
  token VARCHAR(100),
  tokenExpire BIGINT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users
(
  id SERIAL PRIMARY KEY,
  cb_id INTEGER REFERENCES cbusiness(id),
  fullName VARCHAR(100) NOT NULL,
  sex VARCHAR(30) NOT NULL,
  yearOfBirth INTEGER NOT NULL,
  email VARCHAR(100),
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  hash VARCHAR(64) NOT NULL
);

CREATE TABLE activities
(
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cb_id INTEGER REFERENCES cbusiness(id),
  deleted BOOLEAN DEFAULT false,
  monday BOOLEAN DEFAULT false,
  tuesday BOOLEAN DEFAULT false,
  wednesday BOOLEAN DEFAULT false,
  thursday BOOLEAN DEFAULT false,
  friday BOOLEAN DEFAULT false,
  saturday BOOLEAN DEFAULT false,
  sunday BOOLEAN DEFAULT false,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visits
(
  id SERIAL PRIMARY KEY,
  usersId INTEGER REFERENCES users,
  activitiesId INTEGER REFERENCES activities(id),
  cb_id INTEGER REFERENCES cbusiness(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
