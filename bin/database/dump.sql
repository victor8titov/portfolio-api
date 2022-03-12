--
-- PostgreSQL database dump
--
DROP DATABASE portfolio;
CREATE DATABASE portfolio;
\ connect portfolio;
-- CREATE SCHEMA portfolio;
-- COMMENT ON SCHEMA portfolio IS 'Database Scheme Portfolio';
--- create table homepage
CREATE TABLE homepage (
  language VARCHAR(7) NOT NULL,
  title text,
  subtitle text,
  description text,
  image VARCHAR(10),
  CHECK (language IN ('en', 'ru')),
  PRIMARY KEY (language),
);

--- create table users
 CREATE TABLE users (
  user_id serial NOT NULL,
  name VARCHAR(10) NOT NULL,
  email VARCHAR(30) NOT NULL,
  password text NOT NULL,
  salt text NOT NULL,
  PRIMARY KEY (user_id),
  UNIQUE (email)
);

--- crate talbe refresh tokens
CREATE TABLE refresh_tokens (
  token_id NOT NULL,
  user text NOT NULL,
  PRIMARY KEY (token_id),
  UNIQUE (user),
  FOREIGN KEY ( user )
    REFERENCES users ( user_id )
); 

--- create table templates_image
CREATE TABLE templates_image (
  template_image_id serial NOT NULL,
  name VARCHAR(20) NOT NULL,
  suffix VARCHAR(8) NOT NULL,
  width SMALLINT NOT NULL,
  height SMALLINT,
  PRIMARY KEY (template_image_id),
  UNIQUE (width, height)
);

--- create table images 
CREATE TABLE images (
  image_id VARCHAR(10) NOT NULL,
  id serial NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  width SMALLINT,
  height SMALLINT,
  PRIMARY KEY (id),
  UNIQUE (image_id, name)
);

-- ALTER DATABASE portfolio SET search_path = portfolio;