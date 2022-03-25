
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


--- create table projects
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE projects (
  project_id serial NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT '',
  stack VARCHAR(30)[] NOT NULL DEFAULT '{}',
  spend_time VARCHAR(100) NOT NULL DEFAULT '',
  release_date DATE DEFAULT NULL,
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
DROP TABLE IF EXISTS links CASCADE;

CREATE TABLE links (
  link_id serial NOT NULL,
  name VARCHAR(30) NOT NULL,
  link VARCHAR(100) NOT NULL,
  social_media BOOLEAN DEFAULT NULL,
  project_id INT DEFAULT NULL,
  PRIMARY KEY (link_id),
  FOREIGN KEY (project_id)
    REFERENCES projects (project_id)
    ON DELETE CASCADE
);

--- table skills
DROP TABLE IF EXISTS skills CASCADE;

CREATE TABLE skills (
  skill_id serial NOT NULL,
  name VARCHAR(500) NOT NULL,
  skill_group VARCHAR(30) NOT NULL DEFAULT '',
  level INT NOT NULL DEFAULT 0,
  PRIMARY KEY ( skill_id ),
  UNIQUE ( name )
);

--- table time-stamps
DROP TABLE IF EXISTS time_stamps CASCADE;

CREATE TABLE time_stamps (
  time_stamp_id serial NOT NULL,
  name VARCHAR(200) NOT NULL,
  link VARCHAR(200) NOT NULL DEFAULT '',
  PRIMARY KEY ( time_stamp_id )
);

--- table events
DROP TABLE IF EXISTS events;

CREATE TABLE events (
  event_id serial NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  time_stamp_id INT DEFAULT NULL,
  project_id INT DEFAULT NULL,
  PRIMARY KEY ( event_id ),
  FOREIGN KEY (time_stamp_id)
    REFERENCES time_stamps (time_stamp_id)
    ON DELETE CASCADE,
  FOREIGN KEY (project_id)
    REFERENCES projects (project_id)
    ON DELETE CASCADE
);

--- create table multilingual_content
DROP TABLE IF EXISTS multilingual_content;

CREATE TABLE multilingual_content (
  id serial NOT NULL,
  language VARCHAR(5) NOT NULL,
  project_id INT DEFAULT NULL,
  skill_id INT DEFAULT NULL,
  time_stamp_id INT DEFAULT NULL,
  content TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (id, language),
  FOREIGN KEY (project_id)
    REFERENCES projects (project_id)
    ON DELETE CASCADE,
  FOREIGN KEY ( language )
    REFERENCES languages ( language )
    ON DELETE CASCADE,
  FOREIGN KEY (skill_id)
    REFERENCES skills (skill_id)
    ON DELETE CASCADE,
  FOREIGN KEY (time_stamp_id)
    REFERENCES time_stamps (time_stamp_id)
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
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  width SMALLINT,
  height SMALLINT,
  template_name VARCHAR(8) DEFAULT '',
  project_id INT DEFAULT NULL,
  link_id INT DEFAULT NULL,
  type_avatar VARCHAR(10) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE (image_id, name),
  FOREIGN KEY ( template_name )
    REFERENCES templates_image ( name )
    ON DELETE SET NULL,
  FOREIGN KEY ( project_id )
    REFERENCES projects (project_id)
    ON DELETE SET NULL,
  FOREIGN KEY ( link_id )
    REFERENCES links ( link_id )
    ON DELETE SET NULL
);

DROP TABLE IF EXISTS images_new;
CREATE TABLE images_new (
  image_id serial NOT NULL,
  group_id VARCHAR(10) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  PRIMARY KEY ( image_id ),
);

DROP TABLE IF EXISTS images;
CREATE TABLE images_groups (
  id serial NOT NULL,
  group_id VARCHAR(10) NOT NULL,
  template_name VARCHAR(8) DEFAULT '',
  name VARCHAR(200) NOT NULL,
  width SMALLINT,
  height SMALLINT,
  PRIMARY KEY ( id ),
  FOREIGN KEY ( template_name )
    REFERENCES templates_image ( name )
    ON DELETE SET NULL
);