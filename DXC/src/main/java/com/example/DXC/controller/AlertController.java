package com.example.dxc.controller;

import com.example.dxc.dto.AlertResponse;
import com.example.dxc.model.Alert;
import com.example.dxc.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertRepository alertRepository;

    @GetMapping("/recent")
    public AlertResponse getRecentAlerts() {
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        List<Alert> alerts = alertRepository.findByTriggeredAtAfter(oneMinuteAgo);

        String message = alerts.isEmpty()
                ? "No alerts found."
                : alerts.size() + " alerts fetched successfully.";

        return new AlertResponse(message, alerts.size(), alerts);
    }
}
