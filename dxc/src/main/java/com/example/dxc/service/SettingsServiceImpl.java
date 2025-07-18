package com.example.dxc.service;

import com.example.dxc.dto.SettingsRequest;
import com.example.dxc.model.Alert;
import com.example.dxc.model.Settings;
import com.example.dxc.model.User;
import com.example.dxc.repository.AlertRepository;
import com.example.dxc.repository.SettingsRepository;
import com.example.dxc.repository.UserRepository;
import com.example.dxc.service.observer.AlertObserver;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SettingsServiceImpl implements SettingsService {

    private final SettingsRepository repo;
    private final AlertRepository alertRepository;
    @Autowired
    private UserRepository userRepository;
    private final AlertObserver alertObserver;

    @Override
    public Settings saveSettings(SettingsRequest request) {
        validateRequest(request);

        Optional<Settings> existingSetting = repo.findAll()
                .stream()
                .filter(s -> s.getMetric().equals(request.getMetric()) && s.getType().equals(request.getType()))
                .findFirst();

        Settings setting;

        if (existingSetting.isPresent()) {
            // Update existing
            setting = existingSetting.get();
            setting.setThresholdValue(request.getThresholdValue());
            setting.setAlertType(request.getAlertType());
            setting.setCreatedAt(LocalDateTime.now());
        } else {
            // Create new
            setting = Settings.builder()
                    .type(request.getType())
                    .metric(request.getMetric())
                    .thresholdValue(request.getThresholdValue())
                    .alertType(request.getAlertType())
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        return repo.save(setting);
    }

    @Override
    public Alert checkAndTriggerAlert(String metric, float currentValue) {
        Optional<Settings> optionalSetting = repo.findAll()
                .stream()
                .filter(s -> s.getMetric().equals(metric))
                .findFirst();

        if (optionalSetting.isPresent()) {
            Settings setting = optionalSetting.get();

            boolean shouldTrigger = switch (setting.getAlertType()) {
                case Above -> currentValue > setting.getThresholdValue();
                case Below -> currentValue < setting.getThresholdValue();
            };

            if (shouldTrigger) {
                Alert alert = Alert.builder()
                        .metric(metric)
                        .value(currentValue)
                        .thresholdValue(setting.getThresholdValue())
                        .type(setting.getType())
                        .alertType(setting.getAlertType())
                        .triggeredAt(LocalDateTime.now())
                        .build();

                Alert savedAlert = alertRepository.save(alert);

                // Send to all users
                List<User> users = userRepository.findAll();
                for (User user : users) {
                    alertObserver.notify(savedAlert, user);
                }
                return savedAlert;
            }
        }
        return null;
    }

    private void validateRequest(SettingsRequest request) {
        switch (request.getMetric()) {
            case "trafficDensity" -> {
                if (request.getThresholdValue() < 0 || request.getThresholdValue() > 500)
                    throw new IllegalArgumentException("trafficDensity must be between 0 and 500");
            }
            case "avgSpeed" -> {
                if (request.getThresholdValue() < 0 || request.getThresholdValue() > 120)
                    throw new IllegalArgumentException("avgSpeed must be between 0 and 120");
            }
            case "co" -> {
                if (request.getThresholdValue() < 0 || request.getThresholdValue() > 50)
                    throw new IllegalArgumentException("co must be between 0 and 50");
            }
            case "ozone" -> {
                if (request.getThresholdValue() < 0 || request.getThresholdValue() > 300)
                    throw new IllegalArgumentException("ozone must be between 0 and 300");
            }
            case "brightnessLevel" -> {
                if (request.getThresholdValue() < 0 || request.getThresholdValue() > 100)
                    throw new IllegalArgumentException("brightnessLevel must be between 0 and 100");
            }
            case "powerConsumption" -> {
                if (request.getThresholdValue() < 0 || request.getThresholdValue() > 5000)
                    throw new IllegalArgumentException("powerConsumption must be between 0 and 5000");
            }
            default -> throw new IllegalArgumentException("Invalid metric");
        }
    }
}
