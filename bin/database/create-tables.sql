
--- create teable languages ---
DROP TABLE IF EXISTS languages CASCADE;

CREATE TABLE languages (
  language VARCHAR(5) NOT NULL,
  PRIMARY KEY (language)
);

--- create table users ---
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  user_id serial NOT NULL,
  name VARCHAR(10) NOT NULL,
  email VARCHAR(30) NOT NULL,
  password text NOT NULL,
  salt text NOT NULL,
  PRIMARY KEY (user_id),
  UNIQUE (email),
  UNIQUE (name)
);

--- crate talbe refresh tokens ---
DROP TABLE IF EXISTS refresh_tokens CASCADE;

CREATE TABLE refresh_tokens (
  token_id text NOT NULL,
  user_id integer NOT NULL,
  expiry_date timestamp NOT NULL,
  PRIMARY KEY (token_id),
  UNIQUE ( user_id ),
  FOREIGN KEY ( user_id )
    REFERENCES users ( user_id )
    ON DELETE SET NULL
);


--- create table projects
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE projects (
  project_id serial NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT '',
  stack VARCHAR(30)[] NOT NULL DEFAULT '{}',
  spend_time VARCHAR(100) NOT NULL DEFAULT '',
  PRIMARY KEY ( project_id ),
  UNIQUE ( name )
);

DROP TABLE IF EXISTS projects_multilanguge_content CASCADE;

CREATE TABLE projects_multilanguge_content (
  language VARCHAR(5) NOT NULL,
  project_id INT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (project_id, language),
  FOREIGN KEY (project_id)
    REFERENCES projects (project_id)
    ON DELETE CASCADE,
  FOREIGN KEY ( language )
    REFERENCES languages ( language )
    ON DELETE CASCADE
);

--- table links
DROP TABLE IF EXISTS links;

CREATE TABLE links (
  link_id serial NOT NULL,
  name VARCHAR(30) NOT NULL,
  link VARCHAR(100) NOT NULL,
  project_id INT NOT NULL,
  PRIMARY KEY (link_id),
  FOREIGN KEY (project_id)
    REFERENCES projects (project_id)
    ON DELETE CASCADE
);

--- create table homepage ---
DROP TABLE IF EXISTS homepage CASCADE;

CREATE TABLE homepage (
  language VARCHAR(5) NOT NULL,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  PRIMARY KEY (language),
  FOREIGN KEY ( language )
    REFERENCES languages ( language )
    ON DELETE CASCADE
);



--- create table templates_image ---
DROP TABLE IF EXISTS templates_image CASCADE;

CREATE TABLE templates_image (
  name VARCHAR(8) NOT NULL,
  width SMALLINT,
  height SMALLINT,
  PRIMARY KEY (name),
  UNIQUE (width, height)
);

--- create table images ---
DROP TABLE IF EXISTS images;

CREATE TABLE images (
  id serial NOT NULL,
  image_id VARCHAR(10) NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  width SMALLINT,
  height SMALLINT,
  template_name VARCHAR(8) DEFAULT '',
  project_id INT DEFAULT NULL,
  type_avatar VARCHAR(10) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE (image_id, name),
  FOREIGN KEY ( template_name )
    REFERENCES templates_image ( name )
    ON DELETE SET NULL,
  FOREIGN KEY ( project_id )
    REFERENCES projects (project_id)
    ON DELETE SET NULL
);

