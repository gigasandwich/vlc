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

-- INSERT INTO point (date_, surface, budget, coordinates, user_id, point_state_id, point_type_id) VALUES
-- (NOW(), null, null, ST_GeomFromText('POINT(47.5260 -18.9095)', 4326), 2, 1, (SELECT id FROM point_type WHERE label='peu grave')),
-- (NOW() - INTERVAL '2 days', null, null, ST_GeomFromText('POINT(47.5235 -18.9110)', 4326), 3, 1, (SELECT id FROM point_type WHERE label='grave')),
-- (NOW() - INTERVAL '7 days', null, null, ST_GeomFromText('POINT(47.5280 -18.9120)', 4326), 2, 1, (SELECT id FROM point_type WHERE label='grave')),
-- (NOW() - INTERVAL '14 days', null, null, ST_GeomFromText('POINT(47.5210 -18.9070)', 4326), 3, 1, (SELECT id FROM point_type WHERE label='tres grave')),
-- (NOW() - INTERVAL '1 days', null, null, ST_GeomFromText('POINT(47.5255 -18.9130)', 4326), 2, 1, (SELECT id FROM point_type WHERE label='peu grave'));

INSERT INTO factory (label) VALUES
('Factory A'),
('Factory B');

UPDATE point_state SET progress=0 WHERE label='nouveau';

INSERT INTO point (date_, surface, budget, coordinates, user_id, point_state_id, point_type_id, level_) VALUES
(NOW() - INTERVAL '14 days', null, null, ST_GeomFromText('POINT(47.5210 -18.9070)', 4326), 3, 1, (SELECT id FROM point_type WHERE label='tres grave'), 10);

INSERT INTO config (key, value_, type, date_) VALUES
('PRICE', '1000', 'double', '2026-09-02');