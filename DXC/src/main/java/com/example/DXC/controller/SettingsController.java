package com.example.DXC.controller;

import com.example.DXC.dto.SettingsRequest;
import com.example.DXC.model.Settings;
import com.example.DXC.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {
    private final SettingsService settingsService;

    @PostMapping
    public ResponseEntity<Settings> addSetting(@RequestBody SettingsRequest dto) {
        Settings setting = settingsService.saveSettings(dto);
        return ResponseEntity.ok(setting);
    }
}
