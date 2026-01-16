\c postgres;
DROP DATABASE IF EXISTS vlc;
CREATE DATABASE vlc;
\c vlc;

CREATE TABLE example (
    id SERIAL PRIMARY KEY,
    column1 VARCHAR(100)
);