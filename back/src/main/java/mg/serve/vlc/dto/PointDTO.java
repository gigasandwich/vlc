package mg.serve.vlc.dto;

import java.time.LocalDateTime;

public class PointDTO {
        public Integer id;
        public java.time.LocalDateTime date;
        public Double surface;
        public Double budget;
        public Double lat;
        public Double lon;
        public Integer user_id;
        public String username;
        public Integer point_state_id;
        public String point_state_label;
        public Integer point_type_id;
        public String point_type_label;

        public PointDTO(Integer id,
                        LocalDateTime date,
                        Double surface,
                        Double budget,
                        Double lat,
                        Double lon,
                        Integer user_id,
                        String username,
                        Integer point_state_id,
                        String point_state_label,
                        Integer point_type_id,
                        String point_type_label) {
            this.id = id;
            this.date = date;
            this.surface = surface;
            this.budget = budget;
            this.lat = lat;
            this.lon = lon;
            this.user_id = user_id;
            this.username = username;
            this.point_state_id = point_state_id;
            this.point_state_label = point_state_label;
            this.point_type_id = point_type_id;
            this.point_type_label = point_type_label;
        }
    }
