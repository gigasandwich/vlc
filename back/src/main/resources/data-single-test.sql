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
('admin@gmail.com', 'admin123', 'admin', 1);

INSERT INTO user_historic (email, password, username, date_, user_state_id, user_id) VALUES
('admin@gmail.com', 'admin123', 'admin', NOW(), 1, 1);

INSERT INTO user_role (role_id, user_id) VALUES
(2, 1);

-- DELETE FROM user_role;
-- DELETE FROM user_historic;
-- DELETE FROM user_;

-- ===============================
-- Point states (états des points) STEEVE
-- ===============================
INSERT INTO point_state (label, order_, progress) VALUES
('nouveau', 1.0, 0.0),
('en cours', 2.0, 0.5),
('termine', 3.0, 1.0);

-- ===============================
-- Point types (échelle professionnelle)
-- ===============================
INSERT INTO point_type (label) VALUES
('peu grave'),
('grave'),
('tres grave');

INSERT INTO point (date_, surface, budget, coordinates, user_id, point_state_id, point_type_id) VALUES
(NOW(), null, null, ST_GeomFromText('POINT(47.5260 -18.9095)', 4326), 2, 1, (SELECT id FROM point_type WHERE label='peu grave'));

INSERT INTO factory (label) VALUES
('Factory A'),
('Factory B');

-- UPDATE point SET surface = 500 WHERE id=7;
-- INSERT INTO point_historic (date_, surface, budget, coordinates, point_state_id, point_id) VALUES
-- (NOW(), 500, null, ST_GeomFromText('POINT(47.5260 -18.9095)', 4326), 1,  7);
