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
@Table(name = "settings")
public class Settings {

    public enum SettingType {
        Traffic,
        Air_Pollution,
        Street_Light
    }

    public enum AlertType {
        Above,
        Below
    }


    @Id
    @GeneratedValue
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettingType type;

    @Column(nullable = false)
    private String metric;

    @Column(nullable = false)
    private float thresholdValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "alert_type")
    private AlertType alertType;

    @Column(nullable = false, name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
