INSERT INTO example (column1) VALUES
('Sample data 1'),
('Sample data 2'),
(null);

INSERT INTO config (key, value_, type, date_) VALUES
('TOKEN_EXPIRATION', '180', 'integer', NOW()),
('LOGIN_ATTEMPT_LIMIT', '3', 'integer', NOW());

INSERT INTO action(label) VALUES
('WRONG_LOGIN'),
('LOGIN_ATTEMPT_RESET');

INSERT INTO role(label) VALUES
('USER'),
('ADMIN');

INSERT INTO user_state (label) VALUES
('ACTIVE'),
('INACTIVE'),
('BLOCKED');

-- ===============================
-- Users
-- ===============================

INSERT INTO user_(email, password, username, user_state_id) VALUES
('admin@gmail.com', 'admin123', 'admin', 1),
('user1@gmail.com', 'pass123', 'user1', 1),
('user2@gmail.com', 'pass123', 'user2', 1);

INSERT INTO user_historic (email, password, username, date_, user_state_id, user_id) VALUES
('admin@gmail.com', 'admin123', 'admin', NOW(), 1, 1),
('user1@gmail.com', 'pass123', 'user1', NOW(), 1, 2),
('user2@gmail.com', 'pass123', 'user2', NOW(), 1, 3);

INSERT INTO user_role (role_id, user_id) VALUES
(2, 1),
(1, 2),
(1, 3);

-- ===============================
-- Point states (états des points) STEEVE
-- ===============================
INSERT INTO point_state (label, order_, progress) VALUES
('nouveau', 1.0, 0.25),
('en cours', 2.0, 0.5),
('termine', 3.0, 1.0);

-- ===============================
-- Point types (échelle professionnelle)
-- ===============================
INSERT INTO point_type (label) VALUES
('peu grave'),
('grave'),
('tres grave');

-- ===============================
-- Points (5 exemples)
-- Remarque: seuls les utilisateurs avec le rôle USER (user_id 2 et 3)
-- sont assignés ici conformément au fichier `data.sql` fourni.
-- Coordinates are stored as PostGIS geometries (SRID 4326).
-- ===============================
INSERT INTO point (title, description, location, point_state_id, point_type_id, user_id, date_created) VALUES
('Point 1', 'Description for point 1', ST_SetSRID(ST_MakePoint(-0.1276, 51.5074), 4326), 1, 1, 2, NOW()),
('Point 2', 'Description for point 2', ST_SetSRID(ST_MakePoint(-74.0060, 40.7128), 4326), 2, 2, 3, NOW()),
('Point 3', 'Description for point 3', ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326), 3, 3, 2, NOW()),
('Point 4', 'Description for point 4', ST_SetSRID(ST_MakePoint(139.6917, 35.6895), 4326), 1, 1, 3, NOW()),
('Point 5', 'Description for point 5', ST_SetSRID(ST_MakePoint(151.2093, -33.8688), 4326), 2, 2, 2, NOW());
