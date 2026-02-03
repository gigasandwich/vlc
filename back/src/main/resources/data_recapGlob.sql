-- =========================
-- DONNÉES DE TEST
-- =========================

-- États des points
INSERT INTO point_state (label, order_, progress) VALUES
('Nouveau', 1, 0),
('En cours', 2, 0.5),
('Terminé', 3, 1);

-- Types de points
INSERT INTO point_type (label) VALUES
('Industriel'),
('Résidentiel');
-- Points
INSERT INTO point
(date_, surface, budget, coordinates, user_id, point_state_id, point_type_id)
VALUES
(NOW(), 1000, 50000, ST_SetSRID(ST_MakePoint(2.35, 48.85), 4326), 1, 1, 1),
(NOW(), 2000, 120000, ST_SetSRID(ST_MakePoint(2.36, 48.86), 4326), 1, 2, 1),
(NOW(), 1500, 80000, ST_SetSRID(ST_MakePoint(2.37, 48.87), 4326), 2, 3, 2);