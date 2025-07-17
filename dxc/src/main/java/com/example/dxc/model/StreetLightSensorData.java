package com.example.dxc.model;

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
@Table(name = "street_light_sensors_data")
public class StreetLightSensorData {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private int brightnessLevel; // 0 to 100

    private float powerConsumption; // 0 to 5000

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LightStatus status;

    public enum LightStatus {
        ON, OFF
    }
}
