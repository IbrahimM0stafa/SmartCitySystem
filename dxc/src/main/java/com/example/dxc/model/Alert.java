package com.example.dxc.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String metric;

    @Column(nullable = false)
    private float value;

    @Column(nullable = false, name = "threshold_value")
    private float thresholdValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Settings.AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Settings.SettingType type;

    @Column(nullable = false, name = "triggered_at")
    private LocalDateTime triggeredAt = LocalDateTime.now();
}
