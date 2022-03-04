--
-- PostgreSQL database dump
--

DROP DATABASE portfolio;
CREATE DATABASE portfolio;

\connect portfolio;

-- CREATE SCHEMA portfolio;


-- COMMENT ON SCHEMA portfolio IS 'Database Scheme Portfolio';

--- create table homepage
CREATE TABLE homepage (
  language VARCHAR(7) NOT NULL,
  title text,
  subtitle text,
  description text,
  CHECK (language IN ('en', 'ru')),
  PRIMARY KEY (language),
);

-- ALTER DATABASE portfolio SET search_path = portfolio;

