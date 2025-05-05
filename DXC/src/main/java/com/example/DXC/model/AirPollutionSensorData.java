package com.example.DXC.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "air_pollution_sensors_data")
public class AirPollutionSensorData {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private float pm2_5;
    private float pm10;
    private float co;    // 0 to 50 ppm
    private float no2;
    private float so2;
    private float ozone; // 0 to 300 ppb

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PollutionLevel pollutionLevel;

    public enum PollutionLevel {
        Good, Moderate, Unhealthy, Very_Unhealthy, Hazardous
    }
}
