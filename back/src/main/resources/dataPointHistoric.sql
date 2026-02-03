-- Historic data for points
-- Ensure each point has at least one historic row and provide progress transitions

-- Point 1 (id = 1) : still new
INSERT INTO point_historic (date_, surface, budget, coordinates, point_id, point_state_id) VALUES
('2026-02-03 10:00:00'::timestamp, 12.5, 150000, ST_GeomFromText('POINT(47.5260 -18.9095)', 4326), 1, 1);

-- Point 2 (id = 2) : progressed from new -> in progress -> finished
INSERT INTO point_historic (date_, surface, budget, coordinates, point_id, point_state_id) VALUES
('2026-01-28 12:00:00'::timestamp, 220.0, 550000, ST_GeomFromText('POINT(47.5235 -18.9110)', 4326), 2, 1),
('2026-01-30 12:00:00'::timestamp, 120.0, 320000, ST_GeomFromText('POINT(47.5235 -18.9110)', 4326), 2, 2),
('2026-02-01 12:00:00'::timestamp, 0.0, 0, ST_GeomFromText('POINT(47.5235 -18.9110)', 4326), 2, 3);

-- Mark point 2 as finished in the main table
UPDATE point SET point_state_id = (SELECT id FROM point_state WHERE label = 'termine') WHERE id = 2;

-- Point 3 (id = 3) : progressed and finished earlier
INSERT INTO point_historic (date_, surface, budget, coordinates, point_id, point_state_id) VALUES
('2026-01-14 12:00:00'::timestamp, 480.0, 1200000, ST_GeomFromText('POINT(47.5280 -18.9120)', 4326), 3, 1),
('2026-01-24 12:00:00'::timestamp, 200.0, 600000, ST_GeomFromText('POINT(47.5280 -18.9120)', 4326), 3, 2),
('2026-01-27 12:00:00'::timestamp, 0.0, 0, ST_GeomFromText('POINT(47.5280 -18.9120)', 4326), 3, 3);

-- Mark point 3 as finished in the main table
UPDATE point SET point_state_id = (SELECT id FROM point_state WHERE label = 'termine') WHERE id = 3;

-- Point 4 (id = 4) : moved to in progress and currently in progress
INSERT INTO point_historic (date_, surface, budget, coordinates, point_id, point_state_id) VALUES
('2026-01-13 12:00:00'::timestamp, 300.0, 800000, ST_GeomFromText('POINT(47.5210 -18.9070)', 4326), 4, 1),
('2026-01-20 12:00:00'::timestamp, 150.0, 400000, ST_GeomFromText('POINT(47.5210 -18.9070)', 4326), 4, 2);

-- Mark point 4 as currently in progress in the main table
UPDATE point SET point_state_id = (SELECT id FROM point_state WHERE label = 'en cours') WHERE id = 4;

-- Point 5 (id = 5) : recently created, still new
INSERT INTO point_historic (date_, surface, budget, coordinates, point_id, point_state_id) VALUES
('2026-02-02 12:00:00'::timestamp, 52.0, 180000, ST_GeomFromText('POINT(47.5255 -18.9130)', 4326), 5, 1);

-- Update main point rows to match latest historic values (surface and budget)
UPDATE point SET surface = 12.5, budget = 150000 WHERE id = 1;
UPDATE point SET surface = 0.0, budget = 0 WHERE id = 2;
UPDATE point SET surface = 0.0, budget = 0 WHERE id = 3;
UPDATE point SET surface = 150.0, budget = 400000 WHERE id = 4;
UPDATE point SET surface = 52.0, budget = 180000 WHERE id = 5;
