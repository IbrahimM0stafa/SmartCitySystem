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
@Table(name = "settings")
public class Settings {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String type; // e.g., "Traffic", "Air_Pollution", "Street_Light"

    @Column(nullable = false)
    private String metric; // e.g., "Density", "PM2.5", etc.

    @Column(nullable = false)
    private float thresholdValue;

    @Column(nullable = false)
    private String alertType; // "above" or "below"

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
