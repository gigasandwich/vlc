INSERT INTO example (column1) VALUES
('Sample data 1'),
('Sample data 2'),
(null);

INSERT INTO config (key, value_, type, date_) VALUES
('token_expiration', '180', 'integer', NOW());

INSERT INTO role(label) VALUES
('USER'),
('ADMIN');