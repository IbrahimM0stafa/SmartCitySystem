package com.example.dxc.controller;

import com.example.dxc.dto.SettingsRequest;
import com.example.dxc.model.Settings;
import com.example.dxc.service.SettingsService;
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
