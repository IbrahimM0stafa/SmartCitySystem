package com.example.DXC.dto;

import com.example.DXC.model.Settings.AlertType;
import com.example.DXC.model.Settings.SettingType;
import lombok.Data;

@Data
public class SettingsRequest {
    private SettingType type;
    private String metric;
    private float thresholdValue;
    private AlertType alertType;
}
