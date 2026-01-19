INSERT INTO example (column1) VALUES
('Sample data 1'),
('Sample data 2'),
(null);

INSERT INTO config (key, value_, type, date_) VALUES
('token_expiration', '180', 'integer', NOW());

INSERT INTO role(label) VALUES
('USER'),
('ADMIN');

-- ===============================
-- Users
-- ===============================

INSERT INTO user_(email, password, username) VALUES
('user1@gmail.com', 'pass1', 'user1'),
('user2@gmail.com', 'pass2', 'user2');

INSERT INTO user_historic (email, password, username, date_, user_id) VALUES
('user1@gmail.com', 'pass1', 'user1', NOW(), 1),
('user2@gmail.com', 'pass2', 'user2', NOW(), 2);

INSERT INTO user_role (role_id, user_id) VALUES
(1, 1),
(1, 2);