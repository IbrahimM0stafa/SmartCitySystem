package com.example.DXC.service;

import com.example.DXC.dto.SettingsRequest;
import com.example.DXC.model.Alert;
import com.example.DXC.model.Settings;

public interface SettingsService {
    Settings saveSettings(SettingsRequest request);
    Alert checkAndTriggerAlert(String metric, float currentValue);
}
