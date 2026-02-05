\c postgres;
DROP DATABASE IF EXISTS vlc;
CREATE DATABASE vlc;
\c vlc;

CREATE EXTENSION IF NOT EXISTS POSTGIS;

CREATE TABLE example (
    id SERIAL PRIMARY KEY,
    column1 VARCHAR(100)
);

CREATE TABLE config(
   id SERIAL,
   key VARCHAR(50) NOT NULL,
   value_ VARCHAR(255),
   type VARCHAR(50) NOT NULL,
   date_ TIMESTAMP NOT NULL,
   fb_id VARCHAR(50),
   PRIMARY KEY(id),
   UNIQUE(fb_id)
);

CREATE TABLE action(
   id SERIAL,
   label VARCHAR(50) NOT NULL,
   fb_id VARCHAR(50),
   PRIMARY KEY(id),
   UNIQUE(fb_id)
);

CREATE TABLE role(
   id SERIAL,
   label VARCHAR(50) NOT NULL,
   fb_id VARCHAR(50),
   PRIMARY KEY(id),
   UNIQUE(label),
   UNIQUE(fb_id)
);

CREATE TABLE point_type(
   id SERIAL,
   label VARCHAR(50) NOT NULL,
   fb_id VARCHAR(50),
   PRIMARY KEY(id),
   UNIQUE(label),
   UNIQUE(fb_id)
);

CREATE TABLE point_state(
   id SERIAL,
   label VARCHAR(50) NOT NULL,
   order_ DOUBLE PRECISION NOT NULL,
   progress DOUBLE PRECISION NOT NULL,
   fb_id VARCHAR(50),
   PRIMARY KEY(id),
   UNIQUE(label),
   UNIQUE(fb_id)
);

CREATE TABLE factory(
   id SERIAL,
   label VARCHAR(50) NOT NULL,
   fb_id VARCHAR(50),
   PRIMARY KEY(id),
   UNIQUE(label),
   UNIQUE(fb_id)
);

CREATE TABLE user_state(
   id SERIAL,
   label VARCHAR(50) NOT NULL,
   fb_id VARCHAR(50),
   PRIMARY KEY(id),
   UNIQUE(fb_id)
);

CREATE TABLE user_(
   id SERIAL,
   email VARCHAR(50) NOT NULL,
   password VARCHAR(50) NOT NULL,
   username VARCHAR(50),
   fb_id VARCHAR(50),
   user_state_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   UNIQUE(email),
   UNIQUE(fb_id),
   FOREIGN KEY(user_state_id) REFERENCES user_state(id)
);

CREATE TABLE user_log(
   id SERIAL,
   date_ TIMESTAMP NOT NULL,
   state DOUBLE PRECISION NOT NULL,
   fb_id VARCHAR(50),
   user_to INTEGER,
   user_from INTEGER NOT NULL,
   action_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   UNIQUE(fb_id),
   FOREIGN KEY(user_to) REFERENCES user_(id),
   FOREIGN KEY(user_from) REFERENCES user_(id),
   FOREIGN KEY(action_id) REFERENCES action(id)
);

CREATE TABLE user_historic(
   id SERIAL,
   email VARCHAR(50) NOT NULL,
   password VARCHAR(50) NOT NULL,
   username VARCHAR(50),
   date_ TIMESTAMP NOT NULL,
   fb_id VARCHAR(50),
   user_state_id INTEGER NOT NULL,
   user_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   UNIQUE(fb_id),
   FOREIGN KEY(user_state_id) REFERENCES user_state(id),
   FOREIGN KEY(user_id) REFERENCES user_(id)
);

CREATE TABLE user_role(
   role_id INTEGER,
   user_id INTEGER,
   id SERIAL,
   PRIMARY KEY(role_id, user_id, id),
   FOREIGN KEY(role_id) REFERENCES role(id),
   FOREIGN KEY(user_id) REFERENCES user_(id)
);

CREATE TABLE point(
   id SERIAL,
   date_ TIMESTAMP NOT NULL,
   surface DOUBLE PRECISION,
   budget DOUBLE PRECISION,
   coordinates GEOMETRY(POINT, 4326) NOT NULL,
   updated_at TIMESTAMP,
   deleted_at TIMESTAMP,
   fb_id VARCHAR(50),
   user_id INTEGER NOT NULL,
   point_state_id INTEGER NOT NULL,
   point_type_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   UNIQUE(fb_id),
   FOREIGN KEY(user_id) REFERENCES user_(id),
   FOREIGN KEY(point_state_id) REFERENCES point_state(id),
   FOREIGN KEY(point_type_id) REFERENCES point_type(id)
);

CREATE TABLE point_historic(
   id SERIAL,
   date_ TIMESTAMP NOT NULL,
   surface DOUBLE PRECISION,
   budget DOUBLE PRECISION,
   coordinates GEOMETRY(POINT, 4326) NOT NULL,
   fb_id VARCHAR(50),
   point_id INTEGER NOT NULL,
   point_state_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   UNIQUE(fb_id),
   FOREIGN KEY(point_id) REFERENCES point(id),
   FOREIGN KEY(point_state_id) REFERENCES point_state(id)
);

CREATE TABLE point_factory(
   factory_id INTEGER,
   point_id INTEGER,
   id SERIAL,
   updated_at TIMESTAMP NOT NULL DEFAULT NOW(), -- TODO: make it be the updated point date, not always now
   PRIMARY KEY(factory_id, point_id, id),
   FOREIGN KEY(factory_id) REFERENCES factory(id),
   FOREIGN KEY(point_id) REFERENCES point(id)
);
