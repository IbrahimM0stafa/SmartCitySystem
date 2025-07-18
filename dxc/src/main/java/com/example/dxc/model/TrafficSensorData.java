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
@Table(name = "traffic_sensors_data")
public class TrafficSensorData {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private int trafficDensity; // 0 to 500

    @Column(nullable = false)
    private float avgSpeed; // 0 to 120

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CongestionLevel congestionLevel;

    public enum CongestionLevel {
        Low, Moderate, High, Severe
    }

}
