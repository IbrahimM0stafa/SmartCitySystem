package com.example.dxc.service;

import com.example.dxc.dto.SettingsRequest;
import com.example.dxc.model.Alert;
import com.example.dxc.model.Settings;

public interface SettingsService {
    Settings saveSettings(SettingsRequest request);
    Alert checkAndTriggerAlert(String metric, float currentValue);
}
