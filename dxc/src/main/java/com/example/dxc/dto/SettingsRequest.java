package com.example.dxc.dto;

import com.example.dxc.model.Settings.AlertType;
import com.example.dxc.model.Settings.SettingType;
import lombok.Data;

@Data
public class SettingsRequest {
    private SettingType type;
    private String metric;
    private float thresholdValue;
    private AlertType alertType;
}
