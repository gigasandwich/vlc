INSERT INTO example (column1) VALUES
('Sample data 1'),
('Sample data 2'),
(null);

INSERT INTO config (key, value_, type, date_) VALUES
('token_expiration', '180', 'integer', NOW()),
('login_attempt_limit', '3', 'integer', NOW());

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
('user1@gmail.com', 'pass1', 'user1', 1),
('user2@gmail.com', 'pass2', 'user2', 1);

INSERT INTO user_historic (email, password, username, date_, user_state_id, user_id) VALUES
('user1@gmail.com', 'pass1', 'user1', NOW(), 1, 1),
('user2@gmail.com', 'pass2', 'user2', NOW(), 1, 2);

INSERT INTO user_role (role_id, user_id) VALUES
(1, 1),
(1, 2);